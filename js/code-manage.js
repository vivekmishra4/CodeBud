import {
  downloadFile,
  downloadFiles,
} from "./store-offline.js";
import { outputCode } from "./shared-data.js";
import { addUploadedFile } from "./store-online.js";
import { currentFile, getFileType } from "./store-online.js";
import { files } from "./shared-data.js";
let codeButton = document.getElementById("run-btn");
let outputFrame = document.getElementById("output-frame");
let inputArea = document.getElementById("code-input");
const fileType=document.getElementById("select-file-type");
let frameCode="";
let imagesTypes=['png','jpg','jpeg','svg'];
const uploadFileTypes=['html','css','js','png','jpg','jpeg','svg'];

// let fullOutput=document.getElementById("full-frame");
// let isFullOutput=false;
// fullOutput.addEventListener("click",()=>{
//   if(!isFullOutput){
//     outputFrame.requestFullscreen();
//   }

// })
export let uploadedFiles={

}


document.getElementById("file-upload").addEventListener("change",uploadFile)
inputArea.addEventListener("input", updateOutput);
let liveOutput = document.getElementById("live-output");
liveOutput.addEventListener("change", (e) => {
  const selectedValue = e.target.value;
  if (selectedValue == "on") {
    inputArea.addEventListener("input", updateOutput);
  } else {
    inputArea.removeEventListener("input", updateOutput);
  }
});



let iframeDocument =
  outputFrame.contentDocument || outputFrame.contentWindow.document;
codeButton.addEventListener("click",()=>{
  linker();
  // updateOutput();

} );
function updateOutput() {
  saveDocument(currentFile);
  frameCode=`
        ${files["index.html"]}
        `;
  iframeDocument.open();
  iframeDocument.write(frameCode);
}
document.getElementById("open-output").addEventListener("click",()=>{
 linker();
 let erudaScript = iframeDocument.createElement('script');
 erudaScript.setAttribute("src", "js/eruda.min.js");
 iframeDocument.body.appendChild(erudaScript);

 // Ensure the script is loaded before initializing eruda
 erudaScript.onload = () => {
    //  let initScript = iframeDocument.createElement('script');
    //  initScript.innerHTML = "eruda.init();";
    //  iframeDocument.body.appendChild(initScript);

     // After eruda is initialized, open the content in a new tab
     setTimeout(() => {
         openIframeContentInNewTab();
     }, 1000); // Delay to ensure the initialization script runs
 };
});

 function openIframeContentInNewTab() {
     // Clone the iframe document
     let clone = iframeDocument.cloneNode(true);

     // Ensure the eruda script is included in the cloned document
     let cloneErudaScript = clone.createElement('script');
     cloneErudaScript.setAttribute("src", "http://127.0.0.1:5500/js/eruda.min.js");
     clone.body.appendChild(cloneErudaScript);

     // Add the initialization script to the cloned document
     let cloneInitScript = clone.createElement('script');
     cloneInitScript.innerHTML = "eruda.init();";
     clone.body.appendChild(cloneInitScript);

     // Serialize the cloned document's outer HTML
     var content = clone.documentElement.outerHTML;

     // Create a Blob from the content
     var blob = new Blob([content], { type: 'text/html' });

     // Create an Object URL from the Blob
     var url = URL.createObjectURL(blob);

     // Open the Object URL in a new tab
     window.open(url, '_blank');

     // Clean up by revoking the Object URL
     setTimeout(() => URL.revokeObjectURL(url), 10000); // Delay to ensure the new tab has loaded
 }

inputArea.value=files["index.html"];
function linker(){
  let code = inputArea.value;
code = code.replace(/<link[^>]*?href="([^"]*?)"[^>]*?>/g, function(match, p1) {
  let newUrl = files[p1];
  if(newUrl){
    var blob = new Blob([newUrl], { type: 'text/stylesheet' });
    var url = URL.createObjectURL(blob);
    newUrl=url;
  }else{
    newUrl=uploadedFiles[p1]|| p1;
  }
  // Construct the new tag with the updated URL
  const newTag = match.replace(p1, newUrl);
  return newTag;
});

// Replace URLs in <script> tags
code = code.replace(/<script[^>]*?src="([^"]*?)"[^>]*?>[^<]*?<\/script>/g, function(match, p1) {
  let newUrl = files[p1];
  if(newUrl){
    var blob = new Blob([newUrl], { type: 'text/stylesheet' });
    var url = URL.createObjectURL(blob);
    newUrl=url;
  }else{
    newUrl=uploadedFiles[p1]|| p1;
  }
  const newTag = match.replace(p1, newUrl);
  return newTag;
});

