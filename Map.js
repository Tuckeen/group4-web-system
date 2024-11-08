// Get modal elements
const modal = document.getElementById("messageModal");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementsByClassName("close")[0];

// Function to show the message in the modal
function showModal(message) {
    modalMessage.textContent = message; // Set the message text
    modal.style.display = "block"; // Show the modal
}

// Event listener to close the modal when clicking the close button
closeModal.onclick = function() {
    modal.style.display = "none"; // Hide the modal
}

// Event listener to close the modal when clicking outside of the modal
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none"; // Hide the modal if clicking outside
    }
}

// Initialize the map
const map = L.map('map').setView([51.505, -0.09], 13); // Center the map to a default location (latitude, longitude)

// Add OpenStreetMap tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Get search input and button elements
const searchInput = document.getElementById("search"); // Input field where the user types the location
const searchBtn = document.getElementById("searchBtn"); // Button for initiating the search
const overlay = document.getElementById("overlay"); // Check for overlay visibility
const notificationBtn = document.getElementById("notificationBtn"); // Notification button
const notificationContainer = document.getElementById('notificationContainer'); // Container for notifications
const notificationContent = document.getElementById('notificationContent'); // Container content for notifications
const notificationBadge = document.getElementById('notificationBadge'); // Notification badge

// Function to send data to the server (webhook)
async function sendToServer(notification) {
    try {
        const response = await fetch('http://localhost:3000/send-webhook', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notification)
        });

        if (!response.ok) {
            throw new Error("Failed to send notification to the server");
        }

        return true;
    } catch (error) {
        console.error('Error sending to server:', error);
        showModal('Error sending notification');
    }
}

// Function to queue the notification
function queueNotification(notification) {
    console.log("Notification queued:", notification); // For testing
    displayNotifications(notification); // Call display function after queuing the notification

    // Show the notification badge
    notificationBadge.style.display = 'inline';
}

// Function to display notifications with the latest on top
// Function to display notifications with the latest on top
function displayNotifications(notification) {
    const notificationContainer = document.getElementById('notificationContent');
    if (!notificationContainer) {
        console.error('Notification container not found!');
        return;
    }

    const notificationElement = document.createElement('div');
    notificationElement.classList.add('notification-item');

    let notificationContentHTML = `<strong>Action:</strong> ${notification.action || 'Unknown Action'} 
        <strong>Timestamp:</strong> <span class="notification-time">${notification.timestamp}</span>`;

    // If the action is 'Login', show the Email
    if (notification.action === 'Login') {
        notificationContentHTML += `
            <strong>Email:</strong> ${notification.email || 'N/A'}
        `;
    }

    // If the action is 'Location', show the Location, Latitude, and Longitude
    if (notification.action === 'Location') {
        notificationContentHTML += `
            <strong>Location:</strong> ${notification.location || 'Unknown Location'}
            <strong>Latitude:</strong> ${notification.latitude || 'N/A'}
            <strong>Longitude:</strong> ${notification.longitude || 'N/A'}
        `;
    }

    notificationElement.innerHTML = notificationContentHTML;

    // Prepend the new notification to the top of the container
    notificationContainer.insertBefore(notificationElement, notificationContainer.firstChild);

    // Handle clicking on the notification to mark it as read (remove badge)
    notificationElement.addEventListener('click', function () {
        notificationBadge.style.display = 'none'; // Hide the badge when clicked
    });
}




