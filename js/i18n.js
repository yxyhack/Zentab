/**
 * Zentab
 * i18n.js - 国际化支持
 */

// 语言包
const translations = {
  'en': {
    // 页面标题和标签
    'app_name': 'Zentab Tab Auto Cleaner',
    'settings': 'Settings',
    'history': 'History',
    'whitelist': 'Whitelist',
    
    // 设置面板
    'auto_close_threshold': 'Tab auto-close threshold',
    'hours': 'hours',
    'minutes': 'minutes',
    'auto_close_description': 'Tabs that have not been visited for longer than this time will be automatically closed',
    'enable_notifications': 'Enable closing notifications',
    'notification_description': 'Show notifications when tabs are automatically closed',
    'language_setting': 'Language',
    'language_description': 'Change the display language of the extension',
    'save_settings': 'Save Settings',
    
    // 历史记录面板
    'closed_tabs': 'Closed Tabs',
    'refresh': 'Refresh',
    'clear': 'Clear',
    'search_placeholder': 'Search by title, URL or domain...',
    'no_history': 'No closed tabs',
    'loading_failed': 'Failed to load records, please try again',
    'restore': 'Restore',
    'add_to_whitelist': 'Add to whitelist',
    'closed_time': 'Closed time: ',
    
    // 白名单面板
    'add_current_page': 'Add current page',
    'add_to_whitelist_label': 'Add website to whitelist',
    'url_placeholder': 'Enter complete URL (https://example.com/path)',
    'add': 'Add',
    'whitelist_description': 'Websites in the whitelist will not be automatically closed',
    'no_whitelist': 'No whitelist records',
    'loading_failed_whitelist': 'Failed to load whitelist, please try again',
    'visit': 'Visit',
    'remove': 'Remove',
    
    // 提示消息
    'settings_saved': 'Settings saved',
    'save_failed': 'Failed to save settings',
    'added_to_whitelist': 'Added to whitelist',
    'add_to_whitelist_failed': 'Failed to add to whitelist',
    'restore_failed': 'Failed to restore tab',
    'tab_restored': 'Tab restored',
    'history_cleared': 'History cleared',
    'clear_history_failed': 'Failed to clear history',
    'invalid_url': 'Please enter a valid URL',
    'confirm_clear_history': 'Are you sure you want to clear all history? This action cannot be undone.',
    'remove_failed': 'Failed to remove from whitelist',
    
    // 确认对话框
    'confirm_dialog_title': 'Confirmation',
    'confirm_cancel': 'Cancel',
    'confirm_ok': 'OK'
  },
  
  'zh-CN': {
    // 页面标题和标签
    'app_name': 'Zentab 标签页自动清理器',
    'settings': '设置',
    'history': '历史记录',
    'whitelist': '白名单',
    
    // 设置面板
    'auto_close_threshold': '标签页自动关闭时间阈值',
    'hours': '小时',
    'minutes': '分钟',
    'auto_close_description': '超过设定时间未访问的标签页将被自动关闭',
    'enable_notifications': '启用关闭通知',
    'notification_description': '标签页自动关闭时显示通知',
    'language_setting': '语言设置',
    'language_description': '更改扩展程序的显示语言',
    'save_settings': '保存设置',
    
    // 历史记录面板
    'closed_tabs': '已关闭的标签页',
    'refresh': '刷新',
    'clear': '清空',
    'search_placeholder': '搜索标题、URL或域名...',
    'no_history': '暂无关闭记录',
    'loading_failed': '加载记录失败，请重试',
    'restore': '恢复',
    'add_to_whitelist': '加入白名单',
    'closed_time': '关闭时间: ',
    
    // 白名单面板
    'add_current_page': '添加当前页面',
    'add_to_whitelist_label': '添加网站到白名单',
    'url_placeholder': '输入完整URL (https://example.com/path)',
    'add': '添加',
    'whitelist_description': '白名单中的网站根据精确URL匹配，不会被自动关闭',
    'no_whitelist': '暂无白名单记录',
    'loading_failed_whitelist': '加载白名单失败，请重试',
    'visit': '访问',
    'remove': '移除',
    
    // 提示消息
    'settings_saved': '设置已保存',
    'save_failed': '保存设置失败',
    'added_to_whitelist': '已添加到白名单',
    'add_to_whitelist_failed': '添加到白名单失败，请重试',
    'restore_failed': '恢复标签页失败，请重试',
    'tab_restored': '标签页已恢复',
    'history_cleared': '历史记录已清空',
    'clear_history_failed': '清空历史记录失败，请重试',
    'invalid_url': '请输入有效的URL格式',
    'confirm_clear_history': '确定要清空所有历史记录吗？此操作不可撤销。',
    'remove_failed': '从白名单移除失败，请重试',
    
    // 确认对话框
    'confirm_dialog_title': '确认',
    'confirm_cancel': '取消',
    'confirm_ok': '确定'
  },
  
  'zh-HK': {
    // 页面标题和标签
    'app_name': 'Zentab 標簽頁自動清理器',
    'settings': '設置',
    'history': '歷史記錄',
    'whitelist': '白名單',
    
    // 设置面板
    'auto_close_threshold': '分頁自動關閉時間閾值',
    'hours': '小時',
    'minutes': '分鐘',
    'auto_close_description': '超過設定時間未訪問的分頁將被自動關閉',
    'enable_notifications': '啟用關閉通知',
    'notification_description': '分頁自動關閉時顯示通知',
    'language_setting': '語言設置',
    'language_description': '更改擴展程式的顯示語言',
    'save_settings': '保存設置',
    
    // 历史记录面板
    'closed_tabs': '已關閉的分頁',
    'refresh': '刷新',
    'clear': '清空',
    'search_placeholder': '搜索標題、URL或域名...',
    'no_history': '暫無關閉記錄',
    'loading_failed': '加載記錄失敗，請重試',
    'restore': '恢復',
    'add_to_whitelist': '加入白名單',
    'closed_time': '關閉時間: ',
    
    // 白名单面板
    'add_current_page': '添加當前頁面',
    'add_to_whitelist_label': '添加網站到白名單',
    'url_placeholder': '輸入完整URL (https://example.com/path)',
    'add': '添加',
    'whitelist_description': '白名單中的網站根據精確URL匹配，不會被自動關閉',
    'no_whitelist': '暫無白名單記錄',
    'loading_failed_whitelist': '加載白名單失敗，請重試',
    'visit': '訪問',
    'remove': '移除',
    
    // 提示消息
    'settings_saved': '設置已保存',
    'save_failed': '保存設置失敗',
    'added_to_whitelist': '已添加到白名單',
    'add_to_whitelist_failed': '添加到白名單失敗，請重試',
    'restore_failed': '恢復分頁失敗，請重試',
    'tab_restored': '分頁已恢復',
    'history_cleared': '歷史記錄已清空',
    'clear_history_failed': '清空歷史記錄失敗，請重試',
    'invalid_url': '請輸入有效的URL格式',
    'confirm_clear_history': '確定要清空所有歷史記錄嗎？此操作不可撤銷。',
    'remove_failed': '從白名單移除失敗，請重試',
    
    // 确认对话框
    'confirm_dialog_title': '確認',
    'confirm_cancel': '取消',
    'confirm_ok': '確定'
  }
};

