
const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

let isInitialized = false;

try {
    // You can put your service account file in the root or config folder
    // Make sure to add it to .gitignore
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || path.join(__dirname, "../firebase-service-account.json");

    if (!admin.apps.length) {
        admin.initializeApp({
            credential: admin.credential.cert(require(serviceAccountPath)),
        });
        isInitialized = true;
        console.log("Firebase Admin Initialized successfully.");
    } else {
        isInitialized = true;
    }
} catch (error) {
    console.error("Firebase Admin Initialization Failed:", error.message);
    // Continue without crashing, but sending will fail
}

const sendBatchNotifications = async (tokens, title, body, imageUrl, data) => {
    if (!isInitialized) {
        console.error("Firebase not initialized. Cannot send notifications.");
        return { successCount: 0, failureCount: tokens.length, failedTokens: tokens.map(t => ({ token: t, error: "Firebase not initialized" })) };
    }

    if (!tokens || tokens.length === 0) {
        return { successCount: 0, failureCount: 0, failedTokens: [] };
    }

    // Ensure all data values are strings as required by FCM
    const stringifiedData = data ? Object.keys(data).reduce((acc, key) => {
        acc[key] = String(data[key]);
        return acc;
    }, {}) : {};

    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: stringifiedData,
        tokens: tokens,
    };

    if (imageUrl) {
        // Top-level image for Android/Flutter system notifications
        message.notification.image = imageUrl;

        // Android
        message.android = {
            notification: {
                image: imageUrl // Changed from imageUrl to image
            }
        };
        // Apple
        message.apns = {
            payload: {
                aps: {
                    'mutable-content': 1
                }
            },
            fcm_options: {
                image: imageUrl
            }
        };
        // Web? (optional)
    }

    try {
        const response = await admin.messaging().sendEachForMulticast(message);

        const failedTokens = [];
        if (response.failureCount > 0) {
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push({
                        token: tokens[idx],
                        error: resp.error.message,
                    });
                }
            });
        }

        return {
            successCount: response.successCount,
            failureCount: response.failureCount,
            failedTokens: failedTokens,
        };
    } catch (error) {
        console.error("Error sending batch notifications:", error);
        // Treat all as failed
        return {
            successCount: 0,
            failureCount: tokens.length,
            failedTokens: tokens.map(t => ({ token: t, error: error.message })),
        };
    }
};

module.exports = {
    sendBatchNotifications,
};
