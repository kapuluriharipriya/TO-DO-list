// Simple To-Do app with localStorage persistence and filters

const STORAGE_KEY = 'todo-tasks:v1';
const form = document.getElementById('new-task-form');
const input = document.getElementById('new-task-input');
const list = document.getElementById('task-list');
const filters = document.querySelectorAll('.filter');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-completed');

let tasks = [];
let filter = 'all';

function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    tasks = raw ? JSON.parse(raw) : [];
  } catch (e) {
    tasks = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTaskElement(task){
  const li = document.createElement('li');
  li.className = 'task' + (task.completed ? ' completed' : '');
  li.dataset.id = task.id;

  // checkbox
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = task.completed;
  cb.className = 'checkbox';
  cb.setAttribute('aria-label', 'Mark task complete');
  cb.addEventListener('change', () => toggleComplete(task.id));
  li.appendChild(cb);

  // label
  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = task.text;
  label.tabIndex = 0;
  label.addEventListener('dblclick', () => startEdit(task.id));
  li.appendChild(label);

  // edit button
  const editBtn = document.createElement('button');
  editBtn.className = 'icon';
  editBtn.title = 'Edit';
  editBtn.innerHTML = '✏️';
  editBtn.addEventListener('click', () => startEdit(task.id));
  li.appendChild(editBtn);

  // delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'icon';
  delBtn.title = 'Delete';
  delBtn.innerHTML = '🗑️';
  delBtn.addEventListener('click', () => deleteTask(task.id));
  li.appendChild(delBtn);

  return li;
}

function render() {
  list.innerHTML = '';
  const shown = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });
  shown.forEach(t => list.appendChild(createTaskElement(t)));
  updateCount();
  updateFilterUI();
}

function updateCount(){
  const active = tasks.filter(t => !t.completed).length;
  countEl.textContent = `${active} item${active !== 1 ? 's' : ''} left`;
}

function updateFilterUI(){
  filters.forEach(btn => {
    const is = btn.dataset.filter === filter;
    btn.classList.toggle('active', is);
    btn.setAttribute('aria-selected', is ? 'true' : 'false');
  });
}

function addTask(text){
  const task = { id: uuid(), text: text.trim(), completed: false };
  if (!task.text) return;
  tasks.unshift(task);
  save();
  render();
}

function toggleComplete(id){
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  save();
  render();
}

function deleteTask(id){
  tasks = tasks.filter(x => x.id !== id);
  save();
  render();
}

function startEdit(id){
  const li = list.querySelector(`li[data-id="${id}"]`);
  if (!li) return;
  const task = tasks.find(t => t.id === id);
  const label = li.querySelector('.label');
  const inputEdit = document.createElement('input');
  inputEdit.type = 'text';
  inputEdit.value = task.text;
  inputEdit.className = 'edit-input';
  inputEdit.style.flex = '1';
  li.replaceChild(inputEdit, label);
  inputEdit.focus();
  inputEdit.select();

  function finish() {
    const val = inputEdit.value.trim();
    if (val) task.text = val;
    save();
    render();
  }
  inputEdit.addEventListener('blur', finish);
  inputEdit.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') inputEdit.blur();
    if (e.key === 'Escape') { render(); }
  });
}

function deleteCompleted(){
  tasks = tasks.filter(t => !t.completed);
  save();
  render();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  addTask(input.value);
  form.reset();
  input.focus();
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', deleteCompleted);

// initial load
load();
render();