// 当前语言
let currentLanguage = 'en';

// 设置语言
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    return true;
  }
  return false;
}

// 获取文本
function getText(key) {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }
  // 如果找不到当前语言的文本，则使用英文
  return translations['en'][key] || key;
}

// 更新界面语言
function updateUILanguage() {
  // 更新标签按钮
  document.querySelectorAll('.tab-btn').forEach(btn => {
    const tabId = btn.dataset.tab;
    if (tabId === 'settings') btn.textContent = getText('settings');
    if (tabId === 'history') btn.textContent = getText('history');
    if (tabId === 'whitelist') btn.textContent = getText('whitelist');
  });
  
  // 更新设置面板
  document.querySelector('label[for="inactive-threshold"]').textContent = getText('auto_close_threshold');
  document.querySelectorAll('.time-input-text')[0].textContent = getText('hours');
  document.querySelectorAll('.time-input-text')[1].textContent = getText('minutes');
  document.querySelector('#settings-tab .form-group:first-child .form-text').textContent = getText('auto_close_description');
  
  document.querySelector('label[for="enable-notifications"]').textContent = getText('enable_notifications');
  document.querySelector('#settings-tab .form-group:nth-child(2) .form-text').textContent = getText('notification_description');
  
  document.querySelector('label[for="language-select"]').textContent = getText('language_setting');
  document.querySelector('#settings-tab .form-group:nth-child(3) .form-text').textContent = getText('language_description');
  
  document.querySelector('#save-settings').textContent = getText('save_settings');
  
  // 更新历史记录面板
  document.querySelector('.history-header h2').textContent = getText('closed_tabs');
  document.querySelector('#refresh-history').textContent = getText('refresh');
  document.querySelector('#clear-history').textContent = getText('clear');
  document.querySelector('#history-search').placeholder = getText('search_placeholder');
  
  // 更新白名单面板
  document.querySelector('.whitelist-header h2').textContent = getText('whitelist');
  document.querySelector('#add-current-to-whitelist').textContent = getText('add_current_page');
  document.querySelector('label[for="whitelist-url"]').textContent = getText('add_to_whitelist_label');
  document.querySelector('#whitelist-url').placeholder = getText('url_placeholder');
  document.querySelector('#add-to-whitelist').textContent = getText('add');
  document.querySelector('#whitelist-tab .form-group .form-text').textContent = getText('whitelist_description');
  
  // 更新页脚版本信息
  document.querySelector('footer p').textContent = `${getText('app_name')} v1.0.0`;
  
  // 动态更新历史记录和白名单项（如果存在）
  updateDynamicContent();
}

