// 添加批注UI相关功能
function setupCommentUI() {
  // 右键菜单添加批注选项
  document.addEventListener('contextmenu', (e) => {
    const node = e.target.closest('.flow-node');
    if (node) {
      e.preventDefault();
      showNodeContextMenu(node, e.clientX, e.clientY);
    }
  });

  // 显示节点右键菜单
  function showNodeContextMenu(node, x, y) {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    menu.innerHTML = `
      <div class="menu-item" data-action="add-comment">添加批注</div>
      <div class="menu-item" data-action="view-comments">查看批注(${commentSystem.getNodeComments(node.id).length})</div>
    `;
    
    document.body.appendChild(menu);
    
    // 菜单项点击处理
    menu.querySelectorAll('.menu-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.action === 'add-comment') {
          showCommentEditor(node);
        } else {
          showCommentList(node);
        }
        menu.remove();
      });
    });

    // 点击外部关闭菜单
    setTimeout(() => {
      const closeMenu = () => {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      };
      document.addEventListener('click', closeMenu);
    }, 100);
  }

  // 显示批注编辑器
  function showCommentEditor(node) {
    const editor = document.createElement('div');
    editor.className = 'comment-editor';
    editor.innerHTML = `
      <h4>添加批注</h4>
      <textarea placeholder="输入批注内容..."></textarea>
      <div class="editor-actions">
        <button class="cancel">取消</button>
        <button class="submit">提交</button>
      </div>
    `;
    
    document.body.appendChild(editor);
    
    // 事件处理
    editor.querySelector('.cancel').addEventListener('click', () => editor.remove());
    editor.querySelector('.submit').addEventListener('click', () => {
      const content = editor.querySelector('textarea').value.trim();
      if (content) {
        commentSystem.addComment(node.id, content);
        updateNodeCommentBadge(node);
        editor.remove();
      }
    });
  }

  // 更新节点批注标记
  function updateNodeCommentBadge(node) {
    const count = commentSystem.getNodeComments(node.id).length;
    let badge = node.querySelector('.comment-badge');
    if (!badge && count > 0) {
      badge = document.createElement('div');
      badge.className = 'comment-badge';
      node.appendChild(badge);
    }
    if (badge) {
      badge.textContent = count > 0 ? count : '';
      badge.style.display = count > 0 ? '' : 'none';
    }
  }
}

// 初始化批注UI
setupCommentUI();

// 批注系统核心类
class CommentSystem {
  constructor() {
    this.comments = JSON.parse(localStorage.getItem('flow-comments')) || {};
    this.currentEditId = null;
  }

  // 添加/更新批注
  addComment(nodeId, content, status = 'pending') {
    if (!this.comments[nodeId]) {
      this.comments[nodeId] = [];
    }
    
    const newComment = {
      id: Date.now().toString(),
      content,
      status,
      createdAt: new Date().toISOString(),
      resolvedAt: status === 'resolved' ? new Date().toISOString() : null
    };

    this.comments[nodeId].push(newComment);
    this.saveComments();
    return newComment;
  }

  // 保存到本地存储
  saveComments() {
    localStorage.setItem('flow-comments', JSON.stringify(this.comments));
  }

  // 获取节点批注
  getNodeComments(nodeId) {
    return this.comments[nodeId] || [];
  }

  // 更新批注状态
  updateCommentStatus(nodeId, commentId, newStatus) {
    const comment = this.comments[nodeId]?.find(c => c.id === commentId);
    if (comment) {
      comment.status = newStatus;
      comment.resolvedAt = newStatus === 'resolved' ? new Date().toISOString() : null;
      this.saveComments();
    }
  }
}

// 初始化批注系统
const commentSystem = new CommentSystem();

// 智能配色系统
class ColorScheme {
  constructor() {
    this.presets = JSON.parse(localStorage.getItem('color-presets')) || {
      default: {
        input: { base: '#4CAF50', text: '#FFFFFF' },
        process: { base: '#2196F3', text: '#FFFFFF' },
        output: { base: '#FF9800', text: '#000000' },
        feedback: { base: '#9C27B0', text: '#FFFFFF' }
      },
      modern: {
        input: { base: '#00ACC1', text: '#FFFFFF' },
        process: { base: '#5C6BC0', text: '#FFFFFF' },
        output: { base: '#FF7043', text: '#000000' },
        feedback: { base: '#26A69A', text: '#FFFFFF' }
      }
    };
    this.currentPreset = 'default';
  }

  // 获取节点颜色
  getNodeColors(nodeType) {
    const preset = this.presets[this.currentPreset];
    return preset[nodeType.toLowerCase()] || preset.process;
  }

