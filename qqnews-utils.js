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

  // ===== 腾讯新闻客户端激励广告（看广告复活等）=====
  // 遵循腾讯新闻激励广告 JSAPI 标准时序：
  //   loadRewardedAd -> 校验 -> 注册 window.rewardedAdCallback -> showRewardedAd -> 等待 onGetReward/onViewClosed
  // 完整观看以 onGetReward 为准发奖；onViewClosed 只处理「未获得奖励」的失败；
  // 奖励逻辑必须等页面恢复 visible 后执行；每次结束清理 window.rewardedAdCallback，避免残留回调。
  // 按页面域名隔离测试/正式广告参数，避免正式流量误用测试渠道。
  var TEST_AD_CONFIG = {
    entranceId: 'panlegeyan_revive',
    channel: 'news_news_bonbon_lps'
  };
  var PRODUCTION_AD_CONFIG = {
    entranceId: '8876',
    channel: 'news_news_designminigames'
  };
  var LOAD_AD_TIMEOUT = 10000;
  var SHOW_AD_TIMEOUT = 60000;

  function isProductionHost() {
    return !!(global.location && global.location.hostname === 'h5.news.qq.com');
  }

  // 显式 options / 全局覆盖优先，未传时按当前页面域名自动选择测试或正式配置。
  function getAdConfig(options) {
    options = options || {};
    var defaults = isProductionHost() ? PRODUCTION_AD_CONFIG : TEST_AD_CONFIG;
    return {
      entranceId: String(options.entranceId || global.QQNEWS_REWARDED_AD_ENTRANCE_ID || defaults.entranceId),
      channel: options.channel || global.QQNEWS_REWARDED_AD_CHANNEL || defaults.channel
    };
  }

  // qqnews-jsapi IIFE 会把广告方法挂在 QNJSAPI 命名空间；
  // 少数旧版/特殊注入环境可能仍暴露 window 顶层函数，因此两种形式都兼容。
  function getRewardedAdApi() {
    var api = getApi();
    if (api && typeof api.loadRewardedAd === 'function' && typeof api.showRewardedAd === 'function') {
      return api;
    }
    if (typeof global.loadRewardedAd === 'function' && typeof global.showRewardedAd === 'function') {
      return global;
    }
    return null;
  }

  function isRewardedAdSupported() {
    return !!getRewardedAdApi();
  }

  // 页面恢复可见后再执行奖励/结算，避免广告原生层未关闭时误发奖
  function waitForPageVisible(callback) {
    if (global.document && global.document.visibilityState === 'visible') {
      callback();
      return;
    }
    var handler = function () {
      if (global.document.visibilityState === 'visible') {
        global.document.removeEventListener('visibilitychange', handler);
        callback();
      }
    };
    global.document.addEventListener('visibilitychange', handler);
  }

  // 预加载缓存：Promise 用于合并并发 load；ready 保存已加载结果。
  // 点击时若 ready 已存在，必须在当前用户手势调用栈内同步执行 showRewardedAd，
  // 避免部分客户端把 Promise.then 后的调用判定为脱离用户手势，出现首次点击不展示。
  var rewardedAdPreloads = {};
  var rewardedAdReady = {};

  function loadRewardedAd(options) {
    options = options || {};
    var config = getAdConfig(options);
    var entranceId = config.entranceId;
    var channel = config.channel;
    var cacheKey = entranceId + '::' + channel;
    if (rewardedAdReady[cacheKey]) return Promise.resolve(rewardedAdReady[cacheKey]);
    if (rewardedAdPreloads[cacheKey]) return rewardedAdPreloads[cacheKey];

    var rewardedAdApi = getRewardedAdApi();
    if (!rewardedAdApi) return Promise.resolve({ ok: false, reason: 'no_sdk' });

    var loadPromise = new Promise(function (resolve) {
      var settled = false;
      var finishLoad = function (result) {
        if (settled) return;
        settled = true;
        global.clearTimeout(loadTimer);
        if (!result.ok) delete rewardedAdPreloads[cacheKey];
        resolve(result);
      };
      var loadTimer = global.setTimeout(function () {
        finishLoad({ ok: false, reason: 'load_timeout' });
      }, LOAD_AD_TIMEOUT);

      Promise.resolve(rewardedAdApi.loadRewardedAd({ entranceId: entranceId, channel: channel }))
        .then(function (loadRes) {
          var errCode = loadRes && loadRes.errCode;
          var data = (loadRes && loadRes.data) || {};
          var maxUnlockTime = data.maxUnlockTime || 0;
          if (String(errCode) !== '0' || maxUnlockTime <= 0) {
            finishLoad({ ok: false, reason: 'load_fail', errCode: errCode, data: data });
            return;
          }
          var readyResult = {
            ok: true,
            api: rewardedAdApi,
            maxUnlockTime: maxUnlockTime,
            cacheKey: cacheKey
          };
          rewardedAdReady[cacheKey] = readyResult;
          finishLoad(readyResult);
        })
        .catch(function () {
          finishLoad({ ok: false, reason: 'load_error' });
        });
    });
    rewardedAdPreloads[cacheKey] = loadPromise;
    return loadPromise;
  }

  function preloadRewardedAd(options) {
    return loadRewardedAd(options).then(function (result) {
      return { ready: !!result.ok, reason: result.reason || 'ready' };
    });
  }

  function showLoadedRewardedAd(loaded) {
    // 本次 load 结果只消费一次；下一次广告流程必须重新加载。
    delete rewardedAdPreloads[loaded.cacheKey];
    delete rewardedAdReady[loaded.cacheKey];
    return new Promise(function (resolve) {
      var rewarded = false;
      var closed = false;
      var showTimer = global.setTimeout(function () {
        finish(false, 'show_timeout');
      }, SHOW_AD_TIMEOUT);

      // 单一结束函数：closed 守卫保证只 resolve 一次（防 onGetReward->onViewClosed 连续触发重复发奖）
      function finish(ok, reason) {
        if (closed) return;
        closed = true;
        global.clearTimeout(showTimer);
        global.rewardedAdCallback = function () {};
        resolve({ rewarded: ok, reason: reason });
      }

      global.rewardedAdCallback = function (res) {
        var cb = res && res.callback;
        if (cb === 'onGetReward' && !rewarded) {
          rewarded = true;
          waitForPageVisible(function () { finish(true, 'onGetReward'); });
        } else if (cb === 'onViewClosed' && !rewarded) {
          waitForPageVisible(function () { finish(false, 'onViewClosed_no_reward'); });
        }
      };

      try {
        // ready 命中时，此调用发生在按钮点击的同步调用栈中，保留客户端要求的用户手势。
        loaded.api.showRewardedAd({ maxUnlockTime: loaded.maxUnlockTime / 1000 });
      } catch (e) {
        finish(false, 'show_exception');
      }
    });
  }

  // 返回 Promise<{ rewarded: boolean, reason: string }>
  //   reason: no_sdk | load_timeout | load_fail | load_error | show_exception | show_timeout | onViewClosed_no_reward | onGetReward
  function playRewardedAd(options) {
    options = options || {};
    var config = getAdConfig(options);
    var cacheKey = config.entranceId + '::' + config.channel;
    var ready = rewardedAdReady[cacheKey];
    if (ready) {
      return showLoadedRewardedAd(ready);
    }
    return loadRewardedAd(options).then(function (loaded) {
      if (!loaded.ok) return { rewarded: false, reason: loaded.reason, errCode: loaded.errCode };
      return showLoadedRewardedAd(loaded);
    });
  }

  global.qqNewsRewardedAd = {
    isSupported: isRewardedAdSupported,
    getConfig: function () { return getAdConfig({}); },
    preload: preloadRewardedAd,
    play: playRewardedAd
  };
})(window);
