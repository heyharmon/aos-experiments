// Tasklet minimal web client. Talks to the API envelope from ADR 0001:
// every response is {ok, data} or {ok, error}. Always check resp.ok before
// reading data. Keep this file framework-free (ADR 0004: no SPA framework yet).

async function apiFetch(method, path, body) {
  const resp = await fetch(path, {
    method,
    headers: {
      "Authorization": "Bearer " + window.TASKLET_TOKEN,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await resp.json();
  if (!json.ok) {
    throw new Error(json.error.code + ": " + json.error.message);
  }
  return json.data;
}

async function loadTasks() {
  const data = await apiFetch("GET", "/tasks");
  return data.tasks;
}

async function addTask(title) {
  const data = await apiFetch("POST", "/tasks", { title });
  return data.task;
}
