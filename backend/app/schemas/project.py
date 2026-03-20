from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import re


def _slugify(name: str) -> str:
    slug = name.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None

    @property
    def slug(self) -> str:
        return _slugify(self.name)


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    user_id: int
    name: str
    slug: str
    description: Optional[str]
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
