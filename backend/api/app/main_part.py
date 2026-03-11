import arxiv
from habanero import Crossref
import json
from datetime import datetime
from langchain_core.documents import Document
from langchain_huggingface import HuggingFaceEmbeddings  
from langchain_community.vectorstores import Chroma, FAISS
from typing import List, Dict, Any # New agent creation method
from langchain_groq.chat_models import ChatGroq
from langchain_community.tools import Tool
from langchain_classic.agents import AgentType,initialize_agent

import os
from dotenv import load_dotenv


load_dotenv()

cr = Crossref(mailto="cse@takeoffprojects.com")

"""Data preparation """


def searchData(paper:str,result:int,start:str,end:str,sort_type:str)->list:
    data=[]
    # Determine sort criteria based on the input sort_type
    if sort_type == "relevance":
        sort_by = arxiv.SortCriterion.Relevance
    elif sort_type == "submittedDate":
        sort_by = arxiv.SortCriterion.SubmittedDate  
    else:
        sort_by = arxiv.SortCriterion.LastUpdatedDate
    # Execute the search
    query=f"{paper} AND submittedDate:[{start} TO {end}]"
    search = arxiv.Search(
        query=query,
        max_results=result,
        sort_by=sort_by
    )
    
    
    for result in search.results():
        data.append({
            "Title": result.title,
            "about": {
                "Authors": ",".join(auth.name for auth in result.authors),
                "Published ": result.published,
                "Summary": result.summary,
                "PDF_URL": result.pdf_url,
                "doi": result.doi if result.doi else "😊 Sorry No Doi ",
            },
        }
    )
    # works = search_from(limit=10,query=query)
    # for d in works:
    #      data.append({
    #     "Title":d.get('title','No Title'),
    #     "about":{
    #     "Authors":d.get('author','No Authors'),
    #     "Published ": d.get('published','No Date Found'),
    #     "Summary": d.get('abstract',"No Data About Abstract"),
    #     "PDF_URL":d.get('URL',"No Refrence URL Find for this"),
    #     'doi': "😊 Sorry No Doi "}
    #     })
    serial_it = serialize_data(data)
    with open("main.json","w",encoding='utf-8') as e:
        json.dump(serial_it,e,indent=4,ensure_ascii=False)
         
    return data

def search_from(limit:int=10,query:str="")->list[dict]:
    result=cr.works(query=query,limit=limit)
    return result['message']['items']

def serialize_data(obj):
    if isinstance(obj,datetime):
        return obj.isoformat()
    if isinstance(obj,list) and obj and isinstance(obj[0],dict) and 'given' in obj[0]:
        authors=[]
        for author in obj:
            name = f"{author.get('given','')}, {author.get('family','')}".strip()
            authors.append(name)
            return authors
    if isinstance(obj,list):
        return [serialize_data(item) for item in obj]
    elif isinstance(obj,dict):
        return {key:serialize_data(value) for key,value in obj.items()}
    return obj





"""Intializing Agentic Rag"""

"""Data injection Process"""

class ResultDataProcess:
    def __init__(self,json_data:List[Dict]):
        self.json_data=json_data
    
    def preprocess_data(self)->List[Document]:
        documents=[]
        for item in self.json_data:
            if isinstance(item['Title'],list):
                title=item["Title"][0]
            else:
                title=item["Title"]
            if isinstance(item["about"]['Authors'],list):
                authors=', '.join(item.get("about",""))
            else:
                authors=item['about']['Authors']
            content=f"""
            Title :{title}
            Authors : {authors}
            Published : {item.get('Published','Unknown')}
            Summary : {item['about']['Summary']}
            DOI : {item.get('doi','Not Available')}
            PDF URL : {item.get('PDF_URL','NOT Available')}
"""
            metadata={
                'title':title,
                'author':authors,
                'published':str(item['about'].get('Published','')),
                'doi':item['about'].get('doi',''),
                'PDF URL':item['about'].get('PDF_URL',''),
                'source':'arxiv'
            }
            document=Document(
                page_content=content,
                metadata=metadata
            )
            documents.append(document)
        return documents
    def  get_processed_documents(self):
        return self.preprocess_data()
    