// Replace URLs in <a> tags
code = code.replace(/<a[^>]*?href="([^"]*?)"[^>]*?>/g, function(match, p1) {
  let newUrl=uploadedFiles[p1]|| p1;
  if(newUrl){
    var blob = new Blob([newUrl], { type: 'text/stylesheet' });
    var url = URL.createObjectURL(blob);
    newUrl=url;
  }
  const newTag = match.replace(p1, newUrl);
  return newTag;
});
console.log(code);
// Replace URLs in <img> tags
code = code.replace(/<img[^>]*?src="([^"]*?)"[^>]*?>/g, function(match, p1) {
  let newUrl = files[p1];
  if(newUrl){
    var blob = new Blob([newUrl], { type: 'text/stylesheet' });
    var url = URL.createObjectURL(blob);
    newUrl=url;
  }else{
    newUrl=uploadedFiles[p1]|| p1;
  }
  // Construct the new tag with the updated URL
  const newTag = match.replace(p1, newUrl);
  return newTag;
});
iframeDocument.open();
iframeDocument.write(code);
iframeDocument.close();
outputCode[0]=code;
console.log(outputCode[0]);
localStorage.setItem('outputCode',code);
}
function uploadFile(event) {
  const file = event.target.files[0];
  if (file) {
    const fileType = getFileType(file.name).trim();

    if (!uploadFileTypes.includes(fileType)) {
      alert("You can only upload html, css, js, or images. The type is " + fileType);
      return;
    }

    // Use FileReader to read the file
    const reader = new FileReader();

    if (imagesTypes.includes(fileType)) {
      reader.onload = function(e) {
        const dataURL = e.target.result;
        storeFile(file.name, dataURL, fileType);
      };
      reader.readAsDataURL(file);
    } else {
      // For text files, read as text
      reader.onload = function(e) {
        const dataText = e.target.result;
        storeFile(file.name, dataText, fileType);
      };
      reader.readAsText(file);
    }
  } else {
    console.log("No file selected");
  }
}

// Function to store file content
function storeFile(fileName, data, fileType) {
  if (files[fileName] === undefined && uploadedFiles[fileName] === undefined) {
    uploadedFiles[fileName] = data;
    addUploadedFile(fileName, data,fileType);
    console.log("File added:", fileName);
  } else {
    console.log("File name already exists: " + fileName + " " + files[fileName] + " " + uploadedFiles[fileName]);
  }
}
function getText(file){
  
}


function saveDocument(fileName) {
  files[fileName] = inputArea.value;
}
// Add keyboard shortcuts
document.addEventListener("keydown", function (event) {
  if (event.ctrlKey && event.key === "s") {
    event.preventDefault();
    downloadFile(currentFile);
  }
  if (event.ctrlKey && event.key === "u") {
    event.preventDefault();
    uploadFile();
  }
  if (event.ctrlKey && event.key === "S") {
    console.log("hjj");
    event.preventDefault();
    downloadFiles();
  }

});
/*
function generateLink() {
  // const code = document.getElementById('code').value;
  const code="<h1>Hello</h1>";
  const blob = new Blob([code], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const openLink = document.createElement('a');
  openLink.href = url;
  openLink.textContent = 'Open Generated Page';
  document.querySelector(".bad").appendChild(openLink);
}



document.getElementById('image-upload').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
          const dataURL = e.target.result;
          const imgTag = `<img src="${dataURL}" alt="Uploaded Image">`;
          const codeTextArea = document.getElementById('code');
          const regex = /<img[^>]+src="?([^"\s]+)"?\s*\/?>/g;
          let matches;
          while ((matches = regex.exec(codeTextArea.value)) !== null) {
              const imgSrc = matches[1];
              if (imgSrc.includes(file.name)) {
                  const newDataUrlImgTag = `<img src="${dataURL}" alt="Uploaded Image">`;
                  document.querySelector(".bad").innerHTML=newDataUrlImgTag;
                  codeTextArea.value = codeTextArea.value.replace(matches[0], newDataUrlImgTag);
                  console.log(codeTextArea.value);
              }
          }
      };
      reader.readAsDataURL(file);
  }
});
*/