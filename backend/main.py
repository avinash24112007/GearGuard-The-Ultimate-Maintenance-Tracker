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
    # 2. Create DB Model
    db_log = models.MaintenanceLog(
        title=log.title,
        description=log.description,
        # description_vector=vector, # Vector search disabled for SQLite
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
    # Vector search disabled for SQLite
    # Return simple text match or empty list for now
    # Implementing basic text search as fallback
    results = db.query(models.MaintenanceLog).filter(
        models.MaintenanceLog.description.contains(query.query)
    ).limit(query.limit).all()
    
    return results

@app.get("/logs", response_model=List[schemas.MaintenanceLogRead])
def get_all_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    logs = db.query(models.MaintenanceLog).offset(skip).limit(limit).all()
    return logs

# -- Equipment Endpoints --
@app.post("/equipment", response_model=schemas.EquipmentRead)
def create_equipment(item: schemas.EquipmentCreate, db: Session = Depends(get_db)):
    db_item = models.Equipment(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@app.get("/equipment", response_model=List[schemas.EquipmentRead])
def get_equipment(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    items = db.query(models.Equipment).offset(skip).limit(limit).all()
    return items

# -- Teams Endpoints --
@app.post("/teams", response_model=schemas.TeamRead)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    db_team = models.Team(**team.dict())
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@app.get("/teams", response_model=List[schemas.TeamRead])
def get_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = db.query(models.Team).offset(skip).limit(limit).all()
    return teams

@app.delete("/reset")
def reset_database(db: Session = Depends(get_db)):
    """
    DANGER: Clears all data from the database.
    """
    try:
        db.query(models.MaintenanceLog).delete()
        db.query(models.Equipment).delete()
        db.query(models.Team).delete()
        db.commit()
        return {"message": "Database successfully reset."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
