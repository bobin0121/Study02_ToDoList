// 생성: 2026-10-01 11:28 KST
const STORAGE_KEY = 'todos';
const CATEGORIES = { work: '업무', personal: '개인', study: '공부' };
const MAX_LENGTH = 100;

let todos = loadTodos();
let editingId = null;

const form = document.getElementById('add-form');
const addText = document.getElementById('add-text');
const addCategory = document.getElementById('add-category');
const listEl = document.getElementById('todo-list');
const emptyEl = document.getElementById('empty');

function loadTodos() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!Array.isArray(data)) return [];
    return data.filter(t =>
      t && typeof t.id === 'string' && typeof t.text === 'string' &&
      t.category in CATEGORIES && typeof t.done === 'boolean');
  } catch (e) {
    return [];
  }
}

function saveTodos() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    alert('저장하지 못했습니다. 브라우저 저장소를 확인해 주세요.');
  }
}

function commit() {
  saveTodos();
  render();
}

function makeLabel(category) {
  const span = document.createElement('span');
  span.className = 'label ' + category;
  span.textContent = CATEGORIES[category];
  return span;
}

function makeButton(text, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = text;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderItem(todo) {
  const li = document.createElement('li');
  li.className = 'todo' + (todo.done ? ' done' : '');

  if (todo.id === editingId) {
    const input = document.createElement('input');
    input.type = 'text';
    input.maxLength = MAX_LENGTH;
    input.value = todo.text;
    input.setAttribute('aria-label', '내용 수정');

    const select = document.createElement('select');
    select.setAttribute('aria-label', '카테고리 수정');
    for (const key in CATEGORIES) {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = CATEGORIES[key];
      select.appendChild(opt);
    }
    select.value = todo.category;

    const save = () => {
      const text = input.value.trim();
      if (!text) return;
      todo.text = text;
      todo.category = select.value;
      editingId = null;
      commit();
    };
    const cancel = () => {
      editingId = null;
      render();
    };
    const onKey = e => {
      if (e.key === 'Enter') save();
      else if (e.key === 'Escape') cancel();
    };
    input.addEventListener('keydown', onKey);
    select.addEventListener('keydown', onKey);

    li.append(input, select, makeButton('저장', save), makeButton('취소', cancel));
    queueMicrotask(() => { input.focus(); input.select(); });
    return li;
  }

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = todo.done;
  checkbox.setAttribute('aria-label', '완료');
  checkbox.addEventListener('change', () => {
    todo.done = checkbox.checked;
    commit();
  });

  const text = document.createElement('span');
  text.className = 'text';
  text.textContent = todo.text;
  text.addEventListener('dblclick', () => startEdit(todo.id));

  li.append(
    checkbox,
    text,
    makeLabel(todo.category),
    makeButton('수정', () => startEdit(todo.id)),
    makeButton('삭제', () => {
      if (!confirm('이 할 일을 삭제할까요?')) return;
      todos = todos.filter(t => t.id !== todo.id);
      commit();
    })
  );
  return li;
}

function startEdit(id) {
  editingId = id;
  render();
}

function updateBar(key, done, total) {
  const row = document.querySelector('.progress-row[data-key="' + key + '"]');
  const percent = total === 0 ? 0 : Math.round(done / total * 100);
  row.querySelector('.progress-count').textContent = done + ' / ' + total;
  row.querySelector('.progress-percent').textContent = percent + '%';
  row.querySelector('.bar span').style.width = percent + '%';
}

function renderProgress() {
  updateBar('total', todos.filter(t => t.done).length, todos.length);
  for (const key in CATEGORIES) {
    const items = todos.filter(t => t.category === key);
    updateBar(key, items.filter(t => t.done).length, items.length);
  }
}

function render() {
  listEl.replaceChildren(...todos.map(renderItem));
  emptyEl.hidden = todos.length > 0;
  renderProgress();
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const text = addText.value.trim();
  if (!text) return;
  todos.push({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text,
    category: addCategory.value,
    done: false,
    createdAt: Date.now()
  });
  addText.value = '';
  addText.focus();
  commit();
});

render();
