# vesl-gear-up

# VESL STEM — Preseason Gear-Up (GitHub Pages)

This is a card-based onboarding flow (Option 1: Gear-Up Checkpoint).
It stores progress in localStorage and can export a JSON completion file.

## Customize
Open `app.js` and update:

- `CONFIG.seasonName`
- `CONFIG.shortVideoEmbedUrl`
- `CONFIG.videoMinSeconds`

## Run locally
Just open `index.html` in a browser.

## Deploy on GitHub Pages
1. Create a repo (example: `vesl-gear-up`)
2. Upload these files to the repo root:
   - `index.html`
   - `styles.css`
   - `app.js`
   - `README.md`
3. In GitHub:
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: `main` (root)
4. Your site will appear at:
   `https://YOUR_USERNAME.github.io/vesl-gear-up/`

## Notes
- Student answers are stored in their browser (localStorage).
- The "Download Completion" button exports a JSON file.
- To collect responses automatically, replace download with a POST request to your backend.
