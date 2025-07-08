// 全局變數
let tasks = [];
let currentBigTask = null;
let bigTasks = [];

// 初始化應用程式
function initApp() {
  try {
    bigTasks = JSON.parse(localStorage.getItem('bigTasks')) || [];
    currentBigTask = localStorage.getItem('currentBigTask');
    console.log('初始化 - 大任務:', bigTasks, '當前大任務:', currentBigTask);
    updateBigTaskDisplay();
    if (currentBigTask) loadTasks();
    else openBigTaskModal();
    bindEventListeners();
  } catch (error) {
    console.error('初始化失敗:', error);
    bigTasks = [];
    currentBigTask = null;
    tasks = [];
    updateBigTaskDisplay();
    openBigTaskModal();
  }
}

// 綁定事件監聽器
function bindEventListeners() {
  const eventMap = {
    'add-task-btn': openTaskModal,
    'switch-big-task-btn': openBigTaskModal,
    'add-task-submit-btn': addTask,
    'close-modal-btn': closeTaskModal,
    'add-big-task-btn': addBigTask,
    'close-big-task-modal-btn': closeBigTaskModal,
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
  if (!currentBigTask) {
    console.warn('無當前大任務，無法載入任務');
    tasks = [];
    renderTasks();
    return;
  }
  try {
    tasks = JSON.parse(localStorage.getItem(`tasks_${currentBigTask}`)) || [];
    console.log(`載入 ${currentBigTask} 的任務:`, tasks);
    renderTasks();
  } catch (error) {
    console.error(`載入 ${currentBigTask} 的任務失敗:`, error);
    tasks = [];
    renderTasks();
  }
}

// 儲存任務
function saveTasks() {
  if (!currentBigTask) {
    console.warn('無當前大任務，無法儲存任務');
    return;
  }
  try {
    localStorage.setItem(`tasks_${currentBigTask}`, JSON.stringify(tasks));
    console.log(`儲存 ${currentBigTask} 的任務:`, tasks);
  } catch (error) {
    console.error(`儲存 ${currentBigTask} 的任務失敗:`, error);
    alert('儲存任務失敗，請檢查瀏覽器設定');
  }
}

// 儲存大任務列表
function saveBigTasks() {
  try {
    localStorage.setItem('bigTasks', JSON.stringify(bigTasks));
    console.log('儲存大任務列表:', bigTasks);
  } catch (error) {
    console.error('儲存大任務列表失敗:', error);
    alert('儲存大任務列表失敗，請檢查瀏覽器設定');
  }
}

// 新增任務
function addTask() {
  if (!currentBigTask) {
    console.warn('無選擇大任務，開啟大任務模態框');
    alert('請先選擇大任務');
    openBigTaskModal();
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
  console.log(`新增任務 (${currentBigTask}):`, task);
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
  if (!currentBigTask) {
    taskList.innerHTML = '<p>請選擇大任務以查看任務</p>';
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
  console.log(`切換任務 ${id} 狀態 (${currentBigTask})`);
  saveTasks();
  renderTasks();
}

// 刪除任務
function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  console.log(`刪除任務 ${id} (${currentBigTask})`);
  saveTasks();
  renderTasks();
}

// 開啟任務模態框
function openTaskModal() {
  if (!currentBigTask) {
    console.warn('無選擇大任務，開啟大任務模態框');
    alert('請先選擇大任務');
    openBigTaskModal();
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

// 開啟大任務模態框
function openBigTaskModal() {
  const bigTaskModal = document.getElementById('big-task-modal');
  const bigTaskList = document.getElementById('big-task-list');
  if (!bigTaskModal || !bigTaskList) {
    console.error('大任務模態框或大任務列表未找到');
    return;
  }
  bigTaskList.innerHTML = bigTasks.length
    ? bigTasks.map(bigTask => `
        <div class="big-task-list-item">
          <span onclick="switchBigTask('${bigTask}')">${bigTask}</span>
          <button onclick="editBigTask('${bigTask}')">更改</button>
          <button class="delete-btn" onclick="deleteBigTask('${bigTask}')">刪除</button>
        </div>
      `).join('')
    : '<p>無已有大任務，請輸入新大任務名稱</p>';
  bigTaskModal.classList.remove('hidden');
  console.log('大任務模態框開啟');
}

// 關閉大任務模態框
function closeBigTaskModal() {
  const bigTaskModal = document.getElementById('big-task-modal');
  if (!bigTaskModal) {
    console.error('大任務模態框未找到');
    return;
  }
  bigTaskModal.classList.add('hidden');
  document.getElementById('big-task-input').value = '';
  console.log('大任務模態框關閉');
}

// 切換大任務
function switchBigTask(bigTask) {
  currentBigTask = bigTask;
  localStorage.setItem('currentBigTask', currentBigTask);
  console.log(`切換到大任務: ${currentBigTask}`);
  loadTasks();
  updateBigTaskDisplay();
  closeBigTaskModal();
}

// 新增大任務
function addBigTask() {
  const bigTaskInput = document.getElementById('big-task-input');
  if (!bigTaskInput) {
    console.error('大任務輸入框未找到');
    return;
  }
  const bigTask = bigTaskInput.value.trim();
  if (!bigTask) {
    console.warn('大任務名稱為空');
    alert('請輸入大任務名稱');
    return;
  }
  if (bigTasks.includes(bigTask)) {
    console.warn(`大任務 ${bigTask} 已存在`);
    alert('大任務名稱已存在，請直接點選或輸入新名稱');
    return;
  }
  bigTasks.push(bigTask);
  saveBigTasks();
  currentBigTask = bigTask;
  localStorage.setItem('currentBigTask', currentBigTask);
  console.log(`新增並切換到大任務: ${currentBigTask}`);
  loadTasks();
  updateBigTaskDisplay();
  closeBigTaskModal();
}

// 編輯大任務
function editBigTask(oldBigTask) {
  const newBigTask = prompt('輸入新的大任務名稱：', oldBigTask)?.trim();
  if (!newBigTask) {
    console.warn('新大任務名稱為空或取消');
    alert('請輸入有效的新大任務名稱');
    return;
  }
  if (newBigTask === oldBigTask) {
    console.log('大任務名稱未變更');
    return;
  }
  if (bigTasks.includes(newBigTask)) {
    console.warn(`大任務 ${newBigTask} 已存在`);
    alert('大任務名稱已存在，請輸入其他名稱');
    return;
  }
  bigTasks = bigTasks.map(b => b === oldBigTask ? newBigTask : b);
  if (currentBigTask === oldBigTask) {
    currentBigTask = newBigTask;
    localStorage.setItem('currentBigTask', currentBigTask);
  }
  const oldTasks = localStorage.getItem(`tasks_${oldBigTask}`);
  if (oldTasks) {
    localStorage.setItem(`tasks_${newBigTask}`, oldTasks);
    localStorage.removeItem(`tasks_${oldBigTask}`);
  }
  saveBigTasks();
  console.log(`大任務從 ${oldBigTask} 變更為 ${newBigTask}`);
  loadTasks();
  updateBigTaskDisplay();
  openBigTaskModal();
}

// 刪除大任務
function deleteBigTask(bigTask) {
  if (!confirm(`確定要刪除大任務 ${bigTask} 及其所有任務？`)) {
    console.log(`取消刪除大任務 ${bigTask}`);
    return;
  }
  if (bigTask === currentBigTask) {
    currentBigTask = null;
    localStorage.removeItem('currentBigTask');
    tasks = [];
    renderTasks();
    updateBigTaskDisplay();
  }
  bigTasks = bigTasks.filter(b => b !== bigTask);
  localStorage.removeItem(`tasks_${bigTask}`);
  saveBigTasks();
  console.log(`刪除大任務 ${bigTask}`);
  openBigTaskModal();
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

// 更新大任務顯示
function updateBigTaskDisplay() {
  const currentBigTaskElement = document.getElementById('current-big-task');
  if (!currentBigTaskElement) {
    console.error('當前大任務元素未找到');
    return;
  }
  currentBigTaskElement.textContent = currentBigTask || '未登錄';
  console.log('更新大任務顯示:', currentBigTask);
}

// 初始化應用程式
document.addEventListener('DOMContentLoaded', initApp);