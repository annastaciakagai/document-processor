# Document Processor

## Project Description

Document Processor is a full-stack web application that allows users to upload documents, process them asynchronously in the background, and view the processing results. The application supports user authentication and provides a simple interface for managing document uploads and viewing processing status.

Key features:
- User registration and authentication
- Document upload with background processing
- Real-time status tracking
- Simple word and character count processing (extensible for more complex operations)

## Architecture

The application follows a client-server architecture with a clear separation between frontend and backend:

- **Frontend**: A React single-page application (SPA) built with Vite
- **Backend**: A REST API built with FastAPI
- **Database**: SQLite for data persistence
- **Authentication**: JWT-based token authentication
- **File Storage**: Local file system storage for uploaded documents

The frontend communicates with the backend via HTTP requests, with CORS enabled for cross-origin communication.

## Tech Stack

### Frontend
- **React 19**: Modern JavaScript library for building user interfaces
- **Vite**: Fast build tool and development server
- **React Router DOM**: Client-side routing for navigation
- **Axios**: HTTP client for API communication
- **ESLint**: Code linting and formatting

### Backend
- **FastAPI**: Modern, fast web framework for building APIs with Python
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping (ORM)
- **Pydantic**: Data validation and serialization
- **SQLite**: Lightweight database for development and small-scale deployment
- **JWT**: JSON Web Tokens for authentication
- **Uvicorn**: ASGI server for running the FastAPI application

### Development Tools
- **Python venv**: Virtual environment for Python dependencies
- **npm**: Package manager for frontend dependencies

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install fastapi uvicorn sqlalchemy pydantic python-jose passlib python-multipart
   ```

4. Run the backend server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login

### Documents
- `POST /documents/upload` - Upload a document (requires authentication)
- `GET /documents/` - List user's documents (requires authentication)

## Database Schema

### Users Table
- `id`: Primary key
- `email`: Unique email address
- `hashed_password`: Hashed password
- `created_at`: Timestamp

### Documents Table
- `id`: Primary key
- `owner_id`: Foreign key to users
- `filename`: Original filename
- `filepath`: Path to stored file
- `status`: Processing status (pending/processing/done)
- `result`: Processing result
- `created_at`: Timestamp

## Future Enhancements

- Support for multiple file formats (PDF, DOCX, etc.)
- Advanced document processing (OCR, summarization)
- Cloud storage integration (AWS S3)
- Queue-based processing with Celery/Redis
- User dashboard with analytics
- Admin panel for user management</content>