import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/reports", async (_req, res) => {
  const reports = await prisma.report.findMany({
    orderBy: {
      reportDate: "desc",
    },
    include: {
      biomarkers: true,
    },
  });

  res.json(reports);
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});