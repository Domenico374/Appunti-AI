// workspace.js – gestione semplice del workspace di Appunti-AI
document.addEventListener("DOMContentLoaded", () => {
  const fileListEl     = document.getElementById("fileListWorkspace");
  const fileCountBadge = document.getElementById("fileCountBadge");
  const noFilesMsg     = document.getElementById("noFilesMsg");

  const notesEl        = document.getElementById("notes");
  const btnClearNotes  = document.getElementById("btnClearNotes");

  const btnSummary     = document.getElementById("btnSummary");
  const btnHighlights  = document.getElementById("btnHighlights");
  const btnTodo        = document.getElementById("btnTodo");

  const summaryBox     = document.getElementById("summaryBox");
  const highlightsBox  = document.getElementById("highlightsBox");
  const todoBox        = document.getElementById("todoBox");

  const minutesBox     = document.getElementById("minutesBox");
  const btnGenMinutes  = document.getElementById("btnGenerateMinutes");
  const btnCopyMinutes = document.getElementById("btnCopyMinutes");

  /* ===============================
   * 1. Recupero file da localStorage
   * =============================== */
  let filesMeta = [];
  try {
    const raw = localStorage.getItem("appunti_ai_lastFiles");
    if (raw) {
      filesMeta = JSON.parse(raw) || [];
    }
  } catch (e) {
    console.warn("Errore nel leggere i file dal localStorage", e);
  }

  renderFileList(filesMeta);

  function renderFileList(list) {
    if (!fileListEl) return;
    fileListEl.innerHTML = "";

    if (!list || !list.length) {
      if (noFilesMsg) {
        noFilesMsg.classList.remove("hidden");
        fileListEl.appendChild(noFilesMsg);
      }
      if (fileCountBadge) fileCountBadge.textContent = "0 file";
      return;
    }

    if (noFilesMsg) noFilesMsg.remove?.();

    list.forEach((f) => {
      const li = document.createElement("li");
      li.className = "flex items-center justify-between text-sm";
      const size = Math.round(f.sizeKb || 0);

      li.innerHTML = `
        <span class="truncate max-w-[220px]">${f.name}</span>
        <span class="text-xs text-slate-400 ml-2">${size} KB</span>
      `;
      fileListEl.appendChild(li);
    });

    if (fileCountBadge) {
      fileCountBadge.textContent =
        list.length === 1 ? "1 file" : `${list.length} file`;
    }
  }

  /* ===============================
   * 2. Note: pulizia
   * =============================== */
  if (btnClearNotes && notesEl) {
    btnClearNotes.addEventListener("click", () => {
      notesEl.value = "";
    });
  }

  /* ===============================
   * 3. Analisi “intelligente” locale (demo)
   *    – niente AI remota, solo logica JS
   * =============================== */

  // Utility: pulizia testo di base
  function cleanText(t) {
    return String(t || "")
      .replace(/\s+/g, " ")
      .replace(/\s*\n\s*/g, "\n")
      .trim();
  }

  // Split in frasi naive
  function splitSentences(t) {
    return cleanText(t)
      .split(/(?<=[\.\!\?])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  // 3.1 Riassunto: prime N frasi
  function buildSummary(text, maxSentences = 3) {
    const sents = splitSentences(text);
    if (!sents.length) return "";
    return sents.slice(0, maxSentences).join(" ");
  }

  // 3.2 Punti chiave: righe con parole “forti”
  function buildHighlights(text) {
    const lines = cleanText(text).split("\n").filter(Boolean);
    if (!lines.length) return "";

    const keywords = ["decisione", "decide", "concordato", "azione", "task", "scadenza", "entro", "responsabile"];
    const keyLines = lines.filter((l) =>
      keywords.some((kw) => l.toLowerCase().includes(kw))
    );

    const selected = keyLines.length ? keyLines : lines.slice(0, 5);
    return selected.map((l) => `• ${l}`).join("\n");
  }

  // 3.3 To-Do: linee con verbi di azione
  function buildTodo(text) {
    const lines = cleanText(text).split("\n").filter(Boolean);
    if (!lines.length) return "";

    const verbs = ["fare", "inviare", "preparare", "contattare", "verificare", "aggiornare", "condividere", "organizzare", "pagare", "prenotare"];
    const todos = [];

    lines.forEach((l) => {
      const lower = l.toLowerCase();
      if (verbs.some((v) => lower.includes(v))) {
        todos.push(`□ ${l}`);
      }
    });

    if (!todos.length) {
      return "□ Nessuna azione esplicita trovata. Aggiungi manualmente i task principali.";
    }
    return todos.join("\n");
  }

  function ensureNotes() {
    const txt = notesEl?.value.trim();
    if (!txt) {
      alert("Inserisci prima degli appunti (colonna sinistra).");
      return null;
    }
    return txt;
  }

  if (btnSummary) {
    btnSummary.addEventListener("click", () => {
      const txt = ensureNotes();
      if (!txt) return;
      summaryBox.textContent = buildSummary(txt, 3) || "Nessun contenuto da riassumere.";
    });
  }

  if (btnHighlights) {
    btnHighlights.addEventListener("click", () => {
      const txt = ensureNotes();
      if (!txt) return;
      highlightsBox.textContent =
        buildHighlights(txt) || "Nessun punto chiave individuato.";
    });
  }

  if (btnTodo) {
    btnTodo.addEventListener("click", () => {
      const txt = ensureNotes();
      if (!txt) return;
      todoBox.textContent = buildTodo(txt);
    });
  }

  /* ===============================
   * 4. Verbale “formattato” base
   * =============================== */
  if (btnGenMinutes && notesEl && minutesBox) {
    btnGenMinutes.addEventListener("click", () => {
      const txt = ensureNotes();
      if (!txt) return;

      const now = new Date();
      const dateStr = now.toLocaleString("it-IT", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const summary = buildSummary(txt, 3);
      const todo = buildTodo(txt);

      const minutesTemplate = [
        `VERBALE RIUNIONE`,
        `Data: ${dateStr}`,
        ``,
        `1. Sintesi iniziale`,
        summary || "(aggiungi una breve sintesi della riunione)",
        ``,
        `2. Punti principali`,
        highlightsBox.textContent && highlightsBox.textContent !== "—"
          ? highlightsBox.textContent
          : "(aggiungi i punti principali trattati)",
        ``,
        `3. Azioni / To-Do`,
        todo || "(aggiungi le azioni concordate)",
        ``,
        `4. Note aggiuntive`,
        "(eventuali approfondimenti, osservazioni, decisioni finali)",
      ].join("\n");

      minutesBox.value = minutesTemplate;
    });
  }

  if (btnCopyMinutes && minutesBox) {
    btnCopyMinutes.addEventListener("click", async () => {
      const txt = minutesBox.value.trim();
      if (!txt) {
        alert("Non c'è ancora nessun verbale da copiare.");
        return;
      }
      try {
        await navigator.clipboard.writeText(txt);
        alert("Verbale copiato negli appunti.");
      } catch (e) {
        alert("Impossibile copiare il verbale negli appunti.");
      }
    });
  }
});
