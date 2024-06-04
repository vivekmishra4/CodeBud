try {
} catch (err) {}
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDquLNhfW5xtRA8984ALn8o2fTslEVnzd8",
  authDomain: "codebudproject.firebaseapp.com",
  projectId: "codebudproject",
  storageBucket: "codebudproject.appspot.com",
  messagingSenderId: "382385067975",
  appId: "1:382385067975:web:0bc61191f32028a32babe2",
  measurementId: "G-959BJCQBW7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
document.getElementById("register-btn").addEventListener("click", register);
let spinner = document.getElementById('loading-spinner');
function register() {
  
  const email = document.getElementById("regEmail").value;
  const password = document.getElementById("regPassword").value;
  const errorMessage = document.getElementById("register-error-message");
  spinner.style.display='block';
  errorMessage.style.display = 'none';
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      spinner.style.display = 'none';
      errorMessage.style.display = 'block';
      // Registered successfully
      errorMessage.innerText="User Registered successfully";
    
    })
    .catch((error) => {
      spinner.style.display = 'none';
      errorMessage.style.display = 'block';
      // Handle errors
      errorMessage.innerText=error.message;
    });
}

// function loadFirebase() {
//     const script = document.createElement('script');
//     script.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"; // Load Firebase app script
//     script.onload = () => {
//         const scriptAuth = document.createElement('script');
//         scriptAuth.src = "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js"; // Load Firebase auth script
//         document.body.appendChild(scriptAuth);
//         // Initialize Firebase after all scripts are loaded
//         scriptAuth.onload = () => {
//             const firebaseConfig = {
//                 apiKey: "AIzaSyDquLNhfW5xtRA8984ALn8o2fTslEVnzd8",
//                 authDomain: "codebudproject.firebaseapp.com",
//                 projectId: "codebudproject",
//                 storageBucket: "codebudproject.appspot.com",
//                 messagingSenderId: "382385067975",
//                 appId: "1:382385067975:web:0bc61191f32028a32babe2",
//                 measurementId: "G-959BJCQBW7"
//             };
//             firebase.initializeApp(firebaseConfig);
//             initFirebaseAuth();
//         };
//     };
//     document.body.appendChild(script);
// }
// function initFirebaseAuth() {
//     firebase.auth().onAuthStateChanged(user => {
//         if (user) {
//             console.log('User signed in:', user.email);

//         } else {
//             console.log('No user signed in');
//         }
//     });
// }

// if (navigator.onLine) {
//     loadFirebase();
// } else {
//     console.log("Offline mode: Firebase not loaded");
// }

// window.addEventListener('online', loadFirebase);
