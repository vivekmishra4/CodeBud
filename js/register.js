import { initializeFirebase } from './firebaseService.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (navigator.onLine) {
        const { auth, createUserWithEmailAndPassword, updateProfile } = await initializeFirebase();

        document.getElementById("register-btn").addEventListener("click", () => register(auth, createUserWithEmailAndPassword, updateProfile));
    } else {
        alert('You are currently offline. Please connect to the internet to use this application.');
    }
});

function register(auth, createUserWithEmailAndPassword, updateProfile) {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const errorMessage = document.getElementById("register-error-message");
    const spinner = document.getElementById("loading-spinner");
    
    spinner.style.display = "block";
    errorMessage.style.display = "none";

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            localStorage.setItem('userId', user.uid);
            localStorage.setItem('userName',user.displayName || 'Anonymous');
            updateProfile(user, { displayName: name })
                .then(() => {
                    spinner.style.display = "none";
                    errorMessage.style.display = "block";
                    errorMessage.innerText = "User Registered successfully";
                    window.open("authentication.html", "_self");
                });
        })
        .catch((error) => {
            spinner.style.display = "none";
            errorMessage.style.display = "block";
            errorMessage.innerText = error.message;
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
