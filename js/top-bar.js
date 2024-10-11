import {
  deleteOfflineProject,
  downloadFile,
  downloadFiles,
  getProject,
  getProjectName,
  getProjects,
  deleteAllProjects
} from "./store-offline.js";
import { currentFile, updateProject } from "./store-online.js";
import { mySnippets } from "./shared-data.js";
let isDialog = false;
let snippets = document.getElementById("snippets");
let snippetLang = "html";
let dialogWindow = document.querySelector(".dialog-window");
snippets.addEventListener("click", () => {
  dialogWindow.innerHTML = `
  <div class="dialog-header">
   <button id="close-dialog">close</button>
  <input type="text" id="snippet-search" placeholder="Search for a snippet...">
  <select name="snippet-lang" id="snippet-lang">
      <option value="html">html</option>
      <option value="css">css</option>
      <option value="js">js</option>
  </select>
  </div>
  <div id="snippet-list" class="snippet-list"></div>
  `;
  document
    .getElementById("close-dialog")
    .addEventListener("click", toggleDialog);
  document
    .getElementById("snippet-search")
    .addEventListener("keyup", filterSnippets);
  toggleDialog();
});

function filterSnippets() {
  let selectedLang = document.getElementById("snippet-lang").value;
  const query = document.getElementById("snippet-search").value.toLowerCase();
  const filteredSnippets = mySnippets[selectedLang].filter((snippet) =>
    snippet.name.toLowerCase().includes(query)
  );
  displaySnippets(filteredSnippets);
}

function displaySnippets(snippetArray) {
  const snippetList = document.getElementById("snippet-list");
  snippetList.innerHTML = "";
  snippetArray.forEach((snippet) => {
    const snippetItem = document.createElement("div");
    snippetItem.className = "snippet-item";

    const snippetName = document.createElement("div");
    snippetName.className = "snippet-name";
    snippetName.textContent = snippet.name;

    const snippetCode = document.createElement("pre");
    snippetCode.className = "snippet-code";
    snippetCode.textContent = snippet.code;

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.onclick = () => copyToClipboard(snippet.code);

    snippetItem.appendChild(snippetName);
    snippetItem.appendChild(snippetCode);
    snippetItem.appendChild(copyBtn);
    snippetList.appendChild(snippetItem);
  });
}

function copyToClipboard(code) {
  navigator.clipboard.writeText(code).then(
    () => {
      document.querySelector(".copy-btn").innerText = "copied";
    },
    () => {
      alert("Failed to copy code to clipboard.");
    }
  );
}
document.getElementById("help-icon").addEventListener("click", () => {
  console.log("dialog" + isDialog);
  dialogWindow.innerHTML = `
  <button id="close-dialog" style="padding:0px 4px;">X</button>
  <br>
  <img class="icons" src="assets/code.svg"> Code Snippets <br>
  <img class="icons" src="assets/file-add.svg"> New File<br>
  <img class="icons" src="assets/file-upload.svg">Upload File <br>
  <img class="icons" src="assets/line-horizontal-3.svg">Menu Bar <br>
  <img class="icons" src="assets/dark-theme.svg"> Theme Toggle <br>
  <img class="icons" src="assets/install-svgrepo-com.svg"> Install Web App <br>
  <img class="icons" src="assets/search.svg" />Search in Opened File<br>
  <img class="icons" src="assets/code-editor-run.svg" />Run index.html <br>
  <img class="icons" src="assets/arrow-up-right-from-square-svgrepo-com.svg"/>Maximize Output<br>

  `;
  document
    .getElementById("close-dialog")
    .addEventListener("click", toggleDialog);
  toggleDialog();
  console.log("dialog" + isDialog);
});
function toggleDialog() {
  if (isDialog) {
    dialogWindow.close("closing");
    isDialog = false;
  } else {
    dialogWindow.showModal();
    
    isDialog = true;
  }
}

let isDarkTheme = localStorage.getItem("theme") === "dark";
if (isDarkTheme) {
  document.body.classList.add("dark-theme");
}

document.getElementById("theme-toggle").addEventListener("click", () => {
  if (isDarkTheme) {
    isDarkTheme = false;
    localStorage.setItem("theme", "light");
    document.body.classList.remove("dark-theme");
  } else {
    isDarkTheme = true;
    localStorage.setItem("theme", "dark");
    document.body.classList.add("dark-theme");
  }
});

let Mysnippets = [
  { type: "html", name: "button", code: "" },
  { type: "html", name: "button" },
];
let isFileMenuOpen = false;
const fileMenu = document.querySelector(".file-menu");
document.getElementById("file-menu-icon").addEventListener("click", () => {
  if (isFileMenuOpen) {
    fileMenu.style.display = "none";
    isFileMenuOpen = false;
  } else {
    fileMenu.style.display = "block";
    isFileMenuOpen = true;
  }
});
document.getElementById("rename-project").addEventListener("click", () => {
  document.querySelector("title").innerText = prompt("Enter new Name");
});
document
  .getElementById("open-projects")
  .addEventListener("click", openProjects);
