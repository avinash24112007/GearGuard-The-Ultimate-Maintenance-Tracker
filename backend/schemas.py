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
        orm_mode = True 
