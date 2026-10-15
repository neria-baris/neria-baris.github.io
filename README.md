# Neria Baris — personal site

A static site: no build step, no framework, no server code. Four files and a font.

```
index.html      ← all the text. This is the file you edit (by hand, or from the site itself — below).
style.css       ← look and layout
site.js         ← the rings, the opening, the motion (no need to touch)
editor.js       ← the in-site editor; does nothing unless the address ends in ?edit
favicon.svg     ← the tab icon: the point
fonts/stam-ashkenaz.woff2   ← Stam Ashkenaz CLM (Yoram Gnat, GPL with font exception)
```

## Editing from the site itself

Once the site is on GitHub Pages, open it with `?edit` at the end of the address,
e.g. `https://neriabaris.com/?edit`. A bar appears at the bottom:

- click any text and type; Enter finishes a one-line field;
- clicking text inside a link also shows the link's address, which you can change;
- **+ Project**, **+ Writing**, **+ Link** add an entry; the **×** on an entry removes it (projects renumber themselves);
- **Settings** — the browser-tab title and the one-line description, plus the GitHub details;
- **Save** — commits the new `index.html` to your repository; GitHub Pages republishes it within about a minute;
- **Download** — saves the edited `index.html` instead, for any other host;
- **Done** — back to the normal site.

The first time, open **Settings** and fill in your GitHub user, the repository name, the branch (`main`)
and an access token. Make the token at GitHub → Settings → Developer settings → Personal access tokens →
Fine-grained tokens: give it access to **only this repository**, with the permission **Contents: Read and write**.
The token is stored only in that browser. Anyone can open `?edit`, but without your token nothing can be saved.

## Editing the text by hand

Open `index.html` in any text editor. Every page is a `<section>` with a comment above it.
Replace the `[bracketed]` placeholders with your own words.

- **Name and tagline** — the `<h1 id="name">` and `<p class="tagline">` near the top.
- **A project** — each one is an `<a class="row">` block in the Work section. Put the link in `href="…"`.
  Copy a block to add one, delete a block to remove one. The Hebrew letter in `row-num` is its number.
- **A piece of writing** — each is one `<a class="entry">` line in the Writing section.
- **Email** — `href="mailto:you@example.com"` and the visible text next to it.
- **Page title in the browser tab and link previews** — the `<title>` and `<meta>` lines at the top.

Pages alternate white and black automatically. To add a whole page, copy a `<section>`, give it a new `id`,
and add a matching `<button data-go="…">` to the menu (`data-go` counts pages from 0).
A page can be linked directly: `yoursite.com/#about`, `#work`, `#writing`, `#contact`.

Settings for the motion are at the top of `site.js` (`CONFIG`): turn the opening off, ring spacing, hover radius.

## Seeing it on your computer

Fonts load best from a local server rather than by double-clicking the file:

```
cd neria-baris-site
python3 -m http.server 8000
```

then open http://localhost:8000.

## Putting it online (free)

**GitHub Pages** (best if you'll keep editing):
1. Create a new repository on GitHub, e.g. `neria-baris-site`, and upload these files to it (the web page has an "upload files" button; keep the `fonts` folder).
2. In the repository's Settings → Pages, choose to deploy from the `main` branch, root folder.
3. After a minute the site is live at `https://<your-username>.github.io/neria-baris-site/`.
   From then on, editing `index.html` on GitHub (the pencil icon) and saving republishes the site.

**Netlify Drop** (fastest, no account setup beyond a sign-in): drag the whole `neria-baris-site` folder onto
https://app.netlify.com/drop and you get a live address in seconds. To update, drag the folder again.

## Your own address: neriabaris.com

1. **Buy the domain** at a registrar — e.g. Cloudflare Registrar, Porkbun or Namecheap (a `.com` is roughly $10–15 a year).
   Searching for it there also tells you whether it is still free.
2. **Tell GitHub first**: repository → Settings → Pages → *Custom domain* → `neriabaris.com` → Save.
   (Doing this before the DNS step stops anyone else claiming the address.) This adds a small `CNAME` file to the repository — keep it.
3. **Point the domain at GitHub** in the registrar's DNS settings:
   - four `A` records for `@`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - optionally four `AAAA` records for `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - one `CNAME` record for `www` → `<your-github-username>.github.io` (without the repository name)
4. Wait for DNS (minutes to a few hours), then tick **Enforce HTTPS** on the same Pages settings page
   (the option can take up to a day to appear).

After the move, open the editor at `https://neriabaris.com/?edit`; its Settings need the GitHub user and repository
filled in by hand once, since the address no longer says which repository it is.
