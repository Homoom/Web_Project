// 实时协同服务核心模块
class CollaborationService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.peers = new Map(); // 当前协作用户
    this.operationsQueue = []; // 待同步操作队列
    this.serverUrl = 'wss://flow-collab.example.com';
  }

  // 初始化WebSocket连接
  connect(projectId, userId) {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${this.serverUrl}?projectId=${projectId}&userId=${userId}`);

      this.socket.onopen = () => {
        this.connected = true;
        this.flushOperationsQueue();
        resolve();
      };

      this.socket.onmessage = (event) => {
        const { type, data } = JSON.parse(event.data);
        this.handleIncomingMessage(type, data);
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onclose = () => {
        this.connected = false;
        console.log('WebSocket disconnected');
      };
    });
  }

  // 处理接收到的消息
  handleIncomingMessage(type, data) {
    switch (type) {
      case 'operation':
        this.applyRemoteOperation(data);
        break;
      case 'presence':
        this.updatePeerPresence(data);
        break;
      case 'cursor':
        this.updatePeerCursor(data);
        break;
    }
  }

  // 发送本地操作
  sendOperation(op) {
    if (this.connected) {
      this.socket.send(JSON.stringify({
        type: 'operation',
        data: op
      }));
    } else {
      this.operationsQueue.push(op);
    }
  }

  // 发送光标位置
  sendCursorPosition(position) {
    if (this.connected) {
      this.socket.send(JSON.stringify({
        type: 'cursor',
        data: position
      }));
    }
  }

// 应用远程操作（OT算法核心）
  applyRemoteOperation(remoteOp) {
    // 获取当前文档状态
    const currentState = flowEditor.getState();
    
    // 应用转换后的操作
    const transformedOp = OperationTransformer.transform(remoteOp, currentState);
    if (transformedOp) {
      flowEditor.applyOperation(transformedOp);
    }
  }

  // 更新协作用户状态
  updatePeerPresence(peers) {
    this.peers = new Map(peers.map(p => [p.userId, p]));
    this.renderPeerCursors();
  }

  // 更新其他用户的光标位置
  updatePeerCursor({ userId, position }) {
    if (this.peers.has(userId)) {
      this.peers.get(userId).cursor = position;
      this.renderPeerCursors();
    }
  }

// 渲染所有协作用户的光标
  renderPeerCursors() {
    // 清除旧光标
    document.querySelectorAll('.peer-cursor').forEach(el => el.remove());

    // 渲染新光标
    this.peers.forEach(peer => {
      if (peer.cursor) {
        const cursor = document.createElement('div');
        cursor.className = 'peer-cursor';
        cursor.style.left = `${peer.cursor.x}px`;
        cursor.style.top = `${peer.cursor.y}px`;
        cursor.style.backgroundColor = peer.color;
        cursor.title = peer.name;
        document.getElementById('flow-canvas').appendChild(cursor);
      }
    });
  }
}

export const collabService = new CollaborationService();

// 操作转换算法实现
class OperationTransformer {
  static transform(clientOp, serverOp) {
    // 节点创建/删除操作转换
    if (clientOp.type === 'createNode' && serverOp.type === 'createNode') {
      if (clientOp.nodeId === serverOp.nodeId) {
        return null; // 冲突操作，丢弃客户端操作
      }
      return clientOp; // 无冲突
    }

    // 节点移动操作转换
    if (clientOp.type === 'moveNode' && serverOp.type === 'moveNode') {
      if (clientOp.nodeId === serverOp.nodeId) {
        return {
          ...clientOp,
          x: clientOp.x + serverOp.dx,
          y: clientOp.y + serverOp.dy
        };
      }
      return clientOp;
    }

    // 默认返回原始操作
    return clientOp;
  }
}

// 导出初始化方法
export function initCollaboration(projectId, userId) {
  return collabService.connect(projectId, userId)
    .then(() => {
      console.log('Collaboration connected');
      // 设置光标移动跟踪
      document.getElementById('flow-canvas')
        .addEventListener('mousemove', (e) => {
          collabService.sendCursorPosition({
            x: e.clientX,
            y: e.clientY
          });
        });
    });
}
