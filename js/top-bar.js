import { downloadFile, downloadFiles } from "./store-offline.js";
import { currentFile } from "./store-online.js";
import { mySnippets } from "./shared-data.js";
let isDialog=false;
let snippets=document.getElementById("snippets");
let snippetLang="html";
let dialogWindow=document.querySelector(".dialog-window");
snippets.addEventListener("click",()=>{
  dialogWindow.innerHTML=`
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
  document.getElementById('close-dialog').addEventListener('click', toggleDialog);
  document.getElementById('snippet-search').addEventListener('keyup',filterSnippets);
  toggleDialog();
  
});

function filterSnippets() {
  let selectedLang=document.getElementById("snippet-lang").value;
  const query = document.getElementById('snippet-search').value.toLowerCase();
  const filteredSnippets = mySnippets[selectedLang].filter(snippet => snippet.name.toLowerCase().includes(query));
  displaySnippets(filteredSnippets);
}

function displaySnippets(snippetArray) {
  const snippetList = document.getElementById('snippet-list');
  snippetList.innerHTML = '';
  snippetArray.forEach(snippet => {
      const snippetItem = document.createElement('div');
      snippetItem.className = 'snippet-item';

      const snippetName = document.createElement('div');
      snippetName.className = 'snippet-name';
      snippetName.textContent = snippet.name;

      const snippetCode = document.createElement('pre');
      snippetCode.className = 'snippet-code';
      snippetCode.textContent = snippet.code;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => copyToClipboard(snippet.code);

      snippetItem.appendChild(snippetName);
      snippetItem.appendChild(snippetCode);
      snippetItem.appendChild(copyBtn);
      snippetList.appendChild(snippetItem);
  });
}

function copyToClipboard(code) {
  navigator.clipboard.writeText(code).then(() => {
      document.querySelector(".copy-btn").innerText="copied";
  }, () => {
      alert('Failed to copy code to clipboard.');
  });
}
document.getElementById("help-icon").addEventListener("click",()=>{
  dialogWindow.innerHTML=`
   <button id="close-dialog">close</button>
  <p></p>
  `;
  document.getElementById('close-dialog').addEventListener('click', toggleDialog);
  toggleDialog();
  
});

function toggleDialog(){
  if(isDialog){
    dialogWindow.showModal();
    isDialog=false;
  }
  else{
    dialogWindow.close("closing");
  isDialog=true

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

let Mysnippets=[{type:"html",name:"button",code:""},
  {type:"html",name:"button"}
]
let snippetsCode=`

`;
let helpCode=`
`;
let projectsCode=``;
//Code to rename project and show it in <title>
let isFileMenuOpen=false;
const fileMenu=document.querySelector(".file-menu");
document.getElementById("file-menu-icon").addEventListener('click',()=>{
  if(isFileMenuOpen){
    fileMenu.style.display="none";
    isFileMenuOpen=false;
  }else{
    fileMenu.style.display="block";
    isFileMenuOpen=true;
  }
})
document.getElementById("rename-project").addEventListener("click",()=>{
  document.querySelector("title").innerText=prompt("Enter new Name");
})
document.getElementById("open-projects").addEventListener("click",openProjects);
function openProjects(){
  toggleDialog();

}

let fileManage=document.getElementById("file-list");
let closeButton=document.getElementById("close-btn");
let manager=document.getElementById("manager");
let managerOps=document.getElementById("manager-ops");
let isOpen=true;
closeButton.addEventListener("click",()=>{
    if(!isOpen){
        manager.style.display="inline";
        managerOps.style.display="inline";
        isOpen=true;
    }
    else{
        manager.style.display="none";
        managerOps.style.display="none";
        isOpen=false;
    }  
}
);
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

const fileSelector=document.getElementById("file-upload");

const fileDownloadButton=document.getElementById("file-download");
const downloadAllButton=document.getElementById("file-download-all");
fileDownloadButton.addEventListener("click",()=>{
    downloadFile(currentFile);
})
downloadAllButton.addEventListener("click",()=>{
    downloadFiles();
})