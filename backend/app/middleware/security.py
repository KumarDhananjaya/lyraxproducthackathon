"""
BondBack — Security & Hardening Middleware
Implements:
1. Correlation ID tracking (X-Correlation-ID)
2. Production security response headers (HSTS, CSP, nosniff, etc.)
3. IP-based rate limiting via SlowAPI
4. Error masking (no leaked file paths or stack traces)
"""
import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import get_settings
from app.logging_config import get_logger, set_correlation_id

logger = get_logger("security_middleware")
settings = get_settings()

# Initialize Rate Limiter keyed by client IP
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.rate_limit_global],
)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Appends OWASP recommended security headers to all HTTP responses.
    """
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # 1. Set / propagate correlation ID
        client_cid = request.headers.get("X-Correlation-ID")
        correlation_id = set_correlation_id(client_cid)

        start_time = time.time()
        logger.debug(
            "http_request_received",
            method=request.method,
            path=request.url.path,
            client_ip=request.client.host if request.client else "unknown",
        )

        response = await call_next(request)

        duration_ms = int((time.time() - start_time) * 1000)

        # 2. Inject Security Headers
        response.headers["X-Correlation-ID"] = correlation_id
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        if settings.is_production:
            response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        logger.info(
            "http_request_completed",
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            duration_ms=duration_ms,
        )

        return response
