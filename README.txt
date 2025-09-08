
# Employee Punch System (PWA-ready)

Files:
- index.html
- css/style.css
- js/app.js
- manifest.json
- sw.js
- assets/fingerprint.svg

How to use locally:
1. Extract the zip folder on your machine or phone storage.
2. Best practice: serve it via a simple static server (recommended):
   - Python 3: `python -m http.server` (then open http://localhost:8000 on desktop or http://<pc-ip>:8000 on phone)
   - Or upload to GitHub Pages / Netlify
3. For offline app-like experience:
   - Open the site in Chrome on Android and "Add to Home screen".
   - On iOS Safari, "Add to Home Screen" via share sheet (limited service worker support).

Notes:
- Data is stored in browser localStorage per device (private to each phone).
- When total time reaches 8:00:00 the display will show a checkmark and visually indicate completion.
