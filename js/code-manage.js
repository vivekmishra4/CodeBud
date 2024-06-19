import {
  dbinit,
  saveFile,
  downloadFile,
  retrieveAllFiles,
  downloadFiles,
} from "./store-offline.js";
import { outputCode } from "./shared-data.js";
import { currentFile, getFileType } from "./store-online.js";
import { files } from "./shared-data.js";
let codeButton = document.getElementById("run-btn");
let outputFrame = document.getElementById("output-frame");
let inputArea = document.getElementById("code-input");
const fileType=document.getElementById("select-file-type");
let htmlText="";
let styleText="";
let scriptText="";
let frameCode="";
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
 window.open("output.html");

})

inputArea.value=files["index.html"];

function linker(){
  //a,script,img,link:css
  // const myScript=document.createElement("script");
  // myScript.setAttribute("src",dataURL);
  // document.querySelector("body").appendChild(myScript);
  let code = inputArea.value;
  // for (const name in uploadedFiles) {
  //     const regex = new RegExp(name, 'g');
  //     code = code.replace(regex, uploadedFiles[name]);
  // }
 

/// Replace URLs in <link> tags
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
  const newUrl = files[p1] ||uploadedFiles[p1]|| p1;
  // Construct the new tag with the updated URL
  const newTag = match.replace(p1, newUrl);
  return newTag;
});

// Replace URLs in <a> tags
code = code.replace(/<a[^>]*?href="([^"]*?)"[^>]*?>/g, function(match, p1) {
  const newUrl = files[p1] ||uploadedFiles[p1]|| p1;
  // Construct the new tag with the updated URL
  const newTag = match.replace(p1, newUrl);
  return newTag;
});

// Replace URLs in <img> tags
code = code.replace(/<img[^>]*?src="([^"]*?)"[^>]*?>/g, function(match, p1) {
  const newUrl = files[p1] ||uploadedFiles[p1]|| p1;
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
function uploadFile(event){
  const file = event.target.files[0];
    if (file) {
      console.log("file name is"+file.name);
        const reader = new FileReader();
        reader.onload = function(e) {
            if(!uploadFileTypes.includes(getFileType(file.name).trim())){
              alert("You can only upload html,css,js,image the type is "+getFileType(file.name));
              return;
            }
            const dataURL = e.target.result;
            console.log(dataURL);
            const reader = new FileReader();
            reader.readAsText(file);
            reader.addEventListener(
              "load",
              () => {
                if(files[file.name]===undefined&&uploadedFiles[file.name]===undefined){
                  uploadedFiles[file.name]=dataURL;
                  console.log(reader.result);
                 
                }else{
                  console.log("File name already exist n"+file.name+files[file.name]+uploadedFiles[file.name]);
          
                }
                
              },
              false,
            );
            
            
        };
        reader.readAsDataURL(file);
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