"""VME Compatibility Analyzer — FastAPI application entry point."""

import logging
import time
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.models.database import SessionLocal, init_db
from app.models.seed import seed_database
from app.routers import admin, analyze

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Initialize database tables and seed data on startup."""
    logger.info("Starting up — initializing database.")
    try:
        init_db()
        with SessionLocal() as db:
            seed_database(db)
        logger.info("Database ready.")
    except Exception as exc:
        logger.error(
            "Database initialization failed — app starting in degraded mode: %s",
            exc,
            exc_info=True,
        )
    yield
    logger.info("Shutting down.")


app = FastAPI(
    title="VME Compatibility Analyzer",
    description="Classifies VMs against the HPE VM Essentials compatibility matrix.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

_dev_origins = ["http://localhost:5173", "http://localhost:3000"]
_allowed_origins = (
    [settings.FRONTEND_URL]
    if settings.ENVIRONMENT == "production" and settings.FRONTEND_URL
    else _dev_origins
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Analysis-Summary", "Content-Disposition"],
)

# ---------------------------------------------------------------------------
# Request logging middleware
# ---------------------------------------------------------------------------


@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log each request with method, path, status code, and duration."""
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000)
    logger.info(
        "%s %s → %d (%dms)",
        request.method,
        request.url.path,
        response.status_code,
        duration_ms,
    )
    return response


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(analyze.router, prefix="/api")
app.include_router(admin.router, prefix="/api/admin")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check() -> dict[str, str]:
    """Health check endpoint."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Frontend static file serving (production)
# Registered last so API routes always take priority.
# ---------------------------------------------------------------------------

_FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"

if _FRONTEND_DIR.exists():
    _assets_dir = _FRONTEND_DIR / "assets"
    if _assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(_assets_dir)), name="static-assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str) -> FileResponse:
        """Serve the React SPA. Falls back to index.html for client-side routing."""
        candidate = _FRONTEND_DIR / full_path
        if candidate.is_file():
            return FileResponse(str(candidate))
        return FileResponse(str(_FRONTEND_DIR / "index.html"))
