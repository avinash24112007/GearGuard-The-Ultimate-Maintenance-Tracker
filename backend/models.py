from sqlalchemy import Column, Integer, String, Text, Date, Time, Float, Boolean, TIMESTAMP, func
from pgvector.sqlalchemy import Vector
from .database import Base

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    
    # Vector column for embedding search (384 dims for simple transformers, 1536 for OpenAI)
    # Adjust dimension based on the model used in embeddings.py
    # using 1536 for OpenAI small embeddings as default example
    description_vector = Column(Vector(1536))
    
    created_by = Column(String)
    equipment_category = Column(String)
    maintenance_type = Column(String) # Corrective/Preventive
    team = Column(String)
    responsible = Column(String)
    
    request_date = Column(Date)
    scheduled_date = Column(Date, nullable=True)
    duration = Column(Time, nullable=True)
    
    priority = Column(Integer, default=0)
    company = Column(String)
    status = Column(String, default="New Request")
    
    created_at = Column(TIMESTAMP, server_default=func.now())
