// app.js — logica base di Appunti-AI (schermata upload)
document.addEventListener("DOMContentLoaded", () => {
  const dropZone  = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const fileList  = document.getElementById("fileList");
  const fileNames = document.getElementById("fileNames");

  if (!dropZone || !fileInput) {
    console.warn("Elementi upload non trovati nella pagina.");
    return;
  }

  // Clic sul box = apri selettore file
  dropZone.addEventListener("click", () => fileInput.click());

  // Evidenziazione quando si trascina sopra
  ["dragenter", "dragover"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("border-blue-400", "bg-blue-50");
    });
  });

  ["dragleave", "drop"].forEach((ev) => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove("border-blue-400", "bg-blue-50");
    });
  });

  // Drop file
  dropZone.addEventListener("drop", (e) => {
    const files = Array.from(e.dataTransfer?.files || []);
    if (!files.length) return;
    handleSelectedFiles(files);
  });

  // Selezione tramite file picker
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    handleSelectedFiles(files);
  });

  // Gestione file scelti
  function handleSelectedFiles(files) {
    if (!fileList || !fileNames) {
      console.warn("Elementi lista file non trovati.");
      return;
    }

    // Svuota la lista
    fileNames.innerHTML = "";

    const meta = [];

    files.forEach((f) => {
      const sizeKb = f.size / 1024;

      // Aggiorna la lista visibile
      const li = document.createElement("li");
      li.textContent = `${f.name} (${Math.round(sizeKb)} KB)`;
      fileNames.appendChild(li);

      // Metadati per la prossima pagina
      meta.push({
        name: f.name,
        sizeKb: sizeKb,
      });
    });

    // Mostra il blocco "file selezionati"
    fileList.classList.remove("hidden");

    // Salva info in localStorage per usarle in workspace.js
    try {
      localStorage.setItem("appunti_ai_lastFiles", JSON.stringify(meta));
    } catch (e) {
      console.warn("Impossibile salvare i file su localStorage", e);
    }

    // Vai alla pagina di workspace
    window.location.href = "workspace.html";
  }
});
