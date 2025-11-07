"""Simple in-memory cache for API responses"""
from typing import Any, Optional, Dict
from datetime import datetime, timezone

_cache: Dict[str, tuple[Any, datetime]] = {}

def get(key: str) -> Optional[Any]:
    """Get cached value if exists and not expired"""
    if key in _cache:
        value, timestamp = _cache[key]
        return value
    return None

def set(key: str, value: Any):
    """Set cache value with timestamp"""
    _cache[key] = (value, datetime.now(timezone.utc))

def clear(pattern: Optional[str] = None):
    """Clear cache (optionally by pattern)"""
    global _cache
    if pattern is None:
        _cache = {}
        print("✓ Cache cleared completely")
    else:
        keys_to_delete = [k for k in _cache.keys() if pattern in k]
        for k in keys_to_delete:
            del _cache[k]
        print(f"✓ Cache cleared for pattern: {pattern}")

def size() -> int:
    """Get number of cached items"""
    return len(_cache)
