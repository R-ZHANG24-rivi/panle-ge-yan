"use strict";

(function initQuwanPlatform(global) {
  const PROJECT_ID = "panlegeyan_27be";
  const DEFAULT_ACTIVITY_ID = "activity_panlegeyan_20260721";
  const LEGACY_ACTIVITY_IDS = new Set([
    "panlegeyan_h5_20260721",
    "activity_panlegeyan_20260717"
  ]);
  const DATONG_APPKEY = "0WEB06Z2F15ECXWD";
  const QQNEWS_JSAPI_URL = "https://mat1.gtimg.com/qqcdn/tnewsh5/jsapi/1.3.8/qqnews-jsapi.min.js";
  const REPORT_SCHEMA = "panlegeyan_202607";
  const PAGE_ID = `pg_${PROJECT_ID}_game`;
  const RANKING_SCORE_CAP = 999999;
  const CUMULATIVE_RANKING = 0;
  const RANKING_SIZE = 50;
  const RANKING_TIMEOUT_MS = 8000;
  const RANKING_READ_RETRY_DELAY_MS = 350;

  let reporter = null;
  let cachedUserInfo = null;
  let cachedNewsToken = "";
  let loginPromise = null;
  let shareInfo = null;

  function isQQNews() {
    return /qqnews|newsapp|tencentnews/i.test(global.navigator.userAgent || "");
  }

  function isLocalPreview() {
    return global.location.protocol === "file:"
      || ["localhost", "127.0.0.1"].includes(global.location.hostname);
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(global.location.search).get(name) || "";
    } catch (error) {
      return "";
    }
  }

  function usesCustomTitleBar() {
    return isQQNews() && getQueryParam("disabletitlebar") === "1";
  }

  function shouldShowCustomShare() {
    return usesCustomTitleBar();
  }

  function getTopSafeInset() {
    return usesCustomTitleBar() ? 60 : 40;
  }

  function getActivityId() {
    const requestedActivityId = getQueryParam("activityId");
    return !requestedActivityId || LEGACY_ACTIVITY_IDS.has(requestedActivityId)
      ? DEFAULT_ACTIVITY_ID
      : requestedActivityId;
  }

  function getRankingApiBase() {
    return /test/i.test(global.location.hostname)
      ? "https://dev.inews.qq.com"
      : "https://api.prize.qq.com";
  }

  function getWebScenes() {
    return getQueryParam("from") || PROJECT_ID;
  }

  function getJsApi() {
    return global.QNJSAPI || global.qqnewsJSAPI || global.NewsJSAPI || null;
  }

  function firstText(...values) {
    const value = values.find((item) => (typeof item === "string" && item.trim()) || Number.isFinite(item));
    return value == null ? "" : String(value).trim();
  }

  function normalizeAvatarUrl(value) {
    const url = firstText(value);
    return url.startsWith("http://") ? `https://${url.slice(7)}` : url;
  }

  function parseJsonObject(value) {
    if (value && typeof value === "object") return value;
    if (typeof value !== "string" || !value.trim()) return {};
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (error) {
      return {};
    }
  }

  function isTrueFlag(value) {
    return value === true || value === 1 || value === "1" || value === "true";
  }

  function normalizeUserInfo(payload) {
    if (!payload || typeof payload !== "object") return null;
    const wrapped = payload.data && typeof payload.data === "object" ? payload.data : payload;
    const source = wrapped.userInfo && typeof wrapped.userInfo === "object"
      ? wrapped.userInfo
      : wrapped.user_info && typeof wrapped.user_info === "object"
        ? wrapped.user_info
        : wrapped;
    const loginMethod = firstText(source.account).toLowerCase();
    if (!["qq", "weixin", "phone"].includes(loginMethod)) return null;
    const providerInfo = source[loginMethod] && typeof source[loginMethod] === "object"
      ? source[loginMethod]
      : source[`${loginMethod}V2`] && typeof source[`${loginMethod}V2`] === "object"
        ? source[`${loginMethod}V2`]
        : {};
    const lastLoginInfo = parseJsonObject(source.lastLoginInfo);
    const lastLoginUser = lastLoginInfo.user_info && typeof lastLoginInfo.user_info === "object"
      ? lastLoginInfo.user_info
      : {};
    const expired = [
      source.isExpired,
      source.expired,
      source.loginExpired,
      source.isLoginExpired,
      source.tokenExpired
    ].some(isTrueFlag);
    if (expired) return null;
    const nickname = firstText(
      providerInfo.name,
      providerInfo.nick,
      providerInfo.nickname,
      lastLoginUser.nick,
      source.nick,
      source.nickname,
      source.nickName,
      source.name,
      source.userName
    );
    const avatar = normalizeAvatarUrl(firstText(
      providerInfo.icon,
      providerInfo.avatar,
      providerInfo.head_url,
      providerInfo.headUrl,
      lastLoginUser.head_url,
      source.head,
      source.head_url,
      source.headUrl,
      source.avatar,
      source.avatarUrl
    ));
    const userId = firstText(
      source.uid,
      source.userId,
      source.suid,
      providerInfo.uid,
      providerInfo.userId,
      providerInfo.suid,
      providerInfo.openid,
      lastLoginUser.suid,
      lastLoginUser.openid
    );
    return {
      account: loginMethod,
      loginMethod,
      loginMethodLabel: { qq: "QQ", weixin: "微信", phone: "手机号" }[loginMethod],
      nickname: nickname || "腾讯新闻用户",
      avatar,
      userId,
      isWeakLogin: Boolean(source.isWeakLogin),
      expired: false,
      raw: source
    };
  }

  function normalizeRankingExtra(value, fallback = {}) {
    const parsed = parseJsonObject(value);
    const nested = parseJsonObject(parsed.data || parsed.meta || parsed.extra);
    const source = { ...fallback, ...parsed, ...nested };
    const height = Number(
      source.heightMeters
      ?? source.height_meters
      ?? source.height
      ?? source.climbHeight
      ?? source.climb_height
      ?? source.ranking_height
    );
    const duration = Number(
      source.durationSeconds
      ?? source.duration_seconds
      ?? source.duration
      ?? source.time
      ?? source.elapsed
      ?? source.elapsed_time
      ?? source.ranking_duration
    );
    return {
      height: Number.isFinite(height) && height > 0 ? height : 0,
      duration: Number.isFinite(duration) && duration > 0 ? duration : 0
    };
  }

  function getCurrentUser() {
    if (!cachedUserInfo) return null;
    return {
      account: cachedUserInfo.account,
      loginMethod: cachedUserInfo.loginMethod,
      loginMethodLabel: cachedUserInfo.loginMethodLabel,
      nickname: cachedUserInfo.nickname,
      avatar: cachedUserInfo.avatar,
      userId: cachedUserInfo.userId,
      isWeakLogin: cachedUserInfo.isWeakLogin,
      expired: cachedUserInfo.expired
    };
  }

  function isLoggedIn() {
    return Boolean(cachedUserInfo && cachedUserInfo.account);
  }

  function loadScript(src, id) {
    const existing = global.document.getElementById(id);
    if (existing) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = global.document.createElement("script");
      const timer = global.setTimeout(() => {
        script.remove();
        reject(new Error(`${id} 加载超时`));
      }, 8000);
      script.id = id;
      script.src = src;
      script.async = true;
      script.onload = () => {
        global.clearTimeout(timer);
        resolve();
      };
      script.onerror = () => {
        global.clearTimeout(timer);
        reject(new Error(`${id} 加载失败`));
      };
      global.document.head.appendChild(script);
    });
  }

  async function loadPlatformSdks() {
    if (isLocalPreview()) return;
    const tasks = [];
    if (isQQNews() && !global.QNJSAPI && !global.qqnewsJSAPI) {
      tasks.push(loadScript(QQNEWS_JSAPI_URL, "qqnews-jsapi"));
    }
    const results = await Promise.allSettled(tasks);
    results.forEach((result) => {
      if (result.status === "rejected") console.warn("[QuwanPlatform]", result.reason);
    });
  }

  function getCookie(name) {
    try {
      const match = global.document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
      return match ? decodeURIComponent(match[1]) : "";
    } catch (error) {
      return "";
    }
  }

  function extractNewsToken(payload) {
    if (!payload || typeof payload !== "object") return "";
    const wrapped = payload.data && typeof payload.data === "object" ? payload.data : payload;
    const source = wrapped.userInfo && typeof wrapped.userInfo === "object"
      ? wrapped.userInfo
      : wrapped.user_info && typeof wrapped.user_info === "object"
        ? wrapped.user_info
        : wrapped;
    return firstText(
      source.news_token,
      source.newsToken,
      wrapped.news_token,
      wrapped.newsToken,
      payload.news_token,
      payload.newsToken
    );
  }

  function calculateBknSign(newsToken) {
    if (!newsToken) return 0;
    let hash = 5381;
    for (let index = 0; index < newsToken.length; index += 1) {
      hash += (hash << 5) + newsToken.charCodeAt(index);
    }
    return hash & 0x7fffffff;
  }

  function initReport() {
    if (reporter) return reporter;
    if (isLocalPreview()) {
      reporter = {
        reportEvent(payload) {
          console.debug("[QuwanReport][local]", payload);
        },
        setPublicParams() {}
      };
      return reporter;
    }

    const Ctor = global.UniversalReport || global.universalReport;
    if (!Ctor) {
      console.warn("[QuwanReport] 大同 SDK 未加载");
      return null;
    }
    const publicParams = {
      project_id: PROJECT_ID,
      web_scenes: getWebScenes(),
      report_schema: REPORT_SCHEMA
    };
    publicParams.activity_id = getActivityId();

    try {
      reporter = new Ctor({
        beacon: DATONG_APPKEY,
        publicParams,
        enableBeaconReportRetry: true,
        enableCrawlerFilter: true,
        isDisableObserver: false
      });
      return reporter;
    } catch (error) {
      console.error("[QuwanReport] 初始化失败", error);
      return null;
    }
  }

  function reportEvent(eventName, businessParams = {}, pgid = PAGE_ID) {
    const instance = reporter || initReport();
    if (!instance || typeof instance.reportEvent !== "function") return;
    try {
      instance.reportEvent({
        pgid,
        eventName,
        businessParams: {
          report_schema: REPORT_SCHEMA,
          ...businessParams
        }
      });
    } catch (error) {
      console.warn("[QuwanReport] 事件上报失败", eventName, error);
    }
  }

  function buildShareUrl() {
    try {
      const url = new URL(global.location.href);
      ["debug", "forceTheme", "report"].forEach((key) => url.searchParams.delete(key));
      url.hash = "";
      return url.toString();
    } catch (error) {
      return global.location.href.split("#")[0];
    }
  }

  function createShareInfo(overrides = {}) {
    return {
      title: "攀了个岩｜趣玩攀岩挑战",
      longTitle: "按住蓄力、松手抓点，你能攀多高？",
      content: "来腾讯新闻趣玩挑战《攀了个岩》，看看谁能登得更高！",
      url: buildShareUrl(),
      imgUrl: new URL("assets/ui/figma/cover_title.png", global.location.href).toString(),
      ...overrides
    };
  }

  async function setShareInfo(overrides = {}) {
    shareInfo = createShareInfo(overrides);
    if (!isQQNews()) return { success: false, reason: "outside_app" };
    const api = getJsApi();
    if (!api || typeof api.setShareInfo !== "function") {
      return { success: false, reason: "jsapi_unavailable" };
    }
    try {
      await Promise.resolve(api.setShareInfo(shareInfo));
      return { success: true };
    } catch (error) {
      console.warn("[QuwanShare] setShareInfo 失败", error);
      return { success: false, reason: "set_failed", error };
    }
  }

  async function showShareMenu(overrides = {}) {
    const setResult = await setShareInfo(overrides);
    const api = getJsApi();
    if (!isQQNews() || !api || typeof api.showShareMenu !== "function") {
      return { success: false, reason: setResult.reason || "jsapi_unavailable" };
    }
    try {
      await Promise.resolve(api.showShareMenu());
      reportEvent("share_menu_open", { source: "canvas_button" });
      return { success: true };
    } catch (error) {
      reportEvent("share_menu_fail", { message: String(error && error.message || error) });
      return { success: false, reason: "open_failed", error };
    }
  }

  async function refreshUserInfo(retryCount = 0) {
    const api = getJsApi();
    if (!isQQNews() || !api || typeof api.getUserInfo !== "function") return null;
    try {
      const userInfo = await Promise.resolve(api.getUserInfo());
      const wrapped = userInfo && userInfo.data && typeof userInfo.data === "object" ? userInfo.data : userInfo;
      if (wrapped && Number(wrapped.errCode) === 1001 && retryCount < 3) {
        await new Promise((resolve) => global.setTimeout(resolve, 400));
        return refreshUserInfo(retryCount + 1);
      }
      const normalizedUser = normalizeUserInfo(userInfo);
      if (!normalizedUser || !normalizedUser.account) {
        cachedUserInfo = null;
        cachedNewsToken = "";
        return null;
      }
      const previousIdentity = cachedUserInfo && firstText(cachedUserInfo.userId, cachedUserInfo.account);
      const nextIdentity = firstText(normalizedUser.userId, normalizedUser.account);
      if (previousIdentity && nextIdentity && previousIdentity !== nextIdentity) {
        cachedNewsToken = "";
      }
      const newsToken = extractNewsToken(userInfo);
      if (newsToken) cachedNewsToken = newsToken;
      cachedUserInfo = normalizedUser;
      return getCurrentUser();
    } catch (error) {
      if (retryCount < 2) {
        await new Promise((resolve) => global.setTimeout(resolve, 400));
        return refreshUserInfo(retryCount + 1);
      }
      return null;
    }
  }

  async function getBknSign() {
    const cookieToken = getCookie("news_token");
    if (cookieToken) cachedNewsToken = cookieToken;
    if (!cachedNewsToken && cachedUserInfo && cachedUserInfo.raw) {
      cachedNewsToken = extractNewsToken(cachedUserInfo.raw);
    }
    if (!cachedNewsToken) await refreshUserInfo();
    return calculateBknSign(cachedNewsToken);
  }

  async function ensureLogin() {
    if (!isQQNews()) {
      return { success: false, error: "请在腾讯新闻 App 内登录后参与排行" };
    }
    if (cachedUserInfo && cachedUserInfo.account) {
      return { success: true, userInfo: getCurrentUser() };
    }
    if (loginPromise) return loginPromise;

    loginPromise = (async () => {
      const existingUser = await refreshUserInfo();
      if (existingUser && existingUser.account) {
        return { success: true, userInfo: existingUser };
      }
      const api = getJsApi();
      if (!api || typeof api.login !== "function") {
        return { success: false, reason: "login_api_unavailable", error: "暂时无法调起登录" };
      }
      try {
        const loginResult = await Promise.resolve(api.login({
          type: "all",
          from: "game_h5"
        }));
        if (loginResult && loginResult.isLogin === false) {
          return { success: false, reason: "login_cancelled", error: "你取消了登录" };
        }
        let userInfo = null;
        for (let attempt = 0; attempt < 3 && !userInfo; attempt += 1) {
          await new Promise((resolve) => global.setTimeout(resolve, attempt === 0 ? 250 : 400));
          userInfo = await refreshUserInfo();
        }
        if (!userInfo) {
          return { success: false, reason: "login_incomplete", error: "登录未完成" };
        }
        reportEvent("login_success", { has_avatar: userInfo.avatar ? 1 : 0 });
        return { success: true, userInfo };
      } catch (error) {
        reportEvent("login_fail", { message: String(error && error.message || error) });
        return { success: false, reason: "login_failed", error: "登录失败" };
      }
    })();
    try {
      return await loginPromise;
    } finally {
      loginPromise = null;
    }
  }

  function normalizeRankingResult(result) {
    const data = result && result.data ? result.data : {};
    const board = Array.isArray(data.ranking_board) ? data.ranking_board : [];
    const entries = board.map((item, index) => {
      const nickname = item && item.user_info && firstText(
        item.user_info.nick,
        item.user_info.nickname,
        item.user_info.name
      );
      if (!nickname) return null;
      const extra = normalizeRankingExtra(item && item.extra, {
        height: item && (item.height ?? item.climb_height ?? (item.ranking && item.ranking.height)),
        duration: item && (item.duration ?? item.elapsed_time ?? (item.ranking && item.ranking.duration))
      });
      return {
        rank: Number(item && item.ranking && item.ranking.rank) || index + 1,
        score: Number(item && item.ranking && item.ranking.score) || 0,
        nickname,
        userId: item && item.user_info && firstText(
          item.user_info.suid,
          item.user_info.openid,
          item.user_info.user_id
        ),
        avatar: item && item.user_info && normalizeAvatarUrl(firstText(
          item.user_info.head_url,
          item.user_info.head,
          item.user_info.avatar,
          item.user_info.avatarUrl
        )) || "",
        height: extra.height,
        duration: extra.duration
      };
    }).filter(Boolean);
    const bestRank = data.best_rank || {};
    const ownBoardEntry = entries.find((entry) => (
      Number(bestRank.rank) > 0
      && entry.rank === Number(bestRank.rank)
      && entry.score === Number(bestRank.score)
    ));
    const ownExtra = normalizeRankingExtra(data.best_rank_extra);
    return {
      entries,
      own: {
        rank: Number(bestRank.rank) || 0,
        score: Number(bestRank.score) || 0,
        nickname: cachedUserInfo && cachedUserInfo.nickname || "我的最高记录",
        userId: cachedUserInfo && cachedUserInfo.userId || "",
        avatar: cachedUserInfo && cachedUserInfo.avatar || "",
        height: ownExtra.height || ownBoardEntry && ownBoardEntry.height || 0,
        duration: ownExtra.duration || ownBoardEntry && ownBoardEntry.duration || 0
      },
      totalPlayers: Number(data.ranking_size) || entries.length,
      lessScoreCount: Number(data.less_score_count) || 0
    };
  }

  async function fetchWithTimeout(url, options, timeoutMs = RANKING_TIMEOUT_MS) {
    const controller = typeof global.AbortController === "function" ? new global.AbortController() : null;
    let timer = null;
    const timeoutPromise = new Promise((resolve, reject) => {
      timer = global.setTimeout(() => {
        if (controller) controller.abort();
        const timeoutError = new Error("排行榜请求超时，请稍后重试");
        timeoutError.retryable = true;
        reject(timeoutError);
      }, timeoutMs);
    });
    try {
      return await Promise.race([
        global.fetch(url, { ...options, ...(controller ? { signal: controller.signal } : {}) }),
        timeoutPromise
      ]);
    } catch (error) {
      if (error && error.name === "AbortError") {
        const timeoutError = new Error("排行榜请求超时，请稍后重试");
        timeoutError.retryable = true;
        throw timeoutError;
      }
      if (error && typeof error === "object" && error.retryable !== true) {
        error.retryable = true;
      }
      throw error;
    } finally {
      if (timer) global.clearTimeout(timer);
    }
  }

  async function postRanking(path, body) {
    const response = await fetchWithTimeout(`${getRankingApiBase()}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (!response.ok) {
      const httpError = new Error(`排行榜服务异常（HTTP ${response.status}）`);
      httpError.code = response.status;
      httpError.retryable = response.status === 429 || response.status >= 500;
      throw httpError;
    }
    const result = await response.json();
    const ok = result && (result.code === 0 || result.ret === 0);
    if (!ok) {
      const requestError = new Error(result && (result.msg || result.errmsg) || "排行榜接口返回失败");
      requestError.code = Number(result && (result.code ?? result.ret)) || 0;
      throw requestError;
    }
    return normalizeRankingResult(result);
  }

  async function getRankingBoard() {
    if (isLocalPreview()) {
      return { success: true, localPreview: true, data: { entries: [], own: null } };
    }
    let lastError = null;
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        const data = await postRanking("/activity/ranking_board", {
          activityId: getActivityId(),
          cumulativeRanking: CUMULATIVE_RANKING,
          rankingSize: RANKING_SIZE
        });
        reportEvent("ranking_load_success", { count: data.entries.length, retry_count: attempt });
        return { success: true, data };
      } catch (error) {
        lastError = error;
        if (attempt === 0 && error && error.retryable) {
          await new Promise((resolve) => global.setTimeout(resolve, RANKING_READ_RETRY_DELAY_MS));
          continue;
        }
        break;
      }
    }
    reportEvent("ranking_load_fail", { message: String(lastError && lastError.message || lastError) });
    if (lastError && lastError.code === 31032) {
      return {
        success: false,
        reason: "activity_not_ready",
        error: "榜单尚未创建，登录并完成一局后即可参与排行"
      };
    }
    return { success: false, error: lastError && lastError.message || "排行榜加载失败" };
  }

  async function submitScore(score, details = {}) {
    if (isLocalPreview()) {
      return { success: true, localPreview: true, data: { entries: [], own: null } };
    }
    const loginResult = await ensureLogin();
    if (!loginResult.success) return loginResult;
    const bknSign = await getBknSign();
    if (!bknSign) return { success: false, error: "未读取到登录签名，请重新登录" };
    const safeScore = Math.min(RANKING_SCORE_CAP, Math.max(0, Math.floor(Number(score) || 0)));
    const safeHeight = Math.min(99999.9, Math.max(0, Math.round(Number(details.height) * 10) / 10 || 0));
    const safeDuration = Math.min(86400, Math.max(0, Math.round(Number(details.duration)) || 0));
    const extra = JSON.stringify({
      height: safeHeight,
      duration: safeDuration,
      version: 1
    });
    try {
      const data = await postRanking("/activity/ranking", {
        activityId: getActivityId(),
        cumulativeRanking: CUMULATIVE_RANKING,
        rankingSize: RANKING_SIZE,
        score: safeScore,
        bknSign,
        extra
      });
      reportEvent("ranking_submit_success", {
        score: safeScore,
        height: safeHeight,
        duration: safeDuration,
        rank: data.own && data.own.rank || 0
      });
      return { success: true, data };
    } catch (error) {
      reportEvent("ranking_submit_fail", { message: String(error && error.message || error) });
      if (error && error.code === 31032) {
        return {
          success: false,
          reason: "activity_forbidden",
          error: "榜单后台尚未授权，请联系活动管理员"
        };
      }
      return { success: false, error: error.message || "成绩提交失败" };
    }
  }

  async function closePage() {
    const api = getJsApi();
    if (isQQNews() && api && typeof api.closeWebview === "function") {
      try {
        await Promise.resolve(api.closeWebview());
        return true;
      } catch (error) {
        console.warn("[QuwanNav] closeWebview 失败", error);
      }
    }
    if (global.history.length > 1) {
      global.history.back();
      return true;
    }
    return false;
  }

  async function disableGestureQuit() {
    const api = getJsApi();
    if (!isQQNews() || !api || typeof api.setGestureQuit !== "function") return false;
    try {
      await Promise.resolve(api.setGestureQuit({ enabled: true }));
      return true;
    } catch (error) {
      console.warn("[QuwanGesture] 关闭右滑退出失败", error);
      return false;
    }
  }

  async function init() {
    global.document.documentElement.dataset.qqnews = isQQNews() ? "inside" : "outside";
    global.document.documentElement.dataset.titlebar = usesCustomTitleBar() ? "custom" : "native";
    await loadPlatformSdks();
    initReport();
    setShareInfo();
    if (isQQNews()) {
      refreshUserInfo();
      disableGestureQuit();
      global.setTimeout(() => setShareInfo(), 800);
    }
    reportEvent("page_ready", {
      environment: isQQNews() ? "qqnews" : "outside",
      custom_titlebar: usesCustomTitleBar() ? 1 : 0
    });
  }

  global.QuwanPlatform = Object.freeze({
    PROJECT_ID,
    ACTIVITY_ID: DEFAULT_ACTIVITY_ID,
    RANKING_SCORE_CAP,
    PAGE_ID,
    init,
    isQQNews,
    isLocalPreview,
    usesCustomTitleBar,
    shouldShowCustomShare,
    getTopSafeInset,
    reportEvent,
    setShareInfo,
    showShareMenu,
    refreshUserInfo,
    ensureLogin,
    getCurrentUser,
    isLoggedIn,
    getRankingBoard,
    submitScore,
    closePage,
    disableGestureQuit
  });

  global.document.addEventListener("DOMContentLoaded", init, { once: true });
})(window);
