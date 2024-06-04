// app.js
const socket = new WebSocket('ws://localhost:3000');
export let currentFile="index.html";
let isConnected=false;
let isOnline=false;
const fileTypeList=["html","css","js"];
const chatBox = document.getElementById('messages');
const inputProjectId=document.getElementById('project-id')
let startColab=document.getElementById('start-colab');
startColab.addEventListener('click', startCollaboration);
let joinColab=document.getElementById('join-colab');
joinColab.addEventListener('click', joinCollaboration);
document.getElementById('send-message').addEventListener('click', sendMessage);
document.getElementById('add-file').addEventListener('click',addFile);
document.getElementById('close-colab').addEventListener('click',closeCollaboration);
let fileNameOpened = document.getElementById("file-name-opened");
const editor=document.getElementById("code-input");
const fileList=document.getElementById('file-list');
const fileType=document.getElementById("select-file-type");
export const files={"index.html":"",
                    "style.css":"",
                    "script.js":""
};
let projectId="";
let username=Math.floor(Math.random()*1000);
function addFile(){
    if(fileType.value=="image/*"){
      alert("you cannot create image files");
    }
    let filename=prompt("Enter file name",fileType.value);
    if(filename==null){
      return;
    }
    if(filename.trim()!=""&&files[filename]==undefined){
        let newFile=document.createElement("li");
        newFile.setAttribute("data-file",filename);
        newFile.innerText=filename;
        fileList.appendChild(newFile);
        files[filename]="";
        sendData(JSON.stringify({ type: 'file',filename:filename,content:"" }));

    }
    else{
        alert("File name already exist");
    }

}
export function getFileType(filename){

  const dotIndex=filename.lastIndexOf(".");
  if(dotIndex==-1||dotIndex==filename.length-1)
    return "unknown";
  const fileType=filename.slice(dotIndex+1);
  if(fileTypeList.includes(fileType)){
    return fileType;
  }
  else{
    return "unknown";
  }
} 

fileList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        const selectedFile = event.target.dataset.file;
        if (selectedFile !== currentFile) {
            if(currentFile!=""){
              files[currentFile]=editor.value;
            }
            currentFile = selectedFile;
            openFile(currentFile,files[currentFile]);
            highlightSelectedFile(currentFile);
            fileNameOpened.value=currentFile;
        }
    }
});
function highlightSelectedFile(selectedFile) {
    const items = fileList.getElementsByTagName('li');
    for (let item of items) {
        if (item.dataset.file === selectedFile) {
            item.classList.add('selected');
        } else {
            item.classList.remove('selected');
        }
    }
}
editor.addEventListener('input', () => {
    const currentContent = editor.value;
    if(currentFile!=""){
      files[currentFile]=currentContent;
      // const diff = getDiff(previousContent, currentContent);
      // previousContent = currentContent;
      sendData(JSON.stringify({ type: 'file',filename:currentFile,content:currentContent }));
    }
   
});

function startCollaboration() {
  if(socket.CLOSED){
    alert("Socket Inactive");
    return;
  }
  projectId = generateProjectId();
  document.getElementById('project-id').value = projectId;
  sendData(JSON.stringify({ type: 'start-colab',projectId,username }));
  startColab.style.display="none";
  joinColab.style.display="none";
  inputProjectId.setAttribute("readonly",true);
}

function joinCollaboration() {
  if(socket.CLOSED){
    alert("Socket Inactive");
    return;
  }
  const projectId = inputProjectId.value;
  sendData(JSON.stringify({ type: 'join-colab',projectId,username }));
  startColab.style.display="none";
  joinColab.style.display="none";
}
function closeCollaboration(){
  if(socket.CLOSED){
    alert("Socket Inactive");
    return;
  }
    sendData(JSON.stringify({ type: 'close-colab', projectId }));
    startColab.style.display="block";
    joinColab.style.display="inline";
    chatBox.innerHTML="";
    fileList.innerHTML="";
    projectId="";
}
function beforeClose(){
  
}
function sendMessage() {
  const message = document.getElementById('message-text').value;
  sendData(JSON.stringify({ type: 'chat', message }));
}
async function sendData(data){
  if(!isOnline){
    return;
  }
 
 if(socket.CLOSED){
    alert("web socket is inactive")
    return false;
  }
  socket.send(data);
  return true;

}
function colabStatus(){

}

socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  switch(data.type) {
    case 'chat':
      displayMessage(data.message,data.username);
      break;
    case 'file':
        
        if(data.filename==currentFile){
            openFile(data.filename,data.content);
        }
        else if(files[data.filename]==undefined){
          let newFile=document.createElement("li");
          newFile.setAttribute("data-file",data.filename);
          newFile.innerText=data.filename;
          fileList.appendChild(newFile);
        }
        files[data.filename]=data.content;
      break;
    case "projectinvalid":
      if(data.content=="join-colab"){
        alert("Invalid Project Id");
        startColab.style.display="block";
    joinColab.style.display="inline";
      }
      else if(data.content=="chat"||data.content=="close-colab"){
        alert("You are not connected with any project");
      }
      break;
  }
};

function displayMessage(message,userName) {
 
  const messageElement = document.createElement('div');
  if(username!=userName){
    const sender=document.createElement('span');
    sender.classList.add("sender")
    sender.textContent=userName;
    messageElement.appendChild(sender);
  }
  let text = new Text(message);
  messageElement.appendChild(text);
  chatBox.appendChild(messageElement);
}

function openFile(filename, content) {
  editor.value = content;
}

function generateProjectId() {
  return 'proj-' + Math.random().toString(36).substring(2, 9);
}
document.getElementById('toggleOnline').addEventListener('change', function() {
 
  if (this.checked) {
    if(window.onoffline){
      alert("you are offline");
      return;
    }
      console.log('is Online '+isOnline);
      document.querySelector(".colab").style.display="flex";
  } else {
      console.log('is Online '+isOnline);
      document.querySelector(".colab").style.display="none";
  }
  isOnline=!isOnline;
});
