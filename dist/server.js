"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const googleapis_1 = require("googleapis");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        type: "service_account",
        project_id: process.env.GOOGLE_PROJECT_ID,
        private_key: (_a = process.env.GOOGLE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});
const sheets = googleapis_1.google.sheets({ version: "v4", auth });
app.get("/api/results_time", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tabs = ["CONSTRUCTION", "RESEARCH", "TRAINING"];
        const responses = yield Promise.all(tabs.map((v) => sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: `${v}!H1:H100`,
        })));
        // const [constr_times, research_times, training_times] = responses;
        // const response = await sheets.spreadsheets.values.get({
        //   spreadsheetId: process.env.SHEET_ID!,
        //   range: "CONSTRUCTION!H1:H100",
        // });
        // const rows = response.data.values;
        // if (!rows || rows.length < 2) {
        //   res.json([]);
        //   return;
        // }
        // const headers = rows[0];
        // const dataRows = rows.slice(1);
        // const result = dataRows.map((row) => {
        //   const obj: Record<string, string> = {};
        //   headers.forEach((header, index) => {
        //     obj[header] = row[index] ?? "";
        //   });
        //   return obj;
        // });
        function getData(resp) {
            const rows = resp.data.values;
            if (!rows || rows.length < 2) {
                return [];
            }
            const dataRows = rows.slice(1);
            return dataRows;
        }
        const result = tabs.map((tab, index) => [tab, getData(responses[index])]);
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read sheet" });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
