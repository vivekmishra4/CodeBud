import { downloadFile, downloadFiles } from "./store-offline.js";
import { currentFile } from "./store-online.js";

let isDialog=false;
let snippets=document.getElementById("snippets");
let dialogWindow=document.querySelector(".dialog-window");
snippets.addEventListener("click",()=>{
  dialogWindow.innerHTML=`
   <button id="close-dialog">close</button>
  <input type="text" id="snippet-search" placeholder="Search for a snippet...">
  <div id="snippet-list" class="snippet-list"></div>
  `;
  document.getElementById('close-dialog').addEventListener('click', toggleDialog);
  document.getElementById('snippet-search').addEventListener('keyup',filterSnippets);
  toggleDialog();
  
});

const mySnippets = [
  { language: 'JavaScript', name: 'Array Filter', code: 'const filteredArray = array.filter(item => item > 0);' },
  { language: 'Python', name: 'List Comprehension', code: '[x for x in range(10) if x % 2 == 0]' },
  { language: 'Java', name: 'Print Hello', code: 'System.out.println("Hello, World!");' },
];

function filterSnippets() {
  const query = document.getElementById('snippet-search').value.toLowerCase();
  const filteredSnippets = mySnippets.filter(snippet => snippet.name.toLowerCase().includes(query));
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
      alert('Code copied to clipboard!');
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

let isDarkTheme=false;
document.getElementById("theme-toggle").addEventListener("click",()=>{
  if(isDarkTheme){
    isDarkTheme=false;
  }
  else{
    isDarkTheme=true;
  }

})
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
let moreOpen=false;
let moreOptions=document.querySelector(".file-more-options");
document.getElementById("file-more-icon").addEventListener("click",toggleMore);
function toggleMore(){
    console.log("Hii");
    if(moreOpen){
        moreOptions.style.display="none";
        moreOpen=false;
    }else{
        moreOptions.style.display="inline-block";
        moreOpen=true;
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