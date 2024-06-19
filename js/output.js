import { files,outputCode } from "./shared-data.js";
let code = localStorage.getItem('outputCode');
if(code){
    document.body.innerHTML=code;
    console.log(code);
}



eruda.init();