// app.js — logica base di Appunti-AI (schermata upload)
document.addEventListener("DOMContentLoaded", () => {
  console.log("[Appunti-AI] DOM pronto");

  const dropZone  = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const fileList  = document.getElementById("fileList");
  const fileNames = document.getElementById("fileNames");

  if (!dropZone || !fileInput) {
    console.warn("[Appunti-AI] Elementi upload non trovati nella pagina.");
    return;
  }

  /* CLICK → apre selettore file */
  dropZone.addEventListener("click", () => fileInput.click());

  /* DRAG OVER (evidenzia) */
  ["dragenter", "dragover"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("border-blue-400", "bg-blue-50");
    });
  });

  /* DRAG LEAVE / DROP (toglie highlight) */
  ["dragleave", "drop"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("border-blue-400", "bg-blue-50");
    });
  });

  /* DROP FILE */
  dropZone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    console.log("[Appunti-AI] File caricati con drag & drop:", files);
    handleSelectedFiles(files);
  });

  /* FILE SELECTOR (click) */
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    console.log("[Appunti-AI] File scelti dal selettore:", files);
    handleSelectedFiles(files);
  });

  /* FUNZIONE PRINCIPALE: gestisce i file caricati ed estrae il testo */
  function handleSelectedFiles(files) {
    console.log("[Appunti-AI] handleSelectedFiles() iniziata");
    fileNames.innerHTML = ""; // Svuota lista nella UI
    const meta = [];

    // Per multi-file, concateno tutti i testi separati
    let allTexts = [];

    // Conta quanti file da processare
    let filesToProcess = files.length;
    let filesProcessed = 0;

    files.forEach((f, idx) => {
      const sizeKb = f.size / 1024;
      // Mostra nella UI
      const li = document.createElement("li");
      li.textContent = `${f.name} (${Math.round(sizeKb)} KB)`;
      fileNames.appendChild(li);

      meta.push({
        name: f.name,
        sizeKb: sizeKb,
      });

      // ESTRAZIONE TESTO PDF
      if (f.type === "application/pdf") {
        extractTextFromPDF(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // ESTRAZIONE TESTO TXT
      else if (f.type === "text/plain") {
        extractTextFromTXT(f, function(text) {
          allTexts[idx] = text;
          filesProcessed++;
          if (filesProcessed === filesToProcess) afterAllExtracted();
        });
      }
      // File non supportato per estrazione testo (salva vuoto)
      else {
        allTexts[idx] = "";
        filesProcessed++;
        if (filesProcessed === filesToProcess) afterAllExtracted();
      }
    });

    // Funzione Richiamata quando tutti i file sono estratti
    function afterAllExtracted() {
      try {
        localStorage.setItem("appunti_ai_lastFiles", JSON.stringify(meta));
        // Concateno tutti i testi separati da "\n---\n" (se più file)
        const merged = allTexts.filter(t => !!t).join("\n---\n");
        localStorage.setItem("appunti_ai_notes", merged);
        console.log("[Appunti-AI] Salvati su localStorage:", meta, merged);
      } catch (e) {
        console.warn("[Appunti-AI] Errore salvataggio localStorage:", e);
      }
      // Vai alla pagina di workspace
      window.location.assign("workspace.html");
    }
  }

  // Estrazione testo da PDF tramite PDF.js
  function extractTextFromPDF(file, callback) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      try {
        const typedarray = new Uint8Array(e.target.result);
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(item => item.str).join(' ') + '\n';
        }
        callback(text);
      } catch (err) {
        console.error("[Appunti-AI] Errore estrazione PDF:", err);
        callback(""); // se errore, salva testo vuoto
      }
    };
    reader.readAsArrayBuffer(file);
  }

  // Estrazione testo da TXT tramite FileReader
  function extractTextFromTXT(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
      callback(e.target.result);
    };
    reader.readAsText(file);
  }
});
