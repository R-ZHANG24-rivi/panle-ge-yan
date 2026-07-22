/**
 * 腾讯新闻「拉端」能力（纯 HTML 内联实现，严格复刻 qqnews-utils references/app.md + scripts/app.ts）。
 *
 * 用途：在端外（微信 / 手 Q / 浏览器）唤起腾讯新闻 App，并在端内打开目标 H5 页面。
 * 依赖（由 index.html 通过 CDN 引入）：
 *   - gh-qqnews-downapp IIFE  -> window.AppDownload
 *   - qqnews-jsapi.min.js     -> window.QNJSAPI / window.qqnewsJSAPI（端内 openUrl）
 *
 * 必读约束（来自 app.md）：
 *   - 微信 / 手 Q 已安装时必须走 AppDownload.checkAppIsInstalled -> app.run(qqnews scheme)
 *   - 禁止只用应用宝 window.open(launchScheme=...) 而无 AppDownload
 *   - startextras 的 via 固定为 "activity"，project_id / web_scenes 与大同上报共用 "panlegeyan_27be"
 *   - 降级链路必须 copyNewsScheme 写剪贴板
 */
(function (global) {
  "use strict";

  var PROJECT_ID = "panlegeyan_27be"; // 与 quwan-platform.js PROJECT_ID / 大同上报 publicParams.project_id 一致
  var LAUNCH_SRC_FROM_FALLBACK = "activities";

  var DOWNLOAD_URL_VIEW = "https://view.inews.qq.com/mobile?downapp=auto";
  var LAUNCH_URL = "https://launch.inews.qq.com/applinks/channel/news_news/news_news_top";

  var QQNewsAppDownloadInfo = {
    packageName: "com.tencent.news",
    downloadUrl: "https://dldir1v6.qq.com/dlomg/inews/TencentNews_14035.apk",
    wxAppId: "wx073f4a4daff0abe8",
    appleStoreId: "399363156",
    appName: "腾讯新闻-打开眼界",
    downLogo: "https://mat1.gtimg.com/qqcdn/tupload/1640679662268.png"
  };

  // ============ 环境判断 ============
  function ua() {
    return (global.navigator && global.navigator.userAgent) || "";
  }
  function isWeixin() {
    return /micromessenger/i.test(ua());
  }
  function isQQ() {
    return /qq\//i.test(ua());
  }
  function isQQbrowser() {
    return /mqqbrowser|qbwebview/i.test(ua());
  }
  function isIos() {
    return /iphone|ipad|ipod/i.test(ua());
  }
  function isAndroid() {
    return /android/i.test(ua());
  }
  function isQQNews() {
    return /qqnews|newsapp|tencentnews/i.test(ua());
  }

  // ============ 工具 ============
  function getQueryParam(name) {
    try {
      return new URLSearchParams(global.location.search).get(name) || "";
    } catch (e) {
      return "";
    }
  }

  function getFakeDeviceId() {
    try {
      return global.localStorage.getItem("__BEACON_deviceId") || "";
    } catch (e) {
      return "";
    }
  }

  function getBrowserName() {
    if (isWeixin()) return "weixin";
    if (isQQ()) return "qq";
    if (isQQbrowser()) return "qqbrowser";
    return "other";
  }

  function getStartReferrer() {
    try {
      return global.document.referrer || "";
    } catch (e) {
      return "";
    }
  }

  function getWebScenes() {
    var from = getQueryParam("from");
    return from || PROJECT_ID;
  }

  function getActivityId() {
    var id = getQueryParam("activityId");
    return id || "";
  }

  /**
   * scheme URL 上 `from` 字段的取值（与 app.ts resolveSchemeFrom 一致）。
   * 判定顺序：QQ → weixin → QQ浏览器 → ima → activity(兜底)
   */
  function resolveSchemeFrom() {
    if (isQQ()) return "mobileQQPush";
    if (isWeixin()) return "weixin";
    if (isQQbrowser()) return "qb";
    // ima 环境在纯 HTML 项目中无法判断，直接走兜底
    return "activity";
  }

  // ============ scheme 构造 ============
  function getOpenAppUrl(url) {
    var base = encodeURIComponent(url);
    return isAndroid()
      ? "qqnews://article_9555?url=" + base
      : "qqnews://article_9528?act=openurl&realurl=" + base;
  }

  function isQQNewsNativeUrl(url) {
    return typeof url === "string" && url.indexOf("qqnews:") === 0;
  }

  function getStartExtras(extraParams) {
    var base = {
      via: "activity",
      web_uid: getFakeDeviceId(),
      web_scenes_plat: getBrowserName(),
      web_start_from: getStartReferrer(),
      web_launched_at: Date.now(),
      web_scenes: getWebScenes(),
      project_id: PROJECT_ID
    };
    var activityId = getActivityId();
    if (activityId) base.activity_id = activityId;
    if (extraParams && typeof extraParams === "object") {
      for (var k in extraParams) {
        if (Object.prototype.hasOwnProperty.call(extraParams, k)) {
          base[k] = extraParams[k];
        }
      }
    }
    return JSON.stringify(base);
  }

  // ============ 剪贴板 ============
  function copyToClipboard(text) {
    try {
      if (typeof global.document.execCommand !== "function") return false;
      var elem = global.document.createElement("textarea");
      elem.value = text;
      global.document.body.appendChild(elem);
      elem.select();
      var ok = global.document.execCommand("copy");
      global.document.body.removeChild(elem);
      return ok;
    } catch (e) {
      return false;
    }
  }

  function copyNewsScheme(schemeUrl) {
    var textString =
      '<b id="' +
      encodeURIComponent(schemeUrl + "&time=" + new Date().getTime()) +
      '" style="margin:0px;">&nbsp;</b>';
    try {
      copyToClipboard(textString);
    } catch (err) {
      // 静默失败
    }
  }

  // ============ AppDownload 构造 ============
  function getGhAppDownloadConstructor() {
    var ad = global.AppDownload;
    if (typeof ad === "function") return ad;
    if (ad && typeof ad.default === "function") return ad.default;
    return null;
  }

  // ============ 降级（应用宝 / Universal Link） ============
  function openLaunchSchemeFallback(url, srcFrom) {
    var newSrcFrom = srcFrom || LAUNCH_SRC_FROM_FALLBACK;
    var downloadUrl = DOWNLOAD_URL_VIEW + "&";
    if (isIos() && !(isWeixin() || isQQ() || isQQbrowser())) {
      downloadUrl = LAUNCH_URL + "?";
    }
    copyNewsScheme(url);
    return global.open(
      downloadUrl +
        "srcFrom=" +
        encodeURIComponent(newSrcFrom) +
        "&downapp=launch&launchScheme=" +
        encodeURIComponent(url)
    );
  }

  function openLink(link) {
    if (isQQNews()) {
      var jsapi = global.QNJSAPI || global.qqnewsJSAPI;
      if (jsapi && jsapi.openUrl) {
        jsapi.openUrl({ url: link });
        return;
      }
    }
    if (global.self === global.top) {
      global.open(link);
    } else {
      global.open(link, "_top");
    }
  }

  function openNativeUrlOrHttpUrl(url, srcFrom) {
    if (isQQNewsNativeUrl(url)) {
      return openNativeSchemeWithSrc(url, srcFrom);
    }
    openLink(url);
  }

  function openNativeSchemeWithSrc(url, srcFrom) {
    if (isQQNews()) {
      var jsapi = global.QNJSAPI || global.qqnewsJSAPI;
      if (jsapi && jsapi.openUrl) {
        jsapi.openUrl({ url: url });
      }
      return;
    }
    var Ctor = getGhAppDownloadConstructor();
    if (isWeixin() || isQQ()) {
      try {
        if (Ctor) {
          var app = new Ctor(QQNewsAppDownloadInfo);
          if (app && typeof app.checkAppIsInstalled === "function") {
            app.checkAppIsInstalled().then(
              function (isInstall) {
                if (isInstall) {
                  app.run(url);
                  return;
                }
                openLaunchSchemeFallback(url, srcFrom);
              },
              function () {
                openLaunchSchemeFallback(url, srcFrom);
              }
            );
            return;
          }
        }
      } catch (e) {
        // 继续降级
      }
      openLaunchSchemeFallback(url, srcFrom);
      return;
    }
    openLaunchSchemeFallback(url, srcFrom);
  }

  /**
   * 拉端入口：唤起腾讯新闻并在端内打开目标页。
   * @param {Object} params
   *   hrefUrl  目标页地址，默认 window.location.href
   *   srcFrom  项目唯一标识，固定 panlegeyan_27be（与大同上报共用）
   *   extraParams 额外的 startextras 字段
   */
  function tryOpenApp(params) {
    params = params || {};
    var hrefUrl =
      params.hrefUrl != null && params.hrefUrl !== ""
        ? params.hrefUrl
        : (global.location && global.location.href) || "";
    var addParams = params.linkParams ? JSON.stringify(params.linkParams) : "";
    var ext = getStartExtras(params.extraParams);
    var activityQs =
      "_addLink=1&_addparams=" +
      encodeURIComponent(addParams) +
      "&from=" +
      encodeURIComponent(resolveSchemeFrom()) +
      "&startextras=" +
      encodeURIComponent(ext);
    var schemeUrl = getOpenAppUrl(hrefUrl);
    var fullScheme = schemeUrl + "&" + activityQs;
    // 降级链路需要的 srcFrom
    void openNativeUrlOrHttpUrl(fullScheme, getWebScenes() || PROJECT_ID);
    return true;
  }

  global.qqNewsAppLaunch = {
    tryOpenApp: tryOpenApp,
    getOpenAppUrl: getOpenAppUrl,
    isQQNews: isQQNews,
    isWeixin: isWeixin,
    isQQ: isQQ,
    isQQbrowser: isQQbrowser,
    resolveSchemeFrom: resolveSchemeFrom
  };
})(typeof window !== "undefined" ? window : this);
