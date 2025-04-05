/**
 * Zentab
 * popup.js - 弹出界面交互脚本
 */

// DOM 元素
const elements = {
  // 标签页切换
  tabBtns: document.querySelectorAll('.tab-btn'),
  tabPanes: document.querySelectorAll('.tab-pane'),
  
  // 设置面板
  inactiveThresholdHours: document.getElementById('inactive-threshold-hours'),
  inactiveThresholdMinutes: document.getElementById('inactive-threshold-minutes'),
  enableNotifications: document.getElementById('enable-notifications'),
  languageSelect: document.getElementById('language-select'),
  saveSettingsBtn: document.getElementById('save-settings'),
  
  // 历史记录面板
  historyList: document.getElementById('history-list'),
  refreshHistoryBtn: document.getElementById('refresh-history'),
  clearHistoryBtn: document.getElementById('clear-history'),
  historySearch: document.getElementById('history-search'),
  clearSearchBtn: document.getElementById('clear-search'),
  
  // 白名单面板
  whitelistUrl: document.getElementById('whitelist-url'),
  addToWhitelistBtn: document.getElementById('add-to-whitelist'),
  addCurrentToWhitelistBtn: document.getElementById('add-current-to-whitelist'),
  whitelistList: document.getElementById('whitelist-list'),
  
  // 提示框
  toast: document.getElementById('toast')
};

// 存储所有历史记录，用于搜索
let allClosedTabs = [];

// 添加自定义确认对话框功能
const confirmDialog = {
  // 对话框元素
  overlay: document.getElementById('confirm-dialog-overlay'),
  title: document.getElementById('confirm-dialog-title'),
  message: document.getElementById('confirm-dialog-message'),
  cancelBtn: document.getElementById('confirm-dialog-cancel'),
  confirmBtn: document.getElementById('confirm-dialog-confirm'),
  
  // 当前回调函数
  callback: null,
  
  // 显示确认对话框
  show(message, onConfirm, customTitle = null) {
    // 设置标题和按钮文本（使用i18n）
    this.title.textContent = customTitle || (window.i18n ? window.i18n.getText('confirm_dialog_title') : '确认');
    this.cancelBtn.textContent = window.i18n ? window.i18n.getText('confirm_cancel') : '取消';
    this.confirmBtn.textContent = window.i18n ? window.i18n.getText('confirm_ok') : '确定';
    
    // 设置消息
    this.message.textContent = message;
    
    // 存储回调函数
    this.callback = onConfirm;
    
    // 显示对话框
    this.overlay.style.display = 'flex';
    
    // 注册按钮事件
    this.cancelBtn.onclick = () => this.hide(false);
    this.confirmBtn.onclick = () => this.hide(true);
    
    // 阻止点击对话框外部关闭
    this.overlay.onclick = (e) => {
      if (e.target === this.overlay) {
        this.hide(false);
      }
    };
  },
  
  // 隐藏确认对话框
  hide(confirmed) {
    this.overlay.style.display = 'none';
    
    // 执行回调
    if (confirmed && typeof this.callback === 'function') {
      this.callback();
    }
    
    // 清除回调
    this.callback = null;
  }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 加载设置
  loadSettings();
  
  // 加载历史记录
  loadClosedTabs();
  
  // 加载白名单
  loadWhitelist();
  
  // 注册事件监听
  registerEventListeners();
});

