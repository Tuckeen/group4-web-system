const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

let notifications = []; // Store notifications in memory

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors()); // Enable CORS for all routes

// Endpoint to receive data and forward to Webhook.site
app.post('/send-webhook', async (req, res) => {
    console.log('Received request body:', req.body); // Log incoming request data
    const webhookUrl = 'https://webhook.site/d54d87b5-e170-4b2a-877f-d4297b0c2822'; // Replace with your Webhook.site URL

    try {
        // Forward request to Webhook.site
        const response = await axios.post(webhookUrl, req.body, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        console.log('Webhook response data:', response.data); // Log response from Webhook.site
        notifications.push(req.body); // Store notification
        res.status(200).json({
            message: 'Data sent to webhook successfully',
            data: response.data,
        });
    } catch (error) {
        // Detailed error logging
        console.error('Error sending data to webhook:', error.response?.data || error.message || error);
        res.status(500).json({
            message: 'Failed to send data to webhook',
            error: error.response?.data || error.message || error,
        });
    }
});

// Endpoint to fetch notifications

// Endpoint to fetch notifications
// When the user logs out, clear the notifications on the server
app.post('/logout', (req, res) => {
    // Reset the notifications array
    notifications = []; 
    console.log('Notifications cleared on logout');
    res.status(200).send('Logged out and notifications cleared');
});

// Your /notifications endpoint should return the current notifications, 
// which should be an empty array if logged out correctly.
app.get('/notifications', (req, res) => {
    res.status(200).json(notifications);
});



// Start the server
app.listen(PORT, () => {
    console.log(`Node server is running on http://localhost:${PORT}`);
});


