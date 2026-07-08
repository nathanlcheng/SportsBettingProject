import express from "express";
import cors from "cors";
import oddsRouter from "./oddsRoutes";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json());

app.use("/api/odds", oddsRouter);

app.get("/api/health", (_,res)=>{
    res.json({status:"ok", timestamp: new Date().toISOString()});
});

export default app;