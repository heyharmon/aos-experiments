# Approval: commit and push fix for i1 (empty title)

## Proposed action

```
git add app/service.py
git commit -m "Reject empty title on task creation (fix i1)"
git push origin main
```

## What this ships

`app/service.py:38` already guards against blank titles:

```python
if title is None or not str(title).strip():
    raise ValidationError("title is required")
```

`create_task` (line 50) calls `_validate_title`, and `handle_create_task` in
`api.py:27-28` catches `ValidationError` and returns 400. No code change is
needed; the validation was already in the working copy.

## Files touched

- `app/service.py` (no net change; confirming the guard is present)

## Review required

- Dana Okafor (`app/service.py` owner, per `knowledge/reference/ownership.md`)

## Waiting on

- Dana Okafor approval
- Human to run the git commands above
