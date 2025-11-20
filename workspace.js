// workspace.js — logica base della schermata di lavoro

document.addEventListener("DOMContentLoaded", () => {
  const fileInfoEl       = document.getElementById("fileInfo");
  const previewTextEl    = document.getElementById("previewText");
  const notesEl          = document.getElementById("notes");
  const summaryBox       = document.getElementById("summaryBox");
  const highlightsBox    = document.getElementById("highlightsBox");
  const todoBox          = document.getElementById("todoBox");
  const tagsBox          = document.getElementById("tagsBox");
  const minutesResultEl  = document.getElementById("minutesResult");

  // 1) Recupera info file da localStorage (salvata da index)
  try {
    const raw = localStorage.getItem("appunti_ai_lastFiles");
    if (raw) {
      const files = JSON.parse(raw);
      if (files && files.length) {
        const f = files[0];
        fileInfoEl.textContent = `${f.name} (${Math.round(f.sizeKb)} KB)`;
      }
    }
  } catch (e) {
    console.warn("Impossibile leggere i file da localStorage", e);
  }

  // 2) Pulsante "Nuovo file" → torna alla home
  document.getElementById("btnNewFile")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // 3) Appunti: pulizia base
  document.getElementById("btnClean")?.addEventListener("click", () => {
    const t = (notesEl.value || "")
      .replace(/\r/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]{2,}/g, " ")
      .trim();
    notesEl.value = t;
  });

  // 4) Copia anteprima -> Appunti
  document.getElementById("btnFromPreview")?.addEventListener("click", () => {
    notesEl.value = previewTextEl.value || "";
  });

  // 5) Genera verbale (versione semplice, locale)
  document.getElementById("btnGenerateMinutes")?.addEventListener("click", () => {
    const src = (notesEl.value || "").trim();
    if (!src) {
      alert("Scrivi o incolla degli appunti prima di generare il verbale.");
      return;
    }

    const dateStr = new Date().toLocaleString("it-IT");
    const lines   = src.split("\n").map(l => l.trim()).filter(Boolean);
    const bullets = lines.map(l => "- " + l).join("\n");

    const minutes =
`# Verbale riunione

_Data:_ ${dateStr}

## Punti trattati
${bullets}

## Note
Verbale generato in modalità locale (senza AI).`;

    minutesResultEl.textContent = minutes;
  });

  // Reset totale
  document.getElementById("btnReset")?.addEventListener("click", () => {
    previewTextEl.value = "";
    notesEl.value = "";
    summaryBox.textContent = "—";
    highlightsBox.textContent = "—";
    todoBox.textContent = "—";
    tagsBox.textContent = "—";
    minutesResultEl.textContent = "Il verbale comparirà qui…";
  });

  // 6) Analisi "AI" locale (placeholder in attesa del modello vero)

  document.getElementById("btnSummarize")?.addEventListener("click", () => {
    const src = (notesEl.value || "").trim();
    if (!src) { alert("Inserisci del testo negli appunti."); return; }
    const lines  = src.split("\n").map(l => l.trim()).filter(Boolean);
    const max    = 5;
    const short  = lines.slice(0, max).join(" ");
    summaryBox.textContent = short || "—";
  });

  document.getElementById("btnHighlights")?.addEventListener("click", () => {
    const src = (notesEl.value || "").trim();
    if (!src) { alert("Inserisci del testo negli appunti."); return; }
    const lines = src.split("\n").map(l => l.trim()).filter(Boolean);
    const picks = lines.slice(0, 5);
    highlightsBox.textContent = picks.length
      ? picks.map(l => "• " + l).join("\n")
      : "—";
  });

  document.getElementById("btnTodos")?.addEventListener("click", () => {
    const src = (notesEl.value || "").toLowerCase();
    if (!src.trim()) { alert("Inserisci del testo negli appunti."); return; }
    const todoLines = src
      .split("\n")
      .map(l => l.trim())
      .filter(l =>
        /(fare|contattare|inviare|preparare|organizzare|verificare|decidere|aggiornare)/i.test(l)
      );
    todoBox.textContent = todoLines.length
      ? todoLines.map(l => "□ " + l).join("\n")
      : "—";
  });

  document.getElementById("btnTags")?.addEventListener("click", () => {
    const src = (notesEl.value || "").toLowerCase();
    if (!src.trim()) { alert("Inserisci del testo negli appunti."); return; }

    const TAGS = {
      "Bilancio": ["budget","costi","spese","preventivo","consuntivo"],
      "Pianificazione": ["piano","scadenza","deadline","timeline","roadmap"],
      "Prodotto": ["feature","rilascio","versione","beta","bug","release"],
      "Persone": ["team","ruolo","responsabile","referente","manager"],
      "Legale": ["contratto","privacy","gdpr","accordo","licenza"]
    };

    const found = [];
    for (const tag in TAGS) {
      if (TAGS[tag].some(k => src.includes(k))) found.push(tag);
    }
    tagsBox.textContent = (found.length ? found : ["Generale"]).join(", ");
  });

  // 7) Copia / download verbale
  document.getElementById("btnCopyMinutes")?.addEventListener("click", async () => {
    const t = minutesResultEl.textContent || "";
    if (!t.trim()) return;
    try {
      await navigator.clipboard.writeText(t);
      alert("Verbale copiato negli appunti.");
    } catch {
      alert("Impossibile copiare il verbale.");
    }
  });

  document.getElementById("btnDownloadMinutes")?.addEventListener("click", () => {
    const t = minutesResultEl.textContent || "";
    if (!t.trim()) return;
    const blob = new Blob([t], { type: "text/markdown;charset=utf-8" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "verbale_appunti_ai.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  });
});
