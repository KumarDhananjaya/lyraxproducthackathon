"""
BondBack — Structured Logging with structlog
All logs are written as JSON to both stdout and a rotating log file.
Each request gets a unique correlation_id for tracing across services.
"""
import logging
import sys
import uuid
from contextvars import ContextVar
from pathlib import Path
from logging.handlers import RotatingFileHandler

import structlog

# ContextVar so correlation_id flows through async tasks
_correlation_id: ContextVar[str] = ContextVar("correlation_id", default="")


def get_correlation_id() -> str:
    return _correlation_id.get() or "no-ctx"


def set_correlation_id(cid: str | None = None) -> str:
    cid = cid or str(uuid.uuid4())[:8]
    _correlation_id.set(cid)
    return cid


def add_correlation_id(logger, method, event_dict):
    """structlog processor — injects correlation_id into every log event."""
    event_dict["correlation_id"] = get_correlation_id()
    return event_dict


def setup_logging(log_dir: Path, log_level: str = "DEBUG") -> None:
    """
    Configure structlog + stdlib logging.
    - Console: colourised human-readable output in dev, JSON in prod
    - File:    rotating JSON log (10 MB × 5 files)
    """
    level = getattr(logging, log_level.upper(), logging.DEBUG)

    # ── File handler (always JSON) ────────────────────────────────────────────
    log_file = log_dir / "bondback.log"
    file_handler = RotatingFileHandler(
        log_file, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    file_handler.setLevel(level)

    # ── Stdlib root config ────────────────────────────────────────────────────
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=level,
        handlers=[file_handler],
        force=True,
    )
    # Silence noisy third-party loggers
    for noisy in ("uvicorn.access", "httpx", "httpcore"):
        logging.getLogger(noisy).setLevel(logging.WARNING)

    # ── structlog configuration ───────────────────────────────────────────────
    shared_processors = [
        structlog.contextvars.merge_contextvars,
        add_correlation_id,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.stdlib.add_logger_name,
        structlog.processors.StackInfoRenderer(),
    ]

    structlog.configure(
        processors=shared_processors
        + [
            structlog.stdlib.ProcessorFormatter.wrap_for_formatter,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # JSON formatter for the file handler
    formatter = structlog.stdlib.ProcessorFormatter(
        processor=structlog.processors.JSONRenderer(),
        foreign_pre_chain=shared_processors,
    )
    file_handler.setFormatter(formatter)

    # Console — pretty in dev
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(
        structlog.stdlib.ProcessorFormatter(
            processor=structlog.dev.ConsoleRenderer(colors=True),
            foreign_pre_chain=shared_processors,
        )
    )
    logging.getLogger().addHandler(console_handler)


def get_logger(name: str = __name__) -> structlog.stdlib.BoundLogger:
    return structlog.get_logger(name)
