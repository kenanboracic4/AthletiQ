from datetime import date, datetime
from email.mime import base, image
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import String, DateTime, Date, ForeignKey, func, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

if TYPE_CHECKING:
    from .Post import Post

class Post_image(Base):
    __tablename__ = "post_images"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    post_id: Mapped[UUID] = mapped_column(ForeignKey("posts.id"))
    image_url: Mapped[str] = mapped_column(String(255))

    post: Mapped["Post"] = relationship(back_populates="images")