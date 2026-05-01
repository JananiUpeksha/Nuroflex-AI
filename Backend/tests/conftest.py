"""
tests/conftest.py
Shared pytest configuration and fixtures.
"""

import pytest


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "system: marks tests as system tests that require a running server (deselect with -m 'not system')"
    )


@pytest.fixture(autouse=True)
def reset_ai_service_quota():
    try:
        import app.services.ai_service as svc
        svc._quota["count"]        = 0
        svc._quota["reset_minute"] = None
    except ImportError:
        pass
    yield


@pytest.fixture(autouse=True)
def reset_yt_quota():
    try:
        import app.main as m
        from datetime import date
        m._yt_quota["count"]      = 0
        m._yt_quota["reset_date"] = date.today()
        m._stack_cache.clear()
    except ImportError:
        pass
    yield
