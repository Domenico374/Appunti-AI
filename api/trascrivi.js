// /api/trascrivi.js - API per trascrizione audio con OpenAI Whisper

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Not allowed" });
    return;
  }

  // Log di debug per verificare il payload ricevuto
  const { audioBase64, audioMimeType } = req.body;
  console.log("Ricevuto /api/trascrivi:", { audioBase64: !!audioBase64, audioMimeType });

  if (!audioBase64 || !audioMimeType) {
    res.status(400).json({ error: "Audio non inviato." });
    return;
  }

  // Decodifica base64 a buffer
  const buffer = Buffer.from(audioBase64, "base64");

  // Prepara multipart/form-data manualmente
  const boundary = "openaiwhisper" + Date.now();
  const separator = `--${boundary}`;
  const end = `--${boundary}--`;

  let formBody = "";
  formBody += separator + "\r\n";
  formBody += 'Content-Disposition: form-data; name="file"; filename="audio.wav"\r\n';
  formBody += `Content-Type: ${audioMimeType}\r\n\r\n`;

  // Unisci formBody + audio buffer + parametri obbligatori
  let body = Buffer.concat([
    Buffer.from(formBody),
    buffer,
    Buffer.from(
      `\r\n${separator}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-1\r\n` +
      `${separator}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\ntext\r\n${end}\r\n`
    )
  ]);

  // Chiamata API OpenAI Whisper
  try {
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
      console.error("Errore Whisper API:", errorMsg);
      res.status(500).json({ error: errorMsg });
      return;
    }

    const text = await openaiRes.text();
    // Log di conferma risultato
    console.log("Trascrizione ricevuta:", text?.slice(0, 120));
    res.status(200).json({ testo: text });
  } catch (err) {
    console.error("Errore chiamata Whisper:", err);
    res.status(500).json({
