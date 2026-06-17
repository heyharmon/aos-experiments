"""Auth wrapper.

require_auth pulls the bearer token from the request, resolves it to a user_id,
and populates request.user_id before the handler runs. Every route is wrapped
exactly once in app/routes.py. There is intentionally no per-handler auth check;
the wrapper is the single choke point (see knowledge/conventions/auth.md).
"""
from app.responses import error_response

# Demo token table. Real token resolution is out of scope (ADR 0003).
_TOKENS = {
    "tok_demo": "user_1",
}


def resolve_token(token):
    return _TOKENS.get(token)


def require_auth(handler):
    def wrapped(request, *args, **kwargs):
        token = request.headers.get("Authorization", "").removeprefix("Bearer ")
        user_id = resolve_token(token)
        if user_id is None:
            return error_response("unauthorized", "missing or bad token", status=401)
        request.user_id = user_id
        return handler(request, *args, **kwargs)

    return wrapped
