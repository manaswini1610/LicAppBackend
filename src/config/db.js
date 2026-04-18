import mongoose from "mongoose";

// Match server selection so queued ops don’t fail at 10s while Atlas/network is still handshaking.
mongoose.set("bufferTimeoutMS", 20_000);

let connectPromise = null;
let listenersAttached = false;

function attachListenersOnce() {
  if (listenersAttached) return;
  listenersAttached = true;
  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err.message);
  });
  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected");
  });
}

/** Idempotent: safe for Vercel serverless (reuse connection across invocations). */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const mongoUri = typeof process.env.MONGO_URI === "string" ? process.env.MONGO_URI.trim() : "";
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  const opts = {
    serverSelectionTimeoutMS: 20_000,
    socketTimeoutMS: 45_000,
    maxPoolSize: 10,
  };

  attachListenersOnce();

  if (!connectPromise) {
    connectPromise = mongoose.connect(mongoUri, opts).then(() => {
      console.log("MongoDB connected");
    });
  }

  try {
    await connectPromise;
  } catch (err) {
    connectPromise = null;
    throw err;
  }
};

export default connectDB;
