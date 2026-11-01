import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }
});

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "2mb" }));

// Keep the Google Cloud Translation API key on the server.
// Set GOOGLE_TRANSLATE_API_KEY in your hosting provider's environment variables.
async function translateText(text) {
  const params = new URLSearchParams({
    q: text,
    langpair: "en|my"
  });

  const response = await fetch(
    `https://api.mymemory.translated.net/get?${params}`
  );

  const data = await response.json();

  if (!response.ok || data.responseStatus !== 200) {
    throw new Error(data.responseDetails || "Translation failed");
  }

  return data.responseData.translatedText;
}

app.post("/api/translate", async (req, res) => {
  try {
    const texts = req.body?.texts;
    if (!Array.isArray(texts) || texts.length > 100) {
      return res.status(400).json({ error: "စာသား ၁၀၀ ထက်မပိုစေရပါ။" });
    }
    const translations = [];
    // Sequential requests keep the initial version gentle on API quotas.
    for (const text of texts) {
      translations.push(await translateText(String(text)));
    }
    res.json({ translations });
  } catch (error) {
    res.status(500).json({ error: error.message || "ဘာသာပြန်ရာတွင် အမှားဖြစ်နေသည်။" });
  }
});

app.post("/api/translate-file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "JSON ဖိုင်ရွေးပါ။" });
    const parsed = JSON.parse(req.file.buffer.toString("utf8"));
    const candidates = [];

    // RPG Maker MV/MZ map event commands:
    // 401 = Show Text line; 102 = Show Choices.
    // Translate only human-readable strings in these known command positions.
    function walk(value, parent = null, key = null) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const item of value) walk(item, value, null);
        return;
      }
      if (value.code === 401 && Array.isArray(value.parameters) &&
          typeof value.parameters[0] === "string") {
        candidates.push({ object: value.parameters, index: 0 });
      }
      if (value.code === 102 && Array.isArray(value.parameters) &&
          Array.isArray(value.parameters[0])) {
        value.parameters[0].forEach((choice, index) => {
          if (typeof choice === "string") candidates.push({ object: value.parameters[0], index });
        });
      }
      for (const [childKey, child] of Object.entries(value)) walk(child, value, childKey);
    }
    walk(parsed);

    const texts = candidates.map(c => c.object[c.index]).filter(t => t.trim());
    const translated = [];
    for (const text of texts) translated.push(await translateText(text));

    let cursor = 0;
    for (const candidate of candidates) {
      if (typeof candidate.object[candidate.index] === "string" &&
          candidate.object[candidate.index].trim()) {
        candidate.object[candidate.index] = translated[cursor++];
      }
    }

    res.json({
      fileName: req.file.originalname.replace(/\.json$/i, "") + "_my.json",
      translatedCount: translated.length,
      json: parsed
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "ဖိုင်ကို ဖတ်မရပါ။ JSON မှန်မမှန် စစ်ပါ။" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`RPG Myanmar Translator running on ${port}`));
