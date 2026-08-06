(function (global) {
  "use strict";

  const currentScript = document.currentScript;
  const defaultAssetBase = new URL(
    "./assets/",
    currentScript ? currentScript.src : document.baseURI,
  ).href;

  const DEFAULT_GROUPS = [
    { id: 1, scale: 0.7, anchor: { x: 0.5193, y: 0.5131 }, main: "web-1-main.png", outer: "web-1-outer.png" },
    { id: 2, scale: 0.75, anchor: { x: 0.5207, y: 0.4729 }, main: "web-2-main.png", outer: "web-2-outer.png" },
    { id: 3, scale: 0.7, anchor: { x: 0.5692, y: 0.4016 }, main: "web-3-main.png", outer: "web-3-outer.png" },
  ];

  class SpiderWebEffect {
    constructor(options = {}) {
      const mountTarget = options.mountTarget || document.body;
      if (!mountTarget) {
        throw new Error("SpiderWebEffect 需要在 document.body 创建后初始化。");
      }

      const assetBase = options.assetBase || defaultAssetBase;
      const normalizedAssetBase = assetBase.endsWith("/")
        ? assetBase
        : `${assetBase}/`;
      this.assetBase = new URL(normalizedAssetBase, document.baseURI).href;
      this.groups = (options.groups || DEFAULT_GROUPS).map((group) => ({
        ...group,
        mainUrl: new URL(group.main, this.assetBase).href,
        outerUrl: new URL(group.outer, this.assetBase).href,
      }));

      if (this.groups.length === 0) {
        throw new Error("SpiderWebEffect 至少需要一组蛛网素材。");
      }

      this.root = document.createElement("div");
      this.root.className = "swe-root";
      this.root.style.zIndex = String(options.zIndex ?? 9999);

      this.effect = document.createElement("div");
      this.effect.className = "swe-effect";
      this.effect.setAttribute("aria-hidden", "true");
      if (options.size) {
        this.effect.style.setProperty("--swe-size", options.size);
      }

      this.outerLayer = this.createLayer("swe-layer swe-layer--outer");
      this.mainLayer = this.createLayer("swe-layer swe-layer--main");
      this.effect.append(this.outerLayer, this.mainLayer);
      this.root.append(this.effect);
      mountTarget.append(this.root);

      this.preloadAssets();
    }

    createLayer(className) {
      const image = document.createElement("img");
      image.className = className;
      image.alt = "";
      image.draggable = false;
      image.decoding = "async";
      return image;
    }

    preloadAssets() {
      this.groups
        .flatMap((group) => [group.mainUrl, group.outerUrl])
        .forEach((src) => {
          const image = new Image();
          image.src = src;
        });
    }

    /**
     * 在浏览器视口坐标处触发蛛网。x/y 必须是 CSS 像素坐标，
     * 例如 PointerEvent.clientX / clientY 或 getBoundingClientRect() 的坐标。
     */
    playAt(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        throw new TypeError("playAt(x, y) 需要有效的数字坐标。");
      }

      const group = this.groups[Math.floor(Math.random() * this.groups.length)];
      const rotation = Math.random() * 360;

      // 复用唯一实例：新岩点触发前先隐藏旧蛛网，再在新位置重新播放。
      this.effect.classList.remove("swe-is-playing", "swe-is-fading");
      this.mainLayer.src = group.mainUrl;
      this.outerLayer.src = group.outerUrl;
      this.effect.dataset.group = String(group.id);
      this.effect.dataset.rotation = rotation.toFixed(2);
      this.effect.style.left = `${x}px`;
      this.effect.style.top = `${y}px`;
      // 三种形态保留各自基础比例，并统一等比缩小为 0.75。
      this.effect.style.setProperty("--swe-group-scale", group.scale * 0.75);
      this.effect.style.setProperty("--swe-group-rotation", `${rotation}deg`);
      const anchorX = group.anchor && group.anchor.x || 0.5;
      const anchorY = group.anchor && group.anchor.y || 0.5;
      this.effect.style.setProperty("--swe-anchor-x", `${anchorX * 100}%`);
      this.effect.style.setProperty("--swe-anchor-y", `${anchorY * 100}%`);
      this.effect.style.setProperty("--swe-anchor-translate-x", `${anchorX * -100}%`);
      this.effect.style.setProperty("--swe-anchor-translate-y", `${anchorY * -100}%`);

      void this.effect.offsetWidth;
      this.effect.classList.add("swe-is-playing");

      return { groupId: group.id, rotation };
    }

    /**
     * 以 DOM 岩点内部的抓握位置触发。grip.x / grip.y 是 0~1 的比例，
     * { x: 0.5, y: 0.5 } 代表岩点正中心。
     */
    playOnElement(element, grip = { x: 0.5, y: 0.5 }) {
      if (!element || typeof element.getBoundingClientRect !== "function") {
        throw new TypeError("playOnElement() 需要一个有效的 DOM 岩点元素。");
      }

      const rect = element.getBoundingClientRect();
      const gripX = Number.isFinite(grip.x) ? grip.x : 0.5;
      const gripY = Number.isFinite(grip.y) ? grip.y : 0.5;
      return this.playAt(
        rect.left + rect.width * gripX,
        rect.top + rect.height * gripY,
      );
    }

    /**
     * Canvas 游戏使用：把 Canvas 内部坐标转换为当前屏幕坐标后触发。
     */
    playAtCanvasPoint(canvas, canvasX, canvasY) {
      if (!canvas || typeof canvas.getBoundingClientRect !== "function") {
        throw new TypeError("playAtCanvasPoint() 需要一个有效的 canvas 元素。");
      }

      const rect = canvas.getBoundingClientRect();
      const x = rect.left + (canvasX / canvas.width) * rect.width;
      const y = rect.top + (canvasY / canvas.height) * rect.height;
      return this.playAt(x, y);
    }

    moveAt(x, y) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) {
        return;
      }
      this.effect.style.left = `${x}px`;
      this.effect.style.top = `${y}px`;
    }

    moveAtCanvasPoint(canvas, canvasX, canvasY) {
      if (!canvas || typeof canvas.getBoundingClientRect !== "function") {
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const x = rect.left + (canvasX / canvas.width) * rect.width;
      const y = rect.top + (canvasY / canvas.height) * rect.height;
      this.moveAt(x, y);
    }

    fadeOut() {
      if (!this.effect.classList.contains("swe-is-playing")) {
        return;
      }
      this.effect.classList.add("swe-is-fading");
    }

    clear() {
      this.effect.classList.remove("swe-is-playing", "swe-is-fading");
      delete this.effect.dataset.group;
      delete this.effect.dataset.rotation;
    }

    destroy() {
      this.clear();
      this.root.remove();
    }
  }

  SpiderWebEffect.DEFAULT_GROUPS = DEFAULT_GROUPS.map((group) => ({ ...group }));
  global.SpiderWebEffect = SpiderWebEffect;
})(window);
