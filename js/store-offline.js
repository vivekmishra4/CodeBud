import { files } from "./store-online.js";
// Open or create the IndexedDB database
let dbName;
let dbVersion;
let dbRequest;
let db;
function dbinit() {
  dbName = "fileDB";
  dbVersion = 1;
  dbRequest = window.indexedDB.open(dbName, dbVersion);
  dbRequest.onerror = function (event) {
    console.error("Error opening database:", event.target.error);
  };

  dbRequest.onsuccess = function (event) {
    console.log("Database opened successfully");
    db = event.target.result;
  };

  dbRequest.onupgradeneeded = function (event) {
    db = event.target.result;
    const objectStore = db.createObjectStore("files", { keyPath: "filename" });
  };
}

async function downloadFile(openedDoc) {
  if (window.showSaveFilePicker) {
    try {
      let fileName = openedDoc;
      let content = files[openedDoc];
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: fileName,
      });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(content);
      await writableStream.close();
      console.log(`File saved as ${fileName}`);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  } else {
    let fileName = openedDoc;
    let content = fileText[openedDoc];
    const blob = new Blob([content], { type: "text/plain" }); // Adjust type based on the file type
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 0);
  }
}

async function downloadFiles() {
  const filesContent = files;
  const zip = new JSZip();
  for (const [filename, content] of Object.entries(filesContent)) {
    zip.file(filename, content);
  }
  if (window.showSaveFilePicker) {
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: "files.zip",
        types: [
          {
            description: "Zip Files",
            accept: { "application/zip": [".zip"] },
          },
        ],
      });
      const writableStream = await fileHandle.createWritable();
      await writableStream.write(zipBlob);
      await writableStream.close();
      console.log("Zip file saved successfully");
    } catch (error) {
      console.error("Error saving zip file:", error);
    }
  } else {
    try{
    zip.generateAsync({ type: "blob" }).then(function (content) {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = "files.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log("Zip file saved successfully");
    });
    }
    catch(error){
      console.error("Error saving zip file:", error);
    }
    
  }
}

// Function to save file to IndexedDB
function saveFile(filename, content) {
  const transaction = db.transaction(["files"], "readwrite");
  const objectStore = transaction.objectStore("files");
  const file = { filename: filename, content: content };
  const request = objectStore.put(file);

  request.onsuccess = function (event) {
    console.log("File saved successfully");
  };

  request.onerror = function (event) {
    console.error("Error saving file:", event.target.error);
  };
}
function retrieveAllFiles() {
  dbinit();
  const transaction = db.transaction(["files"], "readonly");
  const objectStore = transaction.objectStore("files");
  const request = objectStore.getAll();

  request.onsuccess = function (event) {
    const files = event.target.result;
    console.log("All files:", files);
    // Do something with the array of files, e.g., display them in a list
    return files;
    //   files.forEach(function (file) {
    //     console.log("File:", file.filename, "Content:", file.content);
    //   });
  };

  request.onerror = function (event) {
    console.error("Error retrieving files:", event.target.error);
  };
}
export {
  saveFile,
  downloadFile,
  downloadFiles,
  retrieveAllFiles,
  dbinit,
};
