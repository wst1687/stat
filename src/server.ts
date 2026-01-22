import express, { Request, Response } from "express";
import cors from "cors";
import { google } from "googleapis";
import type { GaxiosResponse } from "gaxios";

const app = express();
app.use(cors());
app.use(express.json());

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

const sheets = google.sheets({ version: "v4", auth });

app.get(
  "/api/results_time",
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const tabs = ["CONSTRUCTION", "RESEARCH", "TRAINING"];

      const responses = await Promise.all(
        tabs.map((v) =>
          sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID!,
            range: `${v}!H1:H100`,
          }),
        ),
      );

      function getData(resp: GaxiosResponse) {
        const rows = resp.data.values;
        if (!rows || rows.length < 2) {
          return [];
        }
        const dataRows: string[][] = rows.slice(1);
        return dataRows.map(el => el[0]);
      }

      const result = tabs.map((tab, index) => [tab, getData(responses[index])]) 

      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to read sheet" });
    }
  },
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
