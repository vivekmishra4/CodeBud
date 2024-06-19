export async function loadFirebaseConfig() {
    const response = await fetch('firebaseConfig.json');
    const config = await response.json();
    return config;
}

export async function initializeFirebase() {
    const firebaseConfig = await loadFirebaseConfig();
    await import('https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js');
    await import('https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js');
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js');
    const { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, deleteUser } = await import('https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js');

    const app = initializeApp(firebaseConfig);
    const auth = getAuth();
    
    return { auth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword, signOut, onAuthStateChanged, updatePassword, deleteUser };
}
