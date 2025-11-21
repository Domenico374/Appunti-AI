// workspace.js - Gestione workspace Appunti-AI con analisi, verbale e export PDF

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Workspace] Avvio...");

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
    btnDownloadPDF: document.getElementById("btnDownloadPDF"),
    minutesBox: document.getElementById("minutesBox"),
    documentType: document.getElementById("documentType"),
    generateDocApi: document.getElementById("generateDocApi")
  };

  let state = {
    files: [],
    currentNotes: ""
  };

  // ====== INIZIALIZZAZIONE FILE ======
  function loadFiles() {
    try {
      const savedFiles = localStorage.getItem("appunti_ai_lastFiles");
      if (savedFiles) {
        state.files = JSON.parse(savedFiles);
        displayFiles();
      } else {
        elements.fileCountBadge.textContent = "0 file";
        elements.noFilesMsg.style.display = "block";
        elements.fileListWorkspace.innerHTML = "";
      }
    } catch (e) {
      console.error("[Workspace] Errore file:", e);
    }
  }

  function displayFiles() {
    if (!state.files || state.files.length === 0) {
      elements.fileCountBadge.textContent = "0 file";
      elements.noFilesMsg.style.display = "block";
      elements.fileListWorkspace.innerHTML = "";
      return;
    }
    elements.fileCountBadge.textContent = `${state.files.length} file`;
    elements.noFilesMsg.style.display = "none";
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

  // ====== APPUNTI ======
  elements.notes?.addEventListener("input", (e) => {
    state.currentNotes = e.target.value;
    localStorage.setItem("appunti_ai_notes", state.currentNotes);
  });

  function loadNotes() {
    const extracted = localStorage.getItem("appunti_ai_extractedText");
    if (extracted) {
      elements.notes.value = extracted;
      state.currentNotes = extracted;
      return;
    }
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

  // ====== ANALISI INTELLIGENTE ======
  elements.btnSummary?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di generare il riassunto");
      return;
    }
    const summary = state.currentNotes
      .split('\n')
      .filter(l => l.trim())
      .slice(0, 3)
      .join(' ')
      .substring(0, 200) + "...";
    const wordCount = state.currentNotes.split(/\s+/).length;
    elements.summaryBox.innerHTML = `
      <em>Riassunto automatico (${wordCount} parole):</em><br>
      ${summary || "Nessun contenuto da riassumere."}
    `;
  });

  elements.btnHighlights?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di estrarre i punti chiave");
      return;
    }
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
    elements.highlightsBox.innerHTML = highlights.length > 0
      ? highlights.map(h => `• ${h.trim()}`).join('<br>')
      : "Nessun punto chiave identificato.";
  });

  elements.btnTodo?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di estrarre le azioni");
      return;
    }
    const actionKeywords = [
      'fare', 'preparare', 'inviare', 'contattare', 'verificare',
      'controllare', 'aggiornare', 'completare', 'organizzare',
      'pianificare', 'TODO', 'TO DO', 'azione', 'task', 'entro'
    ];
    const todos = state.currentNotes
      .split('\n')
      .filter(line => actionKeywords.some(keyword => line.toLowerCase().includes(keyword)))
      .slice(0, 5);
    elements.todoBox.innerHTML = todos.length > 0
      ? todos.map((todo, i) => `${i + 1}. ${todo.trim()}`).join('<br>')
      : `<em>Azioni suggerite:</em><br>
         1. Rivedere gli appunti<br>
         2. Condividere con il team<br>
         3. Pianificare prossimi passi`;
  });

  // ====== VERBALE ======
  elements.btnGenerateMinutes?.addEventListener("click", () => {
    if (!state.currentNotes.trim()) {
      alert("Inserisci degli appunti prima di generare il verbale");
      return;
    }
    const oggi = new Date();
    const dataFormattata = oggi.toLocaleDateString('it-IT', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
[Basato sugli appunti]

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
[Da completare]

====================
AZIONI DA INTRAPRENDERE
====================
${todos || 'Nessuna azione specifica identificata'}

Responsabile: [Da assegnare]
Scadenza: [Da definire]

====================
PROSSIMI PASSI
====================
- Distribuzione verbale
- Follow-up sulle azioni
- Prossima riunione: [Da pianificare]

====================
NOTE
====================
${state.currentNotes.length > 1000 ? 'Appunti completi disponibili separatamente' : ''}

---
Verbale generato da Appunti-AI
${oggi.toISOString()}`;

    elements.minutesBox.value = verbale;
    localStorage.setItem("appunti_ai_lastMinutes", verbale);
    elements.btnGenerateMinutes.textContent = "✓ Generato";
    setTimeout(() => { elements.btnGenerateMinutes.textContent = "Genera da appunti"; }, 1800);
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
      setTimeout(() => { elements.btnCopyMinutes.textContent = "Copia"; }, 1800);
    } catch (err) {
      console.error("[Workspace] Errore copia:", err);
      elements.minutesBox.select();
      document.execCommand('copy');
    }
  });

  // ====== SCARICA PDF ======
  elements.btnDownloadPDF?.addEventListener("click", () => {
    const text = elements.minutesBox.value;
    if (!text.trim()) {
      alert("Nessun documento da scaricare. Genera il verbale prima.");
      return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const logoUrl = "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg";
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = logoUrl;
    img.onload = function () {
      doc.addImage(img, 'PNG', 10, 7, 18, 18);
      doc.setFontSize(18);
      doc.setTextColor(31, 41, 55);
      doc.text("Appunti-AI", 35, 18);
      doc.setDrawColor(196, 203, 221);
      doc.line(10, 27, doc.internal.pageSize.getWidth() - 10, 27);
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generato il: ${new Date().toLocaleString('it-IT')}`, 10, 32);
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      const margin = 10;
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      const maxWidth = pageWidth - 2 * margin;
      const lines = doc.splitTextToSize(text, maxWidth);
      let yPosition = 40;
      lines.forEach(line => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 6;
      });
      // Footer su ogni pagina
      const addFooter = () => {
        doc.setFontSize(9);
        doc.setTextColor(140, 143, 168);
        doc.text("Documento generato da Appunti-AI", margin, pageHeight - 10);
        doc.text(`© ${new Date().getFullYear()} www.appunti-ai.com`, pageWidth - margin - 60, pageHeight - 10);
      };
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        addFooter();
      }
      const fileName = `Appunti-AI-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      elements.btnDownloadPDF.textContent = "✓ Scaricato";
      setTimeout(() => { elements.btnDownloadPDF.textContent = "⬇️ PDF"; }, 2000);
    };
  });

  // ====== GENERAZIONE DOCUMENTO VIA API ======
  elements.generateDocApi?.addEventListener("click", () => {
    const tipo = elements.documentType?.value || "verbale";
    const testo = elements.notes?.value || "";
    if (!testo.trim()) {
      alert("Inserisci degli appunti prima di generare il documento");
      return;
    }
    elements.generateDocApi.disabled = true;
    elements.generateDocApi.textContent = "Attendere...";
    fetch("/api/genera", {
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
        localStorage.setItem("appunti_ai_lastMinutes", data.contenuto);
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
  console.log("[Workspace] Pronto!");
});
