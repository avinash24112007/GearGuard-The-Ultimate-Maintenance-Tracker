from pydantic import BaseModel
from typing import Optional
from datetime import date, time

# Shared properties
class MaintenanceLogBase(BaseModel):
    title: str
    description: str
    created_by: Optional[str] = "Unknown"
    equipment_category: Optional[str] = "Uncategorized"
    maintenance_type: Optional[str] = "Corrective"
    team: Optional[str] = "Internal"
    responsible: Optional[str] = None
    request_date: Optional[date] = None
    scheduled_date: Optional[date] = None
    duration: Optional[time] = None
    priority: Optional[int] = 0
    company: Optional[str] = None
    status: Optional[str] = "New Request"

# Input schema for creation
class MaintenanceLogCreate(MaintenanceLogBase):
    pass

# Input schema for search
class SearchQuery(BaseModel):
    query: str
    limit: Optional[int] = 5

# Schema for reading (response)
class MaintenanceLogRead(MaintenanceLogBase):
    id: int
    created_at: Optional[str] = None # simplified validation

    class Config:
        from_attributes = True # V2 Config

# -- Equipment Schemas --
class EquipmentBase(BaseModel):
    name: str
    category: Optional[str] = None
    used_by: Optional[str] = None
    maintenance_team: Optional[str] = None
    assigned_date: Optional[date] = None
    technician: Optional[str] = None
    employee: Optional[str] = None
    scrap_date: Optional[date] = None
    used_location: Optional[str] = None
    work_center: Optional[str] = None
    description: Optional[str] = None

class EquipmentCreate(EquipmentBase):
    pass

class EquipmentRead(EquipmentBase):
    id: int
    
    class Config:
        from_attributes = True

# -- Team Schemas --
class TeamBase(BaseModel):
    name: str
    members: Optional[str] = None
    company: Optional[str] = None
    avatar_color: Optional[str] = "#007bff"

class TeamCreate(TeamBase):
    pass

class TeamRead(TeamBase):
    id: int

    class Config:
        from_attributes = True
