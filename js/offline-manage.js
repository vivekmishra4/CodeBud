if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js').then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
      console.error('Service Worker registration failed:', error);
  });
}

// Install prompt logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const installButton = document.createElement('button');
  installButton.innerText = 'Install';
  document.body.appendChild(installButton);

  installButton.addEventListener('click', () => {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
          } else {
              console.log('User dismissed the install prompt');
          }
          deferredPrompt = null;
      });
  });
});

// // Service worker registration
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/service-worker.js')
//     .then((registration) => {
//       console.log('Service worker registered:', registration);
//     })
//     .catch((error) => {
//       console.error('Service worker registration failed:', error);
//     });
// }

// let deferredPrompt;

// window.addEventListener('beforeinstallprompt', (event) => {
//   event.preventDefault(); // Prevent default browser prompt
//   deferredPrompt = event;
// });

// // Function to install PWA
// function installPWA() {
//   if(checkAppInstalled()){
//     alert('App is already installed');
//     return;
//   }
//   if (deferredPrompt) {
//     // Show the install prompt
//     deferredPrompt.prompt();

//     // Wait for the user to respond to the prompt
//     deferredPrompt.userChoice
//       .then(choiceResult => {
//         if (choiceResult.outcome === 'accepted') {
//           console.log('User accepted the install prompt');
//         } else {
//           console.log('User dismissed the install prompt');
//         }
//         // Clear the deferredPrompt variable so it can be garbage collected
//         deferredPrompt = null;
//       });
//   }
// }
// // Check if the app is already installed
// function checkAppInstalled() {
//   if (navigator.getInstalledRelatedApps) {
//     navigator.getInstalledRelatedApps().then(apps => {
//       if (apps.length > 0) {
//         return true;
//       } 
//     }).catch(error => {
//       return false;
//     });
//   } else {
//     return false;
//   }
// }




