import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";
import { prisma } from "./lib/prisma";
import { parseCsv } from "./utils/parseCsv";
import { parsePdfText } from "./utils/parsePdfText";

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/reports", async (_req, res) => {
  try {
    const reports = await prisma.report.findMany({
      orderBy: {
        reportDate: "desc",
      },
      include: {
        biomarkers: true,
      },
    });

    res.json(reports);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
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

app.get("/trends", async (req, res) => {
  try {
    const { biomarker } = req.query;

    if (!biomarker || typeof biomarker !== "string") {
      res.status(400).json({ error: "biomarker query param required" });
      return;
    }

    const results = await prisma.biomarkerResult.findMany({
      where: {
        normalizedName: biomarker,
      },
      include: {
        report: true,
      },
      orderBy: {
        report: {
          reportDate: "asc",
        },
      },
    });

    const data = results.map((item) => ({
      date: item.report.reportDate,
      value: item.value,
    }));

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    let extractedBiomarkers: Array<{
      name: string;
      normalizedName: string;
      value: number;
      unit?: string;
      referenceMin?: number;
      referenceMax?: number;
      status?: string;
    }> = [];

    if (file.mimetype.includes("csv")) {
      const fileContent = fs.readFileSync(file.path, "utf-8");
      extractedBiomarkers = parseCsv(fileContent);
    } else if (file.mimetype.includes("pdf")) {
      const parser = new PDFParse({ data: fs.readFileSync(file.path) });
      const pdfData = await parser.getText();
      extractedBiomarkers = parsePdfText(pdfData.text);
    } else {
      extractedBiomarkers = [
        {
          name: "Glucose",
          normalizedName: "glucose",
          value: 5.8,
          unit: "mmol/L",
          referenceMin: 3.9,
          referenceMax: 5.5,
          status: "high",
        },
      ];
    }

    res.json({
      fileName: file.originalname,
      filePath: file.path,
      biomarkers: extractedBiomarkers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/biomarkers", async (_req, res) => {
  try {
    const biomarkers = await prisma.biomarkerResult.findMany({
      select: {
        name: true,
        normalizedName: true,
      },
      distinct: ["normalizedName"],
      orderBy: {
        normalizedName: "asc",
      },
    });

    res.json(biomarkers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch biomarkers" });
  }
});

app.delete("/reports/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.report.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete report" });
  }
});

app.post("/reset", async (_req, res) => {
  try {
    await prisma.biomarkerResult.deleteMany();
    await prisma.report.deleteMany();

    const uploadsDir = path.join(process.cwd(), "uploads");

    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);

      for (const file of files) {
        fs.unlinkSync(path.join(uploadsDir, file));
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset application data" });
  }
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});