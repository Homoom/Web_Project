// 多媒体文件管理器
class MediaManager {
  constructor() {
    this.uploads = new Map();
    this.storageKey = 'flow-media-cache';
    this.loadCache();
  }

  // 上传媒体文件
  async uploadFile(file, nodeId) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nodeId', nodeId);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (result.success) {
        this.cacheMedia(nodeId, result.url);
        return result.url;
      }
    } catch (error) {
      console.error('上传失败:', error);
      return null;
    }
  }

  // 缓存媒体URL
  cacheMedia(nodeId, url) {
    const cache = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    cache[nodeId] = url;
    localStorage.setItem(this.storageKey, JSON.stringify(cache));
    this.uploads.set(nodeId, url);
  }

  // 加载缓存
  loadCache() {
    const cache = JSON.parse(localStorage.getItem(this.storageKey)) || {};
    Object.entries(cache).forEach(([nodeId, url]) => {
      this.uploads.set(nodeId, url);
    });
  }

  // 获取节点媒体URL
  getMediaUrl(nodeId) {
    return this.uploads.get(nodeId);
  }
}

// 媒体节点配置面板
function createMediaConfigPanel(node) {
  const panel = document.createElement('div');
  panel.className = 'media-config-panel';

  switch(node.type) {
    case 'IMAGE':
      panel.innerHTML = `
        <div class="form-group">
          <label>图片URL</label>
          <input type="text" class="media-url" value="${node.config.url}">
          <input type="file" accept="image/*" class="media-upload">
        </div>
        <div class="form-group">
          <label>宽度</label>
          <input type="number" class="media-width" value="${node.config.width}">
        </div>
        <div class="form-group">
          <label>高度</label>
          <input type="number" class="media-height" value="${node.config.height}">
        </div>
      `;
      break;

    case 'VIDEO':
      panel.innerHTML = `
        <div class="form-group">
          <label>视频URL</label>
          <input type="text" class="media-url" value="${node.config.url}">
          <input type="file" accept="video/*" class="media-upload">
        </div>
        <div class="form-group">
          <input type="checkbox" id="autoplay" ${node.config.autoplay ? 'checked' : ''}>
          <label for="autoplay">自动播放</label>
        </div>
        <div class="form-group">
          <input type="checkbox" id="controls" ${node.config.controls ? 'checked' : ''}>
          <label for="controls">显示控件</label>
        </div>
      `;
      break;

    case 'AUDIO':
      panel.innerHTML = `
        <div class="form-group">
          <label>音频URL</label>
          <input type="text" class="media-url" value="${node.config.url}">
          <input type="file" accept="audio/*" class="media-upload">
        </div>
        <div class="form-group">
          <input type="checkbox" id="loop" ${node.config.loop ? 'checked' : ''}>
          <label for="loop">循环播放</label>
        </div>
      `;
      break;
  }

  return panel;
}

export const mediaManager = new MediaManager();
