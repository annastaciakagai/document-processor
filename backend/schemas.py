from pydantic import BaseModel, EmailStr
from typing import Optional


#auth
class UserCreate (BaseModel):
    email:EmailStr
    password: str

class UserOut(BaseModel):
    id:int
    email: str

    class Config:
        from_attributes = True
    
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None


#Documents

class DocumentOut(BaseModel):
    id: int
    filename: str
    status: str
    result: Optional[str] = None

    class Config:
        from_attributes = True