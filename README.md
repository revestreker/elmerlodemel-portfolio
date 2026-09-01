# elmerlodemel.com

Static site — no build step, no framework, no CMS.

```
index.html          indigo bar · autoplaying reel + logo → "Explore my work" cards → contact
work.html           one category's projects, read from ?c=<slug>
css/styles.css      all styling; colour system, type and shape are CSS vars at the top
js/main.js          bar, hero video, cards, category page, lightbox, form, social icons
data/categories.js  the four categories: slug, title, cover image
data/projects.js    every project: title, category, items[]
assets/img/<category>/<project>/   artwork
assets/logo/        the wordmark (white + currentColor versions)
assets/video/reel.mp4, assets/img/reel-poster.jpg
```

## Running it

Just open `index.html` — double-clicking it works. It also works from any
server if you'd rather:

```bash
python3 -m http.server 8000
```

The data lives in `.js` files rather than `.json` for exactly this reason: a
JSON file has to be fetched, and browsers block `fetch()` on pages opened from
the disk, which left the page stuck on "Loading work…" with nothing to click.
Loading the data as ordinary scripts sidesteps that. They're still plain data —
one array per file.

## Retuning the look

Everything visual is in the `:root` block at the top of `css/styles.css`:
colours (`--indigo`, `--orange`, `--orange-light`, `--bone`), fonts
(`--display` is Bricolage Grotesque, `--body` is Inter) and the corner radii
(`--r-xl` … `--r-pill`). Change them there, not in the rules below.

## The indigo bar

Built in `js/main.js` (`renderTopbar`) from the same `data/categories.js` the
cards use, so adding or renaming a category updates the bar, the cards and the
chips on the category pages at once. It's fixed to the top and overlays the
reel; on narrow screens the links wrap and `syncBarHeight` measures the real
height so nothing hides underneath.

## The hero reel

`index.html` sets `data-start="2.6"` on the `<video>`. The reel opens with its
own "ELMER LØDEMEL — animation reel 2026" title card, which runs to about 2.4s
and would sit right under the logo overlay; `data-start` skips past it, on first
play and again on every loop. Set it to `0` to play from the first frame.

Autoplay only works muted — that's a browser rule, not a choice. The "Sound off"
pill hands the audio back. If a browser blocks even muted autoplay, the poster
shows and the pill becomes "Play reel". With `prefers-reduced-motion` the reel
doesn't autoplay and the pill becomes a play/pause toggle.

## Adding work

Drop images in `assets/img/<category>/<project>/`, then add the project to the
array in `data/projects.js`:

```js
{
  "title": "Project name",
  "category": "Backgrounds",
  "items": ["assets/img/concept-world/project/first.jpg"]
}
```

`category` must match one of the four titles in `data/categories.js` (matching
is case- and punctuation-insensitive). Spaces in paths must be written as `%20`.

`items` is a list, rendered top to bottom in the order you write it. Runs of
stills flow into one masonry block; anything else gets its own full-width block:

```js
"assets/img/…/shot.jpg"                                   // a still
{ "src": "assets/img/…/shot.jpg", "alt": "Turnaround" }   // a still with alt text

{ "type": "vimeo",  "id": "1063107002", "title": "Animatic" }
{ "type": "vimeo",  "id": "1051852019", "hash": "b982cfd35d" }   // unlisted video
{ "type": "youtube","id": "8LwFnl3DYJo", "start": 1762 }         // start = seconds
{ "type": "speakerdeck", "id": "9f20…", "ratio": "710/297",
  "href": "https://speakerdeck.com/…" }
{ "type": "video",  "src": "assets/video/x.mp4", "poster": "assets/img/x.jpg" }

{ "type": "link", "href": "https://…", "image": "assets/img/…/shot.jpg",
  "label": "Play the game", "feature": true }                    // image that links out

{ "type": "locked", "password": "…", "note": "…" }               // see the warning below
```

Only stills go into the lightbox; the first still in a project is still what a
gallery would lead with, so put your strongest one first.

To change what a category card shows on the front page, edit its `cover` in
`data/categories.js`. Note the folder on disk for Backgrounds is still
`assets/img/concept-world/` — only the display name changed.

## The NDA tiles — read this

`{ "type": "locked" }` renders a password box. **It is not security.** The
password sits in `data/projects.js`, which anyone can read by viewing source,
and every file in this repository is public the moment it's pushed. It hides
the note from a casual visitor and nothing more.

So: never put NDA artwork in this repo, behind that gate or anywhere else. Right
now the two tiles reveal only a short "get in touch" line, which is safe. If a
studio ever lets you show the work, host it somewhere with real access control
and link out.

## Videos

The site serves compressed copies. Masters live in `assets/video/_masters/`,
which git ignores — keep them, don't push them.

```bash
# re-compress a reel after replacing the master
ffmpeg -i assets/video/_masters/reel-master.mp4 \
  -c:v libx264 -crf 27 -preset slow -vf scale=1600:-2 -pix_fmt yuv420p \
  -c:a aac -b:a 96k -movflags +faststart assets/video/reel.mp4
```

The reel arrived at 76 MB / 9 Mbps; that's 11 MB now at the same visible
quality behind a scrim. Anything much over ~15 MB will make the front page
crawl on mobile data.

## Wiring the contact form

The form posts nowhere by default — submitting opens a pre-filled mail draft to
elmer@revestreker.com. To take real submissions, set an endpoint from a form
service (Formspree, Basin, Netlify Forms):

```html
<form class="contact-form" id="contact-form" action="https://formspree.io/f/XXXX" method="POST">
```

The hidden `company` field is a honeypot; leave it alone.

## Deploying

The site is plain files — any static host works. For GitHub Pages:

```bash
gh auth login
gh repo create elmerlodemel-portfolio --public --source=. --remote=origin --push
gh api -X POST repos/:owner/elmerlodemel-portfolio/pages -f source[branch]=main -f source[path]=/
```

After that it's live at `https://<your-user>.github.io/elmerlodemel-portfolio/`.
Pointing elmerlodemel.com at it is a separate DNS change — don't do it until
you're happy with the site, since it replaces what's live now.

## Notes

- Category pages are linkable: `work.html?c=character-design`, `?c=backgrounds`,
  `?c=storyboards`, `?c=other`.
- Lightbox: arrow keys page through a project, Esc closes, the strip along the
  bottom jumps to any image.
- Social icons and the email address are in `js/main.js` (`SOCIALS`,
  `FALLBACK_EMAIL`).
