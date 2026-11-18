# Portfolio template

A multilingual, markdown-driven personal site: home, projects, experience, resources, music, blog, photography, a standalone CV and portfolio, an apps launcher, light/dark themes, video and bubble backgrounds, and a settings page. It is a static site (no build step beyond two tiny index generators) and deploys as-is to GitHub Pages, Netlify or any static host.

Every page ships in **English, French, Italian, Japanese and Mandarin Chinese**. All text is placeholder text: replace it, or delete the languages you don't need.

## Quick start

```bash
npm run dev          # serves the site at http://localhost:5500 (needs Python 3)
npm run build        # regenerates posts/index.json and music/index.json (needs Node 18+)
```

Open <http://localhost:5500>. Do not open `index.html` via `file://`: the pages fetch markdown at runtime.

## Deploy to GitHub Pages

The `Deploy to GitHub Pages` workflow builds the content indexes and deploys the repository when changes are pushed to `main`. To enable it, open **Settings → Pages** for the repository and set **Build and deployment → Source** to **GitHub Actions**. You can also start a deployment from the **Actions** tab with **Run workflow**.

For a project site such as `https://<owner>.github.io/<repository>/`, keep the site at the repository root; the site detects and accounts for that path. If you rename the repository, GitHub Pages uses the new repository name in the site URL.

## Make it yours

Search the whole repo for these placeholders and replace them:

| Placeholder | Replace with |
| --- | --- |
| `Your Name` | your name |
| `Your Job Title`, `Your Company`, `Your University`, `Your School` | your details |
| `example.com` | your domain (also used in `sitemap.xml`, `robots.txt`, `llms.txt`, JSON-LD and `<link rel="canonical">`) |
| `hello@example.com` | your email |
| `your-username`, `yourusername`, `your_username`, `your.username` | your handles on GitHub, LinkedIn, X, Mastodon, YouTube, Instagram, etc. |
| `your-username/portfolio-template` | your GitHub repo (`assets/js/theme.js` reads its last-push date for the footer) |

Handy one-liner (macOS/Linux; review the diff afterwards):

```bash
grep -rIl "Your Name" . --exclude-dir=.git | xargs sed -i 's/Your Name/Ada Lovelace/g'
```

Then replace the placeholder media in `assets/images/` (`profile.png`, `favicon.png`, `apple-touch-icon.png`, `og-image.jpg`, `home-carousel/`, `cv/`, `portfolio/`), `photos/`, `assets/audio/` and `assets/documents/` (CV and portfolio PDFs), and edit `CNAME` if you use a custom domain (the file is not included; create it with your domain on one line).

Two things to check at the end:

- **Footer visitor counter** (`pages/footer.md`) points at `hitscounter.dev` for `example.com`: change it to your domain or delete the block.
- **Video backgrounds** (`assets/videos/hampton_court.mp4`, `lake_district.mp4`) are sample footage. Swap them for your own (see `scripts/reencode-video.sh`), update the paths at the top of `assets/js/theme.js`, and update the credit line (`footer.videoBg` in `assets/js/i18n.js`).

## Where things live

| What | Where |
| --- | --- |
| Page content (all five languages) | `pages/*.md`: `home`, `projects`, `experience`, `resources`, `music`, `blog`, `info`, `apps`, `textbook-project` (a spare "featured project" tab), `releases`, `footer`, `settings`, `404`, `demo` |
| Blog posts | `posts/YYYY-MM-DD-slug.md`; run `npm run build` to refresh `posts/index.json` |
| Music entries | `music/YYYY-MM-DD-slug.md`, audio in `assets/audio/`, scores in `music/scores/` |
| Photography | `photos/` plus `photos/index.json` (caption, description, tags, coordinates); intro text in `photography/photography.md` |
| Apps launcher | `switcher/apps.json` and `switcher/icons/` |
| UI strings, page titles and meta descriptions | `assets/js/i18n.js` |
| SEO, JSON-LD, Open Graph | `index.html` `<head>` and `assets/js/seo.js` |
| Standalone CV | `cv/` (`index.html`, `awards/`, `skills/`, `languages/`, `references/`) |
| Standalone portfolio | `portfolio/index.html` |
| Styles | `assets/css/` |

### The markdown dialect

Pages are plain markdown plus a few fenced blocks. `pages/demo.md` (served at `/demo`) shows all of them live. The important ones:

- ```` ```language-content ```` with `::en`, `::fr`, `::zh`, `::ja`, `::it` sections: per-language content. Add `hide` to omit the language pill.
- ```` ```projects-data ````, ```` ```experience-data ````, ```` ```resources-data ````: JSON arrays rendered as filterable cards.
- ```` ```rotations ````, ```` ```title-rotations ````: typed/rotating text.
- ```` ```carousel ```` with `--- 📸 Label` slides, ```` ```ipod-coverflow ````, ```` ```tcolorbox ````, ```` ```link-preview ````, ```` ```post-data ````.
- `::vspace 1em`, `{.wow .animated .fadeInUp}` (reveal animations), `[text]{tip: …}` (tooltips), `[cmd]{kbd}` (key caps), `[Mac]{fa:brands/apple}` (Font Awesome icons).

### Removing a language

Delete its `::xx` sections from the markdown pages, its entries in `assets/js/i18n.js`, and its option in `pages/settings.md` (`data-options="en,fr,it,ja,zh"`).

## Automation (optional, GitHub Actions)

- `.github/workflows/update-content-indexes.yml` regenerates `posts/index.json` and `music/index.json` when you push new posts or music.
- `.github/workflows/update-release-log.yml` appends each commit to `pages/releases.md` and updates the "Latest update" date in the footer.

Delete either workflow if you don't want it.

## Keyboard shortcuts (built in)

`⌘/Ctrl + ,` settings · `⌘/Ctrl + M` minimal ("Marie Kondo") mode · `⌘/Ctrl + /` performance mode · `⌘/Ctrl + ;` video background · `⌘/Ctrl + \` bubbles.

## Licence

Add your own. Fonts under `assets/fonts/` are redistributable under the licences listed in `assets/fonts/README.md`.
