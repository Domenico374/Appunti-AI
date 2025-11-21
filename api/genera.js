// /api/genera.js - API per generare verbali, relazioni, pubblicazioni con log

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { testo, tipo, fileRiferimento } = req.body;
  console.log("Ricevuto /api/genera:", { testo, tipo, fileRiferimento });

  if (!testo || !tipo) {
    res.status(400).json({ error: "Testo o tipo mancante." });
    return;
  }

  // Opzione 1: logica locale base
  let contenuto = "";
  if (tipo === "verbale") {
    contenuto = `
VERBALE RIUNIONE
Data: ${new Date().toLocaleDateString("it-IT")} Ora: ${new Date().toLocaleTimeString("it-IT", { hour: '2-digit', minute: '2-digit' })}
${fileRiferimento ? "Documento di riferimento: " + fileRiferimento : ""}
====================
APPUNTI ESTRATTI
====================
${testo}
---
Verbale generato da Appunti-AI
    `;
  } else if (tipo === "relazione") {
    contenuto = `
RELAZIONE:
${testo}
Fonte: ${fileRiferimento || "N/A"}
Generato il: ${new Date().toLocaleString("it-IT")}
    `;
  } else if (tipo === "pubblicazione") {
    contenuto = `
PUBBLICAZIONE:
${testo}
Riferimento: ${fileRiferimento || "N/A"}
Creato con Appunti-AI il ${new Date().toLocaleString("it-IT")}
    `;
  } else {
    contenuto = testo;
  }

  // Opzione 2: chiamata OpenAI GPT (attiva togliendo il commento)
  /*
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {role: "system", content: `Devi generare un ${tipo} da questo testo. Sii sintetico e ordinato.`},
          {role: "user", content: testo}
        ]
      })
    });
    const data = await response.json();
    contenuto = data.choices?.[0]?.message?.content || contenuto;
  } catch (err) {
    console.error("Errore OpenAI:", err);
  }
  */

  res.status(200).json({ contenuto });
}
