# Agentic RAG-Powered Research Assistant for Academia

![Python](https://img.shields.io/badge/Python-3.10-blue)
![Django](https://img.shields.io/badge/Django-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-blue)
![RAG](https://img.shields.io/badge/AI-RAG-orange)
![LangChain](https://img.shields.io/badge/LangChain-Agentic-purple)

## Overview

This project presents the design and implementation of an **Agentic Retrieval-Augmented Generation (RAG) system** designed to assist academic research workflows. The platform integrates semantic document retrieval, vector databases, and large language model inference to automatically discover, process, and summarize academic literature.

The system retrieves research papers from **arXiv**, converts them into semantic embeddings, stores them in a vector database, and enables context-grounded responses using a Groq-powered language model. The architecture combines a **React frontend**, **Django backend**, and an **AI processing layer** implementing an agentic RAG pipeline.

This project was developed as a **Final Year B.Tech Project in Computer Science and Engineering**.

---

## Key Features

- Academic paper retrieval from arXiv
- Semantic search using vector embeddings
- Agentic Retrieval-Augmented Generation pipeline
- AI-generated structured summaries
- Document-based question answering
- Context-grounded responses from retrieved papers
- Vector database integration (FAISS and ChromaDB)
- Groq LLM inference for fast response generation
- User authentication and dashboard interface
- Web-based research assistant platform

---

## System Architecture

The system follows a **three-layer architecture** separating user interaction, application logic, and AI processing.

Architecture Diagram Location:

![System Architecture](docs/system_architecture.png)

Architecture Flow:

Client Layer
↓
React Web Application
↓
Backend API (Django)
↓
AI Processing Layer
↓
LangChain Agentic RAG Pipeline
↓
Vector Databases (FAISS / ChromaDB)
↓
Groq Large Language Model


---

## System Workflow

The research pipeline implemented in this system follows the workflow below:

1. User logs into the platform  
2. User enters a research topic  
3. Backend retrieves academic papers from arXiv  
4. Retrieved papers are processed and structured  
5. Documents are converted into embeddings  
6. Embeddings are stored in a vector database  
7. A semantic retriever selects relevant document chunks  
8. An agent-based controller invokes the LLM  
9. The LLM generates a grounded academic summary  
10. The response is displayed to the user  

Workflow Diagram Location:

![Workflow Pipeline](docs/workflow_pipeline.png)

---

## Technology Stack

### Frontend

React  
Vite  
JavaScript  
CSS  
Axios  

### Backend

Django  
Python  
SQLite (development database)

### AI / Machine Learning

LangChain  
HuggingFace Sentence Transformers  
FAISS  
ChromaDB  
Groq LLM  
arXiv API  
CrossRef Metadata API  

---

## Project Structure

Agentic-RAG-Powered-Research-Assistant-for-Academia
│
├── backend
│   └── api
│       ├── app
│       │   ├── main_part.py
│       │   ├── models.py
│       │   ├── views.py
│       │   ├── urls.py
│       │   └── migrations
│       │
│       ├── manage.py
│       ├── requirements.txt
│       └── main.json
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── assets
│   │   ├── components
│   │   ├── context
│   │   ├── css
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── docs
│   ├── system_architecture.png
│   └── workflow_pipeline.png
│   └── Project Report Results and Findings.pdf
│
├── screenshots
│   ├── login_page.png
│   ├── dashboard.png
│   ├── research_search.png
│   └── generated_summary.png
│
├── .gitignore
└── README.md

---

## Running the Project

### Backend Setup

Navigate to backend directory

cd backend/api

Install dependencies

pip install -r requirements.txt

Apply migrations

python manage.py migrate

Start Django server

python manage.py runserver

Backend runs at

http://127.0.0.1:8000

---

### Frontend Setup

Navigate to frontend directory

cd frontend

Install dependencies

npm install

Run development server

npm run dev

Frontend runs at

http://localhost:5173

---

## Screenshots

### Login Interface
![Login Page](screenshots/login_page.png)

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Research Paper Search
![Search](screenshots/research_search.png)

### Paper Summary Page
![Summary](screenshots/paper_summary.png)

### AI Generated Summary
![Generated Summary](screenshots/generated_summary.png)

---

## Current Scope

- arXiv is used as the primary academic data source
- System processes text-based research papers
- AI models are used in inference-only mode
- Vector storage implemented locally
- Designed for research workflow assistance

---

## Future Work

- Integration with Semantic Scholar and IEEE
- Citation formatting support (APA / IEEE / MLA)
- Multi-agent research pipelines
- Quantitative evaluation metrics
- Cloud deployment and scaling
- Collaborative research features

---

## Academic Context

This system was developed as a **Final Year B.Tech thesis project** in Computer Science and Engineering. The work demonstrates practical implementation of:

- Retrieval-Augmented Generation
- Agent-based orchestration
- Semantic search using vector databases
- AI-assisted academic research systems

---

## Author

Basharat Hassan  
Bachelor of Technology – Computer Science and Engineering  
Sharda University
