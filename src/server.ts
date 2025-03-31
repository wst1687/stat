import express from "express";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const auth = new google.auth.GoogleAuth({
    credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        client_id: process.env.GOOGLE_CLIENT_ID,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post("/webhook", async (req, res) => {
    try {
        const formData = req.body; 
        console.log(req.body);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error occured" });
    }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
