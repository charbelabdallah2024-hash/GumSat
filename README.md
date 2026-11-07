# GumSat site (Cloudflare Pages, free plan)

```
gumsat-cf/
  public/                      everything here is the website
    index.html                 landing page with the Whish QR code
    success.html               download page
    config.js                  EDIT THIS: your email / WhatsApp number
    whish-qr.png, styles.css, script.js, robots.txt, _headers
    files-xxxxxxxx.../         the 23 PDFs + 2 ZIPs in a secret-named folder
  functions/api/download.js    checks the access code, then serves a file
```

## How a sale works

Whish QR payments can't tell the website that someone paid, so delivery is manual:

1. Buyer scans the QR (or taps the button) and pays $6.00.
2. Buyer sends you a screenshot of the Whish confirmation.
3. You check that the money arrived in your Whish account.
4. You send the buyer: `https://YOUR-SITE.pages.dev/success?code=YOUR_CODE`

Message to paste:

> Thanks, payment received. Your GumSat pack is here: LINK
> Save all the files to your device. Open 00 Start Here first.

## Deploy on Cloudflare Pages

1. Edit `public/config.js` and add your `supportEmail` and/or `whatsappNumber`.
2. Make up a long random access code (24+ letters and numbers).
3. Upload the contents of this folder to a **private** GitHub repo. The repo's
   top level must show `public`, `functions` and `README.md`.
4. At dash.cloudflare.com create a free account, then go to
   Workers & Pages > Create > Pages > Connect to Git, and pick the repo.
   (Cloudflare's menus move around sometimes. You want the "Pages" option with Git.)
5. Build settings:
   - Framework preset: None
   - Build command: leave empty
   - Build output directory: `public`
6. Before you deploy, add an environment variable named `DOWNLOAD_CODE`
   with your access code as the value. Choose the encrypted / secret type if offered.
   If you already deployed, add it under Settings > Variables and Secrets and
   redeploy.
7. Deploy. Your site will be at `https://PROJECT-NAME.pages.dev`.

## Test

- `/success` with no code: download buttons are greyed out.
- `/success?code=wrong`: downloads say "Access denied".
- `/success?code=YOUR_CODE`: files download.
- Scan the QR with a second phone and check it opens your Whish payment page.
  Check which name a buyer sees there.

## Good to know

- The PDFs are stored in a folder with a long random name. Nobody can see that
  name from the website, and the function only hands files out with the right
  code. Keep the GitHub repo private. If you ever rename the folder, change
  `FILES_DIR` in `functions/api/download.js` to match.
- One code works for every buyer. If the link leaks, change `DOWNLOAD_CODE`,
  redeploy, and send the new link to real buyers. You can list several codes
  separated by commas (`code1,code2`), for example one per buyer.
- Free plan limits (from Cloudflare's docs): static pages are free and unlimited,
  the download function gets 100,000 requests a day, each file can be up to
  25 MiB. That is far above what this site needs.
- If you replace a PDF, keep the same file name. If you rebuild a ZIP, put the
  new one in the same folder with the same name.
