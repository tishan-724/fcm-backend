import express from "express";
import cors from "cors";
import admin from "firebase-admin";

const app = express();

app.use(cors());
app.use(express.json());

// Firebase Admin (Render Environment Variable)
admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  )
});

// Home
app.get("/", (req, res) => {
  res.send("✅ FCM Backend Running");
});

// Send Push Notification
app.post("/send", async (req, res) => {
  try {
    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "token, title and body are required"
      });
    }

    const message = {
      token,
      notification: {
        title,
        body
      }
    };

    const response = await admin.messaging().send(message);

    res.json({
      success: true,
      messageId: response
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server Running on Port ${PORT}`);
});
