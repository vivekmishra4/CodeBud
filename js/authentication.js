import { initializeFirebase } from './firebaseService.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (navigator.onLine) {
        const { auth, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile, updatePassword, deleteUser } = await initializeFirebase();
        
        const main = document.querySelector("main");
        const loginBox = document.querySelector(".login-container");
        const signOutButton = document.getElementById("sign-out-button");
        const editNameBtn = document.getElementById("edit-name");
        const changePasswordBtn = document.getElementById("change-password");
        const deleteAccountBtn = document.getElementById("delete-account");
        const nameChange = document.querySelector(".name-change");
        const passwordChange = document.querySelector(".password-change");
        const errorMessage = document.getElementById("login-error-message");
        const spinner = document.getElementById('loading-spinner');
        
        document.getElementById("login-btn").addEventListener("click", () => login(auth, signInWithEmailAndPassword, errorMessage, spinner, main, loginBox, signOutButton));
        document.getElementById("name-confirm").addEventListener("click", () => updateName(auth, updateProfile));
        document.getElementById("password-confirm").addEventListener("click", () => updatePassword(auth, updatePassword));
        signOutButton.addEventListener("click", () => signOutUser(auth, signOut, main, loginBox, signOutButton));
        editNameBtn.addEventListener("click", () => {
            passwordChange.style.display = "none";
            nameChange.style.display = "block";
        });
        changePasswordBtn.addEventListener("click", () => {
            nameChange.style.display = "none";
            passwordChange.style.display = "block";
        });
        deleteAccountBtn.addEventListener("click", () => deleteAccount(auth, deleteUser));

        // Check auth state
        onAuthStateChanged(auth, (user) => {
            if (user) {
                localStorage.setItem('userId',user.uid);
                localStorage.setItem('userName',user.displayName || 'Anonymous');
                console.log(user.email);
                displayUserProfile(user);
                main.style.display = "block";
                loginBox.style.display = "none";
                signOutButton.style.display = "block";
            } else {
                main.style.display = "none";
                loginBox.style.display = "block";
                signOutButton.style.display = "none";
            }
        });
    } else {
        alert('You are currently offline. Please connect to the internet to use this application.');
    }
});

function displayUserProfile(user) {
    document.getElementById("user-name").textContent = `Name: ${user.displayName}`;
    document.getElementById("user-email").textContent = `Email: ${user.email}`;
}

function login(auth, signInWithEmailAndPassword, errorMessage, spinner, main, loginBox, signOutButton) {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    spinner.style.display = "block";
    errorMessage.style.display = "none";
    
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            spinner.style.display = "none";
            errorMessage.style.display = "block";
            errorMessage.innerText = "User Logged in successfully";
            displayUserProfile(userCredential.user);
            main.style.display = "block";
            loginBox.style.display = "none";
            signOutButton.style.display = "block";
            document.getElementById("user-name").style.display = "none";
            document.getElementById("user-email").style.display="none";
        })
        .catch((error) => {
            spinner.style.display = "none";
            errorMessage.style.display = "block";
            errorMessage.innerText = error.message;
        });
}

function updateName(auth, updateProfile) {
    const newName = document.getElementById("new-name").value;
    updateProfile(auth.currentUser, { displayName: newName })
        .then(() => {
            document.getElementById("user-name").textContent = `Name: ${auth.currentUser.displayName}`;
        })
        .catch((error) => console.error("Error updating name:", error));
}

function updatePassword(auth, updatePassword) {
    const newPassword = document.getElementById("enter-password").value;
    updatePassword(auth.currentUser, newPassword)
        .then(() => {
            alert("Password Changed Successfully");
            document.querySelector(".password-change").style.display = "none";
        })
        .catch((error) => console.error("Error updating password:", error));
}

function deleteAccount(auth, deleteUser) {
    const response = confirm("Do you want to delete account");
    if (response) {
        deleteUser(auth.currentUser)
            .then(() => {
                alert("Account deleted successfully");
                window.location.reload();
            })
            .catch((error) => console.error("Error deleting account:", error));
    }
}

function signOutUser(auth, signOut, main, loginBox, signOutButton) {
    signOut(auth)
        .then(() => {
            main.style.display = "none";
            loginBox.style.display = "block";
            signOutButton.style.display = "none";
            document.getElementById("user-name").style.display = "none";
            document.getElementById("user-email").style.display="none";
        })
        .catch((error) => console.error("Error signing out:", error));
}
