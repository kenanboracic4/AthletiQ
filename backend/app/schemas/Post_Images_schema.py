from datetime import date, datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class PostImageBase(BaseModel):
    post_id: UUID
    image_url: str

class PostImageCreate(PostImageBase):
    pass

class PostImageUpdate(PostImageBase):
    pass

class PostImageRead(PostImageBase):
    id: UUID
    post_id: UUID
    image_url: str
    model_config = ConfigDict(from_attributes=True)
