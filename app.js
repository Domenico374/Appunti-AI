// app.js - Gestione upload file PDF, TXT, DOCX per Appunti-AI

document.addEventListener("DOMContentLoaded", () => {
  console.log("[Appunti-AI] Inizializzazione app...");

  // Elementi DOM
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const fileList = document.getElementById("fileList");
  const fileCountBadge = document.getElementById("fileCountBadge");

  let uploadedFiles = [];

  // ===== GESTIONE CLICK E DRAG-N-DROP SUL BOX =====

  // Click su dropZone apre file picker
  dropZone?.addEventListener("click", () => {
    fileInput?.click();
  });

  // Gestione dragover/leave sul box
  dropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("border-blue-400", "bg-blue-50");
  });
  dropZone?.addEventListener("dragleave", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-400", "bg-blue-50");
  });
  dropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("border-blue-400", "bg-blue-50");
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    console.log(`[Appunti-AI] Trascinati ${files.length} file`);
    handleSelectedFiles(files);
  });

  // Selezione tramite file picker
  fileInput?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      console.log("[Appunti-AI] Nessun file selezionato");
      return;
    }
    console.log(`[Appunti-AI] Selezionati ${files.length} file`);
    handleSelectedFiles(files);
  });

  // ===== CARICAMENTO E LETTURA FILE =====

  function handleSelectedFiles(files) {
    uploadedFiles = [];
    const allTexts = [];
    let filesProcessed = 0;
    const filesToProcess = files.length;

    files.forEach((f, idx) => {
      console.log(`[Appunti-AI] Processing file ${idx + 1}: ${f.name} (${f.type})`);

      const fileRecord = {
        name: f.name,
        sizeKb: f.size / 1024,
        type: f.type
      };

      // PDF
      if (f.name.endsWith(".pdf") || f.type === "application/pdf") {
        extractTextFromPDF(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          console.log(`[Appunti-AI] PDF estratto (${filesProcessed}/${filesToProcess})`);
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // DOCX
      else if (f.name.endsWith(".docx") || f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        extractTextFromDOCX(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          console.log(`[Appunti-AI] DOCX estratto (${filesProcessed}/${filesToProcess})`);
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // TXT
      else if (f.name.endsWith(".txt") || f.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function(e) {
          allTexts[idx] = e.target.result;
          filesProcessed++;
          console.log(`[Appunti-AI] TXT letto (${filesProcessed}/${filesToProcess})`);
          if (filesProcessed === filesToProcess) afterAllExtracted();
        };
        reader.readAsText(f);
      }
      // Formato non riconosciuto
      else {
        console.warn(`[Appunti-AI] Formato non supportato: ${f.name}`);
        filesProcessed++;
        if (filesProcessed === filesToProcess) afterAllExtracted();
      }

      uploadedFiles.push(fileRecord);
    });

    function afterAllExtracted() {
      console.log("[Appunti-AI] Tutti i file elaborati");
      const combinedText = allTexts.filter(t => t).join("\n\n---\n\n");
      // Salva in localStorage
      localStorage.setItem("appunti_ai_extractedText", combinedText);
      localStorage.setItem("appunti_ai_lastFiles", JSON.stringify(uploadedFiles));
      console.log(`[Appunti-AI] Testo salvato (${combinedText.length} caratteri)`);
      console.log("[Appunti-AI] File salvati in localStorage");

      // Reindirizza al workspace
      window.location.assign("workspace.html");
    }
  }

  // ===== ESTRAZIONE PDF (con PDF.js) =====
  function extractTextFromPDF(file, callback) {
    console.log("[Appunti-AI] Inizio estrazione PDF...");
    const reader = new FileReader();

    reader.onload = function(e) {
      const typedArray = new Uint8Array(e.target.result);
      const pdfjsLib = window['pdfjs-dist/build/pdf'];

      if (!pdfjsLib) {
        console.error("[Appunti-AI] PDF.js non caricato");
        callback("");
        return;
      }

      pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
        let text = "";
        let pagesProcessed = 0;
        const totalPages = pdf.numPages;

        function extractPage(pageNum) {
          pdf.getPage(pageNum).then(function(page) {
            page.getTextContent().then(function(content) {
              text += content.items.map(item => item.str).join(" ") + "\n";
              pagesProcessed++;

              if (pagesProcessed === totalPages) {
                console.log(`[Appunti-AI] PDF completato (${totalPages} pagine)`);
                callback(text);
              } else {
                extractPage(pageNum + 1);
              }
            });
          });
        }

        extractPage(1);
      }).catch(function(err) {
        console.error("[Appunti-AI] Errore parsing PDF:", err);
        callback("");
      });
    };

    reader.readAsArrayBuffer(file);
  }

  // ===== ESTRAZIONE DOCX (con Mammoth.js) =====
  function extractTextFromDOCX(file, callback) {
    console.log("[Appunti-AI] Inizio estrazione DOCX...");
    const reader = new FileReader();

    reader.onload = function(e) {
      const mammoth = window.mammoth;
      if (!mammoth) {
        console.error("[Appunti-AI] Mammoth.js non caricato");
        callback("");
        return;
      }
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(function(result) {
          console.log("[Appunti-AI] DOCX estratto correttamente");
          callback(result.value);
        })
        .catch(function(err) {
          console.error("[Appunti-AI] Errore estrazione DOCX:", err);
          callback("");
        });
    };

    reader.readAsArrayBuffer(file);
  }

  console.log("[Appunti-AI] App pronta!");
});