// 更新动态内容（历史记录项和白名单项）
function updateDynamicContent() {
  // 更新历史记录项
  document.querySelectorAll('.restore-tab').forEach(btn => {
    btn.textContent = getText('restore');
  });
  
  document.querySelectorAll('.add-to-whitelist').forEach(btn => {
    if (!btn.id || btn.id !== 'add-to-whitelist') {
      btn.textContent = getText('add_to_whitelist');
    }
  });
  
  document.querySelectorAll('.history-item-time').forEach(el => {
    const timeStr = el.textContent;
    const colonPos = timeStr.indexOf(':');
    if (colonPos > -1) {
      const timeValue = timeStr.substring(colonPos + 1).trim();
      el.textContent = `${getText('closed_time')}${timeValue}`;
    }
  });
  
  // 更新白名单项
  document.querySelectorAll('.remove-from-whitelist').forEach(btn => {
    btn.textContent = getText('remove');
  });
  
  document.querySelectorAll('.visit-whitelist').forEach(btn => {
    btn.textContent = getText('visit');
  });
  
  // 更新空状态消息
  const emptyHistoryStates = document.querySelectorAll('#history-list .empty-state p');
  emptyHistoryStates.forEach(el => {
    if (el.textContent.includes('暂无关闭记录')) {
      el.textContent = getText('no_history');
    } else if (el.textContent.includes('加载记录失败')) {
      el.textContent = getText('loading_failed');
    }
  });
  
  const emptyWhitelistStates = document.querySelectorAll('#whitelist-list .empty-state p');
  emptyWhitelistStates.forEach(el => {
    if (el.textContent.includes('暂无白名单记录')) {
      el.textContent = getText('no_whitelist');
    } else if (el.textContent.includes('加载白名单失败')) {
      el.textContent = getText('loading_failed_whitelist');
    }
  });
}

// 导出方法
window.i18n = {
  setLanguage,
  getText,
  updateUILanguage,
  getCurrentLanguage: () => currentLanguage
}; 