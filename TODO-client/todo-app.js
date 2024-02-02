let todoEntries = [];
let id = -1;
let todoId = '';

function createAppTitle(title) {
  let appTitle = document.createElement('h2');
  appTitle.innerHTML = title;
  return appTitle;
}

function createTodoItemForm() {
  let form = document.createElement('form');
  let input = document.createElement('input');
  let buttonWrapper = document.createElement('div');
  let button = document.createElement('button');

  button.setAttribute('disabled', 'disabled');

  form.classList.add('input-group', 'mb-3');
  input.classList.add('form-control');
  input.placeholder = 'Введите название нового дела';
  buttonWrapper.classList.add('input-group-append');
  button.classList.add('btn', 'btn-primary');
  button.textContent = 'Добавить дело';

  buttonWrapper.append(button);
  form.append(input);
  form.append(buttonWrapper);

  return {
    form,
    input,
    button,
  };
}

function createTodoList() {
  let list = document.createElement('ul');
  list.classList.add('list-group');
  return list;
}

function createTodoItem(id, name, done = false) {
  let item = document.createElement('li');
  let buttonGroup = document.createElement('div');
  let doneButton = document.createElement('button');
  let deleteButton = document.createElement('button');

  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'aling-items-center');
  item.textContent = name;

  buttonGroup.classList.add('btn-group', 'btn-group-sm');
  doneButton.classList.add('btn', 'btn-success');
  doneButton.textContent = 'Готово';
  deleteButton.classList.add('btn', 'btn-danger');
  deleteButton.textContent = 'Удалить';

  if (done) {
    item.classList.add('list-group-item-success');
  }

  doneButton.addEventListener('click', () => {
    item.classList.toggle('list-group-item-success');
    item.classList.contains('list-group-item-success') ? changeTodoStatus(id, true) : changeTodoStatus(id,  false);
  });

  deleteButton.addEventListener('click', () => {
    if (confirm('Вы уверены?')) {
      deleteTodoItem(id);
      item.remove();
    }
  })

  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  return { item }
}

function getId() {
  id += 1;
  return id;
}

async function isInList(entryName) {
  const todoEntries = await loadTodoItems();
  todoEntries.forEach((entry) => {
    if (entryName === entry.name) {
      return true;
    }
  });
  return false;
}

function saveList(arr, listId) {
  localStorage.setItem(listId, JSON.stringify(arr));
}

async function loadTodoItems() {
  const response = await fetch('http://localhost:3000/api/todos');
  const data = await response.json();
  return data;
}

async function createTodoItemOnServer(listId, todo) {
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

async function getTodoItem(id) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`);
  const data = await response.json();
}

async function markTodoAsDone(id) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: true })
  });
  const data = await response.json();
}

async function changeTodoStatus(id, status) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done: status })
  });
  const data = await response.json();
}

async function deleteTodoItem(id) {
  const response = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: 'DELETE',
  });
  if (response.status === 404)
    console.log('Не удалось удалить дело, так как его не существует');
}

async function createTodoApp(listId, container, title = 'Список дел', todoArray = [{name: '', done: false}]) {

  todoId = listId;
  let todoApptitle = createAppTitle(title);
  let todoItemForm = createTodoItemForm();
  let todoList = createTodoList();

  container.append(todoApptitle);
  container.append(todoItemForm.form);
  container.append(todoList);

  // localStorage.clear();

  todoEntries = await loadTodoItems();
  todoEntries.forEach((entry) => {
    if (entry.owner === todoId) {
      const todoItem = createTodoItem(entry.id, entry.name, entry.done);
      todoList.append(todoItem.item);
    };
  });

  todoItemForm.input.addEventListener('input', () => {
    if (todoItemForm.input.value) {
      todoItemForm.button.removeAttribute('disabled');
    } else {
      todoItemForm.button.setAttribute('disabled', 'disabled');
    }
  })

  todoItemForm.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const response = await isInList(todoItemForm.input.value);

    if (response) {
      todoItemForm.input.value = '';
      todoItemForm.input.placeholder = 'Такое дело уже есть, введите название нового дела';
      return;
    } 

    todoItemForm.button.setAttribute('disabled', 'disabled');

    const todoItem = await createTodoItemOnServer(todoId, todoItemForm.input.value);
    const todoItemElement = createTodoItem(todoItem.id, todoItem.name);

    todoEntries.push(todoItemElement.entry);
    todoList.append(todoItemElement.item);
    todoItemForm.input.value = '';
    todoItemForm.input.placeholder = 'Введите название нового дела';
  })
}

export { createTodoApp };