// Fetch notifications when map.html is loaded
document.addEventListener("DOMContentLoaded", function () {
    clearNotifications(); // Clear previous notifications before fetching new ones
    fetchNotifications(); // Fetch notifications from the server

    // Search button event listener
    searchBtn.addEventListener('click', async () => {
        if (overlay && overlay.style.display === 'block') { // Check if notifications are open
            showModal('Please close the notification before searching for another location.'); // Show custom message
            return; // Exit function
        }

        const location = searchInput.value.trim(); // Get trimmed input value
        if (!location) { // Check if location is empty
            showModal('Please enter a location'); // Show message
            return; // Exit function
        }

        // Fetch data from OpenStreetMap (API) using Axios
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${location}`);
            const data = response.data;

            if (data.length === 0) {
                showModal('Location not found');
                return; // Exit function
            }

            // Handle success (map update, notification queueing)
            const [firstResult] = data; // Get the first result from the search
            const notification = {
                action: 'Location',
                location: firstResult.display_name,
                latitude: firstResult.lat,
                longitude: firstResult.lon,
                timestamp: new Date().toISOString()
            };

            // Update the map view to the found location
            map.setView([firstResult.lat, firstResult.lon], 13);

            // Add a marker to the map
            L.marker([firstResult.lat, firstResult.lon]).addTo(map)
                .bindPopup(`<b>${firstResult.display_name}</b>`).openPopup();

            // Queue and display notification
            queueNotification(notification);
            await sendToServer(notification); // Send notification to the server
        } catch (error) {
            console.error("Error fetching location:", error);
            showModal('Error fetching location');
        }
    });
});

// Clear search field
document.getElementById('clearSearch').addEventListener('click', () => {
    searchInput.value = ''; // Clear the search input field
});

// Event listener for notification button click to show notifications
notificationBtn.addEventListener('click', () => {
    if (notificationContainer.style.display === 'none') {
        notificationContainer.style.display = 'flex'; // Show notifications
        overlay.style.display = 'block'; // Show overlay
        notificationBadge.style.display = 'none'; // Hide notification badge when the bell is clicked
    } else {
        notificationContainer.style.display = 'none'; // Hide notifications
        overlay.style.display = 'none'; // Hide overlay
    }
});

// Event listener for closing notification container
document.getElementById('closeNotificationBtn').addEventListener('click', () => {
    notificationContainer.style.display = 'none'; // Hide notifications
    overlay.style.display = 'none'; // Hide overlay
});

// Event listener for overlay click to close notification container
overlay.addEventListener('click', () => {
    notificationContainer.style.display = 'none'; // Hide notifications
    overlay.style.display = 'none'; // Hide overlay
});

// Function to clear notifications and reset modal state
function clearNotifications() {
    // Clear notification content
    notificationContent.innerHTML = ''; 
    notificationBadge.style.display = 'none'; // Hide notification badge
    
    // Hide notification container and overlay
    notificationContainer.style.display = 'none';
    overlay.style.display = 'none'; // Hide the overlay if open

    // Close the modal if open
    modal.style.display = 'none'; // Hide the modal if open
}

// Event listener for logout button
// Event listener for logout
// Event listener for logout button
document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        // Clear notifications on the client-side (JavaScript variable)
        notifications = [];  // If notifications are stored in an array
        
        // Optionally, remove notifications from localStorage (if applicable)
        localStorage.removeItem('notifications'); // If you're storing them in localStorage

        // Send logout request to the server to reset notifications there as well
        const response = await fetch('http://localhost:3000/logout', {
            method: 'POST',
        });

        if (response.ok) {
            console.log('Logged out and notifications cleared on the server.');
        } else {
            console.error('Failed to clear notifications on the server.');
        }

        // Clear the UI notifications (optional)
        clearNotificationsUI();

        // Optionally, redirect to the login page or home page
        window.location.href = 'index.html';  // Redirect to your desired page after logout
    } catch (error) {
        console.error('Error during logout:', error);
    }
});

// Function to clear notifications from the UI
function clearNotificationsUI() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (notificationContainer) {
        notificationContainer.innerHTML = '';  // Clear the displayed notifications
    }
}


// Optional: Function to clear notifications from the UI
function clearNotificationsUI() {
    const notificationContainer = document.getElementById('notificationContainer');
    if (notificationContainer) {
        notificationContainer.innerHTML = ''; // Clear the notifications in the UI
    }
}


// Fetch notifications from the server
async function fetchNotifications() {
    try {
        console.log("Fetching notifications from the server...");
        const response = await fetch('http://localhost:3000/notifications');
        if (!response.ok) {
            if (response.status === 404) {
                console.warn("Notifications endpoint not found (404). Check server.");
                showModal("Notifications endpoint not found. Please ensure the server is running.");
            } else {
                throw new Error("Failed to fetch notifications");
            }
            return;
        }

        const notifications = await response.json();
        notifications.forEach(notification => {
            // Ensure the action and other properties are available before displaying
            if (notification.action) {
                displayNotifications(notification); // Display each notification
            } else {
                console.warn("Notification is missing 'action' property:", notification);
            }
        });

    } catch (error) {
        console.error("Error fetching notifications:", error);
        showModal("Error fetching notifications. Please try again later.");
    }
}
