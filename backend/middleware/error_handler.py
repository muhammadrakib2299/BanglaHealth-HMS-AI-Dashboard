from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=409,
        content={"detail": "A database conflict occurred. The record may already exist."},
    )
