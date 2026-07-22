/**
 * qqnews-utils.js — 腾讯新闻客户端 H5 端内能力工具集（独立文件）
 *
 * 震动反馈（haptic / vibrate）：
 *   端内优先调用 bridge.callHandler / TencentNews.invoke("vibrate", params)，兼容 iOS 原生 Haptic；
 *   旧客户端继续尝试 QNJSAPI / TencentNews 命名空间；
 *   同时回退到标准 Web Vibration API（Android WebView 支持）。
 *
 * 注意：本文件只做「端内能力封装」，业务文件（game.js）仅做引用调用，
 *       不要把 QNJSAPI 调用内联进 game.js。
 */
(function (global) {
  'use strict';

  var bridgeCallbackSeed = 0;
  var bridgeReadyPromise = null;

  // 解析腾讯新闻端内 JSAPI 对象（与 quwan-platform.js 的解析方式保持一致）
  function getApi() {
    try {
      return global.QNJSAPI || global.qqnewsJSAPI || global.NewsJSAPI || null;
    } catch (e) {
      return null;
    }
  }

  function getCallHandlerBridge() {
    var candidates = [
      global.bridge,
      global.WebViewJavascriptBridge,
      global.QQNewsBridge,
      global.QNJSBridge,
      global.TencentNewsJsBridge,
      global.TencentNewsScript,
      global.TencentNews && global.TencentNews.bridge,
      global.TencentNews
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      if (candidates[i] && typeof candidates[i].callHandler === 'function') {
        return candidates[i];
      }
    }
    return null;
  }

  function getInvokeBridge() {
    var candidates = [
      global.TencentNews,
      global.TencentNewsJsBridge,
      global.TencentNewsScript
    ];
    for (var i = 0; i < candidates.length; i += 1) {
      if (candidates[i] && typeof candidates[i].invoke === 'function') {
        return candidates[i];
      }
    }
    return null;
  }

  function hasNativeBridge() {
    return !!getCallHandlerBridge() || !!getInvokeBridge();
  }

  function isQQNewsUa() {
    return /qqnews|newsapp|tencentnews/i.test(global.navigator && global.navigator.userAgent || '');
  }

  function inQQNews() {
    return hasNativeBridge() || !!getApi() || isQQNewsUa();
  }

  function parseBridgeResult(result) {
    if (result && typeof result === 'object') return result;
    if (typeof result !== 'string' || !result) return {};
    try {
      return JSON.parse(result);
    } catch (e) {
      return {};
    }
  }

  function vibrateWithNavigator(level) {
    if (!global.navigator || typeof global.navigator.vibrate !== 'function') return false;
    try {
      var ms = Math.round(15 + level * 85); // 15~100ms，强度映射到时长
      global.navigator.vibrate(ms);
      return true;
    } catch (e) {
      return false;
    }
  }

  function vibrateWithBridge(level) {
    var callHandlerBridge = getCallHandlerBridge();
    var invokeBridge = getInvokeBridge();
    if (!callHandlerBridge && !invokeBridge) return false;
    bridgeCallbackSeed += 1;
    var callbackName = '__panleGeYanVibrateCallback_' + bridgeCallbackSeed;
    var cleanupTimer = null;
    var cleanup = function () {
      if (cleanupTimer) global.clearTimeout(cleanupTimer);
      try {
        delete global[callbackName];
      } catch (e) {
        global[callbackName] = null;
      }
    };
    global[callbackName] = function (result) {
      var parsed = parseBridgeResult(result);
      var resultCode = parsed.errCode;
      if (resultCode == null) resultCode = parsed.code;
      if (resultCode == null) resultCode = parsed.ret;
      var failed = (resultCode != null && String(resultCode) !== '0') || parsed.supported === false;
      cleanup();
      if (failed) vibrateWithNavigator(level);
    };
    cleanupTimer = global.setTimeout(cleanup, 5000);
    try {
      var params = {
        callbackFuncName: callbackName,
        type: 'once',
        intensity: level,
        sharpness: 0.5
      };
      if (callHandlerBridge) {
        callHandlerBridge.callHandler('vibrate', params);
      } else {
        // 腾讯新闻 1.3.8 JSAPI 在 iOS 通过 TencentNews.invoke 转发原生能力。
        params.onCallback = global[callbackName];
        invokeBridge.invoke('vibrate', params);
      }
      return true;
    } catch (e) {
      cleanup();
      return false;
    }
  }

  function ensureBridgeReady() {
    if (hasNativeBridge()) return Promise.resolve(true);
    var api = getApi();
    if (!api || typeof api.ensureJsBridgeReady !== 'function') {
      return Promise.resolve(false);
    }
    if (!bridgeReadyPromise) {
      bridgeReadyPromise = Promise.resolve(api.ensureJsBridgeReady())
        .then(function () {
          return hasNativeBridge();
        })
        .catch(function () {
          return false;
        })
        .then(function (ready) {
          if (!ready) bridgeReadyPromise = null;
          return ready;
        });
    }
    return bridgeReadyPromise;
  }

  function warmUpBridge() {
    ensureBridgeReady();
  }

  function scheduleBridgeWarmup() {
    [0, 200, 800].forEach(function (delay) {
      global.setTimeout(warmUpBridge, delay);
    });
  }

  /**
   * 触发震动反馈
   * @param {number} [intensity=0.5] 震动强度，范围 0~1
   * @returns {boolean} 是否成功触发（端外无震动能力时返回 false）
   */
  function vibrate(intensity) {
    var level = (typeof intensity === 'number') ? intensity : 0.5;
    if (!(level >= 0)) level = 0;
    if (level > 1) level = 1;

    // 1) 腾讯新闻原生 bridge：iOS / Android 均按 intensity、sharpness 执行。
    if (vibrateWithBridge(level)) return true;

    var api = getApi();

    // 2) 旧版腾讯新闻端内 JSAPI：强度参数（0~1）
    if (api && typeof api.vibrate === 'function') {
      try {
        api.vibrate({ intensity: level });
        return true;
      } catch (e) {
        // 端内签名不一致时继续走下方兜底
      }
    }

    // 3) 旧版 window.TencentNews 命名空间兜底
    if (global.TencentNews && typeof global.TencentNews.vibrate === 'function') {
      try {
        global.TencentNews.vibrate({ intensity: level });
        return true;
      } catch (e) { /* noop */ }
    }

    // 4) iOS Bridge 可能晚于业务脚本注入，等 JSAPI ready 后补发本次反馈。
    if (isQQNewsUa()) {
      ensureBridgeReady().then(function (ready) {
        if (ready) vibrateWithBridge(level);
      });
      return true;
    }

    // 5) 标准 Web Vibration API 兜底（Android WebView 支持；iOS 走上面的原生 bridge）。
    return vibrateWithNavigator(level);
  }

  if (global.document) {
    global.document.addEventListener('TencentNewsJSInjectionComplete', warmUpBridge);
    if (global.document.readyState === 'loading') {
      global.document.addEventListener('DOMContentLoaded', scheduleBridgeWarmup, { once: true });
    } else {
      scheduleBridgeWarmup();
    }
  }

  global.qqNewsHaptics = {
    vibrate: vibrate,
    ensureReady: ensureBridgeReady,
    inQQNews: inQQNews,
    isQQNews: inQQNews
  };
})(window);
