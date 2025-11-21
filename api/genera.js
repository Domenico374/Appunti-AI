// api/genera.js
export default function handler(req, res) {
  res.status(200).json({ 
    contenuto: "Risposta API funzionante!",
    metodo: req.method,
    ricevuto: req.body || null
  });
}
