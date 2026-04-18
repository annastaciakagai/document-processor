import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, documents

#create all tables on startup
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Document Processor")

app.add_middleware(
 CORSMiddleware,
 allow_origins=["*"],
 allow_credentials=True,
 allow_methods=["*"],
 allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)

@app.get("/")
async def root():
 return {"message": "Document Processor is running"}

