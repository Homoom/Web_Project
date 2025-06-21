// 协同编辑UI组件
class CollaborationUI {
  constructor() {
    this.container = null;
    this.userList = null;
  }

  // 初始化UI
  init() {
    this.createContainer();
    this.setupEventListeners();
  }

  // 创建容器
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'collab-ui';
    this.container.innerHTML = `
      <div class="status-bar">
        <span class="connection-status">连接中...</span>
        <span class="peer-count">0人在线</span>
      </div>
      <div class="user-list-container">
        <h4>协作用户</h4>
        <ul class="user-list"></ul>
      </div>
    `;
    document.body.appendChild(this.container);
  }

  // 更新连接状态
  updateConnectionStatus(connected) {
    const statusEl = this.container.querySelector('.connection-status');
    statusEl.textContent = connected ? '已连接' : '已断开';
    statusEl.className = `connection-status ${connected ? 'connected' : 'disconnected'}`;
  }

  // 更新用户列表
  updateUserList(peers) {
    const listEl = this.container.querySelector('.user-list');
    const countEl = this.container.querySelector('.peer-count');
    
    listEl.innerHTML = '';
    peers.forEach(peer => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="user-color" style="background-color: ${peer.color}"></span>
        <span class="user-name">${peer.name}</span>
      `;
      listEl.appendChild(li);
    });
    
    countEl.textContent = `${peers.size}人在线`;
  }

  // 设置事件监听
  setupEventListeners() {
    collabService.on('connection', (connected) => {
      this.updateConnectionStatus(connected);
    });
    
    collabService.on('peers', (peers) => {
      this.updateUserList(peers);
    });
  }
}

// 协同编辑样式
const style = document.createElement('style');
style.textContent = `
#collab-ui {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(255,255,255,0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 12px;
  z-index: 100;
  max-width: 250px;
}

.peer-cursor {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 99;
}

.connection-status {
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.connection-status.connected {
  background: #4CAF50;
  color: white;
}

.connection-status.disconnected {
  background: #F44336;
  color: white;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}

.user-list li {
  display: flex;
  align-items: center;
  padding: 4px 0;
}

.user-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}
`;
document.head.appendChild(style);

export const collabUI = new CollaborationUI();
