/**
 * qqnews-utils.js — 腾讯新闻客户端 H5 端内能力工具集（独立文件）
 *
 * 震动反馈（haptic / vibrate）：
 *   端内优先调用 QNJSAPI.vibrate({ intensity })，强度 0~1；
 *   同时回退到标准 Web Vibration API（Android WebView 支持）。
 *
 * 注意：本文件只做「端内能力封装」，业务文件（game.js）仅做引用调用，
 *       不要把 QNJSAPI 调用内联进 game.js。
 */
(function (global) {
  'use strict';

  // 解析腾讯新闻端内 JSAPI 对象（与 quwan-platform.js 的解析方式保持一致）
  function getApi() {
    try {
      return global.QNJSAPI || global.qqnewsJSAPI || global.NewsJSAPI || null;
    } catch (e) {
      return null;
    }
  }

  function inQQNews() {
    return !!getApi();
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

    var api = getApi();

    // 1) 腾讯新闻端内 JSAPI：强度参数（0~1）
    if (api && typeof api.vibrate === 'function') {
      try {
        api.vibrate({ intensity: level });
        return true;
      } catch (e) {
        // 端内签名不一致时继续走下方兜底
      }
    }

    // 2) 旧版 window.TencentNews 命名空间兜底
    if (global.TencentNews && typeof global.TencentNews.vibrate === 'function') {
      try {
        global.TencentNews.vibrate({ intensity: level });
        return true;
      } catch (e) { /* noop */ }
    }

    // 3) 标准 Web Vibration API 兜底（Android WebView 支持；iOS WebView 一般不支持）
    if (global.navigator && typeof global.navigator.vibrate === 'function') {
      try {
        var ms = Math.round(15 + level * 85); // 15~100ms，强度映射到时长
        global.navigator.vibrate(ms);
        return true;
      } catch (e) { /* noop */ }
    }

    return false;
  }

  global.qqNewsHaptics = {
    vibrate: vibrate,
    inQQNews: inQQNews,
    isQQNews: inQQNews
  };
})(window);
