"""Uniform response envelope helpers.

Every handler returns through these so the API envelope is consistent (ADR
0001). Success: {"ok": true, "data": {...}}. Error: {"ok": false, "error":
{"code": ..., "message": ...}}. Do not hand-build response dicts in handlers.
"""


def json_response(data, status=200):
    return {"status": status, "body": {"ok": True, "data": data}}


def error_response(code, message, status=400):
    return {
        "status": status,
        "body": {"ok": False, "error": {"code": code, "message": message}},
    }
