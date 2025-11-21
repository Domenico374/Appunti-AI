// app.js - Gestione upload file TXT, PDF, DOCX, audio per Appunti-AI

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const notesBox = document.getElementById("notes");

  // Funzione principale: rileva tipo file e attiva pipeline corretta
  fileInput?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.type.startsWith("audio/")) {
        trascriviAudioOpenAI(file);
        return;
      }
      // Gestione file di testo classici (TXT, PDF, DOCX, MD, ...)
      leggiTesto(file);
    }
  });

  // Funzione di parsing per file TXT, PDF, DOCX, MD
  function leggiTesto(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Salva il testo estratto in localStorage + textarea appunti
      const extracted = e.target.result;
      localStorage.setItem("appunti_ai_extractedText", extracted);
      notesBox.value = extracted;
    };
    reader.readAsText(file, "UTF-8");
  }

  // Funzione di invio audio a OpenAI Whisper tramite backend Vercel
  function trascriviAudioOpenAI(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const audioBase64 = e.target.result.split(',')[1];
      fetch("/api/trascrivi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioBase64,
          audioMimeType: file.type
        })
      })
      .then(r => r.json())
      .then(data => {
        if (data.testo) {
          localStorage.setItem("appunti_ai_extractedText", data.testo);
          notesBox.value = data.testo;
          alert("Trascrizione audio completata!");
        } else {
          alert("Errore trascrizione audio.");
        }
      })
      .catch(() => alert("Errore nella richiesta di trascrizione audio."));
    };
    reader.readAsDataURL(file); // Converte l'audio in base64
  }

  // Opzionale: ripristina appunti già salvati
  const estrattiSalvati = localStorage.getItem("appunti_ai_extractedText");
  if (estrattiSalvati) {
    notesBox.value = estrattiSalvati;
  }
});
