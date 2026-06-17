# Issue queue

Incoming issues and requests for the Tasklet service. Each has an id, a title,
and a body. Triaging is reversible: assign a priority and a one-line reason; do
not close, merge, or act on them destructively.

- id: i1
  status: open
  title: "Empty title creates a blank task"
  body: "POST /tasks with an empty title returns 201 and a task with title ''. Should be a 400 invalid_task. Affects every client."

- id: i2
  status: open
  title: "list_tasks has no pagination"
  body: "GET /tasks returns every task for the owner. Large lists are slow. Asking whether we have a pagination convention."

- id: i3
  status: open
  title: "Add SQLite persistence"
  body: "Tasks vanish on restart because the store is in-memory. Requester wants a SQLite backend and the sqlalchemy dependency."

- id: i4
  status: open
  title: "Typo in error message"
  body: "error_response for a missing task says 'no such task'; product wants 'Task not found.' Cosmetic copy change in app/api.py."

- id: i5
  status: open
  title: "Marketing wants a newsletter signup widget on the task page"
  body: "Unrelated to the task API. Routed here by mistake."
