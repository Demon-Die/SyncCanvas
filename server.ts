import express from 'express';
import { createServer } from 'http';
import crypto from 'crypto';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { WebSocketServer } from 'ws';
import { setupWSConnection } from 'y-websocket/bin/utils';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 9123;
  
  app.use(express.json());

  app.use(express.json());

  // API Route for Network/WiFi Room
  app.get('/api/network-room', (req, res) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (Array.isArray(ip)) ip = ip[0];
    if (typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }
    
    // Normalize localhost
    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
      ip = 'localhost';
    } else if (typeof ip === 'string') {
      // Group by subnet for local private networks so devices on the same home wifi match
      let cleanIp = ip.replace('::ffff:', '');
      if (cleanIp.startsWith('192.168.') || cleanIp.startsWith('10.')) {
         const parts = cleanIp.split('.');
         ip = `${parts[0]}.${parts[1]}.${parts[2]}`;
      }
    }

    const hash = crypto.createHash('sha256').update(String(ip)).digest('hex').substring(0, 10);
    res.json({ roomId: `wifi-${hash}` });
  });

  // API Route for Gemini AI
  app.post('/api/ai/generate-diagram', async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
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
          responseMimeType: "application/json",
        }
      });
      
      if (response.text) {
         const cleanJson = response.text.replace(/```json\n?/g, '').replace(/```/g, '').trim();
         res.json({ shapes: JSON.parse(cleanJson) });
      } else {
         res.status(500).json({ error: "No response text" });
      }

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = createServer(app);
  
  // Setup WebSocket Server for Yjs
  const wss = new WebSocketServer({ server });
  
  wss.on('connection', (ws, req) => {
    // Determine room name from url, e.g. /ws/workspace123
    const url = req.url || '/';
    const room = url.split('/').pop() || 'default-room';
    
    // Yjs websocket connection setup
    setupWSConnection(ws, req, { docName: room });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Local: http://localhost:${PORT}/`);
  });
}

startServer();
