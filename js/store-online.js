import { files } from "./shared-data.js";
import { initializeFirebase } from './firebaseService.js';
let socket;
export let currentFile = "index.html";
let isConnected = false;
let isOnline = false;
const fileTypeList = ["html", "css", "js"];
const chatBox = document.getElementById("messages");
const inputProjectId = document.getElementById("project-id");
let startColab = document.getElementById("start-colab");
startColab.addEventListener("click", startCollaboration);
const {auth} = await initializeFirebase();
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
let userId=getStoredUserId();
let projectName = "project";
let projectId = "";
let username = getStoredUserName();
function addFile() {
  let filename = prompt("Enter file name");
  if (filename == null) {
    return;
  }
  if(!fileTypeList.includes(getFileType(filename))){
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
    if(isConnected){
      sendData(JSON.stringify({ type: "file", filename: filename, content: "" }));
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
  // if (fileTypeList.includes(fileType)) {
  //   return fileType;
  // } else {
  //   return "unknown";
  // }
}

fileList.addEventListener("click", (event) => {
  if (event.target.tagName === "LI") {
    const selectedFile = event.target.dataset.file;
    if (selectedFile !== currentFile) {
      if (currentFile != "") {
        files[currentFile] = editor.value;
      }
      currentFile = selectedFile;
      openFile(currentFile, files[currentFile]);
      highlightSelectedFile(currentFile);
      fileNameOpened.value = currentFile;
    }
  }
});
function highlightSelectedFile(selectedFile) {
  const items = fileList.getElementsByTagName("li");
  for (let item of items) {
    if (item.dataset.file === selectedFile) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  }
}
highlightSelectedFile(currentFile);
editor.addEventListener("input", () => {
  const currentContent = editor.value;
  if (currentFile != "") {
    files[currentFile] = currentContent;
    // const diff = getDiff(previousContent, currentContent);
    // previousContent = currentContent;
    if(isConnected){
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
  const userId = localStorage.getItem('userId');
  if (userId) {
    console.log('Stored User ID:', userId);
    return userId;
  } else {
    console.log('No User ID found in localStorage');
    return null;
  }
}
function getStoredUserName() {
  const userName = localStorage.getItem('userName');
  if (userName) {
    console.log('Stored User Name:', userId);
    return userName;
  } else {
    console.log('No User Name found in localStorage');
    return null;
  }
}
function startCollaboration() {
  if (!socket.OPEN || !isConnected) {
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
  if (!socket.OPEN || !isConnected) {
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
  if (!socket.OPEN || !isConnected) {
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
  if (!isConnected) {
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
        if (data.content == "join-colab") {
          alert("Invalid Project Id");
          startColab.style.display = "block";
          joinColab.style.display = "inline";
        } else if (data.content == "chat" || data.content == "close-colab") {
          alert("You are not connected with any project");
        }
        break;
    }
  };
}

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

function openFile(filename, content) {
  editor.value = content;
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
        alert("Unable to connect")
      });
    } catch (error) {
      document.querySelector(".colab").style.display = "none";
      this.checked = false;
      alert("Unable to connect")
    }
  }
  else{

  }
  socket.addEventListener("open", (event) => {
    receiveMessage(socket);
    isConnected = !isConnected;
    document.querySelector(".colab").style.display = "flex";
  });
  console.log("is Connected " + isConnected);
});
function renameProject() {
let newName=prompt("Enter New file Name", projectName);
if(newName==null||newName.trim()==""){
  alert("Project Name cannot be empty");
  return;
}
projectName=newName;
sendData(JSON.stringify({ type: "rename-project",newName:newName }));

}
document.getElementById("file-rename").addEventListener("click", renameFile);
function renameFile() {
  let newName=prompt("Enter New file Name", currentFile);
  if (currentFile == "index.html") {
    alert("this is main html file,it cannot be deleted");
    return;
  }
  if (filename == null) {
    return;
  }
  if(!fileTypeList.includes(getFileType(filename))){
    alert("You can only create html,css,js files");
    return;
  }
  if (filename.trim() == "" || files[newName] != undefined) {
    alert("File name already exist");
  }
  sendData(JSON.stringify({ type: "rename-file", oldName:currentFile,newName:newName }));
  files[newName]=files[currentFile];
  files[currentFile]=null;
  
}
document.getElementById("file-delete").addEventListener("click", deleteFile);
function deleteFile() {
  if (currentFile == "index.html") {
    alert("this is main html file,it cannot be deleted");
    return;
  }
  files[currentFile] = null;
  sendData(JSON.stringify({ type: "delete-file", filename:currentFile}));
  document.getElementById(currentFile).remove();
  document.getElementById("index.html").click();
}
