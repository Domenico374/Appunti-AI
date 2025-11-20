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

  /* -------------------------------
      CLICK → apre selettore file
  --------------------------------*/
  dropZone.addEventListener("click", () => fileInput.click());

  /* -------------------------------
      DRAG OVER (evidenzia)
  --------------------------------*/
  ["dragenter", "dragover"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("border-blue-400", "bg-blue-50");
    });
  });

  /* -------------------------------
      DRAG LEAVE / DROP (toglie highlight)
  --------------------------------*/
  ["dragleave", "drop"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("border-blue-400", "bg-blue-50");
    });
  });

  /* -------------------------------
      DROP FILE
  --------------------------------*/
  dropZone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;

    console.log("[Appunti-AI] File caricati con drag & drop:", files);
    handleSelectedFiles(files);
  });

  /* -------------------------------
      FILE SELECTOR (click)
  --------------------------------*/
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    console.log("[Appunti-AI] File scelti dal selettore:", files);
    handleSelectedFiles(files);
  });

  /* -------------------------------
      FUNZIONE PRINCIPALE:
      gestisce i file caricati
  --------------------------------*/
  function handleSelectedFiles(files) {
    console.log("[Appunti-AI] handleSelectedFiles() iniziata");

    // Svuota lista nella UI
    fileNames.innerHTML = "";

    // Metadati da salvare per workspace.html
    const meta = [];

    files.forEach((f) => {
      const sizeKb = f.size / 1024;

      // Mostra nella UI
      const li = document.createElement("li");
      li.textContent = `${f.name} (${Math.round(sizeKb)} KB)`;
      fileNames.appendChild(li);

      // Metadati
      meta.push({
        name: f.name,
        sizeKb: sizeKb,
      });
    });

    // Mostra blocco dei file
    fileList.classList.remove("hidden");

    // Salva in localStorage
    try {
      localStorage.setItem("appunti_ai_lastFiles", JSON.stringify(meta));
      console.log("[Appunti-AI] Salvati su localStorage:", meta);
    } catch (e) {
      console.warn("[Appunti-AI] Errore salvataggio localStorage:", e);
    }

    console.log("[Appunti-AI] Redirect verso workspace.html…");

    // Vai alla pagina di workspace
    window.location.assign("workspace.html");
  }
});
