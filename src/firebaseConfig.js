
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";       
import { getFirestore } from "firebase/firestore"; 


const firebaseConfig = {
  apiKey: "AIzaSyB0O7PZZ1CGiu9lSHAes68BQGizv3CQKF0", 
  authDomain: "teknoproje-b82a3.firebaseapp.com",    
  databaseURL: "https://teknoproje-b82a3-default-rtdb.firebaseio.com", 
  projectId: "teknoproje-b82a3",                     
  storageBucket: "teknoproje-b82a3.firebasestorage.app",
  messagingSenderId: "1058253513184",
  appId: "1:1058253513184:web:70292b94a170dcb2010b85",
  measurementId: "G-179CJ3S4JQ"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);     
const db = getFirestore(app);   
const analytics = getAnalytics(app);


export { auth, db, analytics };
