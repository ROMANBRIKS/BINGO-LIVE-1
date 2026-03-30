import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import * as admin from "firebase-admin";
import crypto from "crypto";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticator } = require('otplib');

// Import the Firebase configuration
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase Admin SDK
try {
  if (admin.apps.length === 0) {
    console.log('Initializing Firebase Admin for project:', firebaseConfig.projectId);
    admin.initializeApp({
      projectId: firebaseConfig.projectId,
      databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`
    });
    console.log('Firebase Admin initialized successfully.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

const db = admin.firestore();
const app = express();
const PORT = 3000;

app.use(express.json());

// HMAC secret (store in env variable in production)
const HMAC_SECRET = process.env.HMAC_SECRET || "change_me_32_bytes_!!";

// ---------- Helper: Verify Transaction Signature ----------
function verifyTransaction(data: any, signature: string) {
  const sorted = JSON.stringify(data);
  const expected = crypto.createHmac('sha256', HMAC_SECRET)
    .update(sorted)
    .digest('hex');
  return signature === expected;
}

// ---------- API: Purchase Diamonds ----------
app.post("/api/purchase-diamonds", async (req, res) => {
  const { uid, amount, isWeb } = req.body;
  if (!uid) return res.status(401).json({ error: "Unauthenticated" });

  try {
    const diamonds = isWeb ? amount : Math.floor(amount / 0.0314);
    const userRef = db.collection('users').doc(uid);
    await userRef.update({
      diamonds: admin.firestore.FieldValue.increment(diamonds),
      totalSpent: admin.firestore.FieldValue.increment(diamonds * 0.0163)
    });
    res.json({ success: true, diamonds });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ---------- API: Send Gift ----------
app.post("/api/send-gift", async (req, res) => {
  const { uid, streamerId, giftId, diamondsSpent, signature } = req.body;
  
  // Verify signature
  const txData = { uid, streamerId, giftId, diamondsSpent };
  if (!verifyTransaction(txData, signature)) {
    return res.status(403).json({ error: "Invalid transaction signature" });
  }

  try {
    const viewerRef = db.collection('users').doc(uid);
    const streamerRef = db.collection('users').doc(streamerId);

    await db.runTransaction(async (transaction) => {
      const viewerSnap = await transaction.get(viewerRef);
      const streamerSnap = await transaction.get(streamerRef);

      if (!viewerSnap.exists) throw new Error("Viewer not found");
      if (!streamerSnap.exists) throw new Error("Streamer not found");

      const viewerData = viewerSnap.data()!;
      if (viewerData.diamonds < diamondsSpent) throw new Error("Insufficient diamonds");

      // Determine server bean ratio
      const server = streamerSnap.data()?.server || 'S1';
      let beanMultiplier = 1;
      if (server === 'S3' || server === 'S6') beanMultiplier = 3;
      const beansEarned = diamondsSpent * beanMultiplier;

      // Update viewer
      transaction.update(viewerRef, {
        diamonds: admin.firestore.FieldValue.increment(-diamondsSpent),
        totalSpent: admin.firestore.FieldValue.increment(diamondsSpent)
      });

      // Update streamer
      transaction.update(streamerRef, {
        beans: admin.firestore.FieldValue.increment(beansEarned)
      });

      // Log transaction
      const txRef = db.collection('transactions').doc();
      transaction.set(txRef, {
        txId: txRef.id,
        uid,
        streamerId,
        giftId,
        diamondsSpent,
        beansEarned,
        server,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// ---------- API: Admin Inspect Token ----------
app.post("/api/admin-inspect", async (req, res) => {
  const { otp, streamerId } = req.body;
  const secret = process.env.ADMIN_OTP_SECRET || "JBSWY3DPEHPK3PXP"; // Default for testing
  
  const isValid = authenticator.verify({ token: otp, secret });
  if (!isValid) return res.status(403).json({ error: "Invalid OTP" });

  const token = crypto.randomBytes(32).toString('hex');
  // Store token in Firestore for verification
  await db.collection('inspectTokens').doc(token).set({
    streamerId,
    expires: admin.firestore.FieldValue.serverTimestamp()
  });

  res.json({ token });
});

async function startServer() {
  console.log('Starting Bingo Live server...');
  const startTime = Date.now();
  
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log('Initializing Vite middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Explicitly handle SPA fallback in dev mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    const duration = Date.now() - startTime;
    console.log(`Server running on http://localhost:${PORT} (Startup took ${duration}ms)`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
