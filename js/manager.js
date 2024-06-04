
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
document.getElementById("select-file-type").addEventListener("change",(e)=>{
    console.log(e.target.value);
   fileSelector.accept=e.target.value;

})