function openProjects() {
  dialogWindow.innerHTML = `
      <div class="dialog-header">
        <button id="close-dialog" style="padding:0px 4px;">X</button>
        <input type="text" id="project-search" placeholder="Search for a Project...">
        <select name="project-type" id="project-type">
        <option value="offline">offline</option>
          <option value="online">online</option>
        </select>
      </div>
      <div id="project-list" class="project-list"></div>
    `;

  document
    .getElementById("close-dialog")
    .addEventListener("click", toggleDialog);

  const projectType = document.getElementById("project-type");
  projectType.addEventListener("change", () => {
    if (projectType.value === "online") {
      getOnlineProjects(getStoredUserId());
    } else {
      getProjects((error, projectMetas) => {
        if (error) {
          console.error(error);
        } else {
          // Format the data into offlineProjects format
          const offlineProjects = projectMetas.reduce((acc, projectMeta) => {
            acc[projectMeta.projectId] = projectMeta.projectName;
            return acc;
          }, {});

          console.log("Formatted all projects metadata:", offlineProjects);

          // Update the project list display
          displayProjects(offlineProjects);
        }
      });
    }
  });

  // Initialize with the default project type if needed
  projectType.dispatchEvent(new Event("change"));

  toggleDialog();
}
function displayProjects(projects) {
  const projectList = document.getElementById("project-list");
  projectList.innerHTML="";
  for (let project in projects) {
    let item = document.createElement("div");
    const projectTitle = document.createElement("pre");
    projectTitle.innerHTML = `${project}   ${projects[project]}`;
    const openBtn = document.createElement("button");
    openBtn.textContent = "Open";
    openBtn.onclick = (e) => {
      openProject(project);
      document
      .getElementById("close-dialog").click();

    };
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = (e) => {
      deleteProject(project);
    };
    deleteBtn.style.marginLeft = "9px";
    item.style.marginTop = "9px";
    item.appendChild(projectTitle);
    item.appendChild(openBtn);
    item.appendChild(deleteBtn);
    projectList.appendChild(item);
  }
}function openProject(projectId) {
  let projectType = document.getElementById("project-type");
  if (projectType == "online") {
    getOnlineProject(getStoredUserId(), projectId);
  } else {
    getProject(projectId, function (error, projectFiles) {
      if (error) {
        console.error("Error in getProject callback:", error);
      } else {
        // Ensure files is declared as let and not re-declared in the scope
        let files;
        
        // Check if projectFiles and projectFiles.files are valid
        if (projectFiles && projectFiles.files) {
          files = projectFiles.files;
          updateProject(files)
          console.log("Formatted project files:", files);
          
        } else {
          console.error("No files found in projectFiles:", projectFiles);
        }
      }
    });
  }
}
function deleteProject(projectId) {
  let isConfirm = confirm("Do you want to delete the project");
  if (isConfirm) {
    if (document.getElementById("project-type").value == "online") {
    } else {
      deleteOfflineProject(projectId);
      getProjects((error, projectMetas) => {
        if (error) {
          console.error(error);
        } else {
          // Format the data into offlineProjects format
          const offlineProjects = projectMetas.reduce((acc, projectMeta) => {
            acc[projectMeta.projectId] = projectMeta.projectName;
            return acc;
          }, {});

          console.log("Formatted all projects metadata:", offlineProjects);

          // Update the project list display
          displayProjects(offlineProjects);
        }
      });

    }
  }
}
let fileManage = document.getElementById("file-list");
let closeButton = document.getElementById("close-btn");
let manager = document.getElementById("manager");
let managerOps = document.getElementById("manager-ops");
let isOpen = true;
closeButton.addEventListener("click", () => {
  if (!isOpen) {
    manager.style.display = "inline";
    managerOps.style.display = "inline";
    isOpen = true;
  } else {
    manager.style.display = "none";
    managerOps.style.display = "none";
    isOpen = false;
  }
});
let moreOptions = document.querySelector(".file-more-options");
let moreOpen = false; // Variable to track if moreOptions is open

document.getElementById("file-more-icon").addEventListener("click", toggleMore);

function toggleMore(e) {
  // Toggle the visibility and position of moreOptions
  if (moreOpen) {
    // Close moreOptions
    moreOptions.style.display = "none";
    moreOpen = false;
  } else {
    // Open moreOptions
    moreOptions.style.display = "inline-block";
    // Position moreOptions relative to e.target (file-more-icon)
    moreOptions.style.right = `${e.target.getBoundingClientRect().right}px`;
    moreOptions.style.top = `${e.target.getBoundingClientRect().bottom}px`; // Adjust positioning as needed
    moreOpen = true;
  }
}

const fileSelector = document.getElementById("file-upload");

const fileDownloadButton = document.getElementById("file-download");
const downloadAllButton = document.getElementById("file-download-all");
fileDownloadButton.addEventListener("click", () => {
  downloadFile(currentFile);
});
downloadAllButton.addEventListener("click", () => {
  downloadFiles();
});

let socketP;
function getOnlineProjects(userId) {
  if (userId == null) {
    return null;
  }
  //Establish Connection with server
  try {
    socketP = new WebSocket("ws://localhost:3000");
  } catch (error) {
    alert("Unable to Reach Server");
  }
  socketP.addEventListener("error", (event) => {
    alert("Unable to connect");
    socketP = undefined;
  });
  socketP.addEventListener("open", (event) => {
    socketP.send(JSON.stringify({ type: "get-projects", userId }));
  });
  socketP.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "invalid-user":
        break;
      case "projects":
        onlineProjects = data.content;
        break;
      case "project":
        files = data.content;
    }
  });
}

function getOfflineProject(projectId) {
  getProject(projectId, function (error, projectFiles) {
    if (error) {
      console.error("Error in getOfflineFiles callback:", error);
    } else {
      // Ensure files is declared as let and not re-declared in the scope
      let files;
      
      // Check if projectFiles and projectFiles.files are valid
      if (projectFiles && projectFiles.files) {
        files = projectFiles.files;
        console.log("Formatted project files:", files);
      } else {
        console.error("No files found in projectFiles:", projectFiles);
      }
    }
  });
}

function getOnlineProject(userId, projectId) {
  if (socketP) {
    socketP.send(JSON.stringify({ type: "get-project", userId, projectId }));
  }
}
