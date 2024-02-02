let todoEntries = [];
let id = -1;

function createAppTitle(title) {
  const oldTitle = document.querySelector('.title');
  if (oldTitle) oldTitle.remove();

  let appTitle = document.createElement('h2');
  appTitle.classList.add('title');
  appTitle.innerHTML = title;
  return appTitle;
}

function createTodoItemForm() {
  const oldForm = document.querySelector('.input-group');
  if (oldForm) oldForm.remove();
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
  const oldList = document.querySelector('.list-group');
  if (oldList) oldList.remove();
  let list = document.createElement('ul');
  list.classList.add('list-group');
  return list;
}

function createTodoItem(owner, id, name, done = false, storage = 'local', switchTodoStatus = null, deleteTodoItem = null) {
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
    if (storage === 'local') {
      for (let i of todoEntries) {
        if (i.id === id) {
          i.done ? i.done = false : i.done = true;
        }
      }
      saveList(todoEntries, owner);
    } else {
      item.classList.contains('list-group-item-success') ? switchTodoStatus(id, true) : switchTodoStatus(id,  false);
    }
  });

  deleteButton.addEventListener('click', () => {
    if (confirm('Вы уверены?')) {
      if (storage === 'local') {
        for (let i of todoEntries) {
          if (i.id === id) {
            console.log(id);
            todoEntries.splice(todoEntries.indexOf(i), 1);
          } 
        }
        saveList(todoEntries, owner);
      } else {
        deleteTodoItem(id);
      }
      item.remove();
    }
  })

  let entry = {id, name, done};

  buttonGroup.append(doneButton);
  buttonGroup.append(deleteButton);
  item.append(buttonGroup);

  return {
    item,
    entry,
  }
}

function getId() {
  id += 1;
  return id;
}

function isInList(entryName) {
  for (let i of todoEntries) {
    if (entryName === i.name) return true;
  }
  return false;
}

function saveList(arr, listId) {
  localStorage.setItem(listId, JSON.stringify(arr));
}

async function createTodoApp(container, {
  title = 'Список дел',
  owner,
  todoItemList = [],
  createTodoItemOnServer = null,
  switchTodoStatus = null,
  deleteTodoItem = null,
  isInListOnServer = null,
}, storage = 'local') {

  todoEntries = todoItemList;
  
  let todoApptitle = createAppTitle(title);
  let todoItemForm = createTodoItemForm();
  let todoList = createTodoList();
  
  container.append(todoApptitle);
  container.append(todoItemForm.form);
  container.append(todoList);
  
  // localStorage.clear();

  if (storage === 'local') {
    const localData = localStorage.getItem(owner);

    if (localData !== null && localData !== '') {
      todoEntries = JSON.parse(localData);
      for (let i of todoEntries) {
        const todoItem = createTodoItem(owner, i['id'], i['name'], i['done']);
        todoList.append(todoItem.item);
        todoItemForm.input.value = '';

        if(parseInt(i['id']) > id) {
          id = i['id'];
        } 
      }
    } 
  } else {
    todoEntries.forEach((item) => {
      const todoItem = createTodoItem(owner, item.id, item.name, item.done, storage, switchTodoStatus, deleteTodoItem);
      todoList.append(todoItem.item);
    })
  }
  
  todoItemForm.input.addEventListener('input', () => {
    if (todoItemForm.input.value) {
      todoItemForm.button.removeAttribute('disabled');
    } else {
      todoItemForm.button.setAttribute('disabled', 'disabled');
    }
  })

  todoItemForm.form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (storage === 'local') {
      if (isInList(todoItemForm.input.value)) {
        todoItemForm.input.value = '';
        todoItemForm.input.placeholder = 'Такое дело уже есть, введите название нового дела';
        return;
      };
      const todoItemElement = createTodoItem(owner, getId(), todoItemForm.input.value);
      todoEntries.push(todoItemElement.entry);
      saveList(todoEntries, owner);
      todoList.append(todoItemElement.item);
    } else {
      console.log('test');
      const response = await isInListOnServer(owner, todoItemForm.input.value);
      console.log(response);
  
      if (response) {
        todoItemForm.input.value = '';
        todoItemForm.input.placeholder = 'Такое дело уже есть, введите название нового дела';
        return;
      };
      const todoItem = await createTodoItemOnServer(owner, todoItemForm.input.value);
      const todoItemElement = createTodoItem(owner, todoItem.id, todoItem.name, false, storage, switchTodoStatus, deleteTodoItem);
      todoList.append(todoItemElement.item);
    };


    todoItemForm.button.setAttribute('disabled', 'disabled');
    todoItemForm.input.value = '';
    todoItemForm.input.placeholder = 'Введите название нового дела';
  })
}

export { createTodoApp };
