// ======================================================
// APPCORUS - FIREBASE CLOUD MESSAGING
// Service Worker para notificaciones Push
// ======================================================

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-app-compat.js"
);

importScripts(
    "https://www.gstatic.com/firebasejs/12.18.0/firebase-messaging-compat.js"
);


// ======================================================
// CONFIGURACIÓN FIREBASE - APPCORUS
// ======================================================

firebase.initializeApp({

    apiKey:
		"AIzaSyCI6KNesshXevS2bUHKwGvUnUB8pDjl3cY",

    authDomain:
        "appcorus-42c1c.firebaseapp.com",

    projectId:
        "appcorus-42c1c",

    storageBucket:
        "appcorus-42c1c.firebasestorage.app",

    messagingSenderId:
        "925195621904",

    appId:
        "1:925195621904:web:19999aa2d52c188c5a5c95"

});


// ======================================================
// FIREBASE CLOUD MESSAGING
// ======================================================

const messaging =
    firebase.messaging();


console.log(
    "✅ AppCorus Firebase Messaging Service Worker cargado"
);