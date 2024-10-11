import { files } from "./shared-data.js";
import { initializeFirebase } from "./firebaseService.js";
import { uploadedFiles } from "./code-manage.js";
import { saveProject, saveProjectName } from "./store-offline.js";
let socket;
export let currentFile = "index.html";
export let connected = false;
let colab = false;
let joined = false;
const fileTypeList = ["html", "css", "js"];
export const imagesTypes = ["png", "jpg", "jpeg", "svg"];
export const allFileTypes = ["html", "css", "js", "png", "jpeg", "jpg", "svg"];
export let onlineProjects = {};
export let offlineProjects = {};
const chatBox = document.getElementById("messages");
const inputProjectId = document.getElementById("project-id");
let startColab = document.getElementById("start-colab");
startColab.addEventListener("click", startCollaboration);
const { auth } = await initializeFirebase();
let joinColab = document.getElementById("join-colab");
joinColab.addEventListener("click", joinCollaboration);
document.getElementById("send-message").addEventListener("click", sendMessage);
document.getElementById("add-file").addEventListener("click", addFile);
document
  .getElementById("close-colab")
  .addEventListener("click", closeCollaboration);
let fileNameOpened = document.getElementById("file-name-opened");
const editor = document.getElementById("code-input");
const fileList = document.getElementById("file-list");
let userId = getStoredUserId();
let projectName = "project";
let projectId = generateProjectId();
let username = getStoredUserName();
function addFile() {
  let filename = prompt("Enter file name");
  if (filename == null) {
    return;
  }
  if (!fileTypeList.includes(getFileType(filename))) {
    alert("You can only create html,css,js files");
    return;
  }
  if (filename.trim() != "" && files[filename] == undefined) {
    let newFile = document.createElement("li");
    newFile.setAttribute("data-file", filename);
    newFile.setAttribute("id", filename);
    newFile.innerText = filename;
    fileList.appendChild(newFile);
    files[filename] = "";
    if (connected) {
      sendData(
        JSON.stringify({ type: "file", filename: filename, content: "" })
      );
    }
  } else {
    alert("File name already exist");
  }
}
export function getFileType(filename) {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex == -1 || dotIndex == filename.length - 1) return "unknown";
  const fileType = filename.slice(dotIndex + 1);
  return fileType;
}
export function addUploadedFile(filename, fileData, fileType) {
  let newFile = document.createElement("li");
  newFile.setAttribute("data-file", filename);
  newFile.setAttribute("id", filename);
  newFile.innerText = filename;
  fileList.appendChild(newFile);
  files[filename] = imagesTypes.includes(fileType) ? "!@Image@#" : fileData;
  files[filename] = fileData;
  if (connected) {
    sendData(JSON.stringify({ type: "file", filename: filename, content: "" }));
  }
}
let isImage = false;
let img = document.createElement("img");
img.setAttribute("alt", "Image");
fileList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedFile = event.target.dataset.file;
    if (selectedFile !== currentFile) {
      if (currentFile != "") {
        files[currentFile] = editor.value;
      }
      if (imagesTypes.includes(getFileType(selectedFile))) {
        isImage = true;
        img.setAttribute("src", uploadedFiles[selectedFile]);
        editor.replaceWith(img);
      } else {
        if (isImage) {
          isImage = false;
          img.replaceWith(editor);
        }
      }
      openFile(selectedFile, files[selectedFile]);
    }
  }
});
function loadFiles(myFiles) {
  files = myFiles;
}
function openFile(filename, content) {
  currentFile = filename;
  fileNameOpened.value = filename;
  highlightFile(filename);
  editor.value = content;
  console.log("ooo");
}
export function highlightFile(selectedFile) {
  const items = fileList.getElementsByTagName("li");
  for (let item of items) {
    if (item.dataset.file === selectedFile) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  }
}
highlightFile(currentFile);
editor.addEventListener("input", () => {
  const currentContent = editor.value;
  if (currentFile != "") {
    files[currentFile] = currentContent;
    // const diff = getDiff(previousContent, currentContent);
    // previousContent = currentContent;
    if (connected) {
      sendData(
        JSON.stringify({
          type: "file",
          filename: currentFile,
          content: currentContent,
        })
      );
    }
  }
});
function getStoredUserId() {
  const userId = localStorage.getItem("userId");
  if (userId) {
    console.log("Stored User ID:", userId);
    return userId;
  } else {
    console.log("No User ID found in localStorage");
    return null;
  }
}
function getStoredUserName() {
  const userName = localStorage.getItem("userName");
  if (userName) {
    console.log("Stored User Name:", userId);
    return userName;
  } else {
    console.log("No User Name found in localStorage");
    return null;
  }
}
document.getElementById("rename-project").addEventListener("click", () => {
  let newName = prompt("Enter new Name", projectName);
  if (renameProject(newName)) {
    sendData(JSON.stringify({ type: "rename-project", newName: newName }));
  }
});
function renameProject(newName) {
  if (newName == null || newName.trim() == "") {
    alert("Project Name cannot be empty");
    return false;
  }
  projectName = newName;
  document.querySelector("title").innerText = newName;
  return true;
}
function startCollaboration() {
  if (!socket.OPEN || !connected) {
    alert("Socket Inactive");
    return;
  }
  projectId = generateProjectId();
  document.getElementById("project-id").value = projectId;
  sendData(
    JSON.stringify({
      type: "start-colab",
      projectId,
      projectName,
      userId,
      username,
    })
  );
  startColab.style.display = "none";
  joinColab.style.display = "none";
  inputProjectId.setAttribute("readonly", true);
}

