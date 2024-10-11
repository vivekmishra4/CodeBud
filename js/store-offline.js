import { files } from "./shared-data.js";
let db;
const request = indexedDB.open("MyDatabase", 1);

request.onupgradeneeded = function(event) {
  db = event.target.result;
  if (!db.objectStoreNames.contains("projectMeta")) {
    db.createObjectStore("projectMeta", { keyPath: "projectId" });
  }
  if (!db.objectStoreNames.contains("projectFiles")) {
    db.createObjectStore("projectFiles", { keyPath: "projectId" });
  }
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log("Database initialized");
};

request.onerror = function(event) {
  console.error("Database error:", event.target.error);
};


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

function saveProjectName(projectId, projectName) {
  const transaction = db.transaction(["projectMeta"], "readwrite");
  const objectStore = transaction.objectStore("projectMeta");

  const projectMeta = {
    projectId: projectId,
    projectName: projectName
  };

  const request = objectStore.put(projectMeta);

  request.onsuccess = function(event) {
    console.log("Project metadata saved successfully");
  };

  request.onerror = function(event) {
    console.error("Error saving project metadata:", event.target.error);
  };
}
function saveProject(projectId, files) {
  const transaction = db.transaction(["projectFiles"], "readwrite");
  const objectStore = transaction.objectStore("projectFiles");

  const projectFiles = {
    projectId: projectId,
    files: files
  };

  const request = objectStore.put(projectFiles);

  request.onsuccess = function(event) {
    console.log("Project files saved successfully");
  };

  request.onerror = function(event) {
    console.error("Error saving project files:", event.target.error);
  };
}
function getProjects(callback) {
  const transaction = db.transaction(["projectMeta"], "readonly");
  const objectStore = transaction.objectStore("projectMeta");

  const request = objectStore.getAll();

  request.onsuccess = function(event) {
    const projectMetas = event.target.result;
    callback(null, projectMetas);
  };

  request.onerror = function(event) {
    callback("Error retrieving project metadata: " + event.target.error, null);
  };
}
function deleteOfflineProject(projectId) {
  const transaction = db.transaction(["projectMeta", "projectFiles"], "readwrite");
  
  // Deleting project metadata
  const projectMetaObjectStore = transaction.objectStore("projectMeta");
  const projectMetaRequest = projectMetaObjectStore.delete(projectId);

  projectMetaRequest.onsuccess = function(event) {
    console.log("Project metadata deleted successfully");
  };

  projectMetaRequest.onerror = function(event) {
    console.error("Error deleting project metadata:", event.target.error);
  };

  // Deleting project files
  const projectFilesObjectStore = transaction.objectStore("projectFiles");
  const projectFilesRequest = projectFilesObjectStore.delete(projectId);

  projectFilesRequest.onsuccess = function(event) {
    console.log("Project files deleted successfully");
  };

  projectFilesRequest.onerror = function(event) {
    console.error("Error deleting project files:", event.target.error);
  };
}

function getProject(projectId, callback) {
  const transaction = db.transaction(["projectFiles"], "readonly");
  const objectStore = transaction.objectStore("projectFiles");

  const request = objectStore.get(projectId);

  request.onsuccess = function(event) {
    const projectFiles = event.target.result;
    if (projectFiles) {
      callback(null, projectFiles);
    } else {
      callback("Project files not found", null);
    }
  };

  request.onerror = function(event) {
    callback("Error retrieving project files: " + event.target.error, null);
  };
}
function getProjectName(projectId, callback) {
  const transaction = db.transaction(["projectMeta"], "readonly");
  const objectStore = transaction.objectStore("projectMeta");

  const request = objectStore.get(projectId);

  request.onsuccess = function(event) {
    const projectMeta = event.target.result;
    if (projectMeta) {
      callback(null, projectMeta);
    } else {
      callback("Project metadata not found", null);
    }
  };

  request.onerror = function(event) {
    callback("Error retrieving project metadata: " + event.target.error, null);
  };
}
function deleteAllProjects() {
  const transaction = db.transaction(["projectMeta", "projectFiles"], "readwrite");

  // Clearing project metadata
  const projectMetaObjectStore = transaction.objectStore("projectMeta");
  const projectMetaRequest = projectMetaObjectStore.clear();

  projectMetaRequest.onsuccess = function(event) {
    console.log("All project metadata deleted successfully");
  };

  projectMetaRequest.onerror = function(event) {
    console.error("Error deleting all project metadata:", event.target.error);
  };

  // Clearing project files
  const projectFilesObjectStore = transaction.objectStore("projectFiles");
  const projectFilesRequest = projectFilesObjectStore.clear();

  projectFilesRequest.onsuccess = function(event) {
    console.log("All project files deleted successfully");
  };

  projectFilesRequest.onerror = function(event) {
    console.error("Error deleting all project files:", event.target.error);
  };
}

export {
  saveFile,
  downloadFile,
  downloadFiles,
  getProjects,
  getProject,
  getProjectName,
  saveProject,
  saveProjectName,
  deleteOfflineProject,
  deleteAllProjects
};
