# String Medic website

Pages: `index.html` (Home), `services.html`, `workshop.html`, `for-sale.html`, `contact.html`.

## Preview it
Extract the zip (right-click > Extract All), then double-click `index.html`.

## Put it online (free)
1. Make a free account at github.com and create a new repository called `stringmedic`.
2. Click **Add file > Upload files** and drag in everything from this folder. Commit.
3. Go to dash.cloudflare.com > **Workers & Pages > Create > Pages > Connect to Git**, pick the repo, leave build settings blank, and deploy.
4. You get a free link like `stringmedic.pages.dev`. Show Dad.

## Quick edits (all in `site.js`, at the top)
- **Contact form:** sign up at formspree.io with stringmedic@gmail.com, create a form, and paste its ID into `FORMSPREE_ID`. Until then, the form opens the visitor's email app.
- **For Sale listings (Dad can do this himself):**
  1. Make a Google Sheet with these headings in row 1: `name | price | description | photo | status`
  2. Photos: upload to a Google Drive folder, set sharing to "Anyone with the link", and paste each photo's share link in the `photo` column (several links separated by a space = several photos).
  3. `status` = available, on hold, or sold.
  4. File > Share > Publish to web > choose the sheet > CSV > Publish. Paste that link into `SALE_SHEET_CSV`.
  5. From then on, Dad just edits the sheet and the site updates within a few minutes.
  - Until the sheet is connected, previewing on your computer shows 3 example listings. The live site shows "Nothing listed right now" instead.
- **Closed for holidays:** in each page, find `<div class="notice" hidden>`, delete the word `hidden`, and edit the text.

## Before cancelling Squarespace
The Workshop gallery photos (flood guitar and violin) still load from Squarespace. Save them and send them to Claude to move into the `images` folder, otherwise they'll disappear when the plan ends.