"""Vectorizing The Data"""
class VectorStoreManagement:
    def __init__(self,model_name="sentence-transformers/all-mpnet-base-v2"):
        self.embedding_model = HuggingFaceEmbeddings(
            model_name=model_name
        )
        self.faiss_store=None
        self.chrom_store=None
    def create_faiss_store(self,documents:List[Document]):
        self.faiss_store = FAISS.from_documents(
            documents=documents,
            embedding=self.embedding_model
        )
    
    def create_chroma_store(self,documents:List[Document],presistance="./chromadb"):
        self.chrom_store = Chroma.from_documents(
            documents=documents,
            embedding=self.embedding_model,
            persist_directory=presistance
        )
        return self.chrom_store
    
    def save_faiss_store(self,file_path='./faiss_index'):
        if self.faiss_store:
            self.faiss_store.save_local(file_path)

    def load_faiss_store(self,file_path='./faiss_index'):
        self.faiss_store=FAISS.load_local(file_path,self.embedding_model)
        return self.faiss_store
        

    def get_retriver(self,store_type='faiss',search_type='similarity',k=4):
        if store_type=="faiss" and self.faiss_store:
            return self.faiss_store.as_retriever(
                search_type=search_type,
                kwargs={'k':k}
            )
        elif store_type=="chroma" and self.chrom_store:
            return self.chrom_store.as_retriever(
                search_type=search_type,
                kwargs={'k',k}
            )
        else:
            raise ValueError("Vector Store not intialised")

"""Agentic Rag Implementation """
class RAGSystem:
    def __init__(self,vector_store_management:VectorStoreManagement,grok_key=""):
        self.vector_manager=vector_store_management
        self.groq_key=grok_key
        self.llm= self._setup_grok_llm()
        self.agent=None
    
    def _setup_grok_llm(self):
        return ChatGroq(
            api_key=self.groq_key,
            model="groq/compound"
        )
    def setup_qa_chain(self,store_type="faiss",k=4):
        retriver = self.vector_manager.get_retriver(store_type=store_type,k=k)

        tools=[
            Tool(name="DocumentSearch",
                 func=retriver._get_relevant_documents,
                 description='Search through the document and give answers elevant to that !! approximately 60 words. Use full sentences. Never use bullet points or lists.'
                 ' every answer should be in paragraph'),
        Tool(
            name="Search_On_Match",
            func=retriver._get_relevant_documents,
            description="Search on matching details of the names !!every answer should be in paragraph approximately 60 words. Use full sentences. Never use bullet points or lists."
        )
        ]
        self.agent = initialize_agent(
            tools=tools,
            llm=self.llm,
            agent=AgentType.STRUCTURED_CHAT_ZERO_SHOT_REACT_DESCRIPTION
        )
        return self.agent
    def query(self,question:str)->Dict[str,Any]:
        result = self.agent.invoke({
            'Context':'approximately 60 words. Use full sentences. Never use bullet points or lists.',
            'input':question
        })
        return result
    
    def get_similar_documents(self,query:str,store_type='faiss',k=3):
        retriver= self.vector_manager.get_retriver(store_type=store_type,k=k)
        return retriver._get_relevant_documents(query=query)
    
"""Pipline Creation"""


class Pipeline:
    def __init__(self,json_data:List[Dict],groq:str):
        self.json_data=json_data
        self.grok = groq
        self.processor = None
        self.vector_manager = None
        self.rag_system = None
    def initialize_pipeline(self,use_faiss=True,use_chroma=False):
        print("intialising Rag")
        print("Step 1 : Procession json data")
        self.processor = ResultDataProcess(self.json_data)
        documents = self.processor.get_processed_documents()
        print(f"Proccessd documents")
        print("Step2 : Creating vector Store")
        self.vector_manager = VectorStoreManagement()
        if use_faiss:
            print("Creating Faiss Store")
            self.vector_manager.create_faiss_store(documents=documents)
            self.vector_manager.save_faiss_store()
        if use_chroma:
            print("Creating Chromadb store")
            self.vector_manager.create_chroma_store(documents=documents)
        self.rag_system=RAGSystem(self.vector_manager,self.grok)
        self.rag_system.setup_qa_chain(store_type='faiss')
        print("Rag Pipeling intialised successfully")
        return self
    
    def ask_question(self,question:str):
        if not  self.rag_system:
            raise "Pipeline is Not intialised"
        return self.rag_system.query(question=question)
    
    def similar_search(self,question:str,k=3):
        if not self.vector_manager:
            return ValueError("Vector store manager not intialised")
        return self.vector_manager.get_retriver()._get_relevant_documents(query=question)

pipeLine: Pipeline = None

def initOf():
    global pipeLine

    with open("main.json", 'r', encoding='utf-8') as g:
        view = json.load(g)

    groq_key = os.getenv("GROQ_API_KEY")

    pipe = Pipeline(view, groq=groq_key)
    pipeLine = pipe.initialize_pipeline()
    
def askQuestion(question:str)->str:
    return pipeLine.ask_question(question)

initOf()
