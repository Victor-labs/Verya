// firebase-config.js — Single source of truth for Firebase
import { initializeApp }  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { getAuth }        from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { getFirestore }   from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            "AIzaSyAVLi7FV1j-Nd5VABk0BxJxB6P8IYeLaNQ",
  authDomain:        "veryagame.firebaseapp.com",
  projectId:         "veryagame",
  storageBucket:     "veryagame.firebasestorage.app",
  messagingSenderId: "926929873025",
  appId:             "1:926929873025:web:ab3f5f5b6b558df6f78580"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
