/**
 * Zentab - 标签页自动清理器
 * background.js - 后台服务脚本
 * 
 * 功能：
 * 1. 跟踪标签页活跃时间
 * 2. 定时检查长时间未活跃的标签页
 * 3. 自动关闭超过阈值的标签页
 * 4. 保存关闭记录
 * 5. 发送通知
 */

// 默认设置
const DEFAULT_SETTINGS = {
  inactiveThreshold: 35 * 60 * 60 * 1000, // 默认35小时（毫秒）
  enableNotifications: true, // 是否启用通知
  whitelist: [], // 白名单URL列表
  language: 'en' // 默认语言：en-英文, zh-CN-简体中文, zh-TW-繁体中文
};

// 存储键名
const STORAGE_KEYS = {
  SETTINGS: 'zentab_settings',
  TAB_ACTIVITY: 'zentab_tab_activity',
  CLOSED_TABS: 'zentab_closed_tabs'
};

// 检查间隔（毫秒）
const CHECK_INTERVAL_MS = 30 * 1000; // 30秒

// 初始化扩展
async function initializeExtension() {
  // 加载或创建设置
  const settings = await loadSettings();
  
  // 设置定时检查 - 使用30秒固定间隔
  chrome.alarms.create('tabCheck', {
    periodInMinutes: 0.5 // 30秒
  });
  
  // 注册标签页事件监听
  registerTabEvents();
  
  // 注册定时器事件监听
  registerAlarmEvents();
  
  // 初始化当前打开的标签页
  initializeCurrentTabs();
}

// 加载设置，如果不存在则使用默认设置
async function loadSettings() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.SETTINGS);
  const settings = result[STORAGE_KEYS.SETTINGS] || DEFAULT_SETTINGS;
  return settings;
}

// 保存设置
async function saveSettings(settings) {
  await chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: settings });
}

// 注册标签页事件监听
function registerTabEvents() {
  // 标签页激活时更新活跃时间
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    updateTabActivity(activeInfo.tabId);
  });
  
  // 标签页更新时更新活跃时间
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
      updateTabActivity(tabId);
    }
  });
  
  // 标签页关闭时移除记录
  chrome.tabs.onRemoved.addListener((tabId) => {
    removeTabActivity(tabId);
  });
  
  // 新标签页创建时触发检查
  chrome.tabs.onCreated.addListener((tab) => {
    // 添加新标签页到活跃记录
    updateTabActivity(tab.id);
    
    // 触发检查不活跃标签页的操作
    checkInactiveTabs();
  });
}

// 注册定时器事件监听
function registerAlarmEvents() {
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'tabCheck') {
      checkInactiveTabs();
    }
  });
}

// 初始化当前打开的标签页
async function initializeCurrentTabs() {
  const tabs = await chrome.tabs.query({});
  const currentTime = Date.now();
  
  // 获取当前活跃的标签页
  const currentTab = tabs.find(tab => tab.active);
  
  // 加载现有的标签页活跃记录
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_ACTIVITY);
  let tabActivity = result[STORAGE_KEYS.TAB_ACTIVITY] || {};
  
  // 更新所有标签页的记录
  tabs.forEach(tab => {
    // 如果是当前活跃标签页，更新活跃时间
    if (currentTab && tab.id === currentTab.id) {
      tabActivity[tab.id] = {
        url: tab.url,
        title: tab.title,
        lastActive: currentTime
      };
    } 
    // 如果不是当前活跃标签页且没有记录，则添加记录
    else if (!tabActivity[tab.id]) {
      tabActivity[tab.id] = {
        url: tab.url,
        title: tab.title,
        lastActive: currentTime
      };
    }
  });
  
  // 保存标签页活跃记录
  await chrome.storage.local.set({ [STORAGE_KEYS.TAB_ACTIVITY]: tabActivity });
}

// 更新标签页活跃时间
async function updateTabActivity(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    const currentTime = Date.now();
    
    // 加载现有的标签页活跃记录
    const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_ACTIVITY);
    let tabActivity = result[STORAGE_KEYS.TAB_ACTIVITY] || {};
    
    // 更新当前标签页的活跃时间
    tabActivity[tabId] = {
      url: tab.url,
      title: tab.title,
      lastActive: currentTime
    };
    
    // 保存标签页活跃记录
    await chrome.storage.local.set({ [STORAGE_KEYS.TAB_ACTIVITY]: tabActivity });
  } catch (error) {
    console.error('更新标签页活跃时间失败:', error);
  }
}

// 移除标签页活跃记录
async function removeTabActivity(tabId) {
  // 加载现有的标签页活跃记录
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_ACTIVITY);
  let tabActivity = result[STORAGE_KEYS.TAB_ACTIVITY] || {};
  
  // 删除关闭的标签页记录
  if (tabActivity[tabId]) {
    delete tabActivity[tabId];
    
    // 保存标签页活跃记录
    await chrome.storage.local.set({ [STORAGE_KEYS.TAB_ACTIVITY]: tabActivity });
  }
}

