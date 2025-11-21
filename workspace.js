// workspace.js - Logica per workspace.html di Appunti-AI
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Workspace] Inizializzazione workspace...");

  const elements = {
    fileListWorkspace: document.getElementById("fileListWorkspace"),
    fileCountBadge: document.getElementById("fileCountBadge"),
    noFilesMsg: document.getElementById("noFilesMsg"),
    notes: document.getElementById("notes"),
    btnClearNotes: document.getElementById("btnClearNotes"),
    btnSummary: document.getElementById("btnSummary"),
    btnHighlights: document.getElementById("btnHighlights"),
    btnTodo: document.getElementById("btnTodo"),
    summaryBox: document.getElementById("summaryBox"),
    highlightsBox: document.getElementById("highlightsBox"),
    todoBox: document.getElementById("todoBox"),
    btnGenerateMinutes: document.getElementById("btnGenerateMinutes"),
    btnCopyMinutes: document.getElementById("btnCopyMinutes"),
    minutesBox: document.getElementById("minutesBox"),
    documentType: document.getElementById("documentType"),
    generateDocApi: document.getElementById("generateDocApi")
  };

  let state = {
    files: [],
    currentNotes: ""
  };

  // ===== INIZIALIZZAZIONE =====
  function loadFiles() {
    try {
      const savedFiles = localStorage.getItem("appunti_ai_lastFiles");
      if (savedFiles) {
        state.files = JSON.parse(savedFiles);
        displayFiles();
      } else {
        console.log("[Workspace] Nessun file trovato in localStorage");
      }
    } catch (e) {
      console.error("[Workspace] Errore caricamento file:", e);
    }
  }

  function displayFiles() {
    if (!state.files || state.files.length === 0) {
      elements.fileCountBadge.textContent = "0 file";
      return;
    }
    elements.fileCountBadge.textContent = `${state.files.length} file`;
    elements.fileListWorkspace.innerHTML = "";
    state.files.forEach((file) => {
      const li = document.createElement("li");
      li.className = "flex items-center justify-between p-2 rounded hover:bg-slate-50";
      li.innerHTML = `
        <span class="text-slate-700">${file.name}</span>
        <span class="text-xs text-slate-400">${Math.round(file.sizeKb)} KB</span>
      `;
      elements.fileListWorkspace.appendChild(li);
    });
  }

  // ===== GESTIONE APPUNTI =====
  elements.notes?.addEventListener("input", (e) => {
    state.currentNotes = e.target.value;
    localStorage.setItem("appunti_ai_notes", state.currentNotes);
  });

  function loadNotes() {
    // Prova prima con gli appunti estratti dagli upload (default pipeline)
    const extracted = localStorage.getItem("appunti_ai_extractedText");
    if (extracted) {
      elements.notes.value = extracted;
      state.currentNotes = extracted;
      return;
    }
    // Se non ci sono, usa quelli manualmente salvati
    const savedNotes = localStorage.getItem("appunti_ai_notes");
    if (savedNotes) {
      elements.notes.value = savedNotes;
      state.currentNotes = savedNotes;
    }
  }

  elements.btnClearNotes?.addEventListener("click", () => {
    if (confirm("Vuoi cancellare tutti gli appunti?")) {
      elements.notes.value = "";
      state.currentNotes = "";
      localStorage.removeItem("appunti_ai_notes");
      localStorage.removeItem("appunti_ai_extractedText");
      clearAllAnalysis();
    }
  });

  // ===== ANALISI AI (DEMO LOCALE) =====
  elements.btnSummary?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di generare il riassunto");
      return;
    }
    console.log("[Workspace] Generazione riassunto...");
    const lines = state.currentNotes.split('\n').filter(l => l.trim());
    const wordCount = state.currentNotes.split(/\s+/).length;
    const summary = lines.slice(0, 3).join(' ').substring(0, 200) + "...";
    elements.summaryBox.innerHTML = `
      <em>Riassunto automatico (${wordCount} parole totali):</em><br>
      ${summary || "Nessun contenuto da riassumere."}
    `;
  });

  elements.btnHighlights?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di estrarre i punti chiave");
      return;
    }
    console.log("[Workspace] Estrazione punti chiave...");
    const lines = state.currentNotes.split('\n');
    const highlights = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && (
        trimmed.match(/^\d+\./) ||
        trimmed.match(/^-/) ||
        trimmed.match(/^•/) ||
        trimmed.includes('importante') ||
        trimmed.includes('decisione') ||
        trimmed.includes('azione') ||
        trimmed.length > 10 && trimmed.length < 100
      );
    }).slice(0, 5);
    if (highlights.length > 0) {
      elements.highlightsBox.innerHTML = highlights
        .map(h => `• ${h.trim()}`)
        .join('<br>');
    } else {
      elements.highlightsBox.innerHTML = "Nessun punto chiave identificato.";
    }
  });

  elements.btnTodo?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di estrarre le azioni");
      return;
    }
    console.log("[Workspace] Estrazione To-Do...");
    const actionKeywords = [
      'fare', 'preparare', 'inviare', 'contattare', 'verificare',
      'controllare', 'aggiornare', 'completare', 'organizzare',
      'pianificare', 'TODO', 'TO DO', 'azione', 'task', 'entro'
    ];
    const lines = state.currentNotes.split('\n');
    const todos = lines.filter(line => {
      const lower = line.toLowerCase();
      return actionKeywords.some(keyword => lower.includes(keyword));
    }).slice(0, 5);
    if (todos.length > 0) {
      elements.todoBox.innerHTML = todos
        .map((todo, i) => `${i + 1}. ${todo.trim()}`)
        .join('<br>');
    } else {
      elements.todoBox.innerHTML = `
        <em>Azioni suggerite:</em><br>
        1. Rivedere gli appunti<br>
        2. Condividere con il team<br>
        3. Pianificare prossimi passi
      `;
    }
  });

  // ===== GENERAZIONE VERBALE =====
  elements.btnGenerateMinutes?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di generare il verbale");
      return;
    }
    console.log("[Workspace] Generazione verbale...");
    const oggi = new Date();
    const dataFormattata = oggi.toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const summary = elements.summaryBox.textContent.replace('—', '').trim();
    const highlights = elements.highlightsBox.textContent.replace('—', '').trim();
    const todos = elements.todoBox.textContent.replace('—', '').trim();
    const verbale = `VERBALE RIUNIONE

Data: ${dataFormattata}
Ora: ${oggi.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
${state.files.length > 0 ? `Documento di riferimento: ${state.files[0].name}` : ''}

====================
PARTECIPANTI
====================
[Da completare]

====================
ORDINE DEL GIORNO
====================
[Da completare basandosi sugli appunti]

====================
SINTESI DELLA DISCUSSIONE
====================
${summary || state.currentNotes.substring(0, 300) + '...'}

====================
PUNTI CHIAVE
====================
${highlights || 'Nessun punto chiave identificato'}

====================
DECISIONI PRESE
====================
[Da completare basandosi sulla discussione]

====================
AZIONI DA INTRAPRENDERE
====================
${todos || 'Nessuna azione specifica identificata'}

Responsabile: [Da assegnare]
Scadenza: [Da definire]

====================
PROSSIMI PASSI
====================
- Distribuzione del presente verbale
- Follow-up sulle azioni assegnate
- Prossima riunione: [Da pianificare]

====================
NOTE AGGIUNTIVE
====================
${state.currentNotes.length > 1000 ? 'Appunti completi disponibili separatamente' : ''}

---
Verbale generato automaticamente da Appunti-AI
${oggi.toISOString()}`;

    elements.minutesBox.value = verbale;
    localStorage.setItem("appunti_ai_lastMinutes", verbale);
    elements.btnGenerateMinutes.textContent = "✓ Generato";
    setTimeout(() => {
      elements.btnGenerateMinutes.textContent = "Genera da appunti";
    }, 2000);
  });

  elements.btnCopyMinutes?.addEventListener("click", async () => {
    const text = elements.minutesBox.value;
    if (!text.trim()) {
      alert("Nessun verbale da copiare");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      elements.btnCopyMinutes.textContent = "✓ Copiato";
      setTimeout(() => {
        elements.btnCopyMinutes.textContent = "Copia";
      }, 2000);
    } catch (err) {
      console.error("[Workspace] Errore copia:", err);
      elements.minutesBox.select();
      document.execCommand('copy');
    }
  });

  // ===== GENERAZIONE DOCUMENTO TRAMITE API =====
  elements.generateDocApi?.addEventListener("click", () => {
    const tipo = elements.documentType?.value || "verbale";
    const testo = elements.notes?.value || "";
    if (!testo.trim()) {
      alert("Inserisci degli appunti prima di generare il documento");
      return;
    }
    elements.generateDocApi.disabled = true;
    elements.generateDocApi.textContent = "Attendere...";
    
    fetch("https://appunti-ai-three.vercel.app/api/genera", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testo,
        tipo,
        fileRiferimento: state.files.length > 0 ? state.files[0].name : ""
      })
    })
    .then(r => r.json())
    .then(data => {
      if (data && data.contenuto) {
        elements.minutesBox.value = data.contenuto;
      } else {
        alert("Nessun documento ricevuto dall'API.");
      }
    })
    .catch(err => {
      console.error("[Workspace] Errore chiamata API:", err);
      alert("Errore nella generazione del documento tramite API.");
    })
    .finally(() => {
      elements.generateDocApi.disabled = false;
      elements.generateDocApi.textContent = "Genera tramite API";
    });
  });

  function clearAllAnalysis() {
    elements.summaryBox.textContent = "—";
    elements.highlightsBox.textContent = "—";
    elements.todoBox.textContent = "—";
    elements.minutesBox.value = "";
  }

  setInterval(() => {
    if (state.currentNotes) {
      localStorage.setItem("appunti_ai_notes", state.currentNotes);
      console.log("[Workspace] Auto-save appunti");
    }
  }, 30000);

  loadFiles();
  loadNotes();
  const lastMinutes = localStorage.getItem("appunti_ai_lastMinutes");
  if (lastMinutes && elements.minutesBox) {
    elements.minutesBox.value = lastMinutes;
  }
  console.log("[Workspace] Workspace pronto!");
});
