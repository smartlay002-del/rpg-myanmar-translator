# RPG Myanmar Translator

## Run locally
1. Install Node.js 18 or newer.
2. In this folder run: `npm install`
3. Set your Google Cloud Translation API key as `GOOGLE_TRANSLATE_API_KEY`.
   - Windows PowerShell: `$env:GOOGLE_TRANSLATE_API_KEY="YOUR_KEY"`
   - macOS/Linux: `export GOOGLE_TRANSLATE_API_KEY="YOUR_KEY"`
4. Run: `npm start`
5. Open `http://localhost:3000`

## Deploy publicly
Deploy this Node.js app to a host that supports Node.js (for example Render, Railway, or a VPS).
Set `GOOGLE_TRANSLATE_API_KEY` in the host's Environment Variables. Do not put the key in `public/app.js` or HTML.
After deployment, add the public domain to Google Search Console and submit `/sitemap.xml` (create sitemap after choosing the final domain).

## Current parser scope
For RPG Maker MV/MZ map JSON, translates command 401 Show Text lines and command 102 Show Choices strings.
Does not translate scripts, commands, IDs, keys, or map metadata. Item and Quest database JSON formats are not part of the uploaded Map001 file and need dedicated parsers before enabling those categories.
