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
  ["dragenter", "dragover"].forEach(ev => {
    dropZone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.add("border-blue-400", "bg-blue-50");
    });
  });

  ["dragleave", "drop"].forEach(ev => {
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

  // Gestione file scelti (per ora solo UI)
  function handleSelectedFiles(files) {
    if (!fileList || !fileNames) {
      console.warn("Elementi lista file non trovati.");
      return;
    }

    fileNames.innerHTML = "";

    files.forEach(f => {
      const li = document.createElement("li");
      li.textContent = `${f.name} (${Math.round(f.size / 1024)} KB)`;
      fileNames.appendChild(li);
    });

    fileList.classList.remove("hidden");

    // 🔜 qui collegheremo upload/estrazione/AI
    console.log("File selezionati:", files);
  }
});