// 注册事件监听
function registerEventListeners() {
  // 标签页切换
  elements.tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.tab;
      switchTab(tabId);
    });
  });
  
  // 保存设置
  elements.saveSettingsBtn.addEventListener('click', saveSettings);
  
  // 语言切换
  elements.languageSelect.addEventListener('change', () => {
    const newLang = elements.languageSelect.value;
    if (window.i18n) {
      window.i18n.setLanguage(newLang);
      window.i18n.updateUILanguage();
      
      // 重新加载历史记录和白名单以使用新语言
      loadClosedTabs();
      loadWhitelist();
    }
  });
  
  // 刷新历史记录
  elements.refreshHistoryBtn.addEventListener('click', loadClosedTabs);
  
  // 清空历史记录
  elements.clearHistoryBtn.addEventListener('click', clearHistory);
  
  // 历史记录搜索
  elements.historySearch.addEventListener('input', () => {
    searchHistory(elements.historySearch.value);
  });
  
  // 清除搜索
  elements.clearSearchBtn.addEventListener('click', () => {
    elements.historySearch.value = '';
    searchHistory('');
  });
  
  // 添加到白名单
  elements.addToWhitelistBtn.addEventListener('click', () => {
    const url = elements.whitelistUrl.value.trim();
    if (url) {
      addToWhitelist(url);
      elements.whitelistUrl.value = '';
    }
  });
  
  // 添加当前页面到白名单
  elements.addCurrentToWhitelistBtn.addEventListener('click', addCurrentPageToWhitelist);
}

// 切换标签页
function switchTab(tabId) {
  // 更新标签按钮状态
  elements.tabBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  
  // 更新标签内容状态
  elements.tabPanes.forEach(pane => {
    pane.classList.toggle('active', pane.id === `${tabId}-tab`);
  });
}

// 加载设置
async function loadSettings() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const { settings } = response;
    
    // 计算小时和分钟
    const totalMilliseconds = settings.inactiveThreshold;
    const totalMinutes = Math.floor(totalMilliseconds / (60 * 1000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // 更新设置表单
    elements.inactiveThresholdHours.value = hours;
    elements.inactiveThresholdMinutes.value = minutes;
    elements.enableNotifications.checked = settings.enableNotifications;
    
    // 设置语言选择
    if (settings.language && elements.languageSelect) {
      elements.languageSelect.value = settings.language;
      
      // 初始化多语言支持
      if (window.i18n) {
        window.i18n.setLanguage(settings.language);
        window.i18n.updateUILanguage();
      }
    }
  } catch (error) {
    console.error('加载设置失败:', error);
  }
}

// 保存设置
async function saveSettings() {
  try {
    // 获取设置值
    const hours = parseInt(elements.inactiveThresholdHours.value) || 0;
    const minutes = parseInt(elements.inactiveThresholdMinutes.value) || 0;
    const totalMinutes = hours * 60 + minutes;
    
    // 确保至少有1分钟
    if (totalMinutes < 1) {
      alert(window.i18n ? window.i18n.getText('invalid_threshold') : '请设置至少1分钟的时间阈值');
      return;
    }
    
    const inactiveThreshold = totalMinutes * 60 * 1000; // 转换为毫秒
    const enableNotifications = elements.enableNotifications.checked;
    const language = elements.languageSelect.value;
    
    // 暂时禁用按钮，防止重复点击
    const originalText = elements.saveSettingsBtn.textContent;
    elements.saveSettingsBtn.disabled = true;
    
    // 获取当前设置
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const currentSettings = response.settings;
    
    // 更新设置
    const newSettings = {
      ...currentSettings,
      inactiveThreshold,
      enableNotifications,
      language
    };
    
    // 保存设置
    await chrome.runtime.sendMessage({ 
      action: 'saveSettings', 
      settings: newSettings 
    });
    
    // 显示保存成功提示
    showToast(window.i18n ? window.i18n.getText('settings_saved') : '设置已保存');
    
    // 添加动画效果到按钮
    elements.saveSettingsBtn.classList.add('feedback-animation');
    
    // 恢复按钮状态
    setTimeout(() => {
      elements.saveSettingsBtn.disabled = false;
      elements.saveSettingsBtn.classList.remove('feedback-animation');
    }, 1000);
  } catch (error) {
    console.error('保存设置失败:', error);
    showToast(window.i18n ? window.i18n.getText('save_failed') : '保存设置失败');
    
    // 恢复按钮状态
    elements.saveSettingsBtn.disabled = false;
  }
}

