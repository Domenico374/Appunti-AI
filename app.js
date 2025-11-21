document.addEventListener("DOMContentLoaded", () => {
  console.log("[Appunti-AI] Inizializzazione app...");

  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");

  // Click attiva fileInput
  dropZone?.addEventListener("click", () => {
    console.log("Click su dropZone!");
    fileInput?.click();
  });

  // Drag-n-drop
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
    console.log(`Trascinati ${files.length} file`);
    handleSelectedFiles(files);
  });

  fileInput?.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      console.log("Nessun file selezionato");
      return;
    }
    console.log(`Selezionati ${files.length} file`);
    handleSelectedFiles(files);
  });

  // ===== Lettura/parsing file =====
  function handleSelectedFiles(files) {
    const allTexts = [];
    let filesProcessed = 0;
    const filesToProcess = files.length;

    files.forEach((f, idx) => {
      console.log(`Processing file: ${f.name}`);

      // PDF
      if (f.name.endsWith(".pdf") || f.type === "application/pdf") {
        extractTextFromPDF(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // DOCX
      else if (f.name.endsWith(".docx") || f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        extractTextFromDOCX(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // TXT
      else if (f.name.endsWith(".txt") || f.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = function(e) {
          allTexts[idx] = e.target.result;
          filesProcessed++;
          if (filesProcessed === filesToProcess) afterAllExtracted();
        };
        reader.readAsText(f);
      }
      else {
        filesProcessed++;
        if (filesProcessed === filesToProcess) afterAllExtracted();
      }
    });

    function afterAllExtracted() {
      const combinedText = allTexts.filter(t => t).join("\n\n---\n\n");
      localStorage.setItem("appunti_ai_extractedText", combinedText);
      window.location.assign("workspace.html");
    }
  }

  // ===== PDF.js =====
  function extractTextFromPDF(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const typedArray = new Uint8Array(e.target.result);
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      if (!pdfjsLib) { callback(""); return; }
      pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
        let text = "", pagesProcessed = 0;
        const totalPages = pdf.numPages;
        function extractPage(pageNum) {
          pdf.getPage(pageNum).then(page => {
            page.getTextContent().then(content => {
              text += content.items.map(item => item.str).join(" ") + "\n";
              pagesProcessed++;
              if (pagesProcessed === totalPages) callback(text);
              else extractPage(pageNum + 1);
            });
          });
        }
        extractPage(1);
      }).catch(() => callback(""));
    };
    reader.readAsArrayBuffer(file);
  }

  // ===== Mammoth.js (DOCX) =====
  function extractTextFromDOCX(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const mammoth = window.mammoth;
      if (!mammoth) { callback(""); return; }
      mammoth.extractRawText({ arrayBuffer: e.target.result })
        .then(result => callback(result.value))
        .catch(() => callback(""));
    };
    reader.readAsArrayBuffer(file);
  }

  console.log("[Appunti-AI] App pronta!");
});
