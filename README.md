# 🧪 Blood Test API

Backend service for uploading lab reports, extracting biomarkers, storing results, and providing trend analytics.

This API is designed as a lightweight MVP with a realistic data flow and clean architecture.

---

## ✨ Features

### 📤 File Upload & Parsing
- Upload CSV, PDF, or image files
- CSV → fully parsed
- PDF → text extraction + rule-based parsing
- Image → mocked extraction (extendable)

### 🧠 Biomarker Extraction
- Extracts:
  - name
  - value
  - unit
  - reference ranges
  - status (high / low / normal)

### 🗂 Reports Management
- Store reports with associated biomarkers
- Retrieve all reports or single report

### ✏️ Editable Biomarkers
- Update biomarker values via API

### 📊 Trends API
- Aggregate biomarker values over time

---

## 🏗 Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- SQLite
- Multer
- csv-parse
- pdf-parse

---

## 🚀 Getting Started

### Install dependencies
npm install

### Run development server
npm run dev

Server runs on:
http://localhost:4000

---

## 📦 API Endpoints

GET /health  
GET /reports  
GET /reports/:id  
POST /reports  
PATCH /biomarkers/:id  
GET /trends?biomarker=glucose  
POST /upload  

---

## 🧠 Extraction Pipeline

Upload → Detect type → Parse → Normalize → Return draft

---

## ⚠️ Limitations

- No authentication
- No OCR for images
- PDF parsing works only for text-based PDFs
- Rule-based parsing

---

## 🎯 Summary

The API provides a complete pipeline for:

- uploading lab data
- extracting biomarkers
- storing results
- analyzing trends
