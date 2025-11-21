export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Not allowed" });
    return;
  }

  // Riceve il file audio codificato base64 e il mime type
  const { audioBase64, audioMimeType } = req.body;
  if (!audioBase64 || !audioMimeType) {
    res.status(400).json({ error: "Audio non inviato." });
    return;
  }

  // Decodifica base64 a buffer
  const buffer = Buffer.from(audioBase64, "base64");

  // Prepara FormData per chiamata fetch
  const boundary = "openaiwhisper" + Date.now();
  const separator = `--${boundary}`;
  const end = `--${boundary}--`;

  // Struttura multipart/form-data (manualmente)
  let formBody = "";
  formBody += separator + "\r\n";
  formBody += 'Content-Disposition: form-data; name="file"; filename="audio.wav"\r\n';
  formBody += `Content-Type: ${audioMimeType}\r\n\r\n`;

  // Unisci formBody + audio buffer + parametri
  let body = Buffer.concat([
    Buffer.from(formBody),
    buffer,
    Buffer.from(`\r\n${separator}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n${separator}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\ntext\r\n${end}\r\n`)
  ]);

  // Chiamata API OpenAI Whisper
  const openaiRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": `multipart/form-data; boundary=${boundary}`
    },
    body
  });

  if (!openaiRes.ok) {
    const errorMsg = await openaiRes.text();
    res.status(500).json({ error: errorMsg });
    return;
  }

  const text = await openaiRes.text();
  // Risponde con la trascrizione
  res.status(200).json({ testo: text });
}
