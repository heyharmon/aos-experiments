"""Tasklet HTTP API handlers.

Thin handlers only: parse the request, call into the service layer, shape the
response. No business logic here (see knowledge/conventions/layering.md). Every
handler returns via the json_response/error_response helpers in app/responses.py
so the envelope stays uniform.
"""
from app.responses import json_response, error_response
from app.service import (
    list_tasks,
    create_task,
    complete_task,
    delete_task,
    TaskNotFound,
    ValidationError,
)


def handle_list_tasks(request):
    tasks = list_tasks(owner=request.user_id)
    return json_response({"tasks": [t.to_dict() for t in tasks]})


def handle_create_task(request):
    try:
        task = create_task(owner=request.user_id, title=request.body.get("title"))
    except ValidationError as e:
        return error_response("invalid_task", str(e), status=400)
    return json_response({"task": task.to_dict()}, status=201)


def handle_complete_task(request, task_id):
    try:
        task = complete_task(owner=request.user_id, task_id=task_id)
    except TaskNotFound:
        return error_response("not_found", "no such task", status=404)
    return json_response({"task": task.to_dict()})


def handle_delete_task(request, task_id):
    # Deletion is hard delete by design; see ADR 0002. Soft-delete was rejected.
    try:
        delete_task(owner=request.user_id, task_id=task_id)
    except TaskNotFound:
        return error_response("not_found", "no such task", status=404)
    return json_response({}, status=204)
