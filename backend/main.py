"""
BondBack — Backend AI & Statutory Dispute Engine
FastAPI application with structured logging, rate limiting, and security hardening.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.logging_config import get_correlation_id, get_logger, setup_logging
from app.middleware.security import SecurityHeadersMiddleware, limiter
from app.routers.analyze import router as analyze_router
from app.routers.depreciation import router as depreciation_router
from app.routers.upload import router as upload_router

settings = get_settings()

# Setup structured logging
setup_logging(log_dir=settings.log_path, log_level=settings.log_level)
logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(
        "bondback_backend_starting",
        env=settings.app_env,
        provider=settings.ai_provider,
        upload_dir=str(settings.upload_path),
        log_dir=str(settings.log_path),
    )
    yield
    # Shutdown
    logger.info("bondback_backend_shutdown")


app = FastAPI(
    title="BondBack — AI Rental Bond Dispute Engine",
    description="Multimodal evidence-mining and statutory depreciation calculator for tenants facing unfair deductions.",
    version="2.0.0",
    lifespan=lifespan,
)

# ─── Middleware ───────────────────────────────────────────────────────────────

# Attach SlowAPI state
app.state.limiter = limiter

# Rate limit exception handler
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    cid = get_correlation_id()
    logger.warning("rate_limit_exceeded", client_ip=request.client.host if request.client else "unknown")
    return JSONResponse(
        status_code=429,
        content={
            "error": "Rate limit exceeded",
            "detail": "Too many requests. Please slow down and try again shortly.",
            "correlation_id": cid,
        },
    )


# Global unhandled exception handler (avoids leaking stack traces)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    cid = get_correlation_id()
    logger.error("unhandled_server_exception", error=str(exc), exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": "An unexpected error occurred while processing the request.",
            "correlation_id": cid,
        },
    )


# Security headers & correlation ID middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Correlation-ID"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(upload_router)
app.include_router(analyze_router)
app.include_router(depreciation_router)


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "BondBack AI Forensic Engine",
        "version": "2.0.0",
        "provider": settings.ai_provider,
        "max_upload_size_mb": settings.max_upload_size_mb,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
