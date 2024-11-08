// Import Firebase modules for app initialization and authentication
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Your web app's Firebase configuration object
const firebaseConfig = {
    apiKey: "AIzaSyDUmhpscBaunDzJGKgaerNSxBHFT7DSkak", 
    authDomain: "sia101-activity2-royando-1bb64.firebaseapp.com", 
    projectId: "sia101-activity2-royando-1bb64", 
    storageBucket: "sia101-activity2-royando-1bb64.firebasestorage.app", 
    messagingSenderId: "733025203912", 
    appId: "1:733025203912:web:56e033f569ec939e15d7fd", 
    measurementId: "G-0ZXW04HXL9"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig); 
const auth = getAuth(app); 

// Flag to prevent duplicate notifications
let loginInProgress = false;

async function handleLogin(email, password) {
    if (loginInProgress) return; 
    loginInProgress = true; 

    try {
        // Perform Firebase login using email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get the user's display name (if available)
        const userName = user.displayName || email.split('@')[0]; // Use email prefix if no display name is set

        // Create a login notification object
        const notification = {
            action: 'Login', 
            email: email, 
            message: 'Login successfully', 
            timestamp: new Date().toISOString() 
        };

        // Send the notification to the webhook endpoint
        const response = await axios.post('http://localhost:3000/send-webhook', notification); 
        console.log('Login notification sent to server:', notification);
        console.log('Server response:', response.data);

        // Append notifications to local storage
        const existingNotifications = JSON.parse(localStorage.getItem('loginNotifications')) || [];
        existingNotifications.push(notification); 
        localStorage.setItem('loginNotifications', JSON.stringify(existingNotifications));
        console.log("Login Notifications Stored:", existingNotifications);

        // Show success message with the user's name
        showMessage(`Login successful! Hello ${userName}`, () => {
            setTimeout(() => { 
                window.location.href = "map.html"; 
            }, 2000);
        });

    } catch (error) {
        // Handle errors
        let errorMessage = 'Wrong Email or Password. Please try again.'; 
        if (error.code === 'auth/invalid-credential') {
            // Customize message for specific Firebase error code
            errorMessage = 'Wrong Email or Password. Please try again.';
        } else if (error.message) {
            errorMessage = error.message;
        }

        console.error(errorMessage, error);
        showMessage(errorMessage, clearInputs); 
    } finally {
        loginInProgress = false; 
    }
}



function showMessage(message, callback) {
    const messageContainer = document.getElementById('messageContainer'); 
    const messageText = document.getElementById('messageText'); 
    messageText.textContent = message; 
    messageContainer.style.display = 'block'; 

    const okButton = document.getElementById('okButton'); 
    okButton.onclick = () => { 
        messageContainer.style.display = 'none'; 
        if (callback) callback(); 
    };
}

function clearInputs() {
    const passwordInput = document.getElementById('login-password'); 
    const emailInput = document.getElementById('login-email'); 
    if (passwordInput) passwordInput.value = ''; 
    if (emailInput) emailInput.value = ''; 
}

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function() {
    const loginButton = document.getElementById('login-button'); 
    if (loginButton) { 
        loginButton.addEventListener("click", function(event) { 
            event.preventDefault(); 

            const email = document.getElementById('login-email').value; 
            const password = document.getElementById('login-password').value; 

            if (!loginInProgress) { 
                handleLogin(email, password); 
            }
        });
    }
});
