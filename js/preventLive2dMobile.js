// 移动端Live2D阻止脚本 - 统一配置管理版本
// 此脚本在页面最早期加载，在OhMyLive2d脚本之前执行

;(function() {
  'use strict';
  
  // 获取移动端优化配置
  function getMobileOptimizationConfig() {
    // 从全局配置中读取移动端优化设置
    if (typeof window !== 'undefined' && window.CONFIG && window.CONFIG.mobileOptimization) {
      return window.CONFIG.mobileOptimization;
    }
    // 默认配置（向后兼容）
    return {
      enable: true,
      disableLive2d: true,
      hideLive2dTips: true
    };
  }
  
  // 移动端检测函数
  function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
      'windows phone', 'mobile', 'opera mini', 'iemobile'
    ];
    const isMobileUA = mobileKeywords.some(keyword => userAgent.includes(keyword));
    const isMobileScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    return isMobileUA || (isMobileScreen && isTouchDevice);
  }

  // 检查是否需要在移动端阻止Live2D
  const config = getMobileOptimizationConfig();
  if (isMobileDevice() && config.enable && config.disableLive2d) {
    
    // 完全阻止OML2D对象的创建
    window.OML2D = null;
    
    // 重写OML2D对象，使其在移动端不执行任何操作
    Object.defineProperty(window, 'OML2D', {
      value: {
        loadOml2d: function() {
          return {
            onLoad: function() {},
            onReady: function() {},
            loadModel: function() {},
            clearTips: function() {},
            showTips: function() {},
            stageSlideIn: function() {},
            stageSlideOut: function() {},
            statusBarOpen: function() {},
            statusBarClose: function() {},
            loadNextModel: function() {},
            loadPrevModel: function() {},
            clearModel: function() {},
            reloadModel: function() {},
            destroy: function() {}
          };
        }
      },
      writable: false,
      configurable: true
    });
    
    // 阻止任何可能的Live2D相关脚本执行
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const element = originalCreateElement.call(this, tagName);
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = element.setAttribute;
        element.setAttribute = function(name, value) {
          if (name === 'src' && value && value.includes('live2d')) {
            return;
          }
          return originalSetAttribute.call(this, name, value);
        };
      }
      return element;
    };
    
    // 根据配置添加CSS样式来隐藏Live2D元素
    const style = document.createElement('style');
    let cssRules = '';
    
    // Live2D模型隐藏样式
    if (config.disableLive2d) {
      cssRules += `
        @media (max-width: 768px) {
          #oh-my-live2d,
          .oh-my-live2d,
          [id*="live2d"],
          [class*="live2d"],
          [id*="oml2d"],
          [class*="oml2d"],
          canvas[id*="live2d"],
          canvas[class*="live2d"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
          }
        }
      `;
    }
    
    // Live2D提示框隐藏样式
    if (config.hideLive2dTips) {
      cssRules += `
        @media (max-width: 768px) {
          .oml2d-tips,
          [class*="tips"][class*="live2d"],
          [class*="tips"][class*="oml2d"] {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
        }
      `;
    }
    
    if (cssRules) {
      style.textContent = cssRules;
      document.head.appendChild(style);
    }
  }
})();