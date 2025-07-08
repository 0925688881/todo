let tasks = [];
let currentUser = null;
let users = [];

// 頁面加載時初始化
window.onload = () => {
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
    console.log('Loaded users:', users);
    currentUser = localStorage.getItem('currentUser');
    console.log('Current user from localStorage:', currentUser);
    if (!currentUser) {
      console.log('No user found, opening user modal');
      openUserModal();
    } else {
      loadTasks();
      updateUserDisplay();
    }
  } catch (e) {
    console.error('Error initializing app:', e);
    tasks = [];
    users = [];
    currentUser = null;
    openUserModal();
  }
};

// 載入任務
function loadTasks() {
  if (!currentUser) {
    console.warn('No current user, cannot load tasks');
    tasks = [];
    renderTasks();
    return;
  }
  try {
    const taskData = localStorage.getItem(`tasks_${currentUser}`);
    tasks = taskData ? JSON.parse(taskData) : [];
    console.log(`Loaded tasks for ${currentUser}:`, tasks);
    renderTasks();
  } catch (e) {
    console.error(`Failed to load tasks for ${currentUser}:`, e);
    tasks = [];
    renderTasks();
  }
}

// 儲存任務
function saveTasks() {
  if (!currentUser) {
    console.warn('No current user, cannot save tasks');
    return;
  }
  try {
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    console.log(`Tasks saved for ${currentUser}:`, tasks);
  } catch (e) {
    console.error(`Failed to save tasks for ${currentUser}:`, e);
    alert('儲存任務失敗，請檢查瀏覽器設定');
  }
}

// 儲存用戶列表
function saveUsers() {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Users saved:', users);
  } catch (e) {
    console.error('Failed to save users:', e);
    alert('儲存用戶列表失敗，請檢查瀏覽器設定');
  }
}

// 添加任務
function addTask() {
  if (!currentUser) {
    console.warn('No user selected, opening user modal');
    alert('請先選擇用戶');
    openUserModal();
    return;
  }
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const priorityInput = document.getElementById('task-priority');
  if (!titleInput || !descInput || !priorityInput) {
    console.error('Input elements not found');
    return alert('頁面元素載入失敗');
  }
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const priority = priorityInput.value;
  if (!title) {
    console.warn('Task title is empty');
    return alert('請輸入標題');
  }
  const task = {
    id: Date.now(),
    title,
    desc,
    priority,
    completed: false,
    date: new Date().toISOString().split('T')[0]
  };
  tasks.push(task);
  console.log(`Added task for ${currentUser}:`, task);
  saveTasks();
  renderTasks();
  closeModal();
}

// 渲染任務
function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) {
    console.error('Task list element not found');
    return;
  }
  taskList.innerHTML = '';
  if (!currentUser) {
    taskList.innerHTML = '<p>請選擇用戶以查看任務</p>';
    return;
  }
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

// 切換任務完成狀態
function toggleTask(id) {
  tasks = tasks.map(task => 
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  console.log(`Toggled task ${id} for ${currentUser}`);
  saveTasks();
  renderTasks();
}

// 刪除任務
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  console.log(`Deleted task ${id} for ${currentUser}`);
  saveTasks();
  renderTasks();
}

// 開啟任務模態框
function openModal() {
  if (!currentUser) {
    console.warn('No user selected, opening user modal');
    alert('請先選擇用戶');
    openUserModal();
    return;
  }
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('Modal element not found');
    return;
  }
  modal.classList.remove('hidden');
}

// 關閉任務模態框
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

// 開啟用戶模態框
function openUserModal() {
  const userModal = document.getElementById('user-modal');
  const userList = document.getElementById('user-list');
  if (!userModal || !userList) {
    console.error('User modal or user list element not found');
    return;
  }
  userList.innerHTML = '';
  if (users.length === 0) {
    userList.innerHTML = '<p>無已有用戶，請輸入新用戶名稱</p>';
  } else {
    users.forEach(user => {
      const userItem = document.createElement('div');
      userItem.className = 'user-list-item';
      userItem.textContent = user;
      userItem.onclick = () => {
        currentUser = user;
        localStorage.setItem('currentUser', currentUser);
        console.log(`Switched to user: ${currentUser}`);
        loadTasks();
        updateUserDisplay();
        closeUserModal();
      };
      userList.appendChild(userItem);
    });
  }
  userModal.classList.remove('hidden');
}

// 關閉用戶模態框
function closeUserModal() {
  const userModal = document.getElementById('user-modal');
  if (!userModal) {
    console.error('User modal element not found');
    return;
  }
  userModal.classList.add('hidden');
  const usernameInput = document.getElementById('username-input');
  if (usernameInput) usernameInput.value = '';
}

// 新增用戶
function addNewUser() {
  const usernameInput = document.getElementById('username-input');
  if (!usernameInput) {
    console.error('Username input element not found');
    return;
  }
  const username = usernameInput.value.trim();
  if (!username) {
    console.warn('Username is empty');
    return alert('請輸入用戶名稱');
  }
  if (users.includes(username)) {
    console.warn(`User ${username} already exists`);
    return alert('用戶名稱已存在，請直接點選或輸入新名稱');
  }
  users.push(username);
  saveUsers();
  currentUser = username;
  localStorage.setItem('currentUser', currentUser);
  console.log(`Added and switched to new user: ${currentUser}`);
  loadTasks();
  updateUserDisplay();
  closeUserModal();
}

// 更新用戶顯示
function updateUserDisplay() {
  const currentUserElement = document.getElementById('current-user');
  if (currentUserElement) {
    currentUserElement.textContent = currentUser || '未登錄';
  } else {
    console.error('Current user element not found');
  }
}

document.getElementById('add-task-btn')?.addEventListener('click', openModal);
document.getElementById('switch-user-btn')?.addEventListener('click', openUserModal);