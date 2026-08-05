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

const db = admin.firestore();

// =========================
// Home
// =========================
app.get("/", (req, res) => {
  res.send("✅ FCM Backend Running");
});

// =========================
// Deploy Test Route
// =========================
app.get("/test-send-all", (req, res) => {
  res.json({
    success: true,
    message: "send-all API Ready 🚀"
  });
});

// =========================
// Send Single Notification
// =========================
app.post("/send", async (req, res) => {
  try {

    const { token, title, body } = req.body;

    if (!token || !title || !body) {
      return res.status(400).json({
        success: false,
        error: "token, title and body are required"
      });
    }

    const response = await admin.messaging().send({
      token,
      notification: {
        title,
        body
      }
    });

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

// =========================
// Send Notification To All Users
// =========================
app.post("/send-all", async (req, res) => {
  try {

    const { title, body } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        error: "title and body are required"
      });
    }

    const snapshot = await db.collection("users").get();

    if (snapshot.empty) {
      return res.json({
        success: false,
        error: "No users found"
      });
    }

    let success = 0;
    let failed = 0;

    for (const user of snapshot.docs) {

      const token = user.data().token;

      if (!token) continue;

      try {

        await admin.messaging().send({
          token,
          notification: {
            title,
            body
          }
        });

        success++;

      } catch (err) {

        console.log("Failed Token:", token);
        console.error(err.message);

        failed++;

      }

    }

    res.json({
      success: true,
      totalUsers: snapshot.size,
      sent: success,
      failed: failed
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
