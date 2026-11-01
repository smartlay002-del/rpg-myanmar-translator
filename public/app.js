const fileInput = document.getElementById("file");
const fileName = document.getElementById("fileName");
const translateButton = document.getElementById("translate");
const downloadButton = document.getElementById("download");
const status = document.getElementById("status");
const progress = document.getElementById("progress");
let result = null;
let resultName = "translated.json";

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  fileName.textContent = file ? file.name : "ဖိုင်မရွေးရသေးပါ";
  translateButton.disabled = !file;
  downloadButton.hidden = true;
  result = null;
  status.textContent = "";
  progress.style.width = "0%";
});

translateButton.addEventListener("click", async () => {
  const file = fileInput.files[0];
  if (!file) return;
  translateButton.disabled = true;
  status.textContent = "ဖိုင်ကို စစ်ဆေးပြီး ဘာသာပြန်နေပါတယ်…";
  progress.style.width = "15%";
  try {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/translate-file", { method: "POST", body: form });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "ဘာသာပြန်မရပါ။");
    result = data.json;
    resultName = data.fileName || "translated.json";
    progress.style.width = "100%";
    status.textContent = `ပြီးပါပြီ။ စာသား ${data.translatedCount} ခု ဘာသာပြန်ပြီးပါပြီ။`;
    downloadButton.hidden = false;
  } catch (error) {
    progress.style.width = "0%";
    status.textContent = `အမှား: ${error.message}`;
  } finally {
    translateButton.disabled = false;
  }
});

downloadButton.addEventListener("click", () => {
  if (!result) return;
  const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = resultName;
  a.click();
  URL.revokeObjectURL(url);
});