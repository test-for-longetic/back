# Blood Test API

Backend service for uploading lab reports, extracting biomarkers, storing results, editing extracted values, deleting reports, resetting demo data, and providing trend analytics.

This API is implemented as a lightweight MVP with a realistic file-processing flow and simple local persistence.

## Features

### File upload and extraction
- Upload CSV and PDF files
- Store uploaded files locally in the `uploads/` directory
- Parse CSV files directly
- Extract text from text-based PDFs and map supported biomarkers
- Return extracted biomarker drafts for frontend review before saving
- Fallback extraction path for unsupported formats

### Reports
- Create reports with associated biomarkers
- Retrieve all reports
- Retrieve a single report with all biomarkers
- Delete reports with cascade deletion of related biomarkers

### Biomarkers
- Edit biomarker values and units after extraction
- Support inline editing from the frontend

### Trends
- Aggregate biomarker values over time
- Query trends by normalized biomarker name
- Return unique biomarker options for dynamic selectors

### Demo reset
- Clear all reports
- Clear all biomarkers
- Remove uploaded files from disk

## Tech stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- Multer
- csv-parse
- pdf-parse

## Project structure

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

## Getting started

Install dependencies:

```bash
npm install
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Run the development server:

```bash
npm run dev
```

The API runs on:

```txt
http://localhost:4000
```

## Build and start

```bash
npm run build
npm run start
```

## API endpoints

### Health
```http
GET /health
```

### Reports
```http
GET /reports
GET /reports/:id
POST /reports
DELETE /reports/:id
```

### Biomarkers
```http
PATCH /biomarkers/:id
```

### Trends
```http
GET /trends?biomarker=glucose
GET /biomarkers
```

### Upload
```http
POST /upload
```

Accepts a multipart file upload and returns extracted biomarker draft data.

Behavior:
- CSV -> parsed directly
- PDF -> text extraction plus rule-based parsing
- unsupported files -> fallback extraction

### Reset demo data
```http
POST /reset
```

Deletes all reports, biomarkers, and uploaded files.

## Extraction pipeline

```txt
Upload -> Detect file type -> Parse -> Normalize -> Return draft -> Review -> Save
```

### CSV
CSV parsing supports expected columns such as:
- `name`
- `value`
- `unit`
- `referenceMin`
- `referenceMax`
- `status`

### PDF
Text-based PDFs are parsed by:
1. extracting text from the file
2. scanning for supported biomarkers
3. mapping numeric values and simple reference ranges

### Images / OCR
Not implemented in this MVP.

## Notes

- The app is intentionally modeled as a single-user demo flow
- Extraction is best-effort and designed to be reviewed in the frontend before persistence
- SQLite is used for simplicity and local setup speed

## Limitations

- No authentication
- No OCR for image uploads
- PDF extraction works only for text-based PDFs
- Biomarker parsing is rule-based
- Validation is intentionally lightweight

## Future improvements

- OCR support for images and scanned PDFs
- LLM-assisted extraction
- Per-user ownership and authentication
- Stronger biomarker normalization and validation
- Background processing for heavy uploads
- Automated tests for parsing and endpoints

## Summary

This backend provides a practical MVP pipeline for:
- uploading lab data
- extracting biomarkers
- reviewing and editing values
- storing reports
- analyzing trends
- resetting demo state quickly
