// 此脚本在页面最早期加载，在OhMyLive2d脚本之前执行

;(function() {
  'use strict';
  
  // 获取移动端优化配置
  function getMobileOptimizationConfig() {
    // 尝试从全局配置中读取
    if (typeof window !== 'undefined' && window.shokax_CONFIG) {
      try {
        const config = JSON.parse(window.shokax_CONFIG);
        const mobileConfig = config.mobileOptimization || {};
        console.log('[preventLive2dMobile] 从shokax_CONFIG读取配置:', mobileConfig);
        return {
          enable: mobileConfig.enable !== false,
          disableLive2d: mobileConfig.disableLive2d || false,
          hideLive2dTips: mobileConfig.hideLive2dTips || false,
          disableFireworks: mobileConfig.disableFireworks || false,
          disablePlayer: mobileConfig.disablePlayer || false,
          reducedQuicklink: mobileConfig.reducedQuicklink || false
        };
      } catch (e) {
        console.warn('[preventLive2dMobile] 配置解析失败:', e);
      }
    }
    
    // 如果无法读取配置，使用默认值
    console.log('[preventLive2dMobile] 使用默认配置');
    return {
      enable: true,
      disableLive2d: true,
      hideLive2dTips: true,
      disableFireworks: true,
      disablePlayer: true,
      reducedQuicklink: true
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

  // 执行移动端优化的主函数
  function executeMobileOptimization() {
    const config = getMobileOptimizationConfig();
    const isMobile = isMobileDevice();
    console.log('[preventLive2dMobile] 移动端检测:', isMobile);
    console.log('[preventLive2dMobile] 配置检查:', config);
    
    // 只有在移动端且启用了移动端优化时才进行处理
    if (isMobile && config.enable) {
      console.log('[preventLive2dMobile] 移动端优化已启用，开始处理各项配置');
      
      // 处理烟花特效配置
      if (config.disableFireworks) {
        console.log('[preventLive2dMobile] 禁用烟花特效');
        // 通过重写全局变量来禁用烟花特效
        window.__shokax_fireworks__ = false;
      } else {
        console.log('[preventLive2dMobile] 启用烟花特效');
        // 确保烟花特效在移动端可以正常工作
        window.__shokax_fireworks__ = true;
      }
      
      // 处理音乐播放器配置
      if (config.disablePlayer) {
        console.log('[preventLive2dMobile] 禁用音乐播放器');
        // 通过重写全局变量来禁用音乐播放器
        window.__shokax_player__ = false;
      } else {
        console.log('[preventLive2dMobile] 启用音乐播放器');
        // 确保音乐播放器在移动端可以正常工作
        window.__shokax_player__ = true;
      }
      
      // 处理quicklink预加载配置
      if (config.reducedQuicklink) {
        console.log('[preventLive2dMobile] 启用quicklink预加载减少优化');
        // 设置全局标记，供siteInit.ts使用
        window.__shokax_mobileOptimization__ = true;
      } else {
        console.log('[preventLive2dMobile] 禁用quicklink预加载减少优化');
        // 确保quicklink预加载在移动端正常工作
        window.__shokax_mobileOptimization__ = false;
      }
    
    // 处理 Live2D 禁用配置
    if (config.disableLive2d) {
      console.log('[preventLive2dMobile] 禁用 Live2D 功能');
      
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
    }
    
    // 添加CSS样式来处理各种移动端优化
    const style = document.createElement('style');
    let cssRules = '';
    
    // Live2D模型隐藏样式
    if (config.disableLive2d) {
      console.log('[preventLive2dMobile] 添加 Live2D 隐藏样式');
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
      console.log('[preventLive2dMobile] 添加 Live2D 提示框隐藏样式');
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
    
    // 应用CSS样式
    if (cssRules) {
      style.textContent = cssRules;
      document.head.appendChild(style);
      console.log('[preventLive2dMobile] CSS样式已应用');
    }
    
      // 处理其他移动端优化配置
      // TODO: 可以在这里添加其他优化功能，如禁用烟花效果、音频播放器等
      
    } else {
      console.log('[preventLive2dMobile] 移动端优化未启用或非移动端设备，跳过处理');
    }
  }
  
  // 直接启动优化逻辑
  executeMobileOptimization();
})();