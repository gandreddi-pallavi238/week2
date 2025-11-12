"use strict";

/* -------------------------
  script.js for Interactive Task Manager
------------------------- */

const STORAGE_KEY = "tasks";

/* ---- Helper utilities ---- */
const $ = (sel) => document.querySelector(sel);

function makeId() {
  return "t_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/* ---- Storage helpers ---- */
function loadFromStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  updateMeta(tasks);
}

/* ---- DOM references ---- */
const taskListEl = $("#taskList");
const inputEl = $("#taskInput");
const addBtn = $("#addBtn");
const errorEl = $("#error");
const metaText = $("#metaText");

/* ---- UI helpers ---- */
function showError(message) {
  errorEl.textContent = message;
  errorEl.style.display = "block";
  setTimeout(() => (errorEl.style.display = "none"), 3000);
}

function updateMeta(tasks) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.done).length;
  metaText.textContent = `You have ${total} task${total !== 1 ? "s" : ""} — ${done} completed.`;
}

function clearInput() {
  inputEl.value = "";
  addBtn.disabled = true;
}

/* ---- Rendering ---- */
function renderTasks(tasks) {
  taskListEl.innerHTML = "";
  if (tasks.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No tasks yet — add your first one!";
    li.style.color = "#6b7280";
    li.style.padding = "8px";
    taskListEl.appendChild(li);
    updateMeta([]);
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");
    li.dataset.id = task.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!task.done;
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const textDiv = document.createElement("div");
    textDiv.className = "text";
    textDiv.textContent = task.text;

    const actions = document.createElement("div");
    actions.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "✏️";
    editBtn.addEventListener("click", () => startEditTask(task.id));

    const delBtn = document.createElement("button");
    delBtn.className = "delete";
    delBtn.textContent = "🗑️";
    delBtn.addEventListener("click", () => removeTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    li.appendChild(checkbox);
    li.appendChild(textDiv);
    li.appendChild(actions);

    taskListEl.appendChild(li);
  });

  updateMeta(tasks);
}

/* ---- CRUD operations ---- */
function addTask(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    showError("Task cannot be empty!");
    return false;
  }
  const tasks = loadFromStorage();
  tasks.unshift({ id: makeId(), text: trimmed, done: false });
  saveToStorage(tasks);
  renderTasks(tasks);
  return true;
}

function removeTask(id) {
  const tasks = loadFromStorage().filter((t) => t.id !== id);
  saveToStorage(tasks);
  renderTasks(tasks);
}

function toggleTask(id) {
  const tasks = loadFromStorage();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx].done = !tasks[idx].done;
    saveToStorage(tasks);
    renderTasks(tasks);
  }
}

/* ---- Editing ---- */
function startEditTask(id) {
  const tasks = loadFromStorage();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return;

  const li = taskListEl.querySelector(`li[data-id="${id}"]`);
  const textDiv = li.querySelector(".text");

  const input = document.createElement("input");
  input.type = "text";
  input.value = tasks[idx].text;
  input.style.width = "100%";

  li.replaceChild(input, textDiv);
  input.focus();

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  input.addEventListener("blur", () => finish(true));

  function finish(save) {
    if (save) {
      const newVal = input.value.trim();
      if (newVal) tasks[idx].text = newVal;
      else showError("Task cannot be empty!");
    }
    saveToStorage(tasks);
    renderTasks(tasks);
  }
}

/* ---- Event wiring ---- */
addBtn.addEventListener("click", () => {
  if (addTask(inputEl.value)) clearInput();
});

inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    if (addTask(inputEl.value)) clearInput();
  } else if (e.key === "Escape") {
    clearInput();
  }
});

inputEl.addEventListener("input", () => {
  addBtn.disabled = inputEl.value.trim() === "";
});

document.addEventListener("DOMContentLoaded", () => {
  renderTasks(loadFromStorage());
  addBtn.disabled = true;
});