  // 生成连接线渐变
  generateConnectionGradient(sourceType, targetType) {
    const sourceColor = this.getNodeColors(sourceType).base;
    const targetColor = this.getNodeColors(targetType).base;
    return `linear-gradient(90deg, ${sourceColor}, ${targetColor})`;
  }

  // 动态调整亮度
  adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#", ""), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    return `#${(
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1)}`;
  }

  // 添加新配色方案
  addCustomPreset(name, colors) {
    this.presets[name] = colors;
    this.savePresets();
  }
  
  savePresets() {
    localStorage.setItem('color-presets', JSON.stringify(this.presets));
  }
}

// 初始化配色系统
const colorScheme = new ColorScheme();

// 添加配色控制UI
function setupColorControls() {
  const controls = document.createElement('div');
  controls.className = 'color-controls';
  controls.innerHTML = `
    <h4>配色方案</h4>
    <select id="color-preset">
      ${Object.keys(colorScheme.presets).map(preset => `
        <option value="${preset}">${preset}</option>
      `).join('')}
    </select>
    <button id="random-colors">随机配色</button>
  `;
  document.getElementById('project-sidebar').appendChild(controls);

  // 事件监听
  document.getElementById('color-preset').addEventListener('change', (e) => {
    colorScheme.currentPreset = e.target.value;
    document.dispatchEvent(new Event('colorSchemeChanged'));
  });
  
  document.getElementById('random-colors').addEventListener('click', () => {
    colorScheme.currentPreset = 'random';
    document.dispatchEvent(new Event('colorSchemeChanged'));
  });
}

// 初始化配色UI
setupColorControls();

// 响应配色变化
document.addEventListener('colorSchemeChanged', () => {
  // 重新应用所有节点样式
  document.querySelectorAll('.flow-node').forEach(node => {
    applyNodeStyle(node, node.dataset.type);
  });
  
  // 更新所有连接线
  updateAllConnections();
});

// 更新节点样式
function applyNodeStyle(nodeElement, nodeType) {
  const colors = colorScheme.getNodeColors(nodeType);
  nodeElement.style.backgroundColor = colors.base;
  nodeElement.style.color = colors.text;
}

// 流程图核心逻辑
// 节点类型定义
const NODE_TYPES = {
  INPUT: { 
    allowedTargets: ['PROCESS'], 
    maxInConnections: 0 
  },
  PROCESS: { 
    allowedTargets: ['OUTPUT', 'FEEDBACK'] 
  },
  FORMULA: {
    allowedTargets: ['PROCESS', 'OUTPUT']
  },
  IMAGE: {
    name: '图片',
    icon: '🖼️',
    color: '#FF9800',
    createConfig: () => ({
      url: '',
      width: 200,
      height: 150
    })
  },
  VIDEO: {
    name: '视频',
    icon: '🎬',
    color: '#E91E63', 
    createConfig: () => ({
      url: '',
      autoplay: false,
      controls: true,
      width: 320,
      height: 180
    })
  },
  AUDIO: {
    name: '音频',
    icon: '🎵',
    color: '#9C27B0',
    createConfig: () => ({
      url: '',
      autoplay: false,
      loop: false
    })
  }
};

// 更新节点渲染逻辑
function renderMediaNode(node) {
  const container = document.createElement('div');
  container.className = `media-node ${node.type.toLowerCase()}`;
  
  switch(node.type) {
    case 'IMAGE':
      container.innerHTML = `
        <img src="${node.config.url}" 
             style="width:${node.config.width}px;
                    height:${node.config.height}px"
             onerror="this.src='placeholder.jpg'">
      `;
      break;
      
    case 'VIDEO':
      container.innerHTML = `
        <video ${node.config.autoplay ? 'autoplay' : ''}
               ${node.config.controls ? 'controls' : ''}
               width="${node.config.width}"
               height="${node.config.height}"
               src="${node.config.url}">
        </video>
      `;
      break;
      
    case 'AUDIO':
      container.innerHTML = `
        <audio ${node.config.autoplay ? 'autoplay' : ''}
               ${node.config.loop ? 'loop' : ''}
               ${node.config.controls ? 'controls' : ''}
               src="${node.config.url}">
        </audio>
      `;
      break;
  }
  
  return container;
}

// 更新节点创建菜单
function updateNodeCreationMenu() {
  const menu = document.getElementById('node-type-menu');
  Object.entries(NODE_TYPES).forEach(([type, config]) => {
    if (!menu.querySelector(`.${type.toLowerCase()}`)) {
      const item = document.createElement('div');
      item.className = `menu-item ${type.toLowerCase()}`;
      item.innerHTML = `${config.icon} ${config.name}`;
      item.onclick = () => createNode(type);
      menu.appendChild(item);
    }
  });
}

class FlowErrorDetector {
  constructor() {
    this.errorMap = new Map();
  }

  // 实时验证方法
  validateConnection(source, target) {
    const errors = [];
    // 连接规则验证...
    return errors;
  }

  checkNodeRules(node) {
    const rules = NODE_TYPES[node.type];
    if (!rules) return ['未知节点类型'];
    
    const errors = [];
    if (node.connections.in > rules.maxInConnections) {
      errors.push(`输入连接数超过限制 (${rules.maxInConnections})`);
    }
    return errors;
  }

  // 新增实时监听方法
  setupRealTimeMonitoring() {
    // 监听节点变化
    MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          this.validateNode(mutation.target);
        }
      });
    });

    // 监听连接创建
    document.addEventListener('connectionCreated', (e) => {
      const errors = this.validateConnection(e.detail.source, e.detail.target);
      if (errors.length > 0) {
        this.highlightError(e.detail.connectionElement, errors);
      }
    });
  }

  highlightError(element, errors) {
    element.classList.add('error-connection');
    element.setAttribute('data-error-tooltip', errors.join('\\n'));
  }
}

// 初始化错误检测系统
const errorDetector = new FlowErrorDetector();
// 初始化并启动监控
errorDetector.setupRealTimeMonitoring();

// 项目管理类
class ProjectManager {
  constructor() {
    this.projects = JSON.parse(localStorage.getItem('flow-projects')) || [];
    this.currentProject = null;
    this.initUI();
  }

  initUI() {
    document.getElementById('new-project').addEventListener('click', () => {
      this.createProject(`新项目_${Date.now()}`);
    });
    
    this.renderProjectList();
  }

  createProject(name) {
    const project = {
      id: Date.now(),
      name,
      data: { nodes: [], connections: [] },
      lastModified: new Date().toISOString()
    };
    this.projects.push(project);
    this.saveProjects();
    this.loadProject(project.id);
    return project;
  }

  loadProject(projectId) {
    this.currentProject = this.projects.find(p => p.id === projectId);
    // 触发流程图重新加载
    document.dispatchEvent(new CustomEvent('projectChanged', {
      detail: this.currentProject.data
    }));
    this.renderProjectList();
  }

  saveCurrentProject(data) {
    if (!this.currentProject) return;
    
    this.currentProject.data = data;
    this.currentProject.lastModified = new Date().toISOString();
    this.saveProjects();
  }

  saveProjects() {
    localStorage.setItem('flow-projects', JSON.stringify(this.projects));
  }

  renderProjectList() {
    const listEl = document.getElementById('project-list');
    listEl.innerHTML = this.projects.map(project => `
      <div class="project-item ${project.id === this.currentProject?.id ? 'active' : ''}" 
           data-id="${project.id}">
        <h4>${project.name}</h4>
        <small>${new Date(project.lastModified).toLocaleString()}</small>
      </div>
    `).join('');
    
    listEl.querySelectorAll('.project-item').forEach(item => {
      item.addEventListener('click', () => {
        this.loadProject(Number(item.dataset.id));
      });
    });
  }

  exportProject(projectId) {
    const project = this.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const dataStr = JSON.stringify(project.data);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name}.flow`;
    a.click();
  }

  importProject(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        this.createProject(`导入_${Date.now()}`).data = data;
      } catch (err) {
        console.error('导入失败:', err);
      }
    };
    reader.readAsText(file);
  }

  createVersion() {
    if (!this.currentProject) return;
    
    if (!this.currentProject.versions) {
      this.currentProject.versions = [];
    }
    
    this.currentProject.versions.push({
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(this.currentProject.data))
    });
    
    this.saveProjects();
  }
}

