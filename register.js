// Import Firebase and initialize it
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// Firebase configuration
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

// Wait for the DOM to be fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", function() {
    // Signup button event listener
    const signupButton = document.getElementById('signup');
    if (signupButton) {
        signupButton.addEventListener("click", function(event) {
            event.preventDefault();

            // Get form values
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const username = document.getElementById('username').value;

            // Check if passwords match
            if (password !== confirmPassword) {
                showMessage("Passwords do not match. Please try again.", () => {
                    document.getElementById('password').value = ''; // Clear the password field
                    document.getElementById('confirmPassword').value = ''; // Clear the confirm password field
                });
                return;
            }

            if (!email || !password || !confirmPassword || !username) {
                showMessage("Please input all required information.");
                return;
            }

            // Check if terms are accepted
            const termsAccepted = document.getElementById('checkbox').checked;
            if (!termsAccepted) {
                showMessage("You must agree to the terms and conditions.");
                return;
            }

            // Create user with Firebase Authentication
            createUserWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    // Successfully registered
                    const user = userCredential.user;
                    showMessage(`Successfully registered! Welcome, ${username}`, () => {
                        // Clear form fields
                        document.getElementById('username').value = '';
                        document.getElementById('email').value = '';
                        document.getElementById('password').value = '';
                        document.getElementById('confirmPassword').value = '';
                        document.getElementById('checkbox').checked = false;
                        
                        window.location.href = "index.html"; // Redirect to login page
                    });
                })
                .catch((error) => {
                    const errorMessage = error.message;
                    showMessage(`Error: ${errorMessage}`); // Show error message
                });
        });
    }
});

// Function to show a message with an optional callback
function showMessage(message, callback) {
    const messageContainer = document.getElementById('messageContainer');
    const messageText = document.getElementById('messageText');
    messageText.textContent = message;
    messageContainer.style.display = 'block'; // Show the message container

    // Add event listener for OK button
    const okButton = document.getElementById('okButton');
    okButton.onclick = () => {
        messageContainer.style.display = 'none'; // Hide the message
        if (callback) callback(); // Call the callback if provided
    };
}