function joinCollaboration() {
  if (!socket.OPEN || !connected) {
    alert("Socket Inactive");
    return;
  }
  console.log(socket.OPEN);

  const projectId = inputProjectId.value;
  sendData(
    JSON.stringify({
      type: "join-colab",
      projectId,
      projectName,
      userId,
      username,
    })
  );
  startColab.style.display = "none";
  joinColab.style.display = "none";
}
function closeCollaboration() {
  if (!socket.OPEN || !connected) {
    alert("Socket Inactive");
    return;
  }
  sendData(JSON.stringify({ type: "close-colab", projectId }));
  startColab.style.display = "block";
  joinColab.style.display = "inline";
  chatBox.innerHTML = "";
  fileList.innerHTML = "";
  projectId = "";
}
function beforeClose() {}
function sendMessage() {
  const message = document.getElementById("message-text").value;
  sendData(JSON.stringify({ type: "chat", message }));
}
async function sendData(data) {
  if (!connected) {
    alert("You are not connected to server");
    return;
  }

  if (!socket.OPEN) {
    alert("web socket is inactive");
    return false;
  }
  socket.send(data);
  return true;
}
function colabStatus() {}
function receiveMessage(socket) {
  socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
      case "connected":
        connected = true;
        break;
      case "colab":
        colab = true;
        if ((data.content = "yes")) {
          joined = true;
        } else {
          sendExistingFiles();
        }
        break;
      case "chat":
        displayMessage(data.message, data.username);
        break;
      case "file":
        if (data.filename == currentFile) {
          openFile(data.filename, data.content);
        } else if (files[data.filename] == undefined) {
          let newFile = document.createElement("li");
          newFile.setAttribute("data-file", data.filename);
          newFile.innerText = data.filename;
          fileList.appendChild(newFile);
        }
        files[data.filename] = data.content;
        break;
      case "projectinvalid":
       
          
          startColab.style.display = "block";
          joinColab.style.display = "inline";
        
        break;
      case "colabClosed":
        alert("Colab Closed");
        isColab = false;
        break;
      case "rename-file":
        files[data.newName] = files[data.oldName];
        files[data.oldName] = null;
        currentFile = data.newName;
        openFile(currentFile, files[currentFile]);
        break;
      case "renameProject":
        renameProject(data.newName);
        break;
      case "deleteFile":
        deleteFile(data.fileName);
        break;
    }
  };
}
function sendExistingFiles() {
  for (const filename in files) {
    sendData(
      JSON.stringify({
        type: "file",
        filename: filename,
        content: files[filename],
      })
    );
  }
}
window.addEventListener("beforeunload", function (event) {
  console.log("User is trying to close the tab or navigate away.");
  saveProjectName(projectId, projectName);
  saveProject(projectId, files);
  this.localStorage.setItem("last-project", projectId);
  const confirmationMessage = "Are you sure you want to leave?";
  event.returnValue = confirmationMessage; // Standard for most browsers
  return confirmationMessage; // For some older browsers
});
function displayMessage(message, userName) {
  const messageElement = document.createElement("div");
  if (username != userName) {
    const sender = document.createElement("span");
    sender.classList.add("sender");
    sender.textContent = userName;
    messageElement.appendChild(sender);
  }
  let text = new Text(message);
  messageElement.appendChild(text);
  chatBox.appendChild(messageElement);
}

