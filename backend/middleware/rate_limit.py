import time
from collections import defaultdict

from fastapi import HTTPException, Request, status


class RateLimiter:
    """Simple in-memory rate limiter for ML endpoints."""

    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self._requests: dict[str, list[float]] = defaultdict(list)

    def _cleanup(self, key: str, now: float):
        cutoff = now - self.window_seconds
        self._requests[key] = [t for t in self._requests[key] if t > cutoff]

    def check(self, request: Request):
        key = request.client.host if request.client else "unknown"
        now = time.time()
        self._cleanup(key, now)

        if len(self._requests[key]) >= self.max_requests:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {self.max_requests} requests per {self.window_seconds}s.",
            )
        self._requests[key].append(now)


ml_rate_limiter = RateLimiter(max_requests=10, window_seconds=60)
