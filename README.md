# **Agentic RAG-Powered Research Assistant for Academia**

An intelligent research automation system that retrieves academic papers, stores them in a vector database, and generates structured summaries and citations using a hybrid **RAG + selective agentic orchestration** workflow.

---

## Overview

This project implements a web-based academic research assistant that automates literature discovery and citation generation. It retrieves papers from **arXiv, CrossRef, and Semantic Scholar APIs**, processes them into a **vector database**, and provides high-quality summaries, insights, and BibTeX references.

A key design principle is **selective agentic orchestration**:
- Agents are used **only** for:  
  **Search → Ingest → Retrieve**  
  and for **Citation Generation**  
- Summarization, clustering, and UI formatting remain **non-agentic** for stability and performance.

---

## Key Features

- **Selective Agentic Orchestration** using LangChain + LangGraph for:
  - Academic paper search across multiple APIs  
  - Ingestion (chunking → embeddings → vector DB indexing)  
  - Semantic retrieval  
  - Citation/BibTeX extraction  
- **RAG Pipeline** with FAISS/Chroma + SentenceTransformers or OpenAI embeddings  
- **Structured Summarization** (non-agentic LLM calls)  
- Modular backend architecture for easy extension  
- Designed for academic/scientific research workflows  

---

---

## Tech Stack

- **Backend:** FastAPI (Python)  
- **Agent Framework:** LangChain + LangGraph (for selected steps)  
- **Vector DB:** FAISS / Chroma  
- **Embeddings:** SentenceTransformers / OpenAI  
- **LLM Engine:** OpenAI GPT / Local Llama or Mistral  
- **APIs:** arXiv, Semantic Scholar, CrossRef  
- **Frontend:** React.js or Streamlit  

---

## Design Philosophy

### Why selective agentic orchestration?

Large, fully agentic systems can introduce unnecessary complexity and latency.  
This project uses agents **only where reasoning + tool use genuinely matter**:

- Multi-API academic search  
- Deciding ingestion structure  
- Retrieval strategy  
- Citation extraction  

Summarization and clustering remain deterministic, lightweight, and cost-efficient.

This hybrid model provides:
- **High performance**  
- **Better control**  
- **Intelligent behavior where needed**  
- **Explainable and modular workflow**

---

License

This project is for academic and educational use.




