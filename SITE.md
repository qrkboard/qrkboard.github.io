# QRK Board website

The public site for QRK Board, served by GitHub Pages from `main` of
`qrkboard/qrkboard.github.io` at https://qrkboard.github.io. The board itself
(Pi and Android TV app) lives in `bradrblack/qrk-board`.

Plain static files, no build step.

| Path | What |
|---|---|
| `index.html` | All the content: hero, platform badges, screenshot picker, layout editor, For home, For business, Free and Pro, privacy, FAQ, contact |
| `styles.css` | All styling (dark page, DM Sans and Manrope from Google Fonts, rainbow gradient text) |
| `script.js` | Mobile menu, screenshot picker, the animated Q logo |
| `assets/screens/` | 12 board screenshots: `{landscape,portrait}-{1,2,3}-{dark,light}.jpg` (1 Everything, 2 Photo clock, 3 Calendar) |
| `assets/layout-editor.png` | The web app's layout editor |
| `assets/qrk-mark.svg` | Static logo mark (not used on the page now; the page draws the animated logo) |

## Decisions so far

- Headline: "Your screen. Your dashboard. Nothing complicated." with "Nothing
  complicated." in the rainbow gradient.
- Sub-head: "Weather, Calendar, News, Security Cameras and more!"
- Page title: "QRK Board".
- The logo is the real animated Q (a canvas, `canvas.logo`, drawn in
  `script.js`), in the header and the footer. The tab icon is the purple ring
  with a pink tail.
- Contact: qrkboard@gmail.com.
- No stocks or markets in any image or text. The Android store build ships
  without the markets tile too.
- Screenshots are renders of the board's demo data
  (`qrk-board --demo --display=headless --png`); how to make them again is in
  `qrk-board/docs/screens/README.md`. Do not stretch them: images need
  `height:auto`.
- Screen text stays short and about now (see `CLAUDE.md` in qrk-board).

## Open items

- "For home" and "For business" show mock-ups drawn in HTML and CSS with
  made-up numbers. Replace them with real screenshots (family layout; cameras
  and metrics, plus a branding tile for Pro).
- Store badges (Google Play, Amazon Appstore, Raspberry Pi) are plain icons
  without links. Swap in the official badges and link live listings when they
  exist, following each brand's guidelines.
- Wording to confirm against the product: the Free and Pro split, "Affordable
  monthly plan" (no price is shown), Fire TV availability, camera support
  claims (Reolink and webhook alerts), and "We don't collect user data".
- A real privacy policy page; the home page text is not a substitute.
- Landscape and portrait shots could be redone with better demo content.

## Changing it

Edit the files and open a pull request into `main`; merging publishes the
site within a minute or two. To preview locally: `python3 -m http.server`
in this folder and open http://localhost:8000.