// 显示提示信息
function showToast(message, duration = 2000) {
  elements.toast.textContent = message;
  elements.toast.classList.add('show');
  
  setTimeout(() => {
    elements.toast.classList.remove('show');
  }, duration);
}

// 格式化URL显示（简化版）
function formatUrlSimple(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname + urlObj.pathname.substring(0, 25) + (urlObj.pathname.length > 25 ? '...' : '');
  } catch (e) {
    return escapeHtml(url);
  }
}

// 加载已关闭的标签页
async function loadClosedTabs() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getClosedTabs' });
    const { closedTabs } = response;
    
    // 存储所有历史记录用于搜索
    allClosedTabs = closedTabs || [];
    
    renderHistoryList(allClosedTabs);
  } catch (error) {
    console.error('加载关闭记录失败:', error);
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <p>加载记录失败，请重试</p>
      </div>
    `;
  }
}

// 渲染历史记录列表
function renderHistoryList(tabs) {
  // 清空列表
  elements.historyList.innerHTML = '';
    
  // 如果没有记录，显示空状态
  if (!tabs || tabs.length === 0) {
    elements.historyList.innerHTML = `
      <div class="empty-state">
        <p>${window.i18n ? window.i18n.getText('no_history') : '暂无关闭记录'}</p>
      </div>
    `;
    return;
  }
  
  // 添加记录到列表
  tabs.forEach(tab => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    
    // 格式化时间
    const closedTime = new Date(tab.closedAt);
    const formattedTime = formatDate(closedTime);
    
    // 获取网站图标
    let domain = '';
    try {
      domain = new URL(tab.url).hostname;
    } catch (e) {
      // URL解析失败
    }
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    
    historyItem.innerHTML = `
      <div class="history-item-header">
        <div class="history-item-title">
          <img src="${faviconUrl}" alt="" class="favicon" onerror="this.style.display='none'">
          ${escapeHtml(tab.title || '无标题')}
        </div>
        <div class="history-item-actions">
          <button class="btn btn-sm restore-tab" data-url="${escapeHtml(tab.url)}">${window.i18n ? window.i18n.getText('restore') : '恢复'}</button>
          <button class="btn btn-sm add-to-whitelist" data-url="${escapeHtml(tab.url)}">${window.i18n ? window.i18n.getText('add_to_whitelist') : '加入白名单'}</button>
        </div>
      </div>
      <div class="history-item-url">
        ${formatUrlSimple(tab.url)}
      </div>
      <div class="history-item-time">
        ${window.i18n ? window.i18n.getText('closed_time') : '关闭时间: '}${formattedTime}
      </div>
    `;
    
    // 添加到列表
    elements.historyList.appendChild(historyItem);
    
    // 注册恢复按钮事件
    const restoreBtn = historyItem.querySelector('.restore-tab');
    restoreBtn.addEventListener('click', () => {
      restoreTab(tab.url);
    });
    
    // 注册加入白名单按钮事件
    const whitelistBtn = historyItem.querySelector('.add-to-whitelist');
    whitelistBtn.addEventListener('click', async () => {
      const success = await addToWhitelist(tab.url);
      if (success) {
        // 添加动画效果到按钮
        whitelistBtn.classList.add('feedback-animation');
        setTimeout(() => {
          whitelistBtn.classList.remove('feedback-animation');
        }, 1000);
      }
    });
  });
}

// 搜索历史记录
function searchHistory(query) {
  if (!query) {
    renderHistoryList(allClosedTabs);
    return;
  }
  
  query = query.toLowerCase();
  
  const filteredTabs = allClosedTabs.filter(tab => {
    // 搜索标题
    if (tab.title && tab.title.toLowerCase().includes(query)) {
      return true;
    }
    
    // 搜索URL
    if (tab.url && tab.url.toLowerCase().includes(query)) {
      return true;
    }
    
    // 搜索域名
    try {
      const domain = new URL(tab.url).hostname;
      if (domain.toLowerCase().includes(query)) {
        return true;
      }
    } catch (e) {
      // URL解析失败，忽略
    }
    
    return false;
  });
  
  renderHistoryList(filteredTabs);
}

// 清空历史记录
async function clearHistory() {
  // 显示自定义确认对话框
  const confirmMessage = window.i18n ? window.i18n.getText('confirm_clear_history') : '确定要清空所有历史记录吗？此操作不可撤销。';
  
  confirmDialog.show(confirmMessage, async () => {
    try {
      await chrome.runtime.sendMessage({ action: 'clearClosedTabs' });
      
      // 刷新历史记录列表
      allClosedTabs = [];
      renderHistoryList([]);
      
      // 显示清空成功提示
      const successMessage = window.i18n ? window.i18n.getText('history_cleared') : '历史记录已清空';
      showToast(successMessage);
    } catch (error) {
      console.error('清空历史记录失败:', error);
      const errorMessage = window.i18n ? window.i18n.getText('clear_history_failed') : '清空历史记录失败，请重试';
      alert(errorMessage);
    }
  });
}

// 恢复标签页
async function restoreTab(url) {
  try {
    await chrome.runtime.sendMessage({ 
      action: 'restoreTab', 
      url 
    });
    
    // 显示恢复成功提示，而不是关闭popup
    showToast(window.i18n ? window.i18n.getText('tab_restored') : '标签页已恢复');
    
    // 找到当前点击的恢复按钮并添加动画效果
    const buttons = document.querySelectorAll('.restore-tab');
    buttons.forEach(btn => {
      if (btn.dataset.url === url) {
        btn.classList.add('feedback-animation');
        setTimeout(() => {
          btn.classList.remove('feedback-animation');
        }, 1000);
      }
    });
  } catch (error) {
    console.error('恢复标签页失败:', error);
    alert(window.i18n ? window.i18n.getText('restore_failed') : '恢复标签页失败，请重试');
  }
}

// 加载白名单
async function loadWhitelist() {
  try {
    const response = await chrome.runtime.sendMessage({ action: 'getSettings' });
    const { settings } = response;
    const { whitelist } = settings;
    
    // 清空列表
    elements.whitelistList.innerHTML = '';
    
    // 如果没有记录，显示空状态
    if (!whitelist || whitelist.length === 0) {
      elements.whitelistList.innerHTML = `
        <div class="empty-state">
          <p>${window.i18n ? window.i18n.getText('no_whitelist') : '暂无白名单记录'}</p>
        </div>
      `;
      return;
    }
    
    // 添加记录到列表
    whitelist.forEach(url => {
      const whitelistItem = document.createElement('div');
      whitelistItem.className = 'whitelist-item';
      
      // 解析URL信息
      let urlTitle = url;
      let domain = '';
      let pathname = '';
      let favicon = '';
      
      try {
        const urlObj = new URL(url);
        domain = urlObj.hostname;
        pathname = urlObj.pathname + urlObj.search;
        favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
        
        // 简化显示标题
        if (pathname && pathname !== '/') {
          let pathDisplay = pathname.length > 25 ? pathname.substring(0, 25) + '...' : pathname;
          urlTitle = domain + pathDisplay;
        } else {
          urlTitle = domain;
        }
      } catch (e) {
        // URL可能格式不正确，使用原始输入
        favicon = `https://www.google.com/s2/favicons?domain=unknown&sz=32`;
      }
      
      whitelistItem.innerHTML = `
        <div class="whitelist-item-header">
          <div class="whitelist-item-title">
            <img src="${favicon}" alt="" class="favicon" onerror="this.style.display='none'">
            ${escapeHtml(urlTitle)}
          </div>
          <div class="whitelist-item-actions">
            <button class="btn btn-sm visit-whitelist" data-url="${escapeHtml(url)}">${window.i18n ? window.i18n.getText('visit') : '访问'}</button>
            <button class="btn btn-sm remove-from-whitelist" data-url="${escapeHtml(url)}">${window.i18n ? window.i18n.getText('remove') : '移除'}</button>
          </div>
        </div>
        <div class="whitelist-item-url">
          ${formatUrlSimple(url)}
        </div>
      `;
      
      // 添加到列表
      elements.whitelistList.appendChild(whitelistItem);
      
      // 注册移除按钮事件
      const removeBtn = whitelistItem.querySelector('.remove-from-whitelist');
      removeBtn.addEventListener('click', () => {
        removeFromWhitelist(url);
      });
      
      // 注册访问按钮事件
      const visitBtn = whitelistItem.querySelector('.visit-whitelist');
      visitBtn.addEventListener('click', () => {
        visitWhitelistUrl(url);
      });
    });
  } catch (error) {
    console.error('加载白名单失败:', error);
    elements.whitelistList.innerHTML = `
      <div class="empty-state">
        <p>${window.i18n ? window.i18n.getText('loading_failed_whitelist') : '加载白名单失败，请重试'}</p>
      </div>
    `;
  }
}

