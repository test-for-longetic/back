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

app.post("/reports", async (req, res) => {
  try {
    const { sourceFileName, reportDate, biomarkers } = req.body;

    const report = await prisma.report.create({
      data: {
        sourceFileName,
        sourceFileType: "manual",
        reportDate: new Date(reportDate),

        biomarkers: {
          create: biomarkers,
        },
      },
      include: {
        biomarkers: true,
      },
    });

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create report" });
  }
});