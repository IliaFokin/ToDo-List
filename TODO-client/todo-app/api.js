export async function loadTodoList(owner) {
  const response = await fetch(`http://localhost:3000/api/todos?owner=${owner}`);
  const data = await response.json();
  return data;
}

export async function createTodoItemOnServer(listId, todo) {
  const response = await fetch('http://localhost:3000/api/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: todo,
      owner: listId,
    })
  });
  const data = await response.json();
  return data;
}

export async function switchTodoStatus(id, status) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: status })
  });
}

export async function deleteTodoItem(id) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 404)
    console.log('Не удалось удалить дело, так как его не существует');
}

export async function isInListOnServer(owner, name) {
  let response = false;
  const todoEntries = await loadTodoList(owner);
  todoEntries.forEach((entry) => {
    if (name === entry.name) {
      response = true;
    }
  });
  return response;
}