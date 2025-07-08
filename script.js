// 全局變數
let tasks = [];
let currentUser = null;
let users = [];

// 初始化應用程式
function initApp() {
  try {
    users = JSON.parse(localStorage.getItem('users')) || [];
    currentUser = localStorage.getItem('currentUser');
    console.log('初始化 - 用戶:', users, '當前任務:', currentUser);
    updateUserDisplay();
    if (currentUser) loadTasks();
    else openUserModal();
    bindEventListeners();
  } catch (error) {
    console.error('初始化失敗:', error);
    users = [];
    currentUser = null;
    tasks = [];
    updateUserDisplay();
    openUserModal();
  }
}

// 綁定事件監聽器
function bindEventListeners() {
  const eventMap = {
    'add-task-btn': openTaskModal,
    'switch-user-btn': openUserModal,
    'add-task-submit-btn': addTask,
    'close-modal-btn': closeTaskModal,
    'add-user-btn': addUser,
    'close-user-modal-btn': closeUserModal,
    'close-app-btn': closeApp
  };

  Object.entries(eventMap).forEach(([id, handler]) => {
    const button = document.getElementById(id);
    if (button) {
      button.addEventListener('click', () => {
        console.log(`${id} 被點擊`);
        handler();
      });
    } else {
      console.error(`按鈕 ${id} 未找到`);
    }
  });
}

// 載入任務
function loadTasks() {
  if (!currentUser) {
    console.warn('無當前任務，無法載入任務');
    tasks = [];
    renderTasks();
    return;
  }
  try {
    tasks = JSON.parse(localStorage.getItem(`tasks_${currentUser}`)) || [];
    console.log(`載入 ${currentUser} 的任務:`, tasks);
    renderTasks();
  } catch (error) {
    console.error(`載入 ${currentUser} 的任務失敗:`, error);
    tasks = [];
    renderTasks();
  }
}

// 儲存任務
function saveTasks() {
  if (!currentUser) {
    console.warn('無當前任務，無法儲存任務');
    return;
  }
  try {
    localStorage.setItem(`tasks_${currentUser}`, JSON.stringify(tasks));
    console.log(`儲存 ${currentUser} 的任務:`, tasks);
  } catch (error) {
    console.error(`儲存 ${currentUser} 的任務失敗:`, error);
    alert('儲存任務失敗，請檢查瀏覽器設定');
  }
}

// 儲存用戶列表
function saveUsers() {
  try {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('儲存任務列表:', users);
  } catch (error) {
    console.error('儲存任務列表失敗:', error);
    alert('儲存任務列表失敗，請檢查瀏覽器設定');
  }
}

// 新增任務
function addTask() {
  if (!currentUser) {
    console.warn('無選擇任務，開啟任務模態框');
    alert('請先選擇大任務');
    openUserModal();
    return;
  }
  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const priorityInput = document.getElementById('task-priority');
  if (!titleInput || !descInput || !priorityInput) {
    console.error('任務輸入框未找到');
    alert('頁面元素載入失敗');
    return;
  }
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();
  const priority = priorityInput.value;
  if (!title) {
    console.warn('任務標題為空');
    alert('請輸入標題');
    return;
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
  console.log(`新增任務 (${currentUser}):`, task);
  saveTasks();
  renderTasks();
  closeTaskModal();
}

// 渲染任務
function renderTasks() {
  const taskList = document.getElementById('task-list');
  if (!taskList) {
    console.error('任務列表元素未找到');
    return;
  }
  taskList.innerHTML = '';
  if (!currentUser) {
    taskList.innerHTML = '<p>請選擇任務以查看任務</p>';
    return;
  }
  if (!tasks.length) {
    taskList.innerHTML = '<p>暫無待辦事項</p>';
    return;
  }
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed - b.completed;
    return priorityOrder[b.priority] - priorityOrder[a.priority] || a.id - b.id;
  });
  let addedSeparator = false;
  tasks.forEach(task => {
    if (!addedSeparator && task.completed) {
      taskList.innerHTML += '<hr><h3>已完成</h3>';
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
  console.log(`切換任務 ${id} 狀態 (${currentUser})`);
  saveTasks();
  renderTasks();
}

// 刪除任務
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  console.log(`刪除任務 ${id} (${currentUser})`);
  saveTasks();
  renderTasks();
}

// 開啟任務模態框
function openTaskModal() {
  if (!currentUser) {
    console.warn('無選擇任務，開啟任務模態框');
    alert('請先選擇任務');
    openUserModal();
    return;
  }
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('任務模態框未找到');
    return;
  }
  modal.classList.remove('hidden');
  console.log('任務模態框開啟');
}

