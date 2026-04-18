import os, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


def process_document(doc_id: int, filepath: str, db: Session):
    """
    Background task — simulates async processing.
    On AWS this logic would live in a Lambda triggered by SQS.
    """
    doc = db.query(models.Document).filter(models.Document.id == doc_id).first()
    if not doc:
        return

    doc.status = "processing"
    db.commit()

    try:
        with open(filepath, "r", errors="ignore") as f:
            content = f.read()

        word_count = len(content.split())
        char_count = len(content)
        doc.result = f"Word count: {word_count} | Character count: {char_count}"
        doc.status = "done"
    except Exception as e:
        doc.status = "done"
        doc.result = f"Processing failed: {str(e)}"

    db.commit()


@router.post("/upload", response_model=schemas.DocumentOut, status_code=201)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Save file to disk
    filepath = os.path.join(UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create DB record with status "pending"
    doc = models.Document(
        owner_id=current_user.id,
        filename=file.filename,
        filepath=filepath,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Kick off processing AFTER response is returned to client
    # On AWS: this is where you'd push a message to SQS instead
    background_tasks.add_task(process_document, doc.id, filepath, db)

    return doc


@router.get("/{doc_id}", response_model=schemas.DocumentOut)
def get_document_status(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    doc = db.query(models.Document).filter(
        models.Document.id == doc_id,
        models.Document.owner_id == current_user.id  # users can only see their own docs
    ).first()

    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    return doc