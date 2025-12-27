from sqlalchemy import Column, Integer, String, Text, Date, Time, Float, Boolean, TIMESTAMP, func
from .database import Base

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    
    
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

class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category = Column(String)
    used_by = Column(String)
    maintenance_team = Column(String)
    assigned_date = Column(Date, nullable=True)
    technician = Column(String)
    employee = Column(String)
    scrap_date = Column(Date, nullable=True)
    used_location = Column(String)
    work_center = Column(String)
    description = Column(Text, nullable=True)
    
class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    members = Column(String) # Storing as comma-separated string for simplicity
    company = Column(String)
    avatar_color = Column(String, default="#007bff") # Store a random color