// 關閉任務模態框
function closeTaskModal() {
  const modal = document.getElementById('modal');
  if (!modal) {
    console.error('任務模態框未找到');
    return;
  }
  modal.classList.add('hidden');
  document.getElementById('task-title').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-priority').value = 'low';
  console.log('任務模態框關閉');
}

// 開啟用戶模態框
function openUserModal() {
  const userModal = document.getElementById('user-modal');
  const userList = document.getElementById('user-list');
  if (!userModal || !userList) {
    console.error('任務模態框或任務列表未找到');
    return;
  }
  userList.innerHTML = users.length
    ? users.map(user => `
        <div class="user-list-item">
          <span onclick="switchUser('${user}')">${user}</span>
          <button onclick="editUser('${user}')">更改</button>
          <button class="delete-btn" onclick="deleteUser('${user}')">刪除</button>
        </div>
      `).join('')
    : '<p>無已有任務，請輸入新大任務名稱</p>';
  userModal.classList.remove('hidden');
  console.log('任務模態框開啟');
}

// 關閉用戶模態框
function closeUserModal() {
  const userModal = document.getElementById('user-modal');
  if (!userModal) {
    console.error('任務模態框未找到');
    return;
  }
  userModal.classList.add('hidden');
  document.getElementById('username-input').value = '';
  console.log('任務模態框關閉');
}

// 切換用戶
function switchUser(user) {
  currentUser = user;
  localStorage.setItem('currentUser', currentUser);
  console.log(`切換到用戶: ${currentUser}`);
  loadTasks();
  updateUserDisplay();
  closeUserModal();
}

// 新增用戶
function addUser() {
  const usernameInput = document.getElementById('username-input');
  if (!usernameInput) {
    console.error('任務輸入框未找到');
    return;
  }
  const username = usernameInput.value.trim();
  if (!username) {
    console.warn('任務名稱為空');
    alert('請輸入大任務名稱');
    return;
  }
  if (users.includes(username)) {
    console.warn(`用戶 ${username} 已存在`);
    alert('任務名稱已存在，請直接點選或輸入新名稱');
    return;
  }
  users.push(username);
  saveUsers();
  currentUser = username;
  localStorage.setItem('currentUser', currentUser);
  console.log(`新增並切換到用戶: ${currentUser}`);
  loadTasks();
  updateUserDisplay();
  closeUserModal();
}

// 編輯用戶
function editUser(oldUsername) {
  const newUsername = prompt('輸入新的大任務名稱：', oldUsername)?.trim();
  if (!newUsername) {
    console.warn('新任務名稱為空或取消');
    alert('請輸入有效的新用戶名稱');
    return;
  }
  if (newUsername === oldUsername) {
    console.log('任務名稱未變更');
    return;
  }
  if (users.includes(newUsername)) {
    console.warn(`用戶 ${newUsername} 已存在`);
    alert('大任務名稱已存在，請輸入其他名稱');
    return;
  }
  users = users.map(u => u === oldUsername ? newUsername : u);
  if (currentUser === oldUsername) {
    currentUser = newUsername;
    localStorage.setItem('currentUser', currentUser);
  }
  const oldTasks = localStorage.getItem(`tasks_${oldUsername}`);
  if (oldTasks) {
    localStorage.setItem(`tasks_${newUsername}`, oldTasks);
    localStorage.removeItem(`tasks_${oldUsername}`);
  }
  saveUsers();
  console.log(`用戶從 ${oldUsername} 變更為 ${newUsername}`);
  loadTasks();
  updateUserDisplay();
  openUserModal();
}

// 刪除用戶
function deleteUser(user) {
  if (!confirm(`確定要刪除用戶 ${user} 及其所有任務？`)) {
    console.log(`取消刪除用戶 ${user}`);
    return;
  }
  if (user === currentUser) {
    currentUser = null;
    localStorage.removeItem('currentUser');
    tasks = [];
    renderTasks();
    updateUserDisplay();
  }
  users = users.filter(u => u !== user);
  localStorage.removeItem(`tasks_${user}`);
  saveUsers();
  console.log(`刪除用戶 ${user}`);
  openUserModal();
}

// 關閉應用程式
function closeApp() {
  console.log('嘗試關閉應用程式');
  window.close();
  setTimeout(() => {
    alert('無法自動關閉視窗，請手動關閉標籤頁');
    window.location.href = '/todo-app/';
  }, 500);
}

// 更新用戶顯示
function updateUserDisplay() {
  const currentUserElement = document.getElementById('current-user');
  if (!currentUserElement) {
    console.error('當前任務元素未找到');
    return;
  }
  currentUserElement.textContent = currentUser || '未登錄';
  console.log('更新任務顯示:', currentUser);
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', initApp);