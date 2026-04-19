// Load first: Vercel and other hosts run this file without server.js, so .env must load here too.
import "./config/loadEnv.js";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./docs/swagger.js";
import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Vercel runs `src/app.js` directly and never executes `server.js`, so MongoDB must connect here.
// Locally, `server.js` still connects before listen; this is a no-op once connected.
if (process.env.VERCEL) {
  app.use(async (req, res, next) => {
    try {
      await connectDB();
      next();
    } catch (err) {
      next(err);
    }
  });
}

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Insurance policy API is running",
    data: null,
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