console.log(generateProjectId());

function generateProjectId() {
  return "proj-" + Math.random().toString(36).substring(2, 9);
}
const toggleOnline = document.getElementById("toggleOnline");
toggleOnline.addEventListener("change", function () {
  if (this.checked) {
    if (window.onoffline) {
      alert("you are offline");
      return;
    }
    try {
      socket = new WebSocket("ws://localhost:3000");
      socket.addEventListener("error", (event) => {
        document.querySelector(".colab").style.display = "none";
        this.checked = false;
        alert("Unable to connect");
      });
    } catch (error) {
      document.querySelector(".colab").style.display = "none";
      this.checked = false;
      alert("Unable to connect");
    }
  } else {
  }
  socket.addEventListener("open", (event) => {
    receiveMessage(socket);
    connected = !connected;
    document.querySelector(".colab").style.display = "flex";
  });
  console.log("is Connected " + connected);
});

document.getElementById("file-rename").addEventListener("click", () => {
  let newName = prompt("Enter New file Name", currentFile);
  if (renameFile(currentFile, newName)) {
    sendData(
      JSON.stringify({
        type: "rename-file",
        oldName: currentFile,
        newName: newName,
      })
    );
    currentFile = newName;
    fileNameOpened.value = newName;
  }
});
function renameFile(oldName, newName) {
  if (oldName == "index.html") {
    alert("this is main html file,it cannot be renamed");
    return false;
  }
  if (oldName == null) {
    return false;
  }
  if (!allFileTypes.includes(getFileType(oldName))) {
    alert("You can only rename to html,css,js,image files");
    return false;
  }
  if (oldName.trim() == "" || files[newName] != undefined) {
    alert("File name already exist");
    return false;
  }
  let newFile = document.getElementById(oldName);
  newFile.setAttribute("data-file", newName);
  newFile.setAttribute("id", newName);
  newFile.innerText = newName;
  files[newName] = files[oldName];
  files[oldName] = null;
  return true;
}
document.getElementById("file-delete").addEventListener("click", () => {
  if (deleteFile(currentFile)) {
    sendData(JSON.stringify({ type: "delete-file", filename: currentFile }));
  }
});
export function deleteFile(filename) {
  if (filename == "index.html") {
    alert("this is main html file,it cannot be deleted");
    return false;
  }
  files[filename] = null;
  document.getElementById(filename).remove();

  if (currentFile == filename) {
    document.getElementById("index.html").click();
  }
  return true;
}
export function updateProject(newfiles){
  for(let item in newfiles){
    console.log("ppp");
  }
  console.log(Object.keys(newfiles).length);
  for(let filename in files){
    if (filename == "index.html") {
      return false;
    }
    files[filename] = null;
    document.getElementById(filename).remove();
  
    if (currentFile == filename) {
      document.getElementById("index.html").click();
    }
  }
  console.log(newfiles.length);
  for(let item in newfiles){
    console.log(item);
    addUploadedFile(item,newfiles[item],getFileType(item));

  }
  files=newfiles;
  files["index.html"]=newfiles["index.html"];
  document.getElementById("index.html").click();
}
