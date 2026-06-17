"""Tasklet service layer: all business logic lives here.

Handlers (app/api.py) call these; the store (app/store.py) is the only thing
these call for persistence. Validation and ownership checks belong HERE, not in
the handlers and not in the store (see knowledge/conventions/layering.md).
"""
from app.store import Store, RecordMissing

MAX_TITLE_LEN = 200

store = Store()


class ValidationError(Exception):
    pass


class TaskNotFound(Exception):
    pass


class Task:
    def __init__(self, task_id, owner, title, done=False):
        self.task_id = task_id
        self.owner = owner
        self.title = title
        self.done = done

    def to_dict(self):
        return {
            "id": self.task_id,
            "title": self.title,
            "done": self.done,
        }


def _validate_title(title):
    if title is None or not str(title).strip():
        raise ValidationError("title is required")
    if len(str(title)) > MAX_TITLE_LEN:
        raise ValidationError("title too long")
    return str(title).strip()


def list_tasks(owner):
    return [_row_to_task(r) for r in store.list_for_owner(owner)]


def create_task(owner, title):
    clean = _validate_title(title)
    row = store.insert(owner=owner, title=clean)
    return _row_to_task(row)


def complete_task(owner, task_id):
    try:
        row = store.get(owner=owner, task_id=task_id)
    except RecordMissing:
        raise TaskNotFound()
    store.update(task_id=task_id, done=True)
    row["done"] = True
    return _row_to_task(row)


def delete_task(owner, task_id):
    try:
        store.get(owner=owner, task_id=task_id)
    except RecordMissing:
        raise TaskNotFound()
    store.delete(task_id=task_id)


def _row_to_task(row):
    return Task(
        task_id=row["id"],
        owner=row["owner"],
        title=row["title"],
        done=row["done"],
    )
