"""Tasklet store: the ONLY module that touches persistence.

In-memory dict for now (ADR 0003 defers a real DB). The store deals in plain
row dicts, never Task objects: keeping the store dumb keeps the service layer
the single home for business rules. Raises RecordMissing on a miss; the service
layer translates that into the domain-level TaskNotFound.
"""
import itertools


class RecordMissing(Exception):
    pass


class Store:
    def __init__(self):
        self._rows = {}
        self._ids = itertools.count(1)

    def insert(self, owner, title):
        tid = next(self._ids)
        row = {"id": tid, "owner": owner, "title": title, "done": False}
        self._rows[tid] = row
        return dict(row)

    def get(self, owner, task_id):
        row = self._rows.get(task_id)
        if row is None or row["owner"] != owner:
            raise RecordMissing()
        return dict(row)

    def list_for_owner(self, owner):
        return [dict(r) for r in self._rows.values() if r["owner"] == owner]

    def update(self, task_id, **fields):
        row = self._rows.get(task_id)
        if row is None:
            raise RecordMissing()
        row.update(fields)
        return dict(row)

    def delete(self, task_id):
        self._rows.pop(task_id, None)
