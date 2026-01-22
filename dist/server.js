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
app.get("/api/appointments", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tabs = ["CONSTRUCTION", "RESEARCH", "TRAINING"];
        const responses = yield Promise.all(tabs.map((v) => sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: `${v}!A1:C100`,
        })));
        function getData(resp) {
            const rows = resp.data.values;
            if (!rows || rows.length < 2) {
                return [];
            }
            const dataRows = rows.slice(1);
            const objRow = dataRows.reduce((acc, val) => {
                const obj = {
                    id: val[1],
                    name: val[2]
                };
                acc.set(val[0], obj);
                return acc;
            }, new Map());
            console.log(objRow);
            return dataRows;
        }
        // const result = tabs.map((tab, index) => [tab, getData(responses[index])])
        const result = tabs.reduce((acc, tab, index) => {
            acc[tab] = getData(responses[index]);
            return acc;
        }, {});
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read sheet" });
    }
}));
app.get("/api/time_slots", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tabs = ["CONSTRUCTION", "RESEARCH", "TRAINING"];
        const responses = yield Promise.all(tabs.map((v) => sheets.spreadsheets.values.get({
            spreadsheetId: process.env.SHEET_ID,
            range: `${v}!H1:H100`,
        })));
        function getData(resp) {
            const rows = resp.data.values;
            if (!rows || rows.length < 2) {
                return [];
            }
            const dataRows = rows.slice(1);
            return dataRows.map((el) => el[0]);
        }
        // const result = tabs.map((tab, index) => [tab, getData(responses[index])])
        const result = tabs.reduce((acc, tab, index) => {
            acc[tab] = getData(responses[index]);
            return acc;
        }, {});
        res.json(result);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to read sheet" });
    }
}));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on ${PORT}`));
