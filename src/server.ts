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

app.get("/reports/:id", async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        biomarkers: true,
      },
    });

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

app.patch("/biomarkers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { value, unit } = req.body;

    const updated = await prisma.biomarkerResult.update({
      where: { id },
      data: {
        ...(value !== undefined && { value }),
        ...(unit !== undefined && { unit }),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update biomarker" });
  }
});