// 检查长时间未活跃的标签页
async function checkInactiveTabs() {
  // 加载设置
  const settings = await loadSettings();
  
  // 加载标签页活跃记录
  const result = await chrome.storage.local.get(STORAGE_KEYS.TAB_ACTIVITY);
  const tabActivity = result[STORAGE_KEYS.TAB_ACTIVITY] || {};
  
  // 当前时间
  const currentTime = Date.now();
  
  // 获取所有标签页
  const tabs = await chrome.tabs.query({});
  
  // 检查每个标签页
  for (const tab of tabs) {
    // 跳过没有记录的标签页
    if (!tabActivity[tab.id]) continue;
    
    // 检查是否在白名单中
    if (isInWhitelist(tab.url, settings.whitelist)) continue;
    
    // 计算不活跃时间
    const inactiveTime = currentTime - tabActivity[tab.id].lastActive;
    
    // 如果超过阈值，关闭标签页
    if (inactiveTime >= settings.inactiveThreshold) {
      await closeInactiveTab(tab, inactiveTime);
    }
  }
}

// 检查URL是否在白名单中
function isInWhitelist(url, whitelist) {
  if (!url || !whitelist || whitelist.length === 0) return false;
  
  // 创建URL对象
  try {
    const urlObj = new URL(url);
    
    // 使用精确匹配
    return whitelist.some(whitelistItem => {
      return url === whitelistItem;
    });
  } catch (error) {
    console.error('检查白名单失败:', error);
    return false;
  }
}

// 关闭长时间未活跃的标签页
async function closeInactiveTab(tab, inactiveTime) {
  try {
    // 保存关闭记录
    await saveClosedTab(tab);
    
    // 关闭标签页
    await chrome.tabs.remove(tab.id);
    
    // 发送通知
    await sendTabClosedNotification(tab);
    
    console.log(`已关闭长时间未活跃的标签页: ${tab.title}`);
  } catch (error) {
    console.error('关闭标签页失败:', error);
  }
}

// 保存关闭的标签页记录
async function saveClosedTab(tab) {
  // 加载现有的关闭记录
  const result = await chrome.storage.local.get(STORAGE_KEYS.CLOSED_TABS);
  let closedTabs = result[STORAGE_KEYS.CLOSED_TABS] || [];
  
  // 添加新的关闭记录
  closedTabs.unshift({
    id: Date.now(), // 使用时间戳作为唯一ID
    url: tab.url,
    title: tab.title,
    favicon: tab.favIconUrl || '',
    closedAt: Date.now()
  });
  
  // 限制记录数量，最多保存100条
  if (closedTabs.length > 100) {
    closedTabs = closedTabs.slice(0, 100);
  }
  
  // 保存关闭记录
  await chrome.storage.local.set({ [STORAGE_KEYS.CLOSED_TABS]: closedTabs });
}

// 发送标签页关闭通知
async function sendTabClosedNotification(tab) {
  // 加载设置
  const settings = await loadSettings();
  
  // 如果禁用了通知，则不发送
  if (!settings.enableNotifications) return;
  
  // 计算小时和分钟数
  const totalMinutes = Math.floor(settings.inactiveThreshold / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  // 格式化时间显示
  let timeDisplay;
  if (hours > 0 && minutes > 0) {
    timeDisplay = `${hours}小时${minutes}分钟`;
  } else if (hours > 0) {
    timeDisplay = `${hours}小时`;
  } else {
    timeDisplay = `${minutes}分钟`;
  }
  
  // 创建通知
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '/images/icon128.png',
    title: 'Zentab', // 简化标题，不使用完整的扩展名称
    message: `您有一个标签页『${tab.title}』（URL: ${tab.url}），超过 ${timeDisplay} 未访问已经被关闭并回收`,
    priority: 1
  });
}

// 初始化扩展
initializeExtension();

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getSettings') {
    loadSettings().then(settings => {
      sendResponse({ settings });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'saveSettings') {
    saveSettings(message.settings).then(() => {
      // 不再需要更新定时器间隔，因为使用固定30秒间隔
      sendResponse({ success: true });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'getClosedTabs') {
    chrome.storage.local.get(STORAGE_KEYS.CLOSED_TABS).then(result => {
      sendResponse({ closedTabs: result[STORAGE_KEYS.CLOSED_TABS] || [] });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'clearClosedTabs') {
    chrome.storage.local.set({ [STORAGE_KEYS.CLOSED_TABS]: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'restoreTab') {
    chrome.tabs.create({ url: message.url }).then(() => {
      sendResponse({ success: true });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'addToWhitelist') {
    loadSettings().then(settings => {
      if (!settings.whitelist.includes(message.url)) {
        settings.whitelist.push(message.url);
        return saveSettings(settings);
      }
      return settings;
    }).then(() => {
      sendResponse({ success: true });
    });
    return true; // 异步响应
  }
  
  if (message.action === 'removeFromWhitelist') {
    loadSettings().then(settings => {
      settings.whitelist = settings.whitelist.filter(url => url !== message.url);
      return saveSettings(settings);
    }).then(() => {
      sendResponse({ success: true });
    });
    return true; // 异步响应
  }
});