// 初始化项目管理
const projectManager = new ProjectManager();

// 监听流程图变化自动保存
document.addEventListener('flowChanged', (e) => {
  projectManager.saveCurrentProject(e.detail);
});

// 添加UI操作按钮
function setupProjectControls() {
  const controls = document.createElement('div');
  controls.innerHTML = `
    <div class="project-controls">
      <button id="export-project">导出当前项目</button>
      <input type="file" id="import-project" accept=".flow" style="display:none">
      <button id="import-trigger">导入项目</button>
      <button id="create-version">创建版本</button>
    </div>
  `;
  document.getElementById('project-sidebar').appendChild(controls);

  // 绑定事件
  document.getElementById('export-project').addEventListener('click', () => {
    projectManager.exportProject(projectManager.currentProject?.id);
  });
  
  document.getElementById('import-trigger').addEventListener('click', () => {
    document.getElementById('import-project').click();
  });
  
  document.getElementById('import-project').addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      projectManager.importProject(e.target.files[0]);
    }
  });
  
  document.getElementById('create-version').addEventListener('click', () => {
    projectManager.createVersion();
  });
}

// 初始化项目控制UI
setupProjectControls();

// 错误可视化样式
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .error-node { stroke: #ff4444 !important; }
    .error-connection { stroke-dasharray: 5,5; }
  </style>
`);

// 添加快捷键支持
class KeyboardShortcuts {
  constructor(flowEditor) {
    this.flowEditor = flowEditor;
    this.setupListeners();
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      // 删除选中节点
      if (e.key === 'Delete' && this.flowEditor.selectedNode) {
        this.flowEditor.deleteNode(this.flowEditor.selectedNode);
      }
      
      // 复制粘贴
      if (e.ctrlKey && e.key === 'c' && this.flowEditor.selectedNode) {
        this.copyNode(this.flowEditor.selectedNode);
      }
      if (e.ctrlKey && e.key === 'v') {
        this.pasteNode();
      }
      
      // 撤销重做
      if (e.ctrlKey && e.key === 'z') {
        this.flowEditor.undo();
      }
      if (e.ctrlKey && e.key === 'y') {
        this.flowEditor.redo();
      }
    });
  }
  
copyNode(node) {
    this.copiedNode = JSON.parse(JSON.stringify(node));
  }
  
  pasteNode() {
    if (this.copiedNode) {
      const newNode = {...this.copiedNode, id: Date.now()};
      this.flowEditor.addNode(newNode);
    }
  }

  setupNodeInteractions() {
    // Shift+拖拽快速连线
    this.flowEditor.canvas.addEventListener('mousedown', (e) => {
      if (e.shiftKey && e.target.classList.contains('flow-node')) {
        this.startQuickConnect(e.target);
      }
    });

    // Ctrl+Click多选
    this.flowEditor.canvas.addEventListener('click', (e) => {
      if (e.ctrlKey && e.target.classList.contains('flow-node')) {
        this.toggleNodeSelection(e.target);
      }
    });
  }

  showShortcutHelp() {
    const helpPanel = document.createElement('div');
    helpPanel.innerHTML = `
      <div class="shortcut-help">
        <h3>快捷键</h3>
        <ul>
          <li>Delete: 删除节点</li>
          <li>Ctrl+C/V: 复制/粘贴</li>
          <li>Ctrl+Z/Y: 撤销/重做</li>
          <li>Shift+拖拽: 快速连线</li>
        </ul>
      </div>
    `;
    document.body.appendChild(helpPanel);
  }
}

// 添加公式节点支持
class FormulaNode {
  constructor(content) {
    this.type = 'formula';
    this.content = content;
    this.id = Date.now();
  }

  render() {
    const node = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
    node.innerHTML = `
      <div xmlns="http://www.w3.org/1999/xhtml" class="formula-node">
        <div class="formula-preview">\\(${this.content}\\)</div>
        <button class="edit-formula">编辑</button>
      </div>
    `;
    node.setAttribute('width', '200');
    node.setAttribute('height', '100');
    return node;
  }
}

// 添加公式编辑器对话框
function showFormulaEditor(node) {
  const editor = document.createElement('div');
  editor.innerHTML = `
    <div class="formula-editor">
      <textarea>${node.content}</textarea>
      <div class="preview"></div>
      <button class="save">保存</button>
    </div>
  `;
  document.body.appendChild(editor);
  
  // 实时预览
  editor.querySelector('textarea').addEventListener('input', (e) => {
    editor.querySelector('.preview').innerHTML = `\\(${e.target.value}\\)`;
    MathJax.typeset();
  });
}

// 初始化快捷键系统
const shortcuts = new KeyboardShortcuts(flowEditor);

// 更新样式
document.head.insertAdjacentHTML('beforeend', `
  <style>
    .shortcut-help {
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: white;
      padding: 10px;
      border-radius: 5px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }
    .formula-editor {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 5px;
      box-shadow: 0 0 20px rgba(0,0,0,0.2);
      z-index: 1000;
    }
    .formula-editor textarea {
      width: 300px;
      height: 100px;
      margin-bottom: 10px;
    }
    .formula-node button {
      margin-top: 5px;
    }
  </style>
`);

// 添加到节点创建菜单
function addFormulaNode() {
  const formulaNode = new FormulaNode('E = mc^2');
  flowEditor.addNode(formulaNode);
  MathJax.typeset();
}

// 添加公式节点按钮
const formulaBtn = document.createElement('button');
formulaBtn.textContent = '添加公式';
formulaBtn.addEventListener('click', addFormulaNode);
document.body.appendChild(formulaBtn);

// 处理公式渲染错误
window.addEventListener('error', (e) => {
  if (e.message.includes('MathJax')) {
    console.warn('公式渲染错误:', e);
    // 显示错误提示
  }
});