// 访问白名单URL
async function visitWhitelistUrl(url) {
  try {
    await chrome.tabs.create({ url });
  } catch (error) {
    console.error('访问URL失败:', error);
    alert('访问URL失败，请重试');
  }
}

// 添加到白名单
async function addToWhitelist(url) {
  try {
    // 确保URL格式正确
    let normalizedUrl = url.trim();
    
    // 如果没有协议前缀，添加默认前缀
    if (!normalizedUrl.includes('://')) {
      // 检查是否是完整URL还是只有域名
      if (normalizedUrl.includes('/')) {
        // 可能是带路径的URL
        normalizedUrl = 'https://' + normalizedUrl;
      } else {
        // 可能只是域名，添加协议并确保有结尾的斜杠
        normalizedUrl = 'https://' + normalizedUrl + '/';
      }
    }
    
    // 尝试解析URL以确保格式正确
    try {
      new URL(normalizedUrl);
    } catch (error) {
      alert(window.i18n ? window.i18n.getText('invalid_url') : '请输入有效的URL格式');
      return;
    }
    
    await chrome.runtime.sendMessage({ 
      action: 'addToWhitelist', 
      url: normalizedUrl
    });
    
    // 显示添加成功提示
    showToast(window.i18n ? window.i18n.getText('added_to_whitelist') : '已添加到白名单');
    
    // 重新加载白名单
    loadWhitelist();
    
    return true;
  } catch (error) {
    console.error('添加到白名单失败:', error);
    alert(window.i18n ? window.i18n.getText('add_to_whitelist_failed') : '添加到白名单失败，请重试');
    return false;
  }
}

// 从白名单移除
async function removeFromWhitelist(url) {
  try {
    await chrome.runtime.sendMessage({ 
      action: 'removeFromWhitelist', 
      url 
    });
    
    // 重新加载白名单
    loadWhitelist();
  } catch (error) {
    console.error('从白名单移除失败:', error);
    alert(window.i18n ? window.i18n.getText('remove_failed') : '从白名单移除失败，请重试');
  }
}

// 添加当前页面到白名单
async function addCurrentPageToWhitelist() {
  try {
    // 获取当前活跃标签页
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const currentTab = tabs[0];
      
      // 使用完整URL而不仅仅是域名
      const fullUrl = currentTab.url;
      
      // 添加到白名单并显示反馈
      const success = await addToWhitelist(fullUrl);
      if (success) {
        // 添加动画效果到按钮
        elements.addCurrentToWhitelistBtn.classList.add('feedback-animation');
        setTimeout(() => {
          elements.addCurrentToWhitelistBtn.classList.remove('feedback-animation');
        }, 1000);
      }
    }
  } catch (error) {
    console.error('添加当前页面到白名单失败:', error);
    alert('添加当前页面到白名单失败，请重试');
  }
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}


