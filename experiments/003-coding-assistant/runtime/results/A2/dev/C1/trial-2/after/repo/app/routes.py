"""Route table: maps method+path to a handler in app/api.py.

New endpoints are registered HERE and nowhere else. Auth is applied uniformly
by the router via the require_auth wrapper; individual handlers assume
request.user_id is already populated (see knowledge/conventions/auth.md).
"""
from app import api
from app.auth import require_auth

ROUTES = [
    ("GET", "/tasks", require_auth(api.handle_list_tasks)),
    ("POST", "/tasks", require_auth(api.handle_create_task)),
    ("POST", "/tasks/<id>/complete", require_auth(api.handle_complete_task)),
    ("DELETE", "/tasks/<id>", require_auth(api.handle_delete_task)),
]
