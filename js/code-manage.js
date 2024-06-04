import {
  dbinit,
  saveFile,
  downloadFile,
  retrieveAllFiles,
  downloadFiles,
} from "./store-offline.js";
import { currentFile, files } from "./store-online.js";
let codeButton = document.getElementById("run-btn");
let outputFrame = document.getElementById("output-frame");
let inputArea = document.getElementById("code-input");

// let fullOutput=document.getElementById("full-frame");
// let isFullOutput=false;
// fullOutput.addEventListener("click",()=>{
//   if(!isFullOutput){
//     outputFrame.requestFullscreen();
//   }

// })
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


eruda.init();
let htmlText="";
let styleText="";
let scriptText="";
let uploadedFiles={

}

let iframeDocument =
  outputFrame.contentDocument || outputFrame.contentWindow.document;
codeButton.addEventListener("click", updateOutput);
function updateOutput() {
  saveDocument(currentFile);
  iframeDocument.open();
  iframeDocument.write(
    `
        <!DOCTYPE html>
        <html>
        <head>
        <style>
        ${files["style.css"]}
        </style>
        </head>
        <body>
        ${files["index.html"]}
        <script>
        ${files["script.js"]}
        </script>
        </body>
        </html>
        `
  );
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