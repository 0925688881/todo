let tasks = [];

// 頁面加載時從 Local Storage 讀取任務
window.onload = () => {
  try {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    console.log('Loaded tasks:', tasks);
    renderTasks();
  } catch (e) {
    console.error('Failed to load tasks from Local Storage:', e);
    tasks = [];
    renderTasks();
  }
};

// 儲存任務到 Local Storage
function saveTasks() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('Tasks saved:', tasks);
  } catch (e) {
    console.error('Failed to save tasks to Local Storage:', e);
  }
}

function addTask() {
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const priorityInput = document.getElementById('task-priority');

  if (!titleInput || !descInput || !priorityInput) {
    console.error('Input elements not found');
    return alert('頁面元素載入失敗，請檢查環境');
  }

  const title = titleInput.value;
  const desc = descInput.value;
  const priority = priorityInput.value;

  if (!title) return alert('請輸入標題');

  const task = {
    id: Date.now(),
    title,
    desc,
    priority,
    completed: false,
    date: new Date().toISOString().split('T')[0]
  };

  tasks.push(task);
  saveTasks();
  renderTasks();
  closeModal();
}

function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) {
    console.error('Task list element not found');
    return;
  }

  taskList.innerHTML = '';
  if (tasks.length === 0) {
    taskList.innerHTML = '<p>暫無待辦事項</p>';
    return;
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return a.id - b.id;
  });

  let addedSeparator = false;
  tasks.forEach(task => {
    if (!addedSeparator && task.completed) {
      const separator = document.createElement('div');
      separator.innerHTML = '<hr><h3>已完成</h3>';
      taskList.appendChild(separator);
      addedSeparator = true;
    }
    const taskCard = document.createElement('div');
    taskCard.className = `task-card ${task.completed ? 'completed' : ''}`;
    taskCard.innerHTML = `
      <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask(${task.id})">
      <div>
        <strong>${task.title}</strong>
        <p>${task.desc}</p>
        <span class="priority-${task.priority}">${task.priority}</span>
        <div class="task-date">建立於：${task.date}</div>
      </div>
      <button class="delete-btn" onclick="deleteTask(${task.id})">刪除</button>
    `;
    taskList.appendChild(taskCard);
  });
}

function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
}

function openModal() {
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  modal.classList.remove('hidden');
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  modal.classList.add('hidden');
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const priorityInput = document.getElementById('task-priority');
  if (titleInput) titleInput.value = '';
  if (descInput) descInput.value = '';
  if (priorityInput) priorityInput.value = 'low';
}

document.getElementById('add-task-btn')?.addEventListener('click', openModal);