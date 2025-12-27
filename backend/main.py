from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List

from . import models, schemas, database, embeddings

# Initialize DB (create tables)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="GearGuard API")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for dev
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "GearGuard Backend is Running"}

@app.post("/add_log", response_model=schemas.MaintenanceLogRead)
def add_log(log: schemas.MaintenanceLogCreate, db: Session = Depends(get_db)):
    # 1. Generate Vector Embedding for description
    vector = embeddings.embedding_service.get_embedding(log.description)
    
    # 2. Create DB Model
    db_log = models.MaintenanceLog(
        title=log.title,
        description=log.description,
        description_vector=vector, # pgvector handles the list -> vector conversion
        created_by=log.created_by,
        equipment_category=log.equipment_category,
        maintenance_type=log.maintenance_type,
        team=log.team,
        responsible=log.responsible,
        request_date=log.request_date,
        scheduled_date=log.scheduled_date,
        duration=log.duration,
        priority=log.priority,
        company=log.company,
        status=log.status
    )
    
    # 3. Save to DB
    db.add(db_log)
    db.commit()
    db.refresh(db_log)
    return db_log

@app.post("/search", response_model=List[schemas.MaintenanceLogRead])
def search_logs(query: schemas.SearchQuery, db: Session = Depends(get_db)):
    # 1. Vectorize query
    query_vector = embeddings.embedding_service.get_embedding(query.query)
    
    # 2. Perform Similarity Search using pgvector operator (<-> is L2 distance, cosine distance is common too)
    # Using L2 distance order by
    results = db.query(models.MaintenanceLog).order_by(
        models.MaintenanceLog.description_vector.l2_distance(query_vector)
    ).limit(query.limit).all()
    
    return results

@app.get("/logs", response_model=List[schemas.MaintenanceLogRead])
def get_all_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(models.MaintenanceLog).offset(skip).limit(limit).all()
    return logs
