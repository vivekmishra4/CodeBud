let chatMaximized=true;
const chatOps=document.querySelector(".chat-ops");
const chatInterface=document.querySelector(".chat-interface");
document.getElementById("chat-maximize").addEventListener("click",()=>{
    if(chatMaximized){
        chatOps.style.display="none";
        chatInterface.style.display="none";
        chatMaximized=false;

    }
    else{
        chatOps.style.display="inline-block";
        chatInterface.style.display="inline-block";
        chatMaximized=true;
    }
});
