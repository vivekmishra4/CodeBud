let lineNumbers = document.getElementById("line-numbers");
let codeInput = document.getElementById("code-input");
lineNumbers.addEventListener("scroll",syncLines)
codeInput.addEventListener("scroll", syncScroll);
codeInput.addEventListener("input", () => {
  let n = codeInput.value.split("\n").length;
  lineNumbers.innerHTML = "";
  for (let i = 1; i <= n; i++) {
    lineNumbers.innerHTML += i + "<br>";
  }
});
function syncScroll() {
  lineNumbers.scrollTop = codeInput.scrollTop;
}
function syncLines(){
  codeInput.scrollTop=lineNumbers.scrollTop
}
let isDialog=false;
let snippets=document.getElementById("snippets");
let dialogWindow=document.querySelector(".dialog-window");
snippets.addEventListener("click",()=>{
  dialogWindow.innerHTML=`
  <span class="close-btn" onclick="toggleDialog()">&times;</span>
  <input type="text" id="snippet-search" placeholder="Search for a snippet..." onkeyup="filterSnippets()">
  <div id="snippet-list" class="snippet-list"></div>
  `;
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
document.getElementById("help-icon").addEventListener("click",toggleDialog);
document.getElementById("close-dialog").addEventListener("click",toggleDialog);

function toggleDialog(){
  if(isDialog){
    dialogWindow.style.display="none";
    isDialog=false;
  }
  else{
    dialogWindow.style.display="block";
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
document.getElementById("open-projects").addEventListener("click",toggleDialog);
