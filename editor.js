/* In-place editor for the site. Inactive unless the address ends in ?edit
   (e.g. https://you.github.io/neria-baris-site/?edit).
   Click any text to change it, add or remove projects / writing / links, then
   "Save" commits the new index.html to your GitHub repository (GitHub Pages republishes it),
   or "Download" saves the file so you can upload it anywhere.
   The GitHub token you enter is kept only in this browser (localStorage). */
(() => {
  if (!new URLSearchParams(location.search).has('edit')) return;
  if (typeof CONFIG !== 'undefined') CONFIG.playIntro = false;   // no opening while editing

  const STORE = 'nb-editor';
  const cfg = Object.assign({ owner: '', repo: '', branch: 'main', path: 'index.html', token: '' },
    JSON.parse(localStorage.getItem(STORE) || '{}'));
  if (!cfg.owner && /\.github\.io$/.test(location.hostname)) {
    cfg.owner = location.hostname.split('.')[0];
    const seg = location.pathname.split('/').filter(Boolean)[0];
    cfg.repo = seg && !seg.includes('.') ? seg : location.hostname;
  }

  const EDITABLE = ['#name', '.tagline', '#track h2', '.about-main > p', '.about-margin > p', '.row-title', '.row-desc',
    '.row-year', '.entry-title', '.entry-venue', '.small-label', '.email', '.links a', '.colophon > span'];
  let dirty = false;

  const css = `
  .ed-on #namebox{z-index:5}
  .ed-on #namebox > *{pointer-events:auto}
  .ed-on [data-ed]{outline:1px dashed rgba(140,140,140,.75);outline-offset:3px;cursor:text}
  .ed-on [data-ed]:focus{outline:1px solid #8a8a8a}
  .ed-on .row,.ed-on .entry,.ed-on .links li{position:relative}
  .ed-ui{font-family:'IBM Plex Sans Hebrew',system-ui,sans-serif;font-size:13px;line-height:1.2}
  .ed-x{position:absolute;top:4px;right:4px;width:28px;height:28px;border:1px solid currentColor;background:transparent;color:inherit;cursor:pointer;opacity:.55;padding:0}
  .ed-x:hover{opacity:1}
  .ed-add{display:inline-block;margin-top:14px;min-height:36px;padding:0 14px;border:1px dashed currentColor;background:transparent;color:inherit;cursor:pointer}
  .ed-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:50;display:flex;flex-wrap:wrap;align-items:center;gap:6px;max-width:calc(100vw - 24px);
    background:#111111;color:#ffffff;padding:6px;border:1px solid #ffffff;box-shadow:0 0 0 1px #111111}
  .ed-bar button{min-height:36px;padding:0 12px;border:1px solid #ffffff;background:#111111;color:#ffffff;cursor:pointer}
  .ed-bar button.ed-primary{background:#ffffff;color:#111111}
  .ed-bar .ed-status{padding:0 8px;color:#bdbdbd;white-space:nowrap}
  .ed-link{position:fixed;z-index:60;display:none;align-items:center;gap:6px;background:#111111;color:#ffffff;border:1px solid #ffffff;padding:6px}
  .ed-link input{width:min(340px,60vw);min-height:30px;border:1px solid #6c6c6c;background:#111111;color:#ffffff;padding:0 8px}
  dialog.ed-dlg{border:1px solid #111111;padding:24px;max-width:480px;width:calc(100vw - 48px);color:#111111;background:#ffffff}
  dialog.ed-dlg::backdrop{background:rgba(17,17,17,.55)}
  .ed-dlg h3{margin:0 0 4px;font:700 18px 'Frank Ruhl Libre',serif}
  .ed-dlg p{margin:0 0 16px;color:#555555}
  .ed-dlg label{display:block;margin:12px 0 4px;color:#111111}
  .ed-dlg input{width:100%;box-sizing:border-box;min-height:36px;border:1px solid #8a8a8a;padding:0 8px;font:inherit}
  .ed-dlg .ed-row{display:flex;gap:8px;justify-content:flex-end;margin-top:20px}
  .ed-dlg button{min-height:36px;padding:0 14px;border:1px solid #111111;background:#ffffff;cursor:pointer;font:inherit}
  .ed-dlg button.ed-primary{background:#111111;color:#ffffff}
  `;

  const el = (tag, attrs, text) => {
    const e = document.createElement(tag);
    for (const k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  };

  // Hebrew numerals for the project numbers (1 → א, 15 → טו, 16 → טז …)
  const heb = (n) => {
    const H = [[400, 'ת'], [300, 'ש'], [200, 'ר'], [100, 'ק'], [90, 'צ'], [80, 'פ'], [70, 'ע'], [60, 'ס'], [50, 'נ'], [40, 'מ'], [30, 'ל'], [20, 'כ'], [10, 'י'],
      [9, 'ט'], [8, 'ח'], [7, 'ז'], [6, 'ו'], [5, 'ה'], [4, 'ד'], [3, 'ג'], [2, 'ב'], [1, 'א']];
    let s = '';
    while (n >= 400) { s += 'ת'; n -= 400; }
    if (n % 100 === 15) { n -= 15; for (const [v, c] of H) if (n >= v) { s += c; n -= v; } return s + 'טו'; }
    if (n % 100 === 16) { n -= 16; for (const [v, c] of H) if (n >= v) { s += c; n -= v; } return s + 'טז'; }
    for (const [v, c] of H) while (n >= v) { s += c; n -= v; }
    return s;
  };
  const renumber = () => document.querySelectorAll('#work .row .row-num').forEach((x, i) => { x.textContent = heb(i + 1); });

  const makeEditable = (root) => {
    for (const sel of EDITABLE) {
      root.querySelectorAll(sel).forEach((x) => {
        if (x.hasAttribute('data-ed')) return;
        x.setAttribute('data-ed', '');
        x.contentEditable = 'plaintext-only';
        if (x.contentEditable !== 'plaintext-only') x.contentEditable = 'true';
        x.spellcheck = true;
      });
    }
    root.querySelectorAll('.row, .entry, .links li').forEach((item) => {
      if (item.querySelector(':scope > .ed-x')) return;
      const kind = item.classList.contains('row') ? 'project' : item.classList.contains('entry') ? 'piece' : 'link';
      const x = el('button', { type: 'button', class: 'ed-ui ed-x', 'aria-label': 'Remove this ' + kind, title: 'Remove' }, '×');
      x.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const list = item.parentElement.querySelectorAll(':scope > .' + (item.classList[0] || 'x'));
        if (item.tagName === 'LI' ? item.parentElement.children.length <= 1 : list.length <= 1) { status('Keep at least one — edit it instead'); return; }
        item.remove(); renumber(); mark();
      });
      item.appendChild(x);
    });
  };

  const addAfterLast = (selector, container) => {
    const items = container.querySelectorAll(selector);
    const last = items[items.length - 1];
    const copy = last.cloneNode(true);
    copy.querySelectorAll('.ed-ui').forEach((u) => u.remove());
    copy.querySelectorAll('[data-ed]').forEach((u) => u.removeAttribute('data-ed'));
    copy.querySelectorAll('.row-title').forEach((u) => { u.textContent = '[Project name]'; });
    copy.querySelectorAll('.row-desc').forEach((u) => { u.textContent = '[One line: what it is, and who it is for]'; });
    copy.querySelectorAll('.row-year').forEach((u) => { u.textContent = '[Year]'; });
    copy.querySelectorAll('.entry-title').forEach((u) => { u.textContent = '[Title]'; });
    copy.querySelectorAll('.entry-venue').forEach((u) => { u.textContent = '[Venue · Year]'; });
    if (copy.tagName === 'A') copy.setAttribute('href', '#');
    last.after(copy);
    makeEditable(container);
    renumber(); mark();
    const first = copy.querySelector('[data-ed]');
    if (first) { first.focus(); document.getSelection().selectAllChildren(first); }
  };

  // ---- link field: shown while editing text inside a link ----
  const linkBox = el('div', { class: 'ed-ui ed-link', role: 'group', 'aria-label': 'Link address' });
  const linkLabel = el('span', null, 'Link');
  const linkInput = el('input', { type: 'text', 'aria-label': 'Link address', placeholder: 'https://…' });
  linkBox.append(linkLabel, linkInput);
  let linkTarget = null;
  const placeLink = () => {
    if (!linkTarget) return;
    const r = linkTarget.getBoundingClientRect();
    linkBox.style.left = Math.max(8, Math.min(r.left, innerWidth - linkBox.offsetWidth - 8)) + 'px';
    linkBox.style.top = Math.min(innerHeight - 48, r.bottom + 8) + 'px';
  };
  linkInput.addEventListener('input', () => { if (linkTarget) { linkTarget.setAttribute('href', linkInput.value.trim() || '#'); mark(); } });

  // ---- bar ----
  const bar = el('div', { class: 'ed-ui ed-bar', role: 'toolbar', 'aria-label': 'Site editor' });
  const statusEl = el('span', { class: 'ed-status', role: 'status' }, 'Editing — click any text');
  const bProject = el('button', { type: 'button' }, '+ Project');
  const bPiece = el('button', { type: 'button' }, '+ Writing');
  const bLink = el('button', { type: 'button' }, '+ Link');
  const bSettings = el('button', { type: 'button' }, 'Settings');
  const bDownload = el('button', { type: 'button' }, 'Download');
  const bSave = el('button', { type: 'button', class: 'ed-primary' }, 'Save');
  const bDone = el('button', { type: 'button' }, 'Done');
  bar.append(statusEl, bProject, bPiece, bLink, bSettings, bDownload, bSave, bDone);
  const status = (t) => { statusEl.textContent = t; };
  const mark = () => { if (!dirty) { dirty = true; status('Unsaved changes'); } };

  // ---- settings dialog ----
  const dlg = el('dialog', { class: 'ed-ui ed-dlg', 'aria-label': 'Editor settings' });
  dlg.innerHTML = `
    <h3>Settings</h3>
    <p>The page title shows in the browser tab and in link previews. The GitHub details let “Save” publish straight to your site; they stay in this browser only.</p>
    <label for="ed-title">Page title</label><input id="ed-title">
    <label for="ed-desc">One-line description</label><input id="ed-desc">
    <label for="ed-owner">GitHub user</label><input id="ed-owner" autocomplete="off">
    <label for="ed-repo">Repository</label><input id="ed-repo" autocomplete="off">
    <label for="ed-branch">Branch</label><input id="ed-branch" autocomplete="off">
    <label for="ed-token">Access token</label><input id="ed-token" type="password" autocomplete="off" placeholder="github_pat_…">
    <p style="margin-top:8px">Create one at GitHub → Settings → Developer settings → Fine-grained tokens, limited to this one repository, with <b>Contents: Read and write</b>.</p>
    <div class="ed-row"><button type="button" id="ed-cancel">Cancel</button><button type="button" class="ed-primary" id="ed-ok">Keep</button></div>`;
  const metaDesc = () => document.querySelector('meta[name="description"]');
  const openSettings = () => {
    dlg.querySelector('#ed-title').value = document.title;
    dlg.querySelector('#ed-desc').value = (metaDesc() && metaDesc().content) || '';
    for (const k of ['owner', 'repo', 'branch', 'token']) dlg.querySelector('#ed-' + k).value = cfg[k] || '';
    dlg.showModal();
  };
  const keepSettings = () => {
    const t = dlg.querySelector('#ed-title').value.trim(), d = dlg.querySelector('#ed-desc').value.trim();
    if (t && t !== document.title) { document.title = t; mark(); }
    if (metaDesc() && d !== metaDesc().content) { metaDesc().content = d; mark(); }
    for (const k of ['owner', 'repo', 'branch', 'token']) cfg[k] = dlg.querySelector('#ed-' + k).value.trim();
    localStorage.setItem(STORE, JSON.stringify(cfg));
    dlg.close();
  };

  // ---- produce the new index.html: the original file, with the editable parts replaced by what's on screen ----
  const scrub = (node) => {
    const c = node.cloneNode(true);
    c.querySelectorAll('.ed-ui').forEach((u) => u.remove());
    for (const x of [c, ...c.querySelectorAll('*')]) {
      x.removeAttribute('contenteditable'); x.removeAttribute('spellcheck'); x.removeAttribute('data-ed');
      if (x.getAttribute('style') === '') x.removeAttribute('style');
    }
    return c;
  };
  const buildHtml = async () => {
    const src = location.pathname.endsWith('/') ? location.pathname + 'index.html' : location.pathname;
    const res = await fetch(src, { cache: 'no-store' });
    if (!res.ok) throw new Error('could not read the original page (' + res.status + ')');
    const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
    doc.getElementById('namebox').innerHTML = scrub(document.getElementById('namebox')).innerHTML;
    document.querySelectorAll('#track > section[id]').forEach((live) => {
      const old = doc.getElementById(live.id);
      if (old) old.replaceWith(doc.importNode(scrub(live), true));
    });
    doc.title = document.title;
    const d = metaDesc() ? metaDesc().content : null;
    if (d != null) {
      const md = doc.querySelector('meta[name="description"]'); if (md) md.setAttribute('content', d);
      const og = doc.querySelector('meta[property="og:description"]'); if (og) og.setAttribute('content', d);
    }
    const ogt = doc.querySelector('meta[property="og:title"]'); if (ogt) ogt.setAttribute('content', document.title);
    return '<!doctype html>\n' + doc.documentElement.outerHTML + '\n';
  };
  const b64 = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = '';
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const saveToGitHub = async () => {
    if (!cfg.owner || !cfg.repo || !cfg.token) { openSettings(); status('Fill in the GitHub details first'); return; }
    status('Saving…'); bSave.disabled = true;
    try {
      const html = await buildHtml();
      const api = 'https://api.github.com/repos/' + encodeURIComponent(cfg.owner) + '/' + encodeURIComponent(cfg.repo) + '/contents/' + cfg.path.split('/').map(encodeURIComponent).join('/');
      const headers = { Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
      const cur = await fetch(api + '?ref=' + encodeURIComponent(cfg.branch || 'main'), { headers, cache: 'no-store' });
      if (!cur.ok) throw new Error(cur.status === 401 ? 'the token was refused' : cur.status === 404 ? 'repository or file not found (or the token cannot see it)' : 'GitHub said ' + cur.status);
      const { sha } = await cur.json();
      const put = await fetch(api, { method: 'PUT', headers, body: JSON.stringify({ message: 'Edit site content', content: b64(html), sha, branch: cfg.branch || 'main' }) });
      if (!put.ok) throw new Error(put.status === 403 ? 'the token cannot write to this repository' : put.status === 409 ? 'the file changed on GitHub meanwhile — reload and redo' : 'GitHub said ' + put.status);
      dirty = false;
      status('Saved — live in about a minute');
    } catch (err) {
      status('Not saved: ' + err.message);
    } finally { bSave.disabled = false; }
  };
  const download = async () => {
    try {
      const html = await buildHtml();
      const a = el('a', { href: URL.createObjectURL(new Blob([html], { type: 'text/html' })), download: 'index.html' });
      document.body.appendChild(a); a.click(); a.remove();
      status('Downloaded index.html — upload it in place of the old one');
    } catch (err) { status('Download failed: ' + err.message); }
  };

  document.addEventListener('DOMContentLoaded', () => {
    document.head.appendChild(el('style', { id: 'ed-style' }, css));
    document.documentElement.classList.add('ed-on');
    makeEditable(document);
    // the "+" buttons live at the end of each list
    const work = document.querySelector('#work article'), writing = document.querySelector('#writing article');
    bProject.addEventListener('click', () => { if (work) addAfterLast(':scope > .row', work); goto('work'); });
    bPiece.addEventListener('click', () => { if (writing) addAfterLast(':scope > .entry', writing); goto('writing'); });
    bLink.addEventListener('click', () => { const ul = document.querySelector('.links'); if (ul) addAfterLast(':scope > li', ul); goto('contact'); });
    bSettings.addEventListener('click', openSettings);
    bDownload.addEventListener('click', download);
    bSave.addEventListener('click', saveToGitHub);
    bDone.addEventListener('click', () => {
      if (dirty && !confirm('Leave without saving your changes?')) return;
      dirty = false;
      location.href = location.pathname + location.hash;
    });
    dlg.querySelector('#ed-cancel').addEventListener('click', () => dlg.close());
    dlg.querySelector('#ed-ok').addEventListener('click', keepSettings);
    document.body.append(bar, linkBox, dlg);

    // links don't navigate while editing; editing inside a link shows its address
    document.addEventListener('click', (e) => { if (e.target.closest('#site a')) e.preventDefault(); }, true);
    document.addEventListener('focusin', (e) => {
      if (linkBox.contains(e.target)) return;
      const a = e.target.closest && e.target.closest('#site a');
      if (a && e.target.hasAttribute('data-ed')) {
        linkTarget = a; linkInput.value = a.getAttribute('href') || '';
        linkBox.style.display = 'flex'; placeLink();
      } else if (!e.target.closest('.ed-ui')) { linkTarget = null; linkBox.style.display = 'none'; }
    });
    document.addEventListener('input', (e) => {
      if (e.target.closest && e.target.closest('[data-ed]')) {
        mark();
        if (e.target.id === 'name' && window.__site && window.__site.ready) window.__site.measure();
      }
    });
    // paste as plain text, and Enter doesn't add line breaks inside single-line fields
    document.addEventListener('paste', (e) => {
      const t = e.target.closest && e.target.closest('[data-ed]');
      if (!t) return;
      e.preventDefault();
      document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
    });
    document.addEventListener('keydown', (e) => {
      const t = e.target.closest && e.target.closest('[data-ed]');
      if (t && e.key === 'Enter' && !t.matches('.about-main > p, .about-margin > p')) { e.preventDefault(); t.blur(); }
    });
    addEventListener('beforeunload', (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });
    addEventListener('resize', placeLink);
  });

  const goto = (id) => {
    const site = window.__site; if (!site) return;
    const i = site.sections.findIndex((s) => s.id === id);
    if (i >= 0) site.goTo(i);
  };
})();
