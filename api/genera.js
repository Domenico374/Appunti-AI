export default function handler(req, res) {
  if (req.method === 'POST') {
    const { testo, tipo, fileRiferimento } = req.body || {};
    let contenuto = "";

    if (tipo === "verbale") {
      contenuto = `VERBALE:\n\n${testo}\n\nDocumento: ${fileRiferimento || "(nessuno)"}`
    } else if (tipo === "relazione") {
      contenuto = `RELAZIONE:\n\n${testo}\n\nFonte: ${fileRiferimento || "(nessuna)"}`
    } else if (tipo === "pubblicazione") {
      contenuto = `PUBBLICAZIONE:\n\n${testo}\n\nRiferimento: ${fileRiferimento || "(nessuno)"}`
    } else {
      contenuto = `Default: ${testo}`;
    }

    res.status(200).json({ contenuto });
  } else {
    res.status(200).json({ contenuto: "Risposta API funzionante!", metodo: req.method, ricevuto: null });
  }
}
