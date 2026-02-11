# Development of an Agentic-RAG Powered Research Assistant for Academia

## Abstract

This project presents the design and implementation of an Agentic Retrieval-Augmented Generation (RAG) based research assistant aimed at supporting academic literature discovery and structured knowledge synthesis. The system integrates semantic retrieval, vector databases, and large language model inference to automate core research tasks such as document discovery, summarization, and contextual question answering.

The assistant retrieves research papers from arXiv, processes and embeds the retrieved documents into vector space, and enables semantically grounded generation using a Groq-powered large language model. The system is designed strictly for inference-based processing and does not involve any custom model training.

---

## 1. Project Overview

Academic research workflows often involve:

- Searching across large repositories of papers
- Filtering results manually
- Reviewing lengthy abstracts
- Extracting key contributions
- Verifying citations

Traditional keyword-based search engines return documents but do not assist in structured synthesis or grounded reasoning. This project addresses that limitation by implementing an Agentic RAG pipeline that:

- Retrieves relevant academic documents from arXiv
- Converts documents into semantic embeddings
- Stores them in a vector database
- Uses a tool-based agent to perform grounded question answering
- Generates structured summaries based only on retrieved context

The system is implemented as a full-stack web application using React (frontend) and Django (backend).

---

## 2. Core Features

- arXiv-based research paper search with date filtering
- Metadata extraction (Title, Authors, Published Date, DOI, PDF URL, Abstract)
- Semantic similarity search using vector embeddings
- FAISS and ChromaDB vector store support
- Agentic Retrieval-Augmented Generation pipeline
- Groq LLM integration via LangChain
- Context-grounded summary generation
- Document-based question answering
- User authentication and profile management
- Web-based dashboard interface

---

## 3. System Architecture Overview

The system follows a modular layered architecture:

### Frontend Layer
- Built using React (Vite)
- Handles user authentication
- Manages research query submission
- Displays search results and AI-generated summaries

### Backend Layer
- Implemented using Django
- Exposes REST endpoints
- Integrates arXiv API
- Coordinates the RAG pipeline
- Manages user data

### AI Processing Layer
- HuggingFace Embeddings (all-mpnet-base-v2)
- FAISS / ChromaDB vector stores
- LangChain agent framework
- Groq LLM for response generation

---

## 4. Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Axios / Fetch API

### Backend
- Django
- Python 3.x
- SQLite (default database)

### AI / Machine Learning
- LangChain
- HuggingFace Embeddings
- FAISS
- ChromaDB
- Groq LLM
- arXiv Python API
- CrossRef metadata integration

---

## 5. Agentic RAG Pipeline Implementation

The system implements the following structured workflow:

1. User submits research query.
2. Backend retrieves relevant papers from arXiv.
3. Retrieved metadata is converted into structured documents.
4. Documents are embedded using HuggingFace sentence-transformer model.
5. Embeddings are stored in FAISS or ChromaDB.
6. A retriever selects top-k semantically similar documents.
7. An Agent-based controller invokes Groq LLM using retrieved context.
8. The LLM generates a structured, grounded response.
9. The output is returned to the frontend for display.

The agent is implemented using LangChain’s structured chat agent with tool-based document retrieval.

---

## 6. Project Structure

```
FinalYearProject/
│
├── Front End/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashBoard.jsx
│   │   │   ├── Login.jsx
│   │   ├── context/
│   │   ├── css/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── ProRoute.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── Back End/
    └── api/
        ├── app/
        │   ├── main_part.py
        │   ├── models.py
        │   ├── views.py
        │   ├── urls.py
        │   ├── migrations/
        │   └── admin.py
        ├── manage.py
        ├── requirements.txt
        ├── db.sqlite3
        └── main.json
```

---

## 7. Backend API Endpoints

| Endpoint   | Description |
|------------|------------|
| `/signup/` | Register a new user |
| `/login/`  | Authenticate user |
| `/search/` | Retrieve papers from arXiv and initialize RAG pipeline |
| `/question/` | Ask contextual question over retrieved documents |
| `/profile/` | Retrieve user profile information |

---

## 8. How to Run the Project

### Backend Setup

Navigate to backend directory:

```
cd Back End/api
```

Activate Conda environment:

```
conda activate my
```

Install dependencies:

```
pip install -r requirements.txt
```

Apply migrations:

```
python manage.py migrate
```

Start Django server:

```
python manage.py runserver
```

Backend runs at:

```
http://127.0.0.1:8000/
```

---

### Frontend Setup

Navigate to frontend directory:

```
cd Front End
```

Install dependencies:

```
npm install
```

Run development server:

```
npm run dev
```

Frontend runs at:

```
http://localhost:5173/
```

---

## 9. Current Scope and Constraints

- Data source limited to arXiv
- Supports text-based research papers only
- No custom model fine-tuning
- Inference-only architecture
- Local vector storage (FAISS / ChromaDB)
- Limited scalability testing

---

## 10. Design Decisions

- FAISS chosen for fast local similarity search
- HuggingFace sentence-transformer selected for stable embedding quality
- Groq LLM used for high-speed inference
- Agent-based retrieval implemented to enforce context grounding
- Modular backend architecture for maintainability

---

## 11. Limitations

- arXiv-only integration
- No evaluation benchmark (Precision/Recall/Faithfulness)
- No citation formatting engine implemented yet
- Basic authentication mechanism
- No production deployment pipeline

---

## 12. Future Improvements

- Multi-agent planning architecture
- Integration with Semantic Scholar and IEEE
- Citation style generation (APA, IEEE, MLA)
- Quantitative evaluation metrics
- Cloud deployment and scalability enhancements
- Collaborative research features

---

## 13. Academic Context

This system was developed as a Final Year B.Tech thesis project in Computer Science and Engineering. It demonstrates applied implementation of:

- Retrieval-Augmented Generation
- Agent-based orchestration
- Semantic search using vector databases
- LLM-grounded academic assistance

The project emphasizes structured design, modular architecture, and practical integration of modern AI tools into real academic workflows.

---

## Author

Basharat Hassan  
Bachelor of Technology (Computer Science and Engineering)  
Sharda University  
