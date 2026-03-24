# 🧪 Blood Test API

Backend service for uploading lab reports, extracting biomarkers, storing results, editing extracted values, deleting reports, resetting demo data, and providing trend analytics.

This API is designed as a lightweight MVP with a realistic data flow and clean architecture.

---

## ✨ Features

### 📤 File Upload & Extraction
- Upload CSV and PDF files
- Save uploaded files locally in the `uploads/` directory
- CSV files are parsed directly
- Text-based PDFs are parsed via PDF text extraction
- Unsupported formats can fall back to mocked extraction behavior

### 🧠 Biomarker Extraction
The API extracts structured biomarker drafts with:
- `name`
- `normalizedName`
- `value`
- `unit`
- `referenceMin`
- `referenceMax`
- `status`

### 🗂 Reports Management
- Create reports with extracted biomarkers
- Retrieve all reports
- Retrieve a single report with all biomarkers
- Delete reports with cascade removal of related biomarkers

### ✏️ Editable Biomarkers
- Update biomarker values and units after extraction
- Supports frontend inline editing flow

### 📊 Trends API
- Aggregate biomarker values over time
- Query trends by normalized biomarker name

### ♻️ Demo Reset
- Reset all stored reports
- Remove related biomarkers
- Clear uploaded files from disk

---

## 🏗 Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- Multer
- `csv-parse`
- `pdf-parse`

---

## 📁 Project Structure

```txt
src/
  lib/
    prisma.ts
  utils/
    parseCsv.ts
    parsePdfText.ts
  server.ts

prisma/
  schema.prisma
  migrations/

uploads/
```

---

## 🚀 Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The API runs on:

```txt
http://localhost:4000
```

---

## 🗄 Database

This project uses **SQLite** for simplicity and fast local setup.

Prisma manages:
- schema
- migrations
- client generation

### Run migrations

```bash
npx prisma migrate dev
```

---

## 📦 API Endpoints

### Health Check

```http
GET /health
```

Returns a simple service status payload.

---

### Reports

```http
GET /reports
```
Returns all reports with biomarkers.

```http
GET /reports/:id
```
Returns a single report with biomarkers.

```http
POST /reports
```
Creates a report and associated biomarkers.

```http
DELETE /reports/:id
```
Deletes a report and cascades related biomarker deletion.

---

### Biomarkers

```http
PATCH /biomarkers/:id
```
Updates editable biomarker fields such as:
- `value`
- `unit`

---

### Trends

```http
GET /trends?biomarker=glucose
```

Returns time-series data for a selected biomarker.

Example response:

```json
[
  { "date": "2026-03-20T00:00:00.000Z", "value": 5.8 },
  { "date": "2026-03-24T00:00:00.000Z", "value": 6.3 }
]
```

---

### Biomarker Options

```http
GET /biomarkers
```

Returns unique biomarker options for dynamic frontend selectors.

Example response:

```json
[
  { "name": "Glucose", "normalizedName": "glucose" },
  { "name": "Hemoglobin", "normalizedName": "hemoglobin" }
]
```

---

### Upload

```http
POST /upload
```

Accepts a multipart file upload and returns extracted biomarker draft data.

Behavior:
- CSV → parsed directly
- PDF → text extraction + rule-based parsing
- unsupported files → fallback extraction

Example response:

```json
{
  "fileName": "report.pdf",
  "filePath": "uploads/1710000000000-report.pdf",
  "biomarkers": [
    {
      "name": "Glucose",
      "normalizedName": "glucose",
      "value": 5.8,
      "unit": "mmol/L",
      "referenceMin": 3.9,
      "referenceMax": 5.5,
      "status": "high"
    }
  ]
}
```

---

### Reset Demo Data

```http
POST /reset
```

Deletes:
- all reports
- all biomarkers
- all uploaded files

Useful for local testing and demo resets.

---

## 🧠 Extraction Pipeline

```txt
Upload → Detect file type → Parse → Normalize → Return draft → Review → Save
```

### CSV
CSV parsing is supported directly using expected column names such as:
- `name`
- `value`
- `unit`
- `referenceMin`
- `referenceMax`
- `status`

### PDF
Text-based PDFs are parsed by:
1. extracting text from the file
2. scanning for known biomarkers
3. mapping numeric values and simple reference ranges

### Images / OCR
Not implemented in this MVP.

---

## ⚠️ Limitations

- No authentication
- Single-user demo flow
- No OCR for image uploads
- PDF extraction works only for text-based PDFs
- Biomarker parsing is rule-based, not LLM-based
- Validation is intentionally lightweight

---

## 🧩 Future Improvements

- Add OCR support for image/scanned PDF uploads
- Add LLM-assisted extraction for more flexible parsing
- Add authentication and per-user ownership
- Add stronger validation and medical normalization
- Store upload metadata more explicitly on reports
- Add background jobs for extraction
- Add automated tests for parsing and endpoints

---

## 🎯 Summary

This backend provides a practical MVP pipeline for:

- uploading lab data
- extracting biomarkers
- reviewing and editing values
- storing reports
- analyzing trends
- resetting demo state quickly

It is intentionally simple, extensible, and optimized for local development and product iteration.
