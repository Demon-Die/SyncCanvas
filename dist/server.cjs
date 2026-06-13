var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_http = require("http");
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_ws = require("ws");
var import_utils = require("y-websocket/bin/utils");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  app.post("/api/ai/generate-diagram", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = new import_genai.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an AI that creates mind maps and diagrams for a whiteboard app. 
          Return ONLY a JSON array of objects representing sticky notes or shapes.
          Each object must have: 
          - id (string, unique uuid)
          - type (string: "rect" or "circle" or "sticky")
          - x (number)
          - y (number)
          - text (string, the node text)
          - width (number)
          - height (number)
          - fill (string, hex color like "#2A2A2A")
          
          Make them visually appealing with good spacing for this prompt: "${prompt}"`,
        config: {
          responseMimeType: "application/json"
        }
      });
      if (response.text) {
        res.json({ shapes: JSON.parse(response.text) });
      } else {
        res.status(500).json({ error: "No response text" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  const server = (0, import_http.createServer)(app);
  const wss = new import_ws.WebSocketServer({ server });
  wss.on("connection", (ws, req) => {
    const url = req.url || "/";
    const room = url.split("/").pop() || "default-room";
    (0, import_utils.setupWSConnection)(ws, req, { docName: room });
  });
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
