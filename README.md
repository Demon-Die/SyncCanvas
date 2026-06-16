# 🎨 SyncCanvas

**The AI-Powered Real-Time Collaborative Whiteboard**

SyncCanvas is an infinite multiplayer whiteboard where teams can brainstorm, design, plan, and collaborate in real time. Think **Miro + Excalidraw + AI Copilot** all in one lightweight, modern workspace.

---

## ✨ Features

### 🌍 Real-Time Collaboration
- **Live Multiplayer**: Instant synchronization across devices using WebSockets and `Yjs`.
- **Live Cursors & Online Status**: See exactly who is in your room and where their mouse is in real-time.
- **Guest Mode**: Instantly hop into a board anonymously without needing to create an account.

### 🏠 "WiFi Rooms" (Local Network Sync)
- Automatically join the same collaborative room as anyone on the exact same physical WiFi network!
- No need to share links—just click "Join WiFi Room" and instantly start drawing with the person next to you.

### 🖊️ Infinite Canvas & Tools
- **Freehand Drawing**: Smooth Pen tool with dynamic color selection.
- **Shapes & Text**: Rectangles, circles, sticky notes, and text blocks.
- **Pan & Zoom**: Infinite panning and zooming for massive diagrams.
- Powered by `Fabric.js`.

### 🤖 Gemini AI Integration
- Type a prompt like *"Generate a mind map for machine learning"*, and the Gemini 2.5 Flash AI will instantly generate and organize a beautiful structure of nodes and shapes directly onto your canvas.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Framer Motion
- **Canvas Engine**: Fabric.js
- **Collaboration**: `y-websocket` and `yjs` (Peer-to-peer data sync)
- **Backend / Deployment**: Express.js (Node.js) server serving the static files and WebSockets simultaneously.
- **Database & Auth**: Firebase Firestore & Firebase Auth

---

## 🚀 Running Locally

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the root directory (or ensure they are set in your environment):
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Start the Development Server**
   ```bash
   npm run dev
   ```
   *The server will start on `http://localhost:9123`.*

---

## 🌐 Deploying to Production (Render)

SyncCanvas uses an integrated Express + WebSocket server, which requires a persistent runtime (like Render or Railway) instead of static hosting.

1. Create a **Web Service** on Render.com connected to your repository.
2. Set the **Build Command**:
   ```bash
   npm install && npm rebuild esbuild && npm run build
   ```
3. Set the **Start Command**:
   ```bash
   NODE_ENV=production node dist/server.cjs
   ```
4. Add your **Environment Variables**:
   - `GEMINI_API_KEY` = `...`
5. Deploy!

---

> **Think Together. Build Together. Instantly.**
