import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import fs from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// Firebase Service Account
const serviceAccount = JSON.parse(
  fs.readFileSync("./serviceAccountKey.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

app.get("/", (req, res) => {
  res.send("✅ FCM Backend Running");
});

app.post("/send", async (req, res) => {
  try {
    const { token, title, body } = req.body;

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
  console.log("Server Running on Port", PORT);
});
