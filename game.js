"use strict";

const DEBUG = false;

const CONFIG = {
  logicalWidth: 375,
  logicalHeight: 812,
  chargeDuration: 1.4,
  minReachDistance: 70,
  maxReachDistance: 260,
  minimumTargetDistance: 90,
  maximumTargetDistance: 235,
  startingTolerance: 28,
  minimumTolerance: 12,
  toleranceDecay: 0.35,
  pixelsPerMeter: 100,
  wallPadding: 48,
  playerBodyOffsetY: 96,
  chargePlayerBodyOffsetY: 66,
  cameraPlayerScreenY: 545,
  initialHoldCount: 14,
  holdBufferAhead: 14,
  removeBelowCamera: 260,

  supportHoldsPerRouteMin: 3,
  supportHoldsPerRouteMax: 6,
  supportOffsetXMin: 35,
  supportOffsetXMax: 118,
  supportOffsetYMin: 28,
  supportOffsetYMax: 176,
  supportMinSpacing: 24,
  footMinSeparation: 42,

  upperArmLength: 36,
  forearmLength: 36,
  thighLength: 45,
  shinLength: 45,
  torsoLength: 52,
  shoulderWidth: 28,
  hipWidth: 22,
  headRadius: 14,
  handRadius: 5,
  footRadius: 6,

  armReachMin: 16,
  armReachMax: 72,
  armRestMinDistance: 58,
  legReachMin: 20,
  legReachMax: 90,

  maxBackswingDistance: 42,
  maxChargeDrop: 14,
  nearMoveThreshold: 145,

  releaseDuration: 0.08,
  launchDuration: 0.24,
  leadHandContactDuration: 0.12,
  bodyFollowDuration: 0.28,
  handRestDuration: 0.42,
  trailingHandDuration: 0.18,
  feetRepositionDuration: 0.25,
  settleDuration: 0.16,
  cameraFollowDuration: 0.24,
  fallDuration: 0.5,
  ropeCatchDuration: 0.55,
  autoBelayDescentSpeed: 185,

  restSwayPeriod: 2.8,
  restSwayAmplitude: 0.045,
  chalkShakeInterval: 2,
  chalkShakeDuration: 1.05,
  chalkShakeAmplitude: 7,
  powerUpChance: 0.13,
  powerUpMinGap: 5,
  powerUpDurations: {
    magnet: 5,
    magnifier: 10
  }
};

const POWER_UPS = {
  magnet: {
    label: "吸铁石",
    color: "#ff3aa9"
  },
  magnifier: {
    label: "放大镜",
    color: "#34a9c4"
  }
};

const ACCURACY_TIERS = {
  precise: {
    label: "精准！",
    points: 100,
    maxRatio: 0.25,
    color: "#FD5F7C",
    bar: "#ff7ac7"
  },
  good: {
    label: "不错！",
    points: 60,
    maxRatio: 0.65,
    color: "#355ABA",
    bar: "#55c6df"
  },
  risky: {
    label: "惊险！",
    points: 30,
    maxRatio: 1,
    color: "#FEAB0B",
    bar: "#ffb23f"
  }
};

const THEME = {
  wall: {
    base: "#eaf8fc",
    light: "#f8fdff",
    mid: "#d8f1f7",
    blue: "#9fddeb",
    deepBlue: "#39b8d7",
    darkBlue: "#168ca7",
    pink: "#f4a5ca",
    seam: "rgba(124, 174, 190, 0.28)",
    bolt: "#9eb9c3"
  },
  holds: {
    route: ["#1264b4", "#247fd0", "#0f4f8f", "#f7fafb", "#18242c"],
    support: ["#3e91cf", "#78b9df", "#ffffff", "#17242b", "#ee5b9b"],
    visualScale: 0.72,
    contactStroke: "#fff9d6",
    boltOuter: "#f7fafb",
    boltInner: "#14202a"
  },
  player: {
    skin: "#f3d5bd",
    skinLine: "#d9ab8d",
    hair: "#352a29",
    shirt: "#f48fbd",
    shirtDark: "#dc6fa5",
    shorts: "#61c7d6",
    shortsDark: "#3fa9bd",
    harness: "#195a9c",
    chalkBag: "#82c5e8",
    shoe: "#15232c",
    shoeAccent: "#3b85aa"
  },
  rope: {
    main: "#7cbce8",
    light: "#d8f2ff"
  },
  ui: {
    card: "rgba(255,255,255,0.94)",
    text: "#172126",
    pointAccent: "#ef7449",
    heightAccent: "#347948",
    cardShadow: "rgba(73, 116, 133, 0.18)"
  },
  charge: {
    base: "rgba(231, 239, 240, 0.72)",
    green: "#47bc68",
    yellow: "#d8cf35",
    orange: "#f29a2e",
    red: "#ee3f32"
  }
};

const HOLD_SHAPES = ["jug", "blob", "triangle", "sloper", "pinch", "smallCrimp", "volume"];

const ROUTE_HOLD_ASSET_BASE = "assets/pink_climbing_holds_complete_assets/individual_png";
const SUPPORT_HOLD_ASSET_BASE = "assets/light_purple_climbing_holds_complete_assets/individual_png";
const ROUTE_HOLD_ASSET_FILES = Array.from(
  { length: 22 },
  (_, index) => `${ROUTE_HOLD_ASSET_BASE}/pink_climbing_hold_${String(index + 1).padStart(2, "0")}.png`
);
const SUPPORT_HOLD_ASSET_FILES = Array.from(
  { length: 22 },
  (_, index) => `${SUPPORT_HOLD_ASSET_BASE}/light_purple_climbing_hold_${String(index + 1).padStart(2, "0")}.png`
);
const PLAYER_ASSET_FILES = {
  fallingPose: "assets/player/falling-pose.png",
  climbingPose: "assets/player/climbing-pose.png",
  headFront: "assets/player/head-front.png",
  headBack: "assets/player/head-back.png",
  hair02Front: "assets/player/outfit/hair-02-front.png",
  hair02Back: "assets/player/outfit/hair-02-back.png",
  hairFemaleFront: "assets/player/outfit/hair-female-front.png",
  hairFemaleBack: "assets/player/outfit/hair-female-back.png",
  hairMaleFront: "assets/player/outfit/hair-male-front.png",
  hairMaleBack: "assets/player/outfit/hair-male-back.png",
  headMaleFront: "assets/player/outfit/head-male-back.png",
  glasses01: "assets/player/outfit/glasses-01.png",
  shirt: "assets/player/shirt.png?v=20260708-rounded",
  shirtFemale: "assets/player/outfit/shirt-female.png",
  shirtMale: "assets/player/outfit/shirt-male.png",
  pantsBlue: "assets/player/outfit/pants-blue.png",
  pantsBrown: "assets/player/outfit/pants-brown.png",
  shorts: "assets/player/shorts.png",
  leftUpperArm: "assets/player/left-upper-arm.png",
  leftLowerArm: "assets/player/left-lower-arm.png",
  rightUpperArm: "assets/player/right-upper-arm.png",
  rightLowerArm: "assets/player/right-lower-arm.png",
  leftHand: "assets/player/left-hand.png",
  rightHand: "assets/player/right-hand.png",
  leftThigh: "assets/player/left-thigh.png",
  leftShin: "assets/player/left-shin.png",
  rightThigh: "assets/player/right-thigh.png",
  rightShin: "assets/player/right-shin.png",
  hips: "assets/player/hips.png",
  belt: "assets/player/belt.png",
  chalkBagSprite: "assets/player/chalk-bag.png",
  chalkBag01: "assets/player/outfit/chalk-bag-01.png",
  chalkBag02: "assets/player/outfit/chalk-bag-02.png",
  leftFoot: "assets/player/left-foot.png",
  rightFoot: "assets/player/right-foot.png"
};

const UI_ICON_FILES = {
  back: "assets/ui/icon-back.png",
  skin: "assets/ui/icon-skin.png?v=20260710-shirt-1",
  restart: "assets/ui/icon-restart.png",
  rank: "assets/ui/icon-rank.png",
  soundOn: "assets/ui/icon-sound-on.png",
  soundOff: "assets/ui/icon-sound-off.png",
  share: "assets/ui/icon-share.png"
};

const FEEDBACK_ASSET_FILES = {
  good: "assets/ui/feedback/feedback-good.png?v=20260710-feedback-2",
  risky: "assets/ui/feedback/feedback-risky.png?v=20260710-feedback-2",
  precise: "assets/ui/feedback/feedback-precise.png?v=20260710-feedback-2",
  combo2: "assets/ui/feedback/combo-2.png?v=20260710-feedback-2",
  combo3: "assets/ui/feedback/combo-3.png?v=20260710-feedback-2",
  combo4: "assets/ui/feedback/combo-4.png?v=20260710-feedback-2",
  combo5: "assets/ui/feedback/combo-5.png?v=20260710-feedback-2",
  combo6: "assets/ui/feedback/combo-6.png?v=20260710-feedback-2",
  combo7: "assets/ui/feedback/combo-7.png?v=20260710-feedback-2",
  combo8: "assets/ui/feedback/combo-8.png?v=20260710-feedback-2",
  combo9: "assets/ui/feedback/combo-9.png?v=20260710-feedback-2",
  combo10: "assets/ui/feedback/combo-10.png?v=20260710-feedback-2"
};

const AUDIO_FILES = {
  bgm: "assets/audio/bgm1.mp3?v=20260710-grip-glide",
  grabSuccess: "assets/audio/grab-success.ogg"
};

const DEFAULT_OUTFIT = {
  hair: "hair_01",
  accessory: "none",
  shirt: "shirt_01",
  pants: "pants_blue",
  chalkBag: "chalk_01",
  glasses: false
};

const OUTFIT_STORAGE_KEY = "ropeClimbJumpOutfit";
const OUTFIT_PARTS = [
  { id: "hair", label: "发型" },
  { id: "accessory", label: "配饰" },
  { id: "shirt", label: "上衣" },
  { id: "pants", label: "裤子" },
  { id: "chalkBag", label: "粉袋" }
];
const OUTFIT_OPTIONS = {
  hair: [
    { id: "hair_01", label: "默认" },
    { id: "hair_female", label: "长发" },
    { id: "hair_male", label: "短发" }
  ],
  accessory: [
    { id: "none", label: "无" },
    { id: "glasses_01", label: "眼镜" }
  ],
  shirt: [
    { id: "shirt_01", label: "粉色" },
    { id: "shirt_female", label: "蓝绿" },
    { id: "shirt_male", label: "青色" }
  ],
  pants: [
    { id: "pants_blue", label: "蓝裤" },
    { id: "pants_brown", label: "棕裤" }
  ],
  chalkBag: [
    { id: "chalk_01", label: "粉袋 1" },
    { id: "chalk_02", label: "粉袋 2" }
  ]
};

const STATE = {
  LOADING: "LOADING",
  START: "START",
  READY: "READY",
  CHARGING: "CHARGING",
  RELEASING: "RELEASING",
  LAUNCHING: "LAUNCHING",
  LEAD_HAND_CONTACT: "LEAD_HAND_CONTACT",
  BODY_FOLLOW: "BODY_FOLLOW",
  HAND_REST: "HAND_REST",
  TRAILING_HAND_MOVE: "TRAILING_HAND_MOVE",
  FEET_REPOSITION: "FEET_REPOSITION",
  SETTLING: "SETTLING",
  CAMERA_FOLLOW: "CAMERA_FOLLOW",
  FALLING: "FALLING",
  AUTO_DESCEND: "AUTO_DESCEND",
  ROPE_CATCH: "ROPE_CATCH",
  GAME_OVER: "GAME_OVER",
  RESTARTING: "RESTARTING"
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpPoint(a, b, t) {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3);
}

function easeInCubic(t) {
  t = clamp(t, 0, 1);
  return t * t * t;
}

function easeInOutCubic(t) {
  t = clamp(t, 0, 1);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function normalize(vector) {
  const length = Math.hypot(vector.x, vector.y);
  if (length < 0.0001) {
    return { x: 0, y: -1 };
  }
  return { x: vector.x / length, y: vector.y / length };
}

function add(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function subtract(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function scale(vector, amount) {
  return { x: vector.x * amount, y: vector.y * amount };
}

function rotate(point, angle) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}

function formatMeters(value) {
  return `${value.toFixed(1)} m`;
}

function hashNumber(value) {
  let n = Math.floor(Math.abs(value) * 9973) + 0x9e3779b9;
  n = Math.imul(n ^ (n >>> 16), 0x85ebca6b);
  n = Math.imul(n ^ (n >>> 13), 0xc2b2ae35);
  return (n ^ (n >>> 16)) >>> 0;
}

function hashUnit(value) {
  return (hashNumber(value) % 10000) / 10000;
}

function shadeHex(hex, amount) {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) {
    return hex;
  }
  const channels = [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
  const shifted = channels.map((channel) => clamp(channel + amount, 0, 255));
  return `#${shifted.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;
}

function solveTwoBoneIK(root, target, upperLength, lowerLength, bendDirection) {
  const toTarget = subtract(target, root);
  const rawDistance = Math.hypot(toTarget.x, toTarget.y);
  const maxReach = upperLength + lowerLength;
  const minReach = Math.abs(upperLength - lowerLength) + 0.001;
  const clampedDistance = clamp(rawDistance, minReach, maxReach - 0.001);
  const direction = rawDistance < 0.001 ? { x: 0, y: 1 } : scale(toTarget, 1 / rawDistance);
  const end = add(root, scale(direction, clampedDistance));
  const a = (upperLength * upperLength - lowerLength * lowerLength + clampedDistance * clampedDistance) / (2 * clampedDistance);
  const h = Math.sqrt(Math.max(0, upperLength * upperLength - a * a));
  const perpendicular = { x: -direction.y, y: direction.x };
  const bend = bendDirection || perpendicular;
  const bendSign = perpendicular.x * bend.x + perpendicular.y * bend.y < 0 ? -1 : 1;
  const normal = scale(perpendicular, bendSign);
  const mid = add(root, scale(direction, a));
  const joint = add(mid, scale(normal, h));
  return {
    joint,
    end,
    clipped: rawDistance > maxReach,
    upperActual: distance(root, joint),
    lowerActual: distance(joint, end)
  };
}

class ScoreManager {
  constructor() {
    this.storageKey = "ropeClimbJumpBestScore";
    this.best = this.loadBestScore();
  }

  loadBestScore() {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        return { holds: 0, height: 0, score: 0 };
      }
      const parsed = JSON.parse(raw);
      return {
        holds: Number(parsed.holds) || 0,
        height: Number(parsed.height) || 0,
        score: Number(parsed.score) || 0
      };
    } catch (error) {
      return { holds: 0, height: 0, score: 0 };
    }
  }

  saveBestScore(score) {
    const nextBest = {
      holds: Math.max(this.best.holds, score.holds),
      height: Math.max(this.best.height, score.height),
      score: Math.max(this.best.score || 0, score.score || 0)
    };
    const changed = nextBest.holds !== this.best.holds
      || nextBest.height !== this.best.height
      || nextBest.score !== this.best.score;
    this.best = nextBest;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.best));
    } catch (error) {
      // Storage can be disabled; gameplay should continue without records.
    }
    return changed;
  }
}

class Camera {
  constructor() {
    this.y = 0;
    this.startY = 0;
    this.targetY = 0;
    this.elapsed = 0;
    this.duration = CONFIG.cameraFollowDuration;
    this.active = false;
  }

  snapToPlayer(player) {
    this.y = player.worldY - CONFIG.cameraPlayerScreenY;
    this.startY = this.y;
    this.targetY = this.y;
    this.elapsed = 0;
    this.active = false;
  }

  beginFollow(player) {
    this.beginFollowToWorldY(player.worldY);
  }

  beginFollowToWorldY(worldY) {
    this.startY = this.y;
    this.targetY = worldY - CONFIG.cameraPlayerScreenY;
    this.elapsed = 0;
    this.duration = CONFIG.cameraFollowDuration;
    this.active = Math.abs(this.targetY - this.startY) > 0.5;
  }

  update(deltaTime) {
    if (!this.active) {
      return true;
    }
    this.elapsed += deltaTime;
    const t = easeOutCubic(this.elapsed / this.duration);
    this.y = lerp(this.startY, this.targetY, t);
    if (t >= 1) {
      this.y = this.targetY;
      this.active = false;
      return true;
    }
    return false;
  }
}

class HoldAssetManager {
  constructor(routeFiles, supportFiles) {
    this.routeAssets = this.loadAssets(routeFiles, "route");
    this.supportAssets = this.loadAssets(supportFiles, "support");
    this.assets = [...this.routeAssets, ...this.supportAssets];
  }

  loadAssets(files, group) {
    return files.map((src, index) => {
      const image = new Image();
      const asset = {
        src,
        image,
        loaded: false,
        failed: false,
        index,
        group
      };
      image.onload = () => {
        asset.loaded = true;
      };
      image.onerror = () => {
        asset.failed = true;
      };
      image.src = src;
      return asset;
    });
  }

  getAssetForHold(hold, options = {}) {
    const useRouteAsset = options.useRouteAsset || hold.type === "route";
    const pool = useRouteAsset ? this.routeAssets : this.supportAssets;
    if (pool.length === 0) {
      return null;
    }
    if (useRouteAsset) {
      const sequenceSeed = hold.sequence ?? hold.routeId ?? 0;
      return pool[hashNumber(hold.id * 17 + sequenceSeed * 5) % pool.length];
    }
    return pool[hashNumber(hold.id * 19 + 7) % pool.length];
  }

  isAssetReady(asset) {
    return Boolean(asset && asset.loaded && !asset.failed && asset.image.complete);
  }
}

class PlayerAssetManager {
  constructor(files) {
    this.assets = {};
    for (const [name, src] of Object.entries(files)) {
      const image = new Image();
      const asset = {
        src,
        image,
        loaded: false,
        failed: false
      };
      image.onload = () => {
        asset.loaded = true;
      };
      image.onerror = () => {
        asset.failed = true;
      };
      image.src = src;
      this.assets[name] = asset;
    }
  }

  get(name) {
    return this.assets[name] || null;
  }

  isReady(name) {
    const asset = this.get(name);
    return Boolean(asset && asset.loaded && !asset.failed && asset.image.complete);
  }
}

class HoldGenerator {
  constructor() {
    this.routeHolds = [];
    this.supportHolds = [];
    this.nextId = 1;
    this.lastPowerUpSequence = -CONFIG.powerUpMinGap;
  }

  generateInitialHolds(startX, startY) {
    this.routeHolds = [];
    this.supportHolds = [];
    this.nextId = 1;
    this.lastPowerUpSequence = -CONFIG.powerUpMinGap;
    const startHold = this.createRouteHold(startX, startY, 0);
    startHold.state = "current";
    this.routeHolds.push(startHold);
    this.generateSupportHoldsAround(startHold);
    while (this.routeHolds.length < CONFIG.initialHoldCount) {
      const next = this.generateNextHold(this.routeHolds[this.routeHolds.length - 1], this.routeHolds.length);
      this.routeHolds.push(next);
      this.generateSupportHoldsAround(next);
    }
    this.routeHolds[1].state = "target";
    return this.routeHolds;
  }

  createRouteHold(x, y, sequence) {
    return {
      id: this.nextId++,
      type: "route",
      x,
      y,
      radius: 13 + Math.random() * 5,
      sequence,
      powerUp: this.choosePowerUp(sequence),
      state: "normal"
    };
  }

  choosePowerUp(sequence) {
    if (sequence < 4 || sequence - this.lastPowerUpSequence < CONFIG.powerUpMinGap) {
      return null;
    }
    if (Math.random() > CONFIG.powerUpChance) {
      return null;
    }
    this.lastPowerUpSequence = sequence;
    return Math.random() < 0.5 ? "magnet" : "magnifier";
  }

  createSupportHold(x, y, routeId, hidden = false, isFootRoute = false) {
    return {
      id: this.nextId++,
      type: "support",
      x,
      y,
      radius: 7 + Math.random() * 4,
      routeId,
      state: "normal",
      hidden,
      isFootRoute
    };
  }

  getDistanceBand(sequence) {
    if (sequence < 10) {
      return { min: 112, max: 168, verticalMin: 104, verticalMax: 150 };
    }
    if (sequence < 30) {
      const widen = (sequence - 10) / 20;
      return {
        min: lerp(102, 94, widen),
        max: lerp(188, 218, widen),
        verticalMin: 96,
        verticalMax: 190
      };
    }
    return { min: 90, max: 232, verticalMin: 86, verticalMax: 220 };
  }

  generateNextHold(previousHold, sequence) {
    const band = this.getDistanceBand(sequence);
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const verticalGap = lerp(band.verticalMin, band.verticalMax, Math.random());
      const maxDxByBand = Math.sqrt(Math.max(0, band.max * band.max - verticalGap * verticalGap));
      const dx = lerp(-maxDxByBand, maxDxByBand, Math.random());
      const x = clamp(previousHold.x + dx, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding);
      const y = previousHold.y - verticalGap;
      const hold = this.createRouteHold(x, y, sequence);
      if (this.isHoldReachable(previousHold, hold, band.min, band.max)) {
        return hold;
      }
    }

    const safeDistance = clamp(140 + Math.min(sequence, 35) * 1.6, band.min, Math.min(band.max, 220));
    const verticalGap = Math.min(safeDistance * 0.88, band.verticalMax);
    const horizontal = Math.sqrt(Math.max(0, safeDistance * safeDistance - verticalGap * verticalGap));
    const direction = previousHold.x > CONFIG.logicalWidth / 2 ? -1 : 1;
    const x = clamp(previousHold.x + direction * horizontal, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding);
    const y = previousHold.y - verticalGap;
    return this.createRouteHold(x, y, sequence);
  }

  generateSupportHoldsAround(routeHold) {
    const count = Math.floor(lerp(CONFIG.supportHoldsPerRouteMin, CONFIG.supportHoldsPerRouteMax + 1, Math.random()));
    const presets = [
      { sx: -1, yMin: 62, yMax: 152 },
      { sx: 1, yMin: 62, yMax: 152 },
      { sx: -1, yMin: -6, yMax: 70 },
      { sx: 1, yMin: -6, yMax: 70 },
      { sx: Math.random() < 0.5 ? -1 : 1, yMin: 118, yMax: 174 },
      { sx: Math.random() < 0.5 ? -1 : 1, yMin: -34, yMax: 24 }
    ];
    const created = [];
    for (let i = 0; i < count; i += 1) {
      for (let attempt = 0; attempt < 24; attempt += 1) {
        const preset = presets[i % presets.length];
        const offsetX = preset.sx * lerp(CONFIG.supportOffsetXMin, CONFIG.supportOffsetXMax, Math.random());
        const offsetY = lerp(
          Math.max(-36, preset.yMin),
          Math.min(CONFIG.supportOffsetYMax, preset.yMax),
          Math.random()
        );
        const x = clamp(routeHold.x + offsetX, CONFIG.wallPadding - 10, CONFIG.logicalWidth - CONFIG.wallPadding + 10);
        const y = routeHold.y + offsetY;
        const candidate = { x, y };
        const tooCloseToRoute = distance(candidate, routeHold) < 28;
        const tooCloseToSupport = created.some((hold) => distance(candidate, hold) < CONFIG.supportMinSpacing);
        if (!tooCloseToRoute && !tooCloseToSupport) {
          const hold = this.createSupportHold(x, y, routeHold.id, false, i < 2);
          this.supportHolds.push(hold);
          created.push(hold);
          break;
        }
      }
    }
  }

  ensureHoldBuffer(currentIndex) {
    while (this.routeHolds.length - currentIndex < CONFIG.holdBufferAhead) {
      const next = this.generateNextHold(this.routeHolds[this.routeHolds.length - 1], this.routeHolds.length);
      this.routeHolds.push(next);
      this.generateSupportHoldsAround(next);
    }
  }

  removeOldHolds(cameraY, currentIndex, protectedIds) {
    const keepFrom = Math.max(0, currentIndex - 4);
    let removed = 0;
    while (
      this.routeHolds.length > 0 &&
      removed < keepFrom &&
      this.routeHolds[0].y > cameraY + CONFIG.logicalHeight + CONFIG.removeBelowCamera &&
      !protectedIds.has(this.routeHolds[0].id)
    ) {
      this.routeHolds.shift();
      removed += 1;
    }
    const bottomLimit = cameraY + CONFIG.logicalHeight + CONFIG.removeBelowCamera;
    this.supportHolds = this.supportHolds.filter((hold) => {
      if (protectedIds.has(hold.id)) {
        return true;
      }
      return hold.y <= bottomLimit;
    });
    return removed;
  }

  isHoldReachable(previousHold, newHold, minDistance = CONFIG.minimumTargetDistance, maxDistance = CONFIG.maximumTargetDistance) {
    const d = distance(previousHold, newHold);
    return d >= minDistance && d <= maxDistance;
  }

  getHoldById(id) {
    if (id == null) {
      return null;
    }
    return this.routeHolds.find((hold) => hold.id === id) || this.supportHolds.find((hold) => hold.id === id) || null;
  }

  getSupportHoldsNear(point, range = 140) {
    return this.supportHolds.filter((hold) => !hold.hidden && distance(hold, point) <= range);
  }

  createFallbackSupport(point, routeId) {
    const hold = this.createSupportHold(
      clamp(point.x, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding),
      point.y,
      routeId,
      false,
      true
    );
    this.supportHolds.push(hold);
    return hold;
  }
}

class Player {
  constructor() {
    this.reset(195, 760);
  }

  reset(x, routeY) {
    this.worldX = x;
    this.worldY = routeY + CONFIG.playerBodyOffsetY;
    this.neutralX = this.worldX;
    this.neutralY = this.worldY;
    this.startWorldY = this.worldY;
    this.activeHand = "left";
    this.actionType = "near";
    this.postureType = "front";
    this.animationStage = STATE.READY;
    this.contacts = {
      leftHand: null,
      rightHand: null,
      leftFoot: null,
      rightFoot: null
    };
    this.handAims = {
      leftHand: { x, y: routeY },
      rightHand: { x, y: routeY }
    };
    this.footAims = {
      leftFoot: { x: x - 24, y: routeY + 110 },
      rightFoot: { x: x + 24, y: routeY + 110 }
    };
    this.motion = {};
    this.animTime = 0;
    this.animDuration = 0;
    this.swingPhase = 0;
    this.bodyAngle = 0;
    this.debugLengths = {};
    this.restElapsed = 0;
    this.chalkShakeTimer = 0;
    this.nextChalkShakeHand = "leftHand";
    this.frontFacingAmount = 0;
    this.headDroop = 0;
  }

  get leadHandName() {
    return `${this.activeHand}Hand`;
  }

  get trailingHandName() {
    return this.activeHand === "left" ? "rightHand" : "leftHand";
  }

  getNeutralBodyForHold(hold) {
    return { x: hold.x, y: hold.y + CONFIG.playerBodyOffsetY };
  }

  getTargetDirection(currentHold, targetHold) {
    return normalize(subtract(targetHold, { x: this.neutralX, y: this.neutralY }));
  }

  applyChargePose(currentHold, targetHold, charge) {
    const neutral = {
      x: currentHold.x,
      y: currentHold.y + CONFIG.chargePlayerBodyOffsetY
    };
    const targetDirection = normalize(subtract(targetHold, neutral));
    const backDirection = scale(targetDirection, -1);
    const backswing = CONFIG.maxBackswingDistance * easeOutCubic(charge);
    this.worldX = neutral.x + backDirection.x * backswing;
    this.worldY = neutral.y + backDirection.y * backswing + CONFIG.maxChargeDrop * charge;
    this.bodyAngle = (this.activeHand === "left" ? -1 : 1) * 0.12 * charge + backDirection.x * 0.08;
    this.motion.backswingDistance = backswing;
  }

  releaseLeadHand() {
    this.contacts[this.leadHandName] = null;
  }

  beginRelease() {
    this.animTime = 0;
    this.animDuration = CONFIG.releaseDuration;
    this.animationStage = STATE.RELEASING;
  }

  updateTimed(deltaTime) {
    this.animTime += deltaTime;
    return clamp(this.animTime / this.animDuration, 0, 1);
  }

  beginLaunch(currentHold, targetHold, attempt, actionType) {
    this.actionType = actionType;
    this.animationStage = STATE.LAUNCHING;
    this.animTime = 0;
    this.animDuration = CONFIG.launchDuration;
    this.releaseLeadHand();
    const startBody = { x: this.worldX, y: this.worldY };
    const targetBody = { x: targetHold.x, y: targetHold.y + CONFIG.playerBodyOffsetY };
    const moveDirection = normalize(subtract(targetHold, currentHold));
    let endBody;
    if (attempt.result === "success") {
      const leadIn = actionType === "near" ? 18 : 34;
      endBody = add(targetBody, scale(moveDirection, -leadIn));
    } else if (attempt.result === "tooWeak") {
      const ratio = clamp(attempt.actualReach / Math.max(attempt.targetDistance, 1), 0.35, 0.86);
      endBody = lerpPoint(startBody, targetBody, ratio * 0.7);
    } else {
      endBody = add(targetBody, scale(moveDirection, 48));
    }
    this.motion = {
      ...this.motion,
      launchStart: startBody,
      launchEnd: endBody,
      targetPoint: { x: targetHold.x, y: targetHold.y },
      currentPoint: { x: currentHold.x, y: currentHold.y },
      moveDirection,
      attempt
    };
  }

  updateLaunch(deltaTime) {
    const t = easeInOutCubic(this.updateTimed(deltaTime));
    const start = this.motion.launchStart;
    const end = this.motion.launchEnd;
    const arcLift = -18 * Math.sin(Math.PI * t);
    this.worldX = lerp(start.x, end.x, t);
    this.worldY = lerp(start.y, end.y, t) + arcLift;
    this.bodyAngle = (this.activeHand === "left" ? -1 : 1) * (0.18 - 0.3 * t);
    this.handAims[this.leadHandName] = this.getLeadHandAim(t);
    return t >= 1;
  }

  getLeadHandAim(t) {
    const current = this.motion.currentPoint || { x: this.worldX, y: this.worldY };
    const target = this.motion.targetPoint || current;
    const attempt = this.motion.attempt;
    if (!attempt) {
      return target;
    }
    if (attempt.result === "success") {
      return lerpPoint(current, target, easeOutCubic(t));
    }
    const direction = normalize(subtract(target, current));
    const ratio = attempt.result === "tooWeak"
      ? clamp(attempt.actualReach / Math.max(attempt.targetDistance, 1), 0.3, 0.88)
      : 1.18;
    return {
      x: current.x + direction.x * attempt.targetDistance * ratio,
      y: current.y + direction.y * attempt.targetDistance * ratio
    };
  }

  beginLeadHandContact(targetHold) {
    this.animationStage = STATE.LEAD_HAND_CONTACT;
    this.animTime = 0;
    this.animDuration = CONFIG.leadHandContactDuration;
    this.contacts[this.leadHandName] = targetHold.id;
    this.handAims[this.leadHandName] = { x: targetHold.x, y: targetHold.y };
  }

  beginBodyFollow(targetHold, nextLeftFoot = null, nextRightFoot = null) {
    this.animationStage = STATE.BODY_FOLLOW;
    this.animTime = 0;
    this.animDuration = CONFIG.bodyFollowDuration;
    this.motion.bodyFollowStart = { x: this.worldX, y: this.worldY };
    this.motion.bodyFollowEnd = this.getNeutralBodyForHold(targetHold);
    if (nextLeftFoot || nextRightFoot) {
      this.prepareFeetReposition(nextLeftFoot, nextRightFoot);
      this.motion.feetSyncActive = true;
      this.motion.feetPositioned = false;
    } else {
      this.motion.feetSyncActive = false;
      this.motion.feetPositioned = false;
    }
  }

  updateBodyFollow(deltaTime) {
    const rawT = this.updateTimed(deltaTime);
    const t = easeOutCubic(rawT);
    this.worldX = lerp(this.motion.bodyFollowStart.x, this.motion.bodyFollowEnd.x, t);
    this.worldY = lerp(this.motion.bodyFollowStart.y, this.motion.bodyFollowEnd.y, t);
    this.bodyAngle = lerp(this.bodyAngle, 0, t);
    if (this.motion.feetSyncActive) {
      this.updateFeetAimProgress(rawT);
    }
    return t >= 1;
  }

  beginHandRest(handName = this.trailingHandName, restMode = "transition") {
    this.animationStage = STATE.HAND_REST;
    this.animTime = 0;
    this.animDuration = CONFIG.handRestDuration;
    const side = handName === "leftHand" ? -1 : 1;
    const shoulder = add(
      { x: this.worldX, y: this.worldY },
      rotate({ x: side * CONFIG.shoulderWidth / 2, y: -CONFIG.torsoLength / 2 }, this.bodyAngle)
    );
    this.motion.restingHand = handName;
    this.motion.restMode = restMode;
    this.motion.restStart = { ...this.handAims[handName] };
    this.motion.restTucked = add(shoulder, rotate({ x: side * 14, y: 26 }, this.bodyAngle));
    this.motion.restBase = {
      x: shoulder.x + rotate({ x: side * 62, y: 16 }, this.bodyAngle).x,
      y: shoulder.y + rotate({ x: side * 62, y: 16 }, this.bodyAngle).y
    };
    this.contacts[handName] = null;
  }

  updateHandRest(deltaTime) {
    const rawT = this.updateTimed(deltaTime);
    const handName = this.motion.restingHand;
    const side = handName === "leftHand" ? -1 : 1;
    let target;
    if (rawT < 0.38) {
      target = lerpPoint(this.motion.restStart, this.motion.restTucked, easeInOutCubic(rawT / 0.38));
    } else {
      const extendT = (rawT - 0.38) / 0.62;
      const base = lerpPoint(this.motion.restTucked, this.motion.restBase, easeOutCubic(extendT));
      const snap = Math.sin(extendT * Math.PI * 2.2) * (1 - extendT) * 13;
      target = {
        x: base.x + snap * side,
        y: base.y + Math.sin(extendT * Math.PI) * 5
      };
    }
    this.handAims[handName] = target;
    return rawT >= 1;
  }

  updateReadyRest(deltaTime, currentHold, enableChalkShake) {
    if (!currentHold) {
      return;
    }
    this.restElapsed += deltaTime;
    const pivot = { x: currentHold.x, y: currentHold.y };
    const neutral = this.getNeutralBodyForHold(currentHold);
    const phase = (this.restElapsed / CONFIG.restSwayPeriod) * Math.PI * 2;
    const angle = Math.sin(phase) * CONFIG.restSwayAmplitude;
    const radius = subtract(neutral, pivot);
    const swung = add(pivot, rotate(radius, angle));
    this.worldX = swung.x;
    this.worldY = swung.y + Math.cos(phase) * 1.4;
    this.bodyAngle = angle * 0.9;

    if (!enableChalkShake) {
      this.motion.idleShakeHand = null;
      this.chalkShakeTimer = 0;
      return;
    }

    if (this.motion.idleShakeHand) {
      this.motion.idleShakeTime += deltaTime;
      if (this.motion.idleShakeTime >= CONFIG.chalkShakeDuration) {
        this.nextChalkShakeHand = this.motion.idleShakeHand === "leftHand" ? "rightHand" : "leftHand";
        this.motion.idleShakeHand = null;
        this.motion.idleShakeTime = 0;
        this.chalkShakeTimer = 0;
      }
      return;
    }

    this.chalkShakeTimer += deltaTime;
    if (this.chalkShakeTimer >= CONFIG.chalkShakeInterval) {
      const handName = this.pickChalkShakeHand(currentHold);
      this.motion.idleShakeHand = handName;
      this.motion.idleShakeTime = 0;
      this.motion.idleShakeStart = { ...this.handAims[handName] };
    }
  }

  pickChalkShakeHand(currentHold) {
    const next = this.nextChalkShakeHand;
    const other = next === "leftHand" ? "rightHand" : "leftHand";
    const nextOnCurrent = this.contacts[next] === currentHold.id;
    const otherOnCurrent = this.contacts[other] === currentHold.id;
    if (nextOnCurrent && !otherOnCurrent) {
      return other;
    }
    return next;
  }

  stopIdleRest() {
    this.motion.idleShakeHand = null;
    this.motion.idleShakeTime = 0;
    this.chalkShakeTimer = 0;
  }

  getChalkBagWorldPoint() {
    const front = this.frontFacingAmount || 0;
    const hangX = lerp(13, -13, front);
    const hangY = CONFIG.torsoLength / 2 + 2;
    return add(
      { x: this.worldX, y: this.worldY },
      rotate({ x: hangX, y: hangY + 16 }, this.bodyAngle)
    );
  }

  getIdleHandAim(handName) {
    if (this.animationStage !== STATE.READY || this.motion.idleShakeHand !== handName) {
      return null;
    }
    const rawT = clamp((this.motion.idleShakeTime || 0) / CONFIG.chalkShakeDuration, 0, 1);
    const start = this.motion.idleShakeStart || this.handAims[handName];
    const bag = this.getChalkBagWorldPoint(handName);
    const side = handName === "leftHand" ? -1 : 1;
    let target;
    if (rawT < 0.36) {
      target = lerpPoint(start, bag, easeInOutCubic(rawT / 0.36));
    } else if (rawT < 0.58) {
      const localT = (rawT - 0.36) / 0.22;
      target = {
        x: bag.x + Math.sin(localT * Math.PI) * 2 * side,
        y: bag.y + Math.sin(localT * Math.PI) * 8
      };
    } else if (rawT < 0.78) {
      const localT = (rawT - 0.58) / 0.2;
      target = {
        x: bag.x - 2 * side + Math.sin(localT * Math.PI) * 2.5 * side,
        y: bag.y + Math.sin(localT * Math.PI) * 9
      };
    } else if (rawT < 0.92) {
      const localT = (rawT - 0.78) / 0.14;
      target = {
        x: bag.x + Math.sin(localT * Math.PI) * CONFIG.chalkShakeAmplitude * 2.2 * side,
        y: bag.y - Math.sin(localT * Math.PI) * 13
      };
    } else {
      target = lerpPoint(bag, start, easeInOutCubic((rawT - 0.92) / 0.08));
    }
    return target;
  }

  beginTrailingHandMove(targetHold, actionType) {
    this.animationStage = STATE.TRAILING_HAND_MOVE;
    this.animTime = 0;
    this.animDuration = CONFIG.trailingHandDuration;
    this.actionType = actionType;
    this.motion.trailingStart = this.handAims[this.trailingHandName];
    this.motion.trailingEnd = { x: targetHold.x, y: targetHold.y };
    if (actionType === "far") {
      this.contacts[this.trailingHandName] = null;
    }
  }

  updateTrailingHandMove(deltaTime) {
    const t = easeOutCubic(this.updateTimed(deltaTime));
    if (this.actionType === "far") {
      this.handAims[this.trailingHandName] = lerpPoint(this.motion.trailingStart, this.motion.trailingEnd, t);
    }
    return t >= 1;
  }

  finishTrailingHandMove(targetHold) {
    if (this.actionType === "far") {
      this.contacts[this.trailingHandName] = targetHold.id;
      this.handAims[this.trailingHandName] = { x: targetHold.x, y: targetHold.y };
    }
  }

  beginFeetReposition(nextLeftFoot, nextRightFoot) {
    this.animationStage = STATE.FEET_REPOSITION;
    this.animTime = 0;
    this.animDuration = CONFIG.feetRepositionDuration;
    this.prepareFeetReposition(nextLeftFoot, nextRightFoot);
    this.motion.feetSyncActive = false;
    this.motion.feetPositioned = false;
  }

  prepareFeetReposition(nextLeftFoot, nextRightFoot) {
    const leftEnd = nextLeftFoot
      ? { x: nextLeftFoot.x, y: nextLeftFoot.y, id: nextLeftFoot.id }
      : { ...this.getHangingFootAim("leftFoot"), id: null };
    const rightEnd = nextRightFoot
      ? { x: nextRightFoot.x, y: nextRightFoot.y, id: nextRightFoot.id }
      : { ...this.getHangingFootAim("rightFoot"), id: null };
    this.motion.feetStart = {
      leftFoot: { ...this.footAims.leftFoot },
      rightFoot: { ...this.footAims.rightFoot }
    };
    this.motion.feetEnd = {
      leftFoot: leftEnd,
      rightFoot: rightEnd
    };
    this.motion.feetTiming = this.calculateFeetTiming();
    this.contacts.leftFoot = null;
    this.contacts.rightFoot = null;
  }

  updateFeetReposition(deltaTime) {
    const t = this.updateTimed(deltaTime);
    this.updateFeetAimProgress(t);
    return t >= 1;
  }

  updateFeetAimProgress(t) {
    const leftT = this.getTimedFootProgress("leftFoot", t);
    const rightT = this.getTimedFootProgress("rightFoot", t);
    this.footAims.leftFoot = lerpPoint(this.motion.feetStart.leftFoot, this.motion.feetEnd.leftFoot, leftT);
    this.footAims.rightFoot = lerpPoint(this.motion.feetStart.rightFoot, this.motion.feetEnd.rightFoot, rightT);
  }

  calculateFeetTiming() {
    const leftStart = this.motion.feetStart.leftFoot;
    const rightStart = this.motion.feetStart.rightFoot;
    const leftEnd = this.motion.feetEnd.leftFoot;
    const rightEnd = this.motion.feetEnd.rightFoot;
    const leftTravel = distance(leftStart, leftEnd);
    const rightTravel = distance(rightStart, rightEnd);
    const verticalDiff = Math.abs(leftEnd.y - rightEnd.y);
    const travelDiff = Math.abs(leftTravel - rightTravel);
    const delay = clamp(verticalDiff / 220 + travelDiff / 420, 0.06, 0.30);
    const leftIsHigher = leftEnd.y < rightEnd.y || (leftEnd.y === rightEnd.y && leftTravel <= rightTravel);
    return {
      leftFoot: leftIsHigher
        ? { start: 0, end: 1 - delay * 0.45 }
        : { start: delay, end: 1 },
      rightFoot: leftIsHigher
        ? { start: delay, end: 1 }
        : { start: 0, end: 1 - delay * 0.45 }
    };
  }

  getTimedFootProgress(limbName, t) {
    const timing = this.motion.feetTiming && this.motion.feetTiming[limbName];
    if (!timing) {
      return easeOutCubic(t);
    }
    const localT = clamp((t - timing.start) / Math.max(0.001, timing.end - timing.start), 0, 1);
    return easeOutCubic(localT);
  }

  finishFeetReposition() {
    this.contacts.leftFoot = this.motion.feetEnd.leftFoot.id ?? null;
    this.contacts.rightFoot = this.motion.feetEnd.rightFoot.id ?? null;
    this.motion.feetSyncActive = false;
    this.motion.feetPositioned = true;
  }

  getHangingFootAim(limbName) {
    const side = limbName === "leftFoot" ? -1 : 1;
    return {
      x: this.worldX + side * 20,
      y: this.worldY + CONFIG.torsoLength / 2 + CONFIG.thighLength + CONFIG.shinLength * 0.55
    };
  }

  beginSettle(currentHold) {
    this.animationStage = STATE.SETTLING;
    this.animTime = 0;
    this.animDuration = CONFIG.settleDuration;
    this.motion.settleStart = { x: this.worldX, y: this.worldY, angle: this.bodyAngle };
    const neutral = this.getNeutralBodyForHold(currentHold);
    this.motion.settleEnd = { x: neutral.x, y: neutral.y, angle: 0 };
  }

  updateSettle(deltaTime) {
    const t = easeOutCubic(this.updateTimed(deltaTime));
    this.worldX = lerp(this.motion.settleStart.x, this.motion.settleEnd.x, t);
    this.worldY = lerp(this.motion.settleStart.y, this.motion.settleEnd.y, t);
    this.bodyAngle = lerp(this.motion.settleStart.angle, this.motion.settleEnd.angle, t);
    this.neutralX = this.motion.settleEnd.x;
    this.neutralY = this.motion.settleEnd.y;
    return t >= 1;
  }

  beginFall(reason, targetHold) {
    const push = reason === "tooStrong" ? 36 : -10;
    const side = targetHold.x >= this.worldX ? 1 : -1;
    this.fallStart = { x: this.worldX, y: this.worldY };
    this.fallEnd = {
      x: this.worldX + side * push,
      y: this.worldY + 132
    };
    this.contacts.leftHand = null;
    this.contacts.rightHand = null;
    this.contacts.leftFoot = null;
    this.contacts.rightFoot = null;
    this.animTime = 0;
    this.animDuration = CONFIG.fallDuration;
    this.frontFacingAmount = 0;
    this.headDroop = 0;
    this.updateDanglingAims(0);
    this.animationStage = STATE.FALLING;
  }

  updateFall(deltaTime) {
    this.animTime += deltaTime;
    const t = easeInCubic(this.animTime / this.animDuration);
    this.worldX = lerp(this.fallStart.x, this.fallEnd.x, t);
    this.worldY = lerp(this.fallStart.y, this.fallEnd.y, t);
    this.frontFacingAmount = easeOutCubic(t);
    this.headDroop = this.frontFacingAmount;
    this.bodyAngle = Math.sin(t * Math.PI) * 0.18;
    this.updateDanglingAims(this.frontFacingAmount);
    return t >= 1;
  }

  beginAutoBelayDescent() {
    this.animTime = 0;
    this.swingPhase = 0;
    this.frontFacingAmount = 1;
    this.headDroop = 1;
    this.animationStage = STATE.AUTO_DESCEND;
  }

  updateAutoBelayDescent(deltaTime, cameraY) {
    this.animTime += deltaTime;
    this.swingPhase += deltaTime * 3.6;
    this.worldY += CONFIG.autoBelayDescentSpeed * deltaTime;
    this.worldX += Math.sin(this.swingPhase) * 0.18;
    this.bodyAngle = Math.sin(this.swingPhase) * 0.055;
    this.frontFacingAmount = 1;
    this.headDroop = 1;
    this.updateDanglingAims(1);
    return this.worldY - cameraY > CONFIG.logicalHeight + 120;
  }

  updateDanglingAims(frontAmount) {
    const handX = lerp(26, 32, frontAmount);
    const handY = lerp(-10, 42, frontAmount);
    const footX = lerp(18, 34, frontAmount);
    const footY = lerp(72, 108, frontAmount);
    this.handAims.leftHand = { x: this.worldX - handX, y: this.worldY + handY };
    this.handAims.rightHand = { x: this.worldX + handX, y: this.worldY + handY };
    this.footAims.leftFoot = { x: this.worldX - footX, y: this.worldY + footY };
    this.footAims.rightFoot = { x: this.worldX + footX, y: this.worldY + footY };
  }

  switchActiveHand() {
    this.activeHand = this.activeHand === "left" ? "right" : "left";
  }

  getContactCount() {
    return Object.values(this.contacts).filter((id) => id != null).length;
  }
}

class InputController {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.inputTarget = canvas.parentElement || canvas;
    this.game = game;
    this.activePointerId = null;
    this.isPointerDown = false;
    this.bindEvents();
  }

  getLogicalPoint(event) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CONFIG.logicalWidth,
      y: ((event.clientY - rect.top) / rect.height) * CONFIG.logicalHeight
    };
  }

  bindEvents() {
    const blockNativeTouch = (event) => event.preventDefault();
    this.inputTarget.addEventListener("contextmenu", blockNativeTouch);
    this.inputTarget.addEventListener("selectstart", blockNativeTouch);
    this.inputTarget.addEventListener("touchstart", blockNativeTouch, { passive: false });
    this.inputTarget.addEventListener("touchmove", blockNativeTouch, { passive: false });
    this.inputTarget.addEventListener("touchend", blockNativeTouch, { passive: false });
    this.inputTarget.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    this.inputTarget.addEventListener("pointerup", (event) => this.onPointerUp(event));
    this.inputTarget.addEventListener("pointercancel", (event) => this.onPointerCancel(event));
    this.inputTarget.addEventListener("lostpointercapture", (event) => this.onPointerCancel(event));
    window.addEventListener("blur", () => this.cancelActiveInput());
  }

  onPointerDown(event) {
    event.preventDefault();
    if (this.activePointerId !== null) {
      return;
    }
    const point = this.getLogicalPoint(event);
    if (this.game.handleUiPointer(point)) {
      return;
    }
    this.activePointerId = event.pointerId;
    this.isPointerDown = true;
    if (this.inputTarget.setPointerCapture) {
      this.inputTarget.setPointerCapture(event.pointerId);
    }
    this.game.handlePressStart();
  }

  onPointerUp(event) {
    event.preventDefault();
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.releasePointer(event.pointerId);
    this.game.handlePressEnd();
  }

  onPointerCancel(event) {
    if (event.pointerId !== this.activePointerId) {
      return;
    }
    this.releasePointer(event.pointerId);
    this.game.handlePressCancel();
  }

  cancelActiveInput() {
    if (this.activePointerId === null) {
      return;
    }
    this.activePointerId = null;
    this.isPointerDown = false;
    this.game.handlePressCancel();
  }

  releasePointer(pointerId) {
    if (this.inputTarget.hasPointerCapture && this.inputTarget.hasPointerCapture(pointerId)) {
      this.inputTarget.releasePointerCapture(pointerId);
    }
    this.activePointerId = null;
    this.isPointerDown = false;
  }
}

class GameAudio {
  constructor(files) {
    this.files = files;
    this.enabled = true;
    this.unlocked = false;
    this.bgm = this.createAudio(files.bgm, {
      loop: true,
      volume: 0.256,
      preload: "auto"
    });
    this.grabSuccess = this.createAudio(files.grabSuccess, {
      loop: false,
      volume: 0.72,
      preload: "auto"
    });
  }

  createAudio(src, options = {}) {
    const audio = new Audio(src);
    audio.loop = Boolean(options.loop);
    audio.volume = options.volume ?? 1;
    audio.preload = options.preload || "auto";
    audio.playsInline = true;
    return audio;
  }

  unlock() {
    if (this.unlocked || !this.enabled) {
      return;
    }
    this.unlocked = true;
    this.playBgm();
  }

  setMuted(muted) {
    this.enabled = !muted;
    this.bgm.muted = muted;
    this.grabSuccess.muted = muted;
    if (muted) {
      this.bgm.pause();
      return;
    }
    this.unlock();
    this.playBgm();
  }

  playBgm() {
    if (!this.enabled) {
      return;
    }
    const playPromise = this.bgm.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  playGrabSuccess() {
    if (!this.enabled || !this.unlocked) {
      return;
    }
    try {
      this.grabSuccess.currentTime = 0;
      const playPromise = this.grabSuccess.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    } catch (error) {}
  }
}

function waitForImageAsset(asset) {
  if (!asset || !asset.image) {
    return Promise.resolve(false);
  }
  if (asset.loaded || asset.failed) {
    return Promise.resolve(!asset.failed);
  }
  if (asset.image.complete && asset.image.naturalWidth > 0) {
    asset.loaded = true;
    asset.failed = false;
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded) => {
      if (settled) {
        return;
      }
      settled = true;
      asset.loaded = Boolean(loaded);
      asset.failed = !loaded;
      resolve(loaded);
    };
    asset.image.addEventListener("load", () => finish(true), { once: true });
    asset.image.addEventListener("error", () => finish(false), { once: true });
    window.setTimeout(() => finish(asset.image.complete && asset.image.naturalWidth > 0), 6000);
  });
}

function waitForAudioAsset(audio) {
  if (!audio) {
    return Promise.resolve(false);
  }
  if (audio.readyState >= 2) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    let settled = false;
    const finish = (loaded) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(loaded);
    };
    audio.addEventListener("loadeddata", () => finish(true), { once: true });
    audio.addEventListener("canplaythrough", () => finish(true), { once: true });
    audio.addEventListener("error", () => finish(false), { once: true });
    try {
      audio.load();
    } catch (error) {
      finish(false);
    }
    window.setTimeout(() => finish(audio.readyState >= 2), 4500);
  });
}

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.scoreManager = new ScoreManager();
    this.camera = new Camera();
    this.player = new Player();
    this.generator = new HoldGenerator();
    this.holdAssets = new HoldAssetManager(ROUTE_HOLD_ASSET_FILES, SUPPORT_HOLD_ASSET_FILES);
    this.playerAssets = new PlayerAssetManager(PLAYER_ASSET_FILES);
    this.outfitAssetCache = new Map();
    this.uiIconAssets = this.loadUiIconAssets();
    this.feedbackAssets = this.loadFeedbackAssets();
    this.audio = new GameAudio(AUDIO_FILES);
    this.input = new InputController(canvas, this);
    this.outfit = this.loadOutfit();
    this.selectedOutfitPart = "hair";
    this.uiButtons = [];
    this.menuButtons = [];
    this.uiPanel = null;
    this.uiToast = null;
    this.uiToastTime = 0;
    this.soundMuted = false;
    this.loading = true;
    this.loadingProgress = 0;
    this.loadingLoaded = 0;
    this.loadingTotal = 1;
    this.loadingMessage = "加载资源中";
    this.lastTime = performance.now();
    this.resetGame();
    this.state = STATE.LOADING;
    this.setupResize();
    this.preloadGameAssets();
    requestAnimationFrame((time) => this.loop(time));
  }

  loadUiIconAssets() {
    const assets = {};
    for (const [name, src] of Object.entries(UI_ICON_FILES)) {
      const image = new Image();
      assets[name] = {
        src,
        image,
        loaded: false,
        failed: false
      };
      image.onload = () => {
        assets[name].loaded = true;
      };
      image.onerror = () => {
        assets[name].failed = true;
      };
      image.src = src;
    }
    return assets;
  }

  loadFeedbackAssets() {
    const assets = {};
    for (const [name, src] of Object.entries(FEEDBACK_ASSET_FILES)) {
      const image = new Image();
      assets[name] = {
        src,
        image,
        loaded: false,
        failed: false
      };
      image.onload = () => {
        assets[name].loaded = true;
      };
      image.onerror = () => {
        assets[name].failed = true;
      };
      image.src = src;
    }
    return assets;
  }

  loadOutfit() {
    try {
      const raw = window.localStorage.getItem(OUTFIT_STORAGE_KEY);
      if (!raw) {
        return { ...DEFAULT_OUTFIT };
      }
      const parsed = JSON.parse(raw);
      const accessory = parsed.accessory || (parsed.glasses ? "glasses_01" : DEFAULT_OUTFIT.accessory);
      const hair = parsed.hair === "hair_02" ? "hair_female" : parsed.hair;
      return {
        hair: this.isValidOutfitOption("hair", hair) ? hair : DEFAULT_OUTFIT.hair,
        accessory: this.isValidOutfitOption("accessory", accessory) ? accessory : DEFAULT_OUTFIT.accessory,
        shirt: this.isValidOutfitOption("shirt", parsed.shirt) ? parsed.shirt : DEFAULT_OUTFIT.shirt,
        pants: this.isValidOutfitOption("pants", parsed.pants) ? parsed.pants : DEFAULT_OUTFIT.pants,
        chalkBag: this.isValidOutfitOption("chalkBag", parsed.chalkBag) ? parsed.chalkBag : DEFAULT_OUTFIT.chalkBag,
        glasses: accessory === "glasses_01"
      };
    } catch (error) {
      return { ...DEFAULT_OUTFIT };
    }
  }

  isValidOutfitOption(part, optionId) {
    return Boolean(OUTFIT_OPTIONS[part] && OUTFIT_OPTIONS[part].some((option) => option.id === optionId));
  }

  saveOutfit() {
    this.outfit.glasses = this.outfit.accessory === "glasses_01";
    try {
      window.localStorage.setItem(OUTFIT_STORAGE_KEY, JSON.stringify(this.outfit));
    } catch (error) {
      // Storage can be disabled; outfit still works for the current session.
    }
  }

  setOutfitHair(hair) {
    this.setOutfitOption("hair", hair);
  }

  toggleOutfitGlasses() {
    this.setOutfitOption("accessory", this.outfit.accessory === "glasses_01" ? "none" : "glasses_01");
  }

  setOutfitOption(part, optionId) {
    if (!this.isValidOutfitOption(part, optionId)) {
      return;
    }
    this.outfit[part] = optionId;
    this.saveOutfit();
    const partInfo = OUTFIT_PARTS.find((item) => item.id === part);
    const optionInfo = OUTFIT_OPTIONS[part].find((item) => item.id === optionId);
    this.showToast(`已切换${partInfo ? partInfo.label : "换装"}：${optionInfo ? optionInfo.label : optionId}`);
  }

  setupResize() {
    const resize = () => this.resizeCanvas();
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", resize);
      window.visualViewport.addEventListener("scroll", resize);
    }
    this.resizeCanvas();
  }

  resizeCanvas() {
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    document.documentElement.style.setProperty("--app-height", `${viewportHeight}px`);
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(
      this.canvas.width / CONFIG.logicalWidth,
      0,
      0,
      this.canvas.height / CONFIG.logicalHeight,
      0,
      0
    );
  }

  preloadGameAssets() {
    const imageAssets = [
      ...this.holdAssets.assets,
      ...Object.values(this.playerAssets.assets),
      ...Object.values(this.uiIconAssets),
      ...Object.values(this.feedbackAssets)
    ];
    const tasks = [
      ...imageAssets.map((asset) => () => waitForImageAsset(asset)),
      () => waitForAudioAsset(this.audio.bgm),
      () => waitForAudioAsset(this.audio.grabSuccess)
    ];
    this.loadingTotal = Math.max(1, tasks.length);
    this.loadingLoaded = 0;
    this.loadingProgress = 0;

    const promises = tasks.map((task) => task().catch(() => false).then((loaded) => {
      this.loadingLoaded += 1;
      this.loadingProgress = this.loadingLoaded / this.loadingTotal;
      return loaded;
    }));

    Promise.allSettled(promises).then(() => {
      this.loadingProgress = 1;
      this.loading = false;
      this.loadingMessage = "加载完成";
      this.enterStartScreen();
      this.lastTime = performance.now();
    });
  }

  resetGame() {
    this.state = STATE.RESTARTING;
    this.charge = 0;
    this.chargeDirection = 1;
    this.score = 0;
    this.preciseCombo = 0;
    this.bestPreciseCombo = 0;
    this.feedback = null;
    this.feedbackTime = 0;
    this.powerUps = {
      magnet: 0,
      magnifier: 0
    };
    this.holdCount = 0;
    this.climbHeight = 0;
    this.failureReason = "";
    this.roundEnded = false;
    this.newBest = false;
    this.lastAttempt = null;
    this.animationResult = null;
    this.pendingAttempt = null;
    this.pendingRestHand = null;
    this.currentIndex = 0;
    this.player.reset(CONFIG.logicalWidth / 2, 760);
    this.routeHolds = this.generator.generateInitialHolds(CONFIG.logicalWidth / 2, 760);
    this.currentHold = this.routeHolds[0];
    this.targetHold = this.routeHolds[1];
    this.previousHold = null;
    this.settlePlayerPose(null, "far");
    this.camera.snapToPlayer(this.player);
    this.state = STATE.READY;
  }

  enterStartScreen() {
    this.resetGame();
    this.uiPanel = null;
    this.charge = 0;
    this.state = STATE.START;
  }

  startGame() {
    this.resetGame();
    this.showToast("开始攀岩");
  }

  loop(time) {
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    this.update(deltaTime);
    this.draw();
    requestAnimationFrame((nextTime) => this.loop(nextTime));
  }

  update(deltaTime) {
    if (this.uiToastTime > 0) {
      this.uiToastTime = Math.max(0, this.uiToastTime - deltaTime);
      if (this.uiToastTime === 0) {
        this.uiToast = null;
      }
    }
    if (this.feedbackTime > 0) {
      this.feedbackTime = Math.max(0, this.feedbackTime - deltaTime);
      if (this.feedbackTime === 0) {
        this.feedback = null;
      }
    }
    this.updatePowerUps(deltaTime);

    if (this.loading || this.state === STATE.LOADING) {
      return;
    }

    if (this.state === STATE.START) {
      this.player.updateReadyRest(deltaTime, this.currentHold, false);
      return;
    }

    if (this.state === STATE.READY) {
      this.player.updateReadyRest(deltaTime, this.currentHold, this.holdCount > 0);
      return;
    }

    if (this.state === STATE.CHARGING) {
      this.updateCharge(deltaTime);
      this.player.applyChargePose(this.currentHold, this.targetHold, this.charge);
      return;
    }

    if (this.state === STATE.RELEASING) {
      if (this.player.updateTimed(deltaTime) >= 1) {
        this.beginLaunchStage();
      }
    } else if (this.state === STATE.LAUNCHING) {
      if (this.player.updateLaunch(deltaTime)) {
        if (this.animationResult.result === "success") {
          this.player.beginLeadHandContact(this.targetHold);
          this.state = STATE.LEAD_HAND_CONTACT;
        } else {
          this.handleFailedGrab(this.animationResult.result);
        }
      }
    } else if (this.state === STATE.LEAD_HAND_CONTACT) {
      if (this.player.updateTimed(deltaTime) >= 1) {
        this.confirmSuccessfulGrab();
      }
    } else if (this.state === STATE.BODY_FOLLOW) {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateBodyFollow(deltaTime)) {
        if (this.player.motion.feetSyncActive) {
          this.player.finishFeetReposition();
        }
        if (this.pendingAttempt.actionType === "far") {
          this.player.beginHandRest(this.player.trailingHandName, "transition");
          this.state = STATE.HAND_REST;
        } else {
          this.player.beginTrailingHandMove(this.currentHold, this.pendingAttempt.actionType);
          this.state = STATE.TRAILING_HAND_MOVE;
        }
      }
    } else if (this.state === STATE.HAND_REST) {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateHandRest(deltaTime)) {
        if (this.player.motion.restMode === "final") {
          this.beginCameraFollow();
        } else {
          this.player.beginTrailingHandMove(this.currentHold, this.pendingAttempt.actionType);
          this.state = STATE.TRAILING_HAND_MOVE;
        }
      }
    } else if (this.state === STATE.TRAILING_HAND_MOVE) {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateTrailingHandMove(deltaTime)) {
        this.player.finishTrailingHandMove(this.currentHold);
        if (this.player.motion.feetPositioned) {
          this.player.beginSettle(this.currentHold);
          this.state = STATE.SETTLING;
        } else {
          const feet = this.chooseFeetSupports();
          this.player.beginFeetReposition(feet.leftFoot, feet.rightFoot);
          this.state = STATE.FEET_REPOSITION;
        }
      }
    } else if (this.state === STATE.FEET_REPOSITION) {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateFeetReposition(deltaTime)) {
        this.player.finishFeetReposition();
        this.player.beginSettle(this.currentHold);
        this.state = STATE.SETTLING;
      }
    } else if (this.state === STATE.SETTLING) {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateSettle(deltaTime)) {
        this.finishSettle();
      }
    } else if (this.state === STATE.CAMERA_FOLLOW) {
      if (this.camera.update(deltaTime)) {
        this.finishCameraFollow();
      }
    } else if (this.state === STATE.FALLING) {
      if (this.player.updateFall(deltaTime)) {
        this.player.beginAutoBelayDescent();
        this.state = STATE.AUTO_DESCEND;
      }
    } else if (this.state === STATE.AUTO_DESCEND) {
      if (this.player.updateAutoBelayDescent(deltaTime, this.camera.y)) {
        this.finalizeGameOver();
      }
    }
  }

  handlePressStart() {
    if (this.loading || this.state === STATE.LOADING) {
      return;
    }
    this.audio.unlock();
    if (this.state === STATE.START) {
      return;
    }
    if (this.state === STATE.GAME_OVER || this.canRestartEndedRound()) {
      this.resetGame();
      return;
    }
    if (this.canInterruptForNextMove()) {
      this.interruptToNextCharge();
      return;
    }
    if (this.state !== STATE.READY) {
      return;
    }
    this.beginCharge();
  }

  handleUiPointer(point) {
    if (this.loading || this.state === STATE.LOADING) {
      return true;
    }
    this.audio.unlock();
    if (this.uiPanel) {
      if (this.uiPanel.closeRect && this.pointInRect(point, this.uiPanel.closeRect)) {
        this.uiPanel = null;
        return true;
      }
      const panelButton = this.uiPanel.buttons
        ? this.uiPanel.buttons.find((item) => this.pointInRect(point, item))
        : null;
      if (panelButton) {
        this.activateUiButton(panelButton.id);
        return true;
      }
      if (this.uiPanel.bounds && !this.pointInRect(point, this.uiPanel.bounds)) {
        this.uiPanel = null;
      }
      return true;
    }
    const menuButton = this.state === STATE.START
      ? this.menuButtons.find((item) => this.pointInRect(point, item))
      : null;
    if (menuButton) {
      this.activateUiButton(menuButton.id);
      return true;
    }
    const button = this.uiButtons.find((item) => this.pointInRect(point, item));
    if (!button) {
      return false;
    }
    this.activateUiButton(button.id);
    return true;
  }

  pointInRect(point, rect) {
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  activateUiButton(id) {
    if (id === "play") {
      this.startGame();
      return;
    }
    if (id === "restart") {
      this.resetGame();
      this.showToast("已重新开始");
      return;
    }
    if (id === "start") {
      this.enterStartScreen();
      this.showToast("已返回开始界面");
      return;
    }
    if (id === "back") {
      this.showToast("已在开始界面");
      return;
    }
    if (id === "rank") {
      this.uiPanel = { type: "rank" };
      return;
    }
    if (id === "sound") {
      this.soundMuted = !this.soundMuted;
      this.audio.setMuted(this.soundMuted);
      this.showToast(this.soundMuted ? "声音已关闭" : "声音已开启");
      return;
    }
    if (id === "share") {
      this.shareGame();
      return;
    }
    if (id === "skin" || id === "shop") {
      this.selectedOutfitPart = "hair";
      this.uiPanel = { type: "outfit" };
      return;
    }
    if (id.startsWith("outfit-part-")) {
      const part = id.replace("outfit-part-", "");
      if (OUTFIT_OPTIONS[part]) {
        this.selectedOutfitPart = part;
      }
      return;
    }
    if (id.startsWith("outfit-option-")) {
      const payload = id.replace("outfit-option-", "");
      const divider = payload.indexOf(":");
      if (divider >= 0) {
        const part = payload.slice(0, divider);
        const optionId = payload.slice(divider + 1);
        if (OUTFIT_OPTIONS[part]) {
          this.selectedOutfitPart = part;
          this.setOutfitOption(part, optionId);
        }
      } else {
        this.setOutfitOption(this.selectedOutfitPart, payload);
      }
      return;
    }
    if (id === "outfit-close") {
      this.uiPanel = null;
    }
  }

  showToast(message) {
    this.uiToast = message;
    this.uiToastTime = 1.6;
  }

  shareGame() {
    const text = `我在趣玩攀岩小游戏爬到了 ${formatMeters(this.scoreManager.best.height / CONFIG.pixelsPerMeter)}，最高岩点 ${this.scoreManager.best.holds} 个，最高分 ${this.scoreManager.best.score || 0}。`;
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: "趣玩攀岩小游戏", text, url })
        .then(() => this.showToast("分享已打开"))
        .catch(() => this.showToast("分享已取消"));
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(`${text} ${url}`)
        .then(() => this.showToast("分享文案已复制"))
        .catch(() => this.showToast("复制失败"));
      return;
    }
    this.showToast("当前浏览器不支持分享");
  }

  beginCharge() {
    this.charge = 0;
    this.chargeDirection = 1;
    this.player.stopIdleRest();
    this.player.applyChargePose(this.currentHold, this.targetHold, this.charge);
    this.state = STATE.CHARGING;
  }

  updateCharge(deltaTime) {
    this.charge += this.chargeDirection * (deltaTime / CONFIG.chargeDuration);
    if (this.charge >= 1) {
      this.charge = 2 - this.charge;
      this.chargeDirection = -1;
    } else if (this.charge <= 0) {
      this.charge = -this.charge;
      this.chargeDirection = 1;
    }
    this.charge = clamp(this.charge, 0, 1);
  }

  handlePressEnd() {
    if (this.state !== STATE.CHARGING) {
      return;
    }
    this.startAttempt();
  }

  handlePressCancel() {
    if (this.state === STATE.CHARGING) {
      this.charge = 0;
      this.chargeDirection = 1;
      this.player.stopIdleRest();
      this.player.worldX = this.player.neutralX;
      this.player.worldY = this.player.neutralY;
      this.player.bodyAngle = 0;
      this.state = STATE.READY;
    }
  }

  startAttempt() {
    const attempt = this.judgeAttempt();
    const actionType = attempt.targetDistance <= CONFIG.nearMoveThreshold ? "near" : "far";
    this.lastAttempt = attempt;
    this.animationResult = attempt;
    this.pendingAttempt = {
      oldHold: this.currentHold,
      targetHold: this.targetHold,
      actionType,
      leadHand: this.player.leadHandName,
      trailingHand: this.player.trailingHandName,
      scoreConfirmed: false,
      handSwitched: false
    };
    this.player.actionType = actionType;
    this.player.beginRelease();
    this.state = STATE.RELEASING;
  }

  beginLaunchStage() {
    this.player.beginLaunch(this.currentHold, this.targetHold, this.animationResult, this.pendingAttempt.actionType);
    this.state = STATE.LAUNCHING;
  }

  calculateReachDistance() {
    return CONFIG.minReachDistance + this.charge * (CONFIG.maxReachDistance - CONFIG.minReachDistance);
  }

  calculateTargetDistance() {
    return distance(this.currentHold, this.targetHold);
  }

  getReachTolerance() {
    return Math.max(
      CONFIG.minimumTolerance,
      CONFIG.startingTolerance - this.holdCount * CONFIG.toleranceDecay
    );
  }

  getEffectiveReachTolerance() {
    const base = this.getReachTolerance();
    return this.powerUps.magnifier > 0 ? base * 1.5 : base;
  }

  updatePowerUps(deltaTime) {
    if (!this.powerUps) {
      return;
    }
    for (const key of Object.keys(this.powerUps)) {
      if (this.powerUps[key] > 0) {
        this.powerUps[key] = Math.max(0, this.powerUps[key] - deltaTime);
      }
    }
  }

  activatePowerUp(type) {
    if (!POWER_UPS[type]) {
      return;
    }
    const duration = CONFIG.powerUpDurations[type] || 3;
    this.powerUps[type] = duration;
    this.showToast(`${POWER_UPS[type].label}生效 ${duration} 秒`);
  }

  hasActivePowerUp() {
    return Boolean(this.powerUps && (this.powerUps.magnet > 0 || this.powerUps.magnifier > 0));
  }

  calculateClimbHeightFromCurrentHold() {
    return Math.max(0, this.player.startWorldY - (this.currentHold.y + CONFIG.playerBodyOffsetY));
  }

  judgeAttempt() {
    let actualReach = this.calculateReachDistance();
    const targetDistance = this.calculateTargetDistance();
    const isMagnetActive = this.powerUps.magnet > 0;
    if (isMagnetActive) {
      actualReach = targetDistance;
    }
    const distanceError = actualReach - targetDistance;
    const reachTolerance = this.getEffectiveReachTolerance();
    const accuracyRatio = Math.min(1, Math.abs(distanceError) / reachTolerance);
    const accuracyTier = this.getAccuracyTier(accuracyRatio);
    let result = "success";
    if (distanceError < -reachTolerance) {
      result = "tooWeak";
    } else if (distanceError > reachTolerance) {
      result = "tooStrong";
    }
    return {
      result,
      actualReach,
      targetDistance,
      distanceError,
      reachTolerance,
      accuracyRatio,
      accuracyTier,
      magnetBoosted: isMagnetActive,
      magnifierBoosted: this.powerUps.magnifier > 0
    };
  }

  getAccuracyTier(ratio) {
    if (ratio <= ACCURACY_TIERS.precise.maxRatio) {
      return "precise";
    }
    if (ratio <= ACCURACY_TIERS.good.maxRatio) {
      return "good";
    }
    return "risky";
  }

  applyAccuracyScore(attempt) {
    const tierName = attempt.accuracyTier || "risky";
    const tier = ACCURACY_TIERS[tierName];
    if (tierName === "precise") {
      this.preciseCombo += 1;
    } else {
      this.preciseCombo = 0;
    }
    this.bestPreciseCombo = Math.max(this.bestPreciseCombo, this.preciseCombo);
    const comboBonus = tierName === "precise" && this.preciseCombo > 1
      ? (this.preciseCombo - 1) * 20
      : 0;
    const gained = tier.points + comboBonus;
    this.score += gained;
    this.feedback = {
      tier: tierName,
      label: tier.label,
      points: gained,
      combo: this.preciseCombo,
      ratio: attempt.accuracyRatio
    };
    this.feedbackTime = 1.15;
  }

  confirmSuccessfulGrab() {
    if (this.pendingAttempt.scoreConfirmed) {
      return;
    }
    this.pendingAttempt.scoreConfirmed = true;
    this.applyAccuracyScore(this.animationResult || this.pendingAttempt);
    this.audio.playGrabSuccess();
    const grabbedPowerUp = this.targetHold.powerUp;
    this.previousHold = this.currentHold;
    this.targetHold.state = "current";
    this.targetHold.powerUp = null;
    this.currentHold.state = "grabbed";
    this.currentIndex += 1;
    this.currentHold = this.targetHold;
    this.targetHold = this.routeHolds[this.currentIndex + 1];
    if (this.targetHold) {
      this.targetHold.state = "target";
    }
    this.holdCount += 1;
    this.climbHeight = this.calculateClimbHeightFromCurrentHold();
    if (grabbedPowerUp) {
      this.activatePowerUp(grabbedPowerUp);
    }
    const feet = this.chooseFeetSupportsForBody("front", this.player.getNeutralBodyForHold(this.currentHold));
    this.player.beginBodyFollow(this.currentHold, feet.leftFoot, feet.rightFoot);
    this.camera.beginFollowToWorldY(this.player.getNeutralBodyForHold(this.currentHold).y);
    this.charge = 0;
    this.chargeDirection = 1;
    this.state = STATE.BODY_FOLLOW;
  }

  handleFailedGrab(result) {
    this.failureReason = result === "tooStrong" ? "力量过大" : "力量不足";
    this.preciseCombo = 0;
    this.finalizeRoundScore();
    this.player.beginFall(result, this.targetHold);
    this.charge = 0;
    this.chargeDirection = 1;
    this.state = STATE.FALLING;
  }

  finishSettle() {
    this.settlePlayerPose(this.previousHold, this.pendingAttempt ? this.pendingAttempt.actionType : "far");
    this.switchActiveHandOnce();
    if (this.pendingRestHand) {
      this.player.beginHandRest(this.pendingRestHand, "final");
      this.pendingRestHand = null;
      this.state = STATE.HAND_REST;
      return;
    }
    this.beginCameraFollow();
  }

  switchActiveHandOnce() {
    if (!this.pendingAttempt || this.pendingAttempt.handSwitched) {
      return;
    }
    this.player.switchActiveHand();
    this.pendingAttempt.handSwitched = true;
  }

  beginCameraFollow() {
    if (this.camera.active) {
      this.state = STATE.CAMERA_FOLLOW;
      return;
    }
    this.finishCameraFollow();
  }

  updateCameraDuringClimb(deltaTime) {
    if (this.camera.active) {
      this.camera.update(deltaTime);
    }
  }

  finishCameraFollow() {
    this.generator.ensureHoldBuffer(this.currentIndex);
    const removed = this.generator.removeOldHolds(this.camera.y, this.currentIndex, this.getProtectedHoldIds());
    if (removed > 0) {
      this.currentIndex -= removed;
      this.routeHolds = this.generator.routeHolds;
      this.currentHold = this.routeHolds[this.currentIndex];
      this.targetHold = this.routeHolds[this.currentIndex + 1];
    }
    this.player.animationStage = STATE.READY;
    this.state = STATE.READY;
  }

  canInterruptForNextMove() {
    if (this.state === STATE.READY) {
      return false;
    }
    if (this.state === STATE.LEAD_HAND_CONTACT) {
      return this.animationResult && this.animationResult.result === "success" && Boolean(this.pendingAttempt);
    }
    return [
      STATE.BODY_FOLLOW,
      STATE.HAND_REST,
      STATE.TRAILING_HAND_MOVE,
      STATE.FEET_REPOSITION,
      STATE.SETTLING,
      STATE.CAMERA_FOLLOW
    ].includes(this.state) && this.pendingAttempt && this.pendingAttempt.scoreConfirmed;
  }

  canRestartEndedRound() {
    return this.roundEnded && [STATE.FALLING, STATE.AUTO_DESCEND].includes(this.state);
  }

  interruptToNextCharge() {
    if (this.state === STATE.LEAD_HAND_CONTACT && this.pendingAttempt && !this.pendingAttempt.scoreConfirmed) {
      this.confirmSuccessfulGrab();
    }
    this.completePostGrabPresentation();
    this.beginCharge();
  }

  completePostGrabPresentation() {
    if (!this.pendingAttempt || !this.pendingAttempt.scoreConfirmed) {
      return;
    }
    this.pendingRestHand = null;
    this.player.stopIdleRest();
    this.player.motion.feetSyncActive = false;
    this.player.motion.feetPositioned = true;
    this.settlePlayerPose(this.previousHold, this.pendingAttempt.actionType || "far");
    this.switchActiveHandOnce();
    this.completeCameraFollowImmediately();
    this.player.animationStage = STATE.READY;
  }

  completeCameraFollowImmediately() {
    if (this.camera.active) {
      this.camera.y = this.camera.targetY;
      this.camera.startY = this.camera.targetY;
      this.camera.elapsed = this.camera.duration;
      this.camera.active = false;
    }
    this.generator.ensureHoldBuffer(this.currentIndex);
    const removed = this.generator.removeOldHolds(this.camera.y, this.currentIndex, this.getProtectedHoldIds());
    if (removed > 0) {
      this.currentIndex -= removed;
      this.routeHolds = this.generator.routeHolds;
      this.currentHold = this.routeHolds[this.currentIndex];
      this.targetHold = this.routeHolds[this.currentIndex + 1];
    }
  }

  chooseFeetSupportsForBody(mode, bodyPosition) {
    const saved = {
      x: this.player.worldX,
      y: this.player.worldY,
      angle: this.player.bodyAngle
    };
    this.player.worldX = bodyPosition.x;
    this.player.worldY = bodyPosition.y;
    this.player.bodyAngle = 0;
    const feet = this.chooseFeetSupports(mode);
    this.player.worldX = saved.x;
    this.player.worldY = saved.y;
    this.player.bodyAngle = saved.angle;
    return feet;
  }

  finalizeGameOver() {
    this.finalizeRoundScore();
    this.state = STATE.GAME_OVER;
  }

  finalizeRoundScore() {
    if (this.roundEnded) {
      return;
    }
    this.roundEnded = true;
    this.climbHeight = Math.max(this.climbHeight, this.calculateClimbHeightFromCurrentHold());
    this.newBest = this.scoreManager.saveBestScore({
      holds: this.holdCount,
      height: this.climbHeight,
      score: this.score
    });
  }

  settlePlayerPose(previousHold, actionType) {
    this.pendingRestHand = null;
    const postureType = this.choosePostureType(actionType);
    this.player.postureType = postureType;
    const neutral = this.player.getNeutralBodyForHold(this.currentHold);
    this.player.worldX = neutral.x;
    this.player.worldY = neutral.y;
    this.player.neutralX = neutral.x;
    this.player.neutralY = neutral.y;
    this.player.bodyAngle = 0;

    if (postureType === "side") {
      this.applySidePosture();
    } else {
      this.applyFrontPosture(previousHold, actionType);
    }
  }

  choosePostureType(actionType) {
    if (actionType === "far" && this.holdCount > 0 && this.holdCount % 3 === 0) {
      return "side";
    }
    return "front";
  }

  applyFrontPosture(previousHold, actionType) {
    const lead = this.player.leadHandName;
    const trailing = this.player.trailingHandName;
    this.player.contacts.leftHand = null;
    this.player.contacts.rightHand = null;
    const feet = this.chooseFeetSupports("front");
    if (actionType === "near" && previousHold) {
      this.player.contacts[lead] = this.currentHold.id;
      this.player.contacts[trailing] = previousHold.id;
      this.player.handAims[lead] = { x: this.currentHold.x, y: this.currentHold.y };
      this.player.handAims[trailing] = { x: previousHold.x, y: previousHold.y };
      const bothFeetOn = feet.leftFoot && feet.rightFoot;
      if (bothFeetOn && this.isRestArmTooBent(trailing, previousHold)) {
        this.player.contacts[trailing] = null;
        this.player.handAims[trailing] = {
          x: this.player.worldX + (trailing === "leftHand" ? -30 : 30),
          y: this.player.worldY - 6
        };
        this.pendingRestHand = trailing;
      }
    } else {
      this.player.contacts.leftHand = this.currentHold.id;
      this.player.contacts.rightHand = this.currentHold.id;
      this.player.handAims.leftHand = { x: this.currentHold.x, y: this.currentHold.y };
      this.player.handAims.rightHand = { x: this.currentHold.x, y: this.currentHold.y };
    }
    this.applyFootPose(feet.leftFoot, feet.rightFoot);
  }

  isRestArmTooBent(handName, hold) {
    const anchors = this.calculateBodyAnchors();
    const shoulder = handName === "leftHand" ? anchors.leftShoulder : anchors.rightShoulder;
    return distance(shoulder, hold) < CONFIG.armRestMinDistance;
  }

  applySidePosture() {
    const lead = this.player.leadHandName;
    const hanging = this.player.trailingHandName;
    const leadSide = lead === "leftHand" ? -1 : 1;
    const plantedFootName = lead === "leftHand" ? "rightFoot" : "leftFoot";
    const crossingFootName = lead === "leftHand" ? "leftFoot" : "rightFoot";
    this.player.contacts.leftHand = null;
    this.player.contacts.rightHand = null;
    this.player.contacts[lead] = this.currentHold.id;
    this.player.handAims[lead] = { x: this.currentHold.x, y: this.currentHold.y };
    this.player.handAims[hanging] = {
      x: this.player.worldX - leadSide * 30,
      y: this.player.worldY - 6
    };
    const pose = this.calculateBodyAnchors();
    const plantedHip = plantedFootName === "leftFoot" ? pose.leftHip : pose.rightHip;
    const plantedSide = plantedFootName === "leftFoot" ? -1 : 1;
    const plantedFoot = this.findFootHoldForLimb(plantedFootName, plantedHip, plantedSide, new Set(), true);
    this.player.contacts.leftFoot = null;
    this.player.contacts.rightFoot = null;
    if (plantedFoot) {
      this.player.contacts[plantedFootName] = plantedFoot.id;
      this.player.footAims[plantedFootName] = { x: plantedFoot.x, y: plantedFoot.y };
      this.player.footAims[crossingFootName] = this.getCrossWallFootAim(crossingFootName, plantedFoot, leadSide);
    } else {
      this.player.footAims[plantedFootName] = this.player.getHangingFootAim(plantedFootName);
      this.player.footAims[crossingFootName] = this.player.getHangingFootAim(crossingFootName);
    }
    this.pendingRestHand = hanging;
  }

  applyFootPose(leftFoot, rightFoot) {
    this.player.contacts.leftFoot = leftFoot ? leftFoot.id : null;
    this.player.contacts.rightFoot = rightFoot ? rightFoot.id : null;
    this.player.footAims.leftFoot = leftFoot
      ? { x: leftFoot.x, y: leftFoot.y }
      : this.player.getHangingFootAim("leftFoot");
    this.player.footAims.rightFoot = rightFoot
      ? { x: rightFoot.x, y: rightFoot.y }
      : this.player.getHangingFootAim("rightFoot");
  }

  getCrossWallFootAim(limbName, plantedFoot, leadSide) {
    const crossSide = limbName === "leftFoot" ? -1 : 1;
    return {
      x: clamp(plantedFoot.x - leadSide * 24 + crossSide * 6, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding),
      y: plantedFoot.y + 10
    };
  }

  chooseFeetSupports(mode = "front") {
    const pose = this.calculateBodyAnchors();
    let leftFoot = this.findFootHoldForLimb("leftFoot", pose.leftHip, -1, new Set(), false);
    const exclude = new Set(leftFoot ? [leftFoot.id] : []);
    let rightFoot = this.findFootHoldForLimb("rightFoot", pose.rightHip, 1, exclude, false);
    if (mode === "front" && leftFoot && rightFoot && Math.abs(leftFoot.x - rightFoot.x) < CONFIG.footMinSeparation) {
      const keepLeft = this.scoreFootHold(leftFoot, pose.leftHip, -1) <= this.scoreFootHold(rightFoot, pose.rightHip, 1);
      if (keepLeft) {
        rightFoot = this.findFootHoldForLimb("rightFoot", pose.rightHip, 1, new Set([leftFoot.id]), false, leftFoot);
      } else {
        leftFoot = this.findFootHoldForLimb("leftFoot", pose.leftHip, -1, new Set([rightFoot.id]), false, rightFoot);
      }
      if (leftFoot && rightFoot && Math.abs(leftFoot.x - rightFoot.x) < CONFIG.footMinSeparation) {
        if (keepLeft) {
          rightFoot = null;
        } else {
          leftFoot = null;
        }
      }
    }
    if (!leftFoot && !rightFoot) {
      leftFoot = this.findFootHoldForLimb("leftFoot", pose.leftHip, -1, new Set(), true);
      if (leftFoot) {
        rightFoot = null;
      } else {
        rightFoot = this.findFootHoldForLimb("rightFoot", pose.rightHip, 1, new Set(), true);
      }
    }
    return { leftFoot, rightFoot };
  }

  findFootHoldForLimb(limbName, joint, side, excludeIds, allowFallback, separationFrom = null) {
    const minReach = CONFIG.legReachMin;
    const maxReach = CONFIG.legReachMax;
    const footFloorY = joint.y + 6;
    const candidates = this.getFootHoldCandidates(joint, maxReach + 28)
      .filter((hold) => !excludeIds.has(hold.id))
      .filter((hold) => hold.y >= footFloorY)
      .filter((hold) => !separationFrom || Math.abs(hold.x - separationFrom.x) >= CONFIG.footMinSeparation)
      .map((hold) => {
        return { hold, score: this.scoreFootHold(hold, joint, side, minReach, maxReach) };
      })
      .sort((a, b) => a.score - b.score);

    if (candidates.length > 0) {
      return candidates[0].hold;
    }

    if (!allowFallback) {
      return null;
    }
    const fallbackPoint = {
      x: clamp(joint.x + side * 30, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding),
      y: joint.y + 62
    };
    return this.generator.createFallbackSupport(fallbackPoint, this.currentHold.id);
  }

  scoreFootHold(hold, joint, side, minReach = CONFIG.legReachMin, maxReach = CONFIG.legReachMax) {
    const d = distance(joint, hold);
    const sideScore = side < 0 ? Math.max(0, hold.x - joint.x) : Math.max(0, joint.x - hold.x);
    const footScore = Math.abs((hold.y - joint.y) - 58);
    const routeBonus = hold.type === "route" ? -8 : 0;
    const footRouteBonus = hold.isFootRoute ? -24 : 0;
    const reachPenalty = d < minReach || d > maxReach ? 200 : 0;
    return d + sideScore * 1.4 + footScore * 0.45 + reachPenalty + routeBonus + footRouteBonus;
  }

  getFootHoldCandidates(joint, range) {
    return [...this.generator.supportHolds, ...this.routeHolds]
      .filter((hold) => !hold.hidden)
      .filter((hold) => hold.type === "route" || hold.isFootRoute)
      .filter((hold) => distance(joint, hold) <= range);
  }

  getProtectedHoldIds() {
    const ids = new Set(Object.values(this.player.contacts).filter((id) => id != null));
    ids.add(this.currentHold.id);
    if (this.targetHold) {
      ids.add(this.targetHold.id);
    }
    if (this.previousHold) {
      ids.add(this.previousHold.id);
    }
    return ids;
  }

  worldToScreen(point) {
    return {
      x: point.x,
      y: point.y - this.camera.y
    };
  }

  getHoldPointByContact(limbName) {
    if (this.state === STATE.READY && limbName.endsWith("Hand")) {
      const idleAim = this.player.getIdleHandAim(limbName);
      if (idleAim) {
        return idleAim;
      }
    }
    const contactId = this.player.contacts[limbName];
    const hold = this.generator.getHoldById(contactId);
    if (hold) {
      return { x: hold.x, y: hold.y };
    }
    if (limbName.endsWith("Hand")) {
      return this.player.handAims[limbName];
    }
    return this.player.footAims[limbName];
  }

  calculateBodyAnchors() {
    const body = { x: this.player.worldX, y: this.player.worldY };
    const angle = this.player.bodyAngle;
    const leftShoulder = add(body, rotate({ x: -CONFIG.shoulderWidth / 2, y: -CONFIG.torsoLength / 2 }, angle));
    const rightShoulder = add(body, rotate({ x: CONFIG.shoulderWidth / 2, y: -CONFIG.torsoLength / 2 }, angle));
    const leftHip = add(body, rotate({ x: -CONFIG.hipWidth / 2, y: CONFIG.torsoLength / 2 }, angle));
    const rightHip = add(body, rotate({ x: CONFIG.hipWidth / 2, y: CONFIG.torsoLength / 2 }, angle));
    const head = add(body, rotate({ x: 0, y: -CONFIG.torsoLength / 2 - CONFIG.headRadius - 7 }, angle));
    const harness = add(body, rotate({ x: 0, y: CONFIG.torsoLength / 2 - 8 }, angle));
    return { body, leftShoulder, rightShoulder, leftHip, rightHip, head, harness };
  }

  calculatePose() {
    const anchors = this.calculateBodyAnchors();
    const leftHandTarget = this.getHoldPointByContact("leftHand");
    const rightHandTarget = this.getHoldPointByContact("rightHand");
    const leftFootTarget = this.getHoldPointByContact("leftFoot");
    const rightFootTarget = this.getHoldPointByContact("rightFoot");
    const leftArm = solveTwoBoneIK(anchors.leftShoulder, leftHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: -1, y: 0.35 });
    const rightArm = solveTwoBoneIK(anchors.rightShoulder, rightHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: 1, y: 0.35 });
    const leftLeg = solveTwoBoneIK(anchors.leftHip, leftFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: -1, y: 0.15 });
    const rightLeg = solveTwoBoneIK(anchors.rightHip, rightFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: 1, y: 0.15 });
    this.player.debugLengths = {
      leftArm: leftArm.upperActual + leftArm.lowerActual,
      rightArm: rightArm.upperActual + rightArm.lowerActual,
      leftLeg: leftLeg.upperActual + leftLeg.lowerActual,
      rightLeg: rightLeg.upperActual + rightLeg.lowerActual
    };
    return {
      ...anchors,
      leftArm,
      rightArm,
      leftLeg,
      rightLeg,
      leftHandTarget,
      rightHandTarget,
      leftFootTarget,
      rightFootTarget
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    if (this.loading || this.state === STATE.LOADING) {
      this.drawLoadingScreen(ctx);
      return;
    }
    this.drawWall(ctx);
    this.drawSupportHolds(ctx, false);
    this.drawRouteHolds(ctx);
    this.drawSupportHolds(ctx, true);
    this.drawRope(ctx);
    this.drawPlayer(ctx);
    if (this.state !== STATE.START) {
      this.drawTargetHighlight(ctx);
    }
    if (this.state === STATE.START) {
      this.drawStartScreen(ctx);
    } else {
      this.drawHud(ctx);
      if (this.state === STATE.GAME_OVER) {
        this.drawGameOver(ctx);
      } else if (this.roundEnded) {
        this.drawRoundEndedBadge(ctx);
      } else if (this.holdCount === 0 && this.state === STATE.READY) {
        this.drawStartHint(ctx);
      }
      if (this.feedback) {
        this.drawAccuracyFeedback(ctx);
      }
    }
    this.drawPowerUpAura(ctx);
    this.drawUiControls(ctx);
    if (this.uiPanel) {
      this.drawUiPanel(ctx);
    }
    if (this.uiToast) {
      this.drawToast(ctx);
    }
    if (DEBUG) {
      this.drawDebug(ctx);
    }
  }

  drawLoadingScreen(ctx) {
    const progress = clamp(this.loadingProgress || 0, 0, 1);
    ctx.save();
    const bg = ctx.createLinearGradient(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    bg.addColorStop(0, "#eefbff");
    bg.addColorStop(0.48, "#d5f0f7");
    bg.addColorStop(1, "#9fddeb");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);

    ctx.globalAlpha = 0.42;
    this.drawWallPanels(ctx);
    this.drawWallBoltHoles(ctx);
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
    ctx.font = "900 42px Arial, Helvetica, sans-serif";
    ctx.lineWidth = 7;
    ctx.strokeStyle = "rgba(52, 154, 180, 0.42)";
    ctx.strokeText("攀了个岩", CONFIG.logicalWidth / 2, 250);
    ctx.fillText("攀了个岩", CONFIG.logicalWidth / 2, 250);

    ctx.fillStyle = "#315f72";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText(this.loadingMessage, CONFIG.logicalWidth / 2, 316);

    const w = 238;
    const h = 18;
    const x = (CONFIG.logicalWidth - w) / 2;
    const y = 346;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    this.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();

    ctx.save();
    this.roundRect(ctx, x + 3, y + 3, (w - 6) * progress, h - 6, (h - 6) / 2);
    ctx.clip();
    const fill = ctx.createLinearGradient(x, 0, x + w, 0);
    fill.addColorStop(0, "#47bc68");
    fill.addColorStop(0.52, "#55c6df");
    fill.addColorStop(1, "#ff3aa9");
    ctx.fillStyle = fill;
    this.roundRect(ctx, x + 3, y + 3, w - 6, h - 6, (h - 6) / 2);
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = "rgba(49, 95, 114, 0.74)";
    ctx.font = "bold 13px Arial, Helvetica, sans-serif";
    ctx.fillText(`${Math.round(progress * 100)}%`, CONFIG.logicalWidth / 2, y + 45);
    ctx.restore();
  }

  drawWall(ctx) {
    ctx.fillStyle = THEME.wall.base;
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    this.drawWallPanels(ctx);
    this.drawWallBoltHoles(ctx);
    this.drawWallTexture(ctx);
    this.drawHeightScale(ctx);
  }

  drawHeightScale(ctx) {
    const startY = this.player.startWorldY;
    const visibleTop = this.camera.y - 70;
    const visibleBottom = this.camera.y + CONFIG.logicalHeight + 70;
    const halfMeter = CONFIG.pixelsPerMeter / 2;
    const minHalfStep = Math.max(0, Math.ceil((startY - visibleBottom) / halfMeter));
    const maxHalfStep = Math.max(0, Math.floor((startY - visibleTop) / halfMeter));
    const x = 0;
    const scaleColor = "rgba(255, 255, 255, 0.80)";

    ctx.save();
    ctx.strokeStyle = scaleColor;
    ctx.fillStyle = scaleColor;
    ctx.lineCap = "butt";

    for (let halfStep = minHalfStep; halfStep <= maxHalfStep; halfStep += 1) {
      const meters = halfStep / 2;
      const isMajor = halfStep % 2 === 0;
      const worldY = startY - meters * CONFIG.pixelsPerMeter;
      const y = worldY - this.camera.y;
      if (y < -24 || y > CONFIG.logicalHeight + 24) {
        continue;
      }

      const tickLength = 16;
      ctx.lineWidth = isMajor ? 6.3 : 2.6;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + tickLength, y);
      ctx.stroke();

      if (isMajor) {
        ctx.font = "bold 18px Arial, Helvetica, sans-serif";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(`${Math.round(meters)} m`, x + tickLength + 7, y);
      }
    }
    ctx.restore();
  }

  drawWallPanels(ctx) {
    const segmentHeight = 520;
    const startIndex = Math.floor(this.camera.y / segmentHeight) - 2;
    const endIndex = Math.floor((this.camera.y + CONFIG.logicalHeight) / segmentHeight) + 2;
    for (let index = startIndex; index <= endIndex; index += 1) {
      const worldTop = index * segmentHeight;
      const y = worldTop - this.camera.y;
      const flip = index % 2 === 0 ? 1 : -1;
      const shift = (hashUnit(index) - 0.5) * 42;

      ctx.fillStyle = index % 3 === 0 ? THEME.wall.light : THEME.wall.mid;
      ctx.beginPath();
      ctx.moveTo(0, y + 10);
      ctx.lineTo(CONFIG.logicalWidth, y - 28);
      ctx.lineTo(CONFIG.logicalWidth, y + segmentHeight * 0.58);
      ctx.lineTo(0, y + segmentHeight * 0.92);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = THEME.wall.blue;
      ctx.beginPath();
      ctx.moveTo(flip > 0 ? -60 : CONFIG.logicalWidth + 60, y + 40);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.34 : 0.66) + shift, y + segmentHeight * 0.08);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.16 : 0.84) + shift * 0.3, y + segmentHeight * 0.76);
      ctx.lineTo(flip > 0 ? -36 : CONFIG.logicalWidth + 36, y + segmentHeight * 0.52);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = index % 4 === 0 ? THEME.wall.deepBlue : THEME.wall.light;
      ctx.beginPath();
      ctx.moveTo(CONFIG.logicalWidth * (flip > 0 ? 0.74 : 0.26) + shift, y - 16);
      ctx.lineTo(CONFIG.logicalWidth + (flip > 0 ? 48 : -48), y + segmentHeight * 0.22);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.88 : 0.12), y + segmentHeight * 0.62);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.50 : 0.50) + shift * 0.2, y + segmentHeight * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = THEME.wall.seam;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + segmentHeight * 0.92);
      ctx.lineTo(CONFIG.logicalWidth, y + segmentHeight * 0.58);
      ctx.stroke();

      ctx.strokeStyle = THEME.wall.pink;
      ctx.lineWidth = 7;
      ctx.globalAlpha = 0.62;
      ctx.beginPath();
      ctx.moveTo(flip > 0 ? -20 : CONFIG.logicalWidth + 20, y + segmentHeight * 0.92);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.82 : 0.18), y + segmentHeight * 0.60);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawWallBoltHoles(ctx) {
    const spacingX = 68;
    const spacingY = 70;
    const startRow = Math.floor((this.camera.y - 100) / spacingY);
    const endRow = Math.ceil((this.camera.y + CONFIG.logicalHeight + 100) / spacingY);
    for (let row = startRow; row <= endRow; row += 1) {
      const worldY = row * spacingY;
      const y = worldY - this.camera.y;
      for (let col = 0; col <= Math.ceil(CONFIG.logicalWidth / spacingX); col += 1) {
        const seed = row * 131 + col * 17;
        const jitterX = (hashUnit(seed) - 0.5) * 16;
        const jitterY = (hashUnit(seed + 8) - 0.5) * 10;
        const x = col * spacingX + 30 + jitterX;
        if (x < 12 || x > CONFIG.logicalWidth - 12) {
          continue;
        }
        ctx.fillStyle = "rgba(130, 160, 172, 0.26)";
        ctx.beginPath();
        ctx.arc(x, y + jitterY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.58)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  drawWallTexture(ctx) {
    ctx.fillStyle = "rgba(86, 136, 154, 0.10)";
    const spacing = 118;
    const start = Math.floor((this.camera.y - 80) / spacing);
    const end = Math.ceil((this.camera.y + CONFIG.logicalHeight + 80) / spacing);
    for (let row = start; row <= end; row += 1) {
      for (let i = 0; i < 4; i += 1) {
        const seed = row * 47 + i * 113;
        const x = 28 + hashUnit(seed) * (CONFIG.logicalWidth - 56);
        const y = row * spacing + hashUnit(seed + 5) * spacing - this.camera.y;
        ctx.beginPath();
        ctx.arc(x, y, 0.9 + hashUnit(seed + 9) * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  getHoldVisual(hold, options = {}) {
    const colors = hold.type === "support" ? THEME.holds.support : THEME.holds.route;
    let color = colors[hashNumber(hold.id + (hold.type === "support" ? 91 : 0)) % colors.length];
    if (hold.state === "current") {
      color = "#247fd0";
    } else if (hold.state === "target") {
      color = "#1264b4";
    }
    const asset = this.holdAssets.getAssetForHold(hold, options);
    const assetReady = this.holdAssets.isAssetReady(asset);
    const imageScale = hold.type === "support" ? 3.05 : 3.85;
    const maxImageSize = Math.max(18, hold.radius * imageScale);
    let imageWidth = maxImageSize;
    let imageHeight = maxImageSize;
    if (assetReady) {
      const aspect = asset.image.width / asset.image.height;
      if (aspect >= 1) {
        imageWidth = maxImageSize;
        imageHeight = maxImageSize / aspect;
      } else {
        imageHeight = maxImageSize;
        imageWidth = maxImageSize * aspect;
      }
    }
    return {
      radius: assetReady ? Math.max(imageWidth, imageHeight) / 2 : this.getVectorHoldRadius(hold),
      shape: HOLD_SHAPES[hashNumber(hold.id) % HOLD_SHAPES.length],
      color,
      angle: (hashUnit(hold.id + 23) - 0.5) * Math.PI * 0.8,
      asset,
      assetReady,
      imageWidth,
      imageHeight
    };
  }

  getHoldVisualRadius(hold, options = {}) {
    return this.getHoldVisual(hold, options).radius;
  }

  getVectorHoldRadius(hold) {
    const typeScale = hold.type === "support" ? 0.82 : 1;
    const specialShapeScale = hashNumber(hold.id) % 7 === 0 && hold.type === "route" ? 1.38 : 1;
    return Math.max(5, hold.radius * THEME.holds.visualScale * typeScale * specialShapeScale);
  }

  drawHold(ctx, hold, isContact = false, options = {}) {
    const screen = this.worldToScreen(hold);
    if (screen.y < -90 || screen.y > CONFIG.logicalHeight + 90) {
      return;
    }
    const visual = this.getHoldVisual(hold, options);
    ctx.save();
    ctx.translate(screen.x, screen.y);
    ctx.rotate(visual.angle);

    if (visual.assetReady) {
      this.drawHoldImage(ctx, hold, visual, isContact);
      ctx.restore();
      return;
    }

    ctx.fillStyle = isContact ? shadeHex(visual.color, 12) : visual.color;
    ctx.strokeStyle = isContact ? THEME.holds.contactStroke : "rgba(42, 77, 92, 0.28)";
    ctx.lineWidth = isContact ? 2.6 : 1.4;
    this.drawHoldShapePath(ctx, visual.shape, visual.radius);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = visual.color === "#ffffff" || visual.color === "#f7fafb"
      ? "rgba(165, 192, 202, 0.26)"
      : "rgba(255,255,255,0.16)";
    this.drawHoldFacet(ctx, visual.shape, visual.radius);
    ctx.fill();

    this.drawHoldBolt(ctx, visual.radius);
    ctx.restore();
  }

  drawHoldImage(ctx, hold, visual, isContact) {
    const r = visual.radius;
    if (hold.state === "target") {
      ctx.shadowColor = "rgba(255, 226, 92, 0.52)";
      ctx.shadowBlur = 12;
    } else if (isContact) {
      ctx.shadowColor = "rgba(255, 255, 214, 0.58)";
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowColor = "rgba(62, 75, 86, 0.20)";
      ctx.shadowBlur = 4;
    }
    ctx.shadowOffsetY = 2;
    ctx.drawImage(
      visual.asset.image,
      -visual.imageWidth / 2,
      -visual.imageHeight / 2,
      visual.imageWidth,
      visual.imageHeight
    );

    ctx.shadowColor = "transparent";
    if (isContact || hold.state === "current") {
      ctx.strokeStyle = THEME.holds.contactStroke;
      ctx.lineWidth = isContact ? 2.3 : 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  drawHoldShapePath(ctx, shape, r) {
    ctx.beginPath();
    if (shape === "jug") {
      ctx.ellipse(0, 0, r * 1.28, r * 1.05, 0, 0, Math.PI * 2);
      return;
    }
    if (shape === "blob") {
      ctx.moveTo(-r * 0.95, -r * 0.18);
      ctx.bezierCurveTo(-r * 0.86, -r * 0.95, -r * 0.06, -r * 1.18, r * 0.58, -r * 0.78);
      ctx.bezierCurveTo(r * 1.20, -r * 0.38, r * 1.02, r * 0.60, r * 0.22, r * 0.98);
      ctx.bezierCurveTo(-r * 0.62, r * 1.38, -r * 1.28, r * 0.66, -r * 0.95, -r * 0.18);
      ctx.closePath();
      return;
    }
    if (shape === "triangle" || shape === "volume") {
      const s = shape === "volume" ? 1.45 : 1.1;
      ctx.moveTo(-r * s, r * 0.95);
      ctx.lineTo(r * 1.18 * s, r * 0.62);
      ctx.lineTo(r * 0.24, -r * 1.32 * s);
      ctx.closePath();
      return;
    }
    if (shape === "sloper") {
      ctx.ellipse(0, 0, r * 1.42, r * 0.78, -0.25, 0, Math.PI * 2);
      return;
    }
    if (shape === "pinch") {
      ctx.moveTo(-r * 0.55, -r * 1.28);
      ctx.bezierCurveTo(r * 0.42, -r * 1.10, r * 0.74, -r * 0.18, r * 0.42, r * 1.20);
      ctx.bezierCurveTo(-r * 0.70, r * 1.08, -r * 0.88, r * 0.08, -r * 0.55, -r * 1.28);
      ctx.closePath();
      return;
    }
    const rr = r * 0.34;
    const w = r * 1.75;
    const h = r * 0.82;
    ctx.moveTo(-w / 2 + rr, -h / 2);
    ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, rr);
    ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, rr);
    ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, rr);
    ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, rr);
    ctx.closePath();
  }

  drawHoldFacet(ctx, shape, r) {
    ctx.beginPath();
    if (shape === "jug") {
      ctx.ellipse(-r * 0.18, -r * 0.18, r * 0.68, r * 0.46, -0.32, 0, Math.PI * 2);
      return;
    }
    if (shape === "triangle" || shape === "volume") {
      ctx.moveTo(-r * 0.65, r * 0.38);
      ctx.lineTo(r * 0.64, r * 0.30);
      ctx.lineTo(r * 0.10, -r * 0.62);
      ctx.closePath();
      return;
    }
    ctx.ellipse(-r * 0.22, -r * 0.20, r * 0.50, r * 0.26, -0.35, 0, Math.PI * 2);
  }

  drawHoldBolt(ctx, r) {
    const boltR = clamp(r * 0.24, 2.1, 4.2);
    ctx.fillStyle = THEME.holds.boltOuter;
    ctx.beginPath();
    ctx.arc(0, 0, boltR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = THEME.holds.boltInner;
    ctx.beginPath();
    ctx.arc(0, 0, boltR * 0.52, 0, Math.PI * 2);
    ctx.fill();
  }

  drawDecorTicks(ctx, x, y, r, time) {
    const colors = ["#f4c84c", "#66b9e8", "#61b77b", "#ec6fa0"];
    ctx.lineWidth = 1;
    for (let i = 0; i < 6; i += 1) {
      const angle = time * 0.8 + i * 1.04;
      const start = r + 8 + (i % 2) * 4;
      const end = start + 5;
      ctx.strokeStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * start, y + Math.sin(angle) * start);
      ctx.lineTo(x + Math.cos(angle) * end, y + Math.sin(angle) * end);
      ctx.stroke();
    }
  }

  drawSupportHolds(ctx, contactedOnly) {
    const contactIds = this.getProtectedHoldIds();
    for (const hold of this.generator.supportHolds) {
      if (hold.hidden) {
        continue;
      }
      const isContact = contactIds.has(hold.id);
      if (contactedOnly !== isContact) {
        continue;
      }
      this.drawHold(ctx, hold, isContact, { useRouteAsset: hold.isFootRoute });
    }
  }

  drawRouteHolds(ctx) {
    const contactIds = this.getProtectedHoldIds();
    for (const hold of this.routeHolds) {
      this.drawHold(ctx, hold, contactIds.has(hold.id));
      if (hold.powerUp) {
        this.drawPowerUpIcon(ctx, hold);
      }
    }
  }

  drawPowerUpIcon(ctx, hold) {
    const screen = this.worldToScreen(hold);
    if (screen.y < -90 || screen.y > CONFIG.logicalHeight + 90) {
      return;
    }
    const type = hold.powerUp;
    const color = POWER_UPS[type] ? POWER_UPS[type].color : "#ff3aa9";
    const y = screen.y - this.getHoldVisualRadius(hold) - 14;
    ctx.save();
    ctx.translate(screen.x, y);
    ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
    ctx.beginPath();
    ctx.arc(0, 0, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (type === "magnet") {
      ctx.beginPath();
      ctx.arc(0, 0, 6.5, Math.PI * 0.12, Math.PI * 0.88, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-6, 1);
      ctx.lineTo(-6, 6);
      ctx.moveTo(6, 1);
      ctx.lineTo(6, 6);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(-2, -2, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(3, 3);
      ctx.lineTo(8, 8);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTargetHighlight(ctx) {
    if (!this.targetHold) {
      return;
    }
    const screen = this.worldToScreen(this.targetHold);
    const visualRadius = this.getHoldVisualRadius(this.targetHold);
    const time = performance.now() * 0.004;
    const pulse = 1 + Math.sin(time) * 0.04;
    const targetScale = this.powerUps.magnifier > 0 ? 1.5 : 1;
    const ringRadius = (visualRadius + 14) * pulse * targetScale;
    ctx.strokeStyle = "rgba(255,255,255,0.96)";
    ctx.lineWidth = 4.6;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 210, 92, 0.76)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, ringRadius + 3, 0, Math.PI * 2);
    ctx.stroke();
    this.drawDecorTicks(ctx, screen.x, screen.y, ringRadius, time);
  }

  drawRope(ctx) {
    const harness = this.worldToScreen(this.calculateBodyAnchors().harness);
    const anchorX = CONFIG.logicalWidth / 2;
    const anchorY = -18;
    const slack = this.state === STATE.READY || this.state === STATE.CHARGING ? 16 : 4;
    const midY = (anchorY + harness.y) / 2 + slack;
    ctx.strokeStyle = THEME.rope.light;
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.quadraticCurveTo(anchorX - 12, midY, harness.x, harness.y);
    ctx.stroke();
    ctx.strokeStyle = THEME.rope.main;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(anchorX + 1.5, anchorY);
    ctx.quadraticCurveTo(anchorX - 10, midY, harness.x + 1.5, harness.y);
    ctx.stroke();
    ctx.strokeStyle = "rgba(255,255,255,0.58)";
    ctx.lineWidth = 1;
    for (let t = 0.08; t < 0.96; t += 0.08) {
      const p0 = { x: anchorX, y: anchorY };
      const p1 = { x: anchorX - 12, y: midY };
      const p2 = harness;
      const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
      const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
      ctx.beginPath();
      ctx.moveTo(x - 2, y - 2);
      ctx.lineTo(x + 2, y + 2);
      ctx.stroke();
    }
  }

  drawPlayerSprite(ctx, assetName, screenBody, options) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    const scale = options.scale;
    const anchor = options.anchor;
    const width = image.width * scale;
    const height = image.height * scale;
    ctx.save();
    ctx.translate(screenBody.x, screenBody.y);
    ctx.rotate(this.player.bodyAngle);
    ctx.drawImage(
      image,
      -anchor.x * scale,
      -anchor.y * scale,
      width,
      height
    );
    ctx.restore();
    return true;
  }

  drawBodyPartSprite(ctx, assetName, localX, localY, scale, rotation = 0) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    ctx.save();
    ctx.translate(localX, localY);
    ctx.rotate(rotation);
    ctx.drawImage(
      image,
      -image.width * scale * 0.5,
      -image.height * scale * 0.5,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();
    return true;
  }

  drawBodyPartSpriteAtAnchor(ctx, assetName, localX, localY, sourceAnchor, scale, rotation = 0) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    ctx.save();
    ctx.translate(localX, localY);
    ctx.rotate(rotation);
    ctx.drawImage(
      image,
      -sourceAnchor.x * scale,
      -sourceAnchor.y * scale,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();
    return true;
  }

  drawEndpointSprite(ctx, assetName, point, scale, rotation = 0) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);
    ctx.drawImage(
      image,
      -image.width * scale * 0.5,
      -image.height * scale * 0.5,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();
    return true;
  }

  drawEndpointSpriteAtAnchor(ctx, assetName, point, sourceAnchor, scale, rotation = 0) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = asset.image;
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);
    ctx.drawImage(
      image,
      -sourceAnchor.x * scale,
      -sourceAnchor.y * scale,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();
    return true;
  }

  drawSegmentSprite(ctx, assetName, root, end, sourceStartY = 0, sourceEndY = null) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = asset.image;
    const length = distance(root, end);
    const endY = sourceEndY ?? image.height;
    const sourceLength = Math.max(1, endY - sourceStartY);
    const scale = length / sourceLength;
    const angle = Math.atan2(end.y - root.y, end.x - root.x) - Math.PI / 2;
    ctx.save();
    ctx.translate(root.x, root.y);
    ctx.rotate(angle);
    ctx.drawImage(
      image,
      -image.width * scale * 0.5,
      -sourceStartY * scale,
      image.width * scale,
      image.height * scale
    );
    ctx.restore();
    return true;
  }

  drawAnchoredSegmentSprite(ctx, assetName, root, end, sourceStart, sourceEnd, crossScale = null) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    const sourceVector = subtract(sourceEnd, sourceStart);
    const targetVector = subtract(end, root);
    const sourceLength = Math.max(1, Math.hypot(sourceVector.x, sourceVector.y));
    const targetLength = Math.max(1, Math.hypot(targetVector.x, targetVector.y));
    const lengthScale = targetLength / sourceLength;
    const widthScale = crossScale ?? lengthScale;
    const angle = Math.atan2(targetVector.y, targetVector.x) - Math.atan2(sourceVector.y, sourceVector.x);
    ctx.save();
    ctx.translate(root.x, root.y);
    ctx.rotate(angle);
    ctx.transform(widthScale, 0, 0, lengthScale, 0, 0);
    ctx.filter = this.getPantsImageFilter(assetName);
    ctx.drawImage(image, -sourceStart.x, -sourceStart.y);
    ctx.restore();
    return true;
  }

  drawAnchoredPairSprite(ctx, assetName, targetStart, targetEnd, sourceStart, sourceEnd, scaleMultiplier = 1) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    const sourceVector = subtract(sourceEnd, sourceStart);
    const targetVector = subtract(targetEnd, targetStart);
    const sourceLength = Math.max(1, Math.hypot(sourceVector.x, sourceVector.y));
    const targetLength = Math.max(1, Math.hypot(targetVector.x, targetVector.y));
    const scaleValue = targetLength / sourceLength * scaleMultiplier;
    const angle = Math.atan2(targetVector.y, targetVector.x) - Math.atan2(sourceVector.y, sourceVector.x);
    ctx.save();
    ctx.translate(targetStart.x, targetStart.y);
    ctx.rotate(angle);
    ctx.scale(scaleValue, scaleValue);
    ctx.filter = this.getPantsImageFilter(assetName);
    ctx.drawImage(image, -sourceStart.x, -sourceStart.y);
    ctx.restore();
    return true;
  }

  getPantsImageFilter(assetName) {
    return "none";
  }

  getOutfitSpriteImage(assetName, image) {
    if (this.outfit && this.outfit.pants === "pants_brown" && ["leftThigh", "rightThigh", "hips"].includes(assetName)) {
      return this.getBrownPantsSprite(assetName, image);
    }
    return image;
  }

  getBrownPantsSprite(assetName, image) {
    const cacheKey = `${assetName}:pants_brown`;
    if (this.outfitAssetCache.has(cacheKey)) {
      return this.outfitAssetCache.get(cacheKey);
    }
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      const isBlueFabric = a > 12 && b > 105 && g > 85 && r < 105 && (b - r > 38 || g - r > 36);
      if (!isBlueFabric) {
        continue;
      }
      const light = clamp((r + g + b) / 465, 0.58, 1.12);
      data[i] = Math.round(151 * light);
      data[i + 1] = Math.round(111 * light);
      data[i + 2] = Math.round(74 * light);
    }
    ctx.putImageData(pixels, 0, 0);
    this.outfitAssetCache.set(cacheKey, canvas);
    return canvas;
  }

  mapAnchoredSegmentPoint(root, end, sourceStart, sourceEnd, sourcePoint) {
    const sourceVector = subtract(sourceEnd, sourceStart);
    const targetVector = subtract(end, root);
    const sourceLength = Math.max(1, Math.hypot(sourceVector.x, sourceVector.y));
    const targetLength = Math.max(1, Math.hypot(targetVector.x, targetVector.y));
    const scaleFactor = targetLength / sourceLength;
    const angle = Math.atan2(targetVector.y, targetVector.x) - Math.atan2(sourceVector.y, sourceVector.x);
    return add(root, rotate(scale(subtract(sourcePoint, sourceStart), scaleFactor), angle));
  }

  drawPlayer(ctx) {
    const pose = this.calculatePose();
    const toScreen = (point) => this.worldToScreen(point);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const rightHipScreen = toScreen(pose.rightHip);
    const rightKneeScreen = toScreen(pose.rightLeg.joint);
    const leftHipScreen = toScreen(pose.leftHip);
    const leftKneeScreen = toScreen(pose.leftLeg.joint);

    this.drawHipPatchBehindThighs(ctx, leftHipScreen, rightHipScreen);

    this.drawLimb(ctx, rightHipScreen, rightKneeScreen, toScreen(pose.rightLeg.end), THEME.player.skin, 7, {
      upperAsset: "rightThigh",
      upperSourceStart: { x: 208, y: 71 },
      upperSourceEnd: { x: 131.98, y: 210 },
      lowerAsset: "rightShin",
      lowerSourceStart: { x: 178, y: 50 },
      lowerSourceEnd: { x: 122, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawLimb(ctx, toScreen(pose.rightShoulder), toScreen(pose.rightArm.joint), toScreen(pose.rightArm.end), THEME.player.skin, 7, {
      upperAsset: "rightUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      lowerAsset: "rightLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 }
    });
    this.drawClimbingShoe(ctx, toScreen(pose.rightLeg.end), 1, rightKneeScreen);

    this.drawLimb(ctx, leftHipScreen, leftKneeScreen, toScreen(pose.leftLeg.end), THEME.player.skin, 7, {
      upperAsset: "leftThigh",
      upperSourceStart: { x: 92, y: 71 },
      upperSourceEnd: { x: 168.02, y: 210 },
      lowerAsset: "leftShin",
      lowerSourceStart: { x: 122, y: 50 },
      lowerSourceEnd: { x: 178, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawOutfitPantsOverlay(ctx, pose);
    this.drawTorso(ctx, pose);
    this.drawLowerBodyAssets(ctx, pose);
    this.drawHead(ctx, toScreen(pose.head));
    this.drawLimb(ctx, toScreen(pose.leftShoulder), toScreen(pose.leftArm.joint), toScreen(pose.leftArm.end), THEME.player.skin, 7, {
      upperAsset: "leftUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      lowerAsset: "leftLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 }
    });
    this.drawClimbingShoe(ctx, toScreen(pose.leftLeg.end), -1, leftKneeScreen);
    this.drawHand(ctx, toScreen(pose.leftArm.end));
    this.drawHand(ctx, toScreen(pose.rightArm.end));

    if (DEBUG) {
      this.drawPoseDebug(ctx, pose);
    }

    if (this.state === STATE.LAUNCHING && this.animationResult && this.animationResult.result === "tooStrong") {
      const target = this.worldToScreen(this.targetHold);
      ctx.strokeStyle = "rgba(255, 121, 96, 0.58)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(target.x - 16, target.y);
      ctx.lineTo(target.x + 16, target.y);
      ctx.stroke();
    }
  }

  drawLimb(ctx, root, joint, end, color, width, assets = {}) {
    const drawUpper = () => assets.upperAsset
      ? this.drawAnchoredSegmentSprite(ctx, assets.upperAsset, root, joint, assets.upperSourceStart, assets.upperSourceEnd, assets.upperCrossScale)
      : false;
    const drawLower = () => assets.lowerAsset
      ? this.drawAnchoredSegmentSprite(ctx, assets.lowerAsset, joint, end, assets.lowerSourceStart, assets.lowerSourceEnd, assets.lowerCrossScale)
      : false;
    const drewLower = assets.lowerBehindUpper ? drawLower() : false;
    const drewUpper = drawUpper();
    const drewLowerFinal = assets.lowerBehindUpper ? drewLower : drawLower();
    if (drewUpper && drewLowerFinal) {
      return;
    }
    ctx.strokeStyle = THEME.player.skinLine;
    ctx.lineWidth = width + 2;
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(root.x, root.y);
    ctx.lineTo(joint.x, joint.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  drawTorso(ctx, pose) {
    const body = this.worldToScreen(pose.body);
    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);

    const drewShirt = this.drawBodyPartSprite(ctx, this.getOutfitShirtAssetName(), 0, -5, 0.26);
    if (!drewShirt) {
      ctx.fillStyle = THEME.player.shirt;
      this.roundRect(ctx, -15, -CONFIG.torsoLength / 2 + 3, 30, CONFIG.torsoLength * 0.70, 9);
      ctx.fill();

      ctx.fillStyle = THEME.player.shirtDark;
      ctx.beginPath();
      ctx.moveTo(-15, -CONFIG.torsoLength / 2 + 16);
      ctx.lineTo(15, -CONFIG.torsoLength / 2 + 25);
      ctx.lineTo(15, -CONFIG.torsoLength / 2 + 38);
      ctx.lineTo(-15, -CONFIG.torsoLength / 2 + 31);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawBody(ctx, pose) {
    this.drawTorso(ctx, pose);
    this.drawLowerBodyAssets(ctx, pose);

    const head = this.worldToScreen(pose.head);
    this.drawHead(ctx, head);
  }

  getBodyLocalPoint(pose, x, y) {
    return this.worldToScreen(add(pose.body, rotate({ x, y }, this.player.bodyAngle)));
  }

  drawHipPatchBehindThighs(ctx, leftHip, rightHip) {
    const hipVector = subtract(rightHip, leftHip);
    const hipMidpoint = lerpPoint(leftHip, rightHip, 0.5);
    const hipAxis = normalize(hipVector);
    const fallbackAxis = rotate({ x: 1, y: 0 }, this.player.bodyAngle);
    const axis = Math.hypot(hipAxis.x, hipAxis.y) > 0 ? hipAxis : fallbackAxis;
    const visualHalfWidth = 8;
    const targetLeft = add(hipMidpoint, scale(axis, -visualHalfWidth));
    const targetRight = add(hipMidpoint, scale(axis, visualHalfWidth));
    this.drawAnchoredPairSprite(
      ctx,
      "hips",
      targetLeft,
      targetRight,
      { x: 111, y: 150 },
      { x: 212, y: 150 }
    );
  }

  drawLowerBodyAssets(ctx, pose) {
    const body = this.worldToScreen(pose.body);
    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);
    this.drawBodyPartSpriteAtAnchor(ctx, "belt", 0, CONFIG.torsoLength / 2 + 16, { x: 150, y: 98 }, 0.30);
    ctx.restore();

    this.drawBeltLegConnections(ctx, pose);

    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);
    const bagFront = this.player.frontFacingAmount || 0;
    const bagHangX = lerp(13, -13, bagFront);
    const bagHangY = CONFIG.torsoLength / 2 + 2;
    const bagSway = Math.sin((this.player.animTime || 0) * 6 + this.player.worldY * 0.02) * 1.8;
    this.drawBodyPartSpriteAtAnchor(ctx, this.getOutfitChalkBagAssetName(), bagHangX + bagSway, bagHangY, { x: 155, y: 49 }, 0.30, bagSway * 0.015);
    ctx.restore();
  }

  getOutfitShirtAssetName() {
    if (this.outfit.shirt === "shirt_female") {
      return "shirtFemale";
    }
    if (this.outfit.shirt === "shirt_male") {
      return "shirtMale";
    }
    return "shirt";
  }

  getOutfitChalkBagAssetName() {
    return this.outfit.chalkBag === "chalk_02" ? "chalkBag02" : "chalkBag01";
  }

  getOutfitHairAssetName(isFront) {
    if (this.outfit.hair === "hair_female") {
      return isFront ? "hairFemaleFront" : "hairFemaleBack";
    }
    if (this.outfit.hair === "hair_male") {
      return isFront ? "hairMaleFront" : "hairMaleBack";
    }
    return null;
  }

  drawBeltLegConnections(ctx, pose) {
    const toScreen = (point) => this.worldToScreen(point);
    const leftHip = toScreen(pose.leftHip);
    const leftKnee = toScreen(pose.leftLeg.joint);
    const rightHip = toScreen(pose.rightHip);
    const rightKnee = toScreen(pose.rightLeg.joint);
    const leftLegMiddle = this.mapAnchoredSegmentPoint(
      leftHip,
      leftKnee,
      { x: 92, y: 71 },
      { x: 168.02, y: 210 },
      { x: 135, y: 149 }
    );
    const rightLegMiddle = this.mapAnchoredSegmentPoint(
      rightHip,
      rightKnee,
      { x: 169.19, y: 71 },
      { x: 93.18, y: 210 },
      { x: 126, y: 149 }
    );
    const leftBeltSide = this.getBodyLocalPoint(pose, -7, CONFIG.torsoLength / 2 + 1);
    const rightBeltSide = this.getBodyLocalPoint(pose, 10, CONFIG.torsoLength / 2 + 1);

    ctx.save();
    ctx.strokeStyle = "#1687bf";
    ctx.lineWidth = 3.2;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(leftBeltSide.x, leftBeltSide.y);
    ctx.lineTo(leftLegMiddle.x, leftLegMiddle.y);
    ctx.moveTo(rightBeltSide.x, rightBeltSide.y);
    ctx.lineTo(rightLegMiddle.x, rightLegMiddle.y);
    ctx.stroke();
    ctx.restore();
  }

  getShortLegPanel(pose, side) {
    const hip = side < 0 ? this.worldToScreen(pose.leftHip) : this.worldToScreen(pose.rightHip);
    const knee = side < 0 ? this.worldToScreen(pose.leftLeg.joint) : this.worldToScreen(pose.rightLeg.joint);
    const body = this.worldToScreen(pose.body);
    const waistOuter = this.getBodyLocalPoint(pose, side * 18, CONFIG.torsoLength / 2 - 14);
    const waistInner = this.getBodyLocalPoint(pose, side * 3, CONFIG.torsoLength / 2 - 7);
    const crotch = this.getBodyLocalPoint(pose, side * 2, CONFIG.torsoLength / 2 + 5);
    const thighEnd = lerpPoint(hip, knee, 0.48);
    const direction = normalize(subtract(thighEnd, hip));
    let outward = { x: -direction.y, y: direction.x };
    const bodyToHip = normalize(subtract(hip, body));
    if (outward.x * bodyToHip.x + outward.y * bodyToHip.y < 0) {
      outward = scale(outward, -1);
    }
    const hemOuter = add(thighEnd, scale(outward, 11));
    const hemInner = add(thighEnd, scale(outward, -8));
    const darkLineTop = lerpPoint(waistInner, crotch, 0.42);
    const darkLineBottom = hemInner;
    const darkLineMiddle = lerpPoint(darkLineTop, darkLineBottom, 0.5);
    return { waistOuter, waistInner, crotch, hemOuter, hemInner, thighEnd, darkLineTop, darkLineBottom, darkLineMiddle };
  }

  drawShortLeg(ctx, panel, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(panel.waistOuter.x, panel.waistOuter.y);
    ctx.quadraticCurveTo(panel.hemOuter.x, panel.hemOuter.y - 4, panel.hemOuter.x, panel.hemOuter.y);
    ctx.lineTo(panel.hemInner.x, panel.hemInner.y);
    ctx.quadraticCurveTo(panel.crotch.x, panel.crotch.y, panel.waistInner.x, panel.waistInner.y);
    ctx.closePath();
    ctx.fill();
  }

  drawOutfitPantsOverlay(ctx, pose) {
    if (!this.outfit || this.outfit.pants !== "pants_brown") {
      return;
    }
    const left = this.getShortLegPanel(pose, -1);
    const right = this.getShortLegPanel(pose, 1);
    ctx.save();
    ctx.lineJoin = "round";
    this.drawShortLeg(ctx, left, "#9f7c55");
    this.drawShortLeg(ctx, right, "#aa835c");

    ctx.fillStyle = "#916f4e";
    ctx.beginPath();
    ctx.moveTo(left.waistInner.x, left.waistInner.y);
    ctx.lineTo(right.waistInner.x, right.waistInner.y);
    ctx.lineTo(right.hemInner.x, right.hemInner.y);
    ctx.lineTo(left.hemInner.x, left.hemInner.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#76583e";
    ctx.lineWidth = 3.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(left.darkLineTop.x, left.darkLineTop.y);
    ctx.lineTo(left.darkLineBottom.x, left.darkLineBottom.y);
    ctx.moveTo(right.darkLineTop.x, right.darkLineTop.y);
    ctx.lineTo(right.darkLineBottom.x, right.darkLineBottom.y);
    ctx.stroke();
    ctx.restore();
  }

  drawDynamicShorts(ctx, pose) {
    const left = this.getShortLegPanel(pose, -1);
    const right = this.getShortLegPanel(pose, 1);
    const waistLeft = this.getBodyLocalPoint(pose, -18, CONFIG.torsoLength / 2 - 15);
    const waistRight = this.getBodyLocalPoint(pose, 18, CONFIG.torsoLength / 2 - 15);
    const strapTopLeft = this.getBodyLocalPoint(pose, -11, CONFIG.torsoLength / 2 - 12);
    const strapTopRight = this.getBodyLocalPoint(pose, 11, CONFIG.torsoLength / 2 - 12);
    const buckle = this.getBodyLocalPoint(pose, 0, CONFIG.torsoLength / 2 - 11);

    ctx.save();
    ctx.lineJoin = "round";
    this.drawShortLeg(ctx, left, "#4abed0");
    this.drawShortLeg(ctx, right, "#55c8d8");

    ctx.fillStyle = THEME.player.shortsDark;
    ctx.beginPath();
    ctx.moveTo(left.waistInner.x, left.waistInner.y);
    ctx.lineTo(right.waistInner.x, right.waistInner.y);
    ctx.lineTo(right.hemInner.x, right.hemInner.y);
    ctx.lineTo(left.hemInner.x, left.hemInner.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#1687bf";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(left.darkLineTop.x, left.darkLineTop.y);
    ctx.lineTo(left.darkLineBottom.x, left.darkLineBottom.y);
    ctx.moveTo(right.darkLineTop.x, right.darkLineTop.y);
    ctx.lineTo(right.darkLineBottom.x, right.darkLineBottom.y);
    ctx.stroke();

    ctx.strokeStyle = "#1687bf";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(waistLeft.x, waistLeft.y);
    ctx.lineTo(waistRight.x, waistRight.y);
    ctx.stroke();

    ctx.strokeStyle = "#1687bf";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(strapTopLeft.x, strapTopLeft.y);
    ctx.lineTo(left.darkLineMiddle.x, left.darkLineMiddle.y);
    ctx.moveTo(strapTopRight.x, strapTopRight.y);
    ctx.lineTo(right.darkLineMiddle.x, right.darkLineMiddle.y);
    ctx.stroke();

    ctx.fillStyle = "#ffc532";
    this.roundRect(ctx, buckle.x - 9, buckle.y - 7, 18, 14, 4);
    ctx.fill();

    this.drawDynamicChalkBag(ctx, buckle);
    ctx.restore();
  }

  drawDynamicChalkBag(ctx, buckle) {
    const bagX = buckle.x;
    const bagY = buckle.y + 17;
    ctx.strokeStyle = "#123e6e";
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(buckle.x, buckle.y + 7);
    ctx.lineTo(bagX, bagY - 4);
    ctx.stroke();

    ctx.fillStyle = "#e45fb5";
    this.roundRect(ctx, bagX - 12, bagY - 2, 24, 25, 9);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    this.roundRect(ctx, bagX - 9, bagY + 2, 18, 6, 4);
    ctx.fill();

    ctx.strokeStyle = "#123e6e";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bagX - 7, bagY + 8);
    ctx.lineTo(bagX + 7, bagY + 18);
    ctx.moveTo(bagX + 7, bagY + 8);
    ctx.lineTo(bagX - 7, bagY + 18);
    ctx.stroke();

    const shakeHand = this.player.motion.idleShakeHand;
    const shakeT = clamp((this.player.motion.idleShakeTime || 0) / CONFIG.chalkShakeDuration, 0, 1);
    if (shakeHand && shakeT > 0.36 && shakeT < 0.94) {
      const side = shakeHand === "leftHand" ? -1 : 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
      for (let i = 0; i < 4; i += 1) {
        const flick = shakeT > 0.78 ? (shakeT - 0.78) / 0.16 : 0;
        const phase = shakeT * Math.PI * 10 + i;
        const px = bagX + side * (8 + i * 3 + flick * 11) + Math.sin(phase) * 2;
        const py = bagY + 6 + i * 3 - flick * 8 + Math.cos(phase) * 2;
        ctx.beginPath();
        ctx.arc(px, py, 1.3 + i * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawHead(ctx, head) {
    const isFront = this.player.frontFacingAmount > 0.55;
    if (!isFront && this.outfit && this.outfit.hair !== "hair_01") {
      this.drawBackOutfitHead(ctx, head, 1);
      return;
    }
    if (isFront && this.outfit && this.outfit.hair === "hair_male" && this.playerAssets.isReady("headMaleFront")) {
      const yOffset = 3;
      this.drawEndpointSprite(ctx, "headMaleFront", { x: head.x, y: head.y + yOffset }, 0.145);
      this.drawOutfitGlasses(ctx, head, true, yOffset);
      return;
    }
    const assetName = isFront ? "headFront" : "headBack";
    if (this.playerAssets.isReady(assetName)) {
      const yOffset = isFront ? 3 : 1;
      this.drawEndpointSprite(ctx, assetName, { x: head.x, y: head.y + yOffset }, 0.145);
      this.drawOutfitHair(ctx, head, isFront, yOffset);
      this.drawOutfitGlasses(ctx, head, isFront, yOffset);
      return;
    }
    if (this.player.frontFacingAmount > 0.55) {
      this.drawFrontHead(ctx, head);
      this.drawOutfitHair(ctx, head, true, 0);
      this.drawOutfitGlasses(ctx, head, true, 0);
      return;
    }
    ctx.fillStyle = THEME.player.skin;
    ctx.beginPath();
    ctx.arc(head.x + 2, head.y, CONFIG.headRadius * 0.88, 0, Math.PI * 2);
    ctx.fill();
    this.drawHair(ctx, head);
    this.drawOutfitHair(ctx, head, false, 0);
    this.drawOutfitGlasses(ctx, head, false, 0);
  }

  drawBackOutfitHead(ctx, head, yOffset = 0) {
    const assetName = this.getOutfitHairAssetName(false);
    const center = { x: head.x, y: head.y + yOffset };
    const skinScale = 0.145;
    ctx.save();
    ctx.fillStyle = "#ffc383";
    this.roundRect(
      ctx,
      center.x - 30 * skinScale,
      center.y + 71 * skinScale,
      58 * skinScale,
      88 * skinScale,
      16 * skinScale
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(center.x - 98 * skinScale, center.y + 29 * skinScale, 24 * skinScale, 0, Math.PI * 2);
    ctx.arc(center.x + 95 * skinScale, center.y + 29 * skinScale, 24 * skinScale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (assetName) {
      const hairScale = this.outfit.hair === "hair_male" ? 0.158 : 0.152;
      const hairYOffset = this.outfit.hair === "hair_male" ? -1.5 : -0.8;
      this.drawEndpointSprite(ctx, assetName, { x: center.x, y: center.y + hairYOffset }, hairScale);
    } else {
      this.drawHair(ctx, center);
    }
  }

  drawOutfitHair(ctx, head, isFront, yOffset = 0) {
    const assetName = this.getOutfitHairAssetName(isFront);
    if (!assetName) {
      return;
    }
    const isMale = this.outfit.hair === "hair_male";
    const hairScale = isFront
      ? (isMale ? 0.152 : 0.145)
      : (isMale ? 0.158 : 0.152);
    const backYOffset = isFront ? 0 : (isMale ? -1.5 : -0.8);
    this.drawEndpointSprite(ctx, assetName, { x: head.x, y: head.y + yOffset + backYOffset }, hairScale);
  }

  drawOutfitGlasses(ctx, head, isFront, yOffset = 0) {
    if (!isFront || !this.outfit || this.outfit.accessory !== "glasses_01") {
      return;
    }
    if (this.drawEndpointSprite(ctx, "glasses01", { x: head.x, y: head.y + yOffset }, 0.145)) {
      return;
    }
    const cx = head.x + (isFront ? 0 : 2);
    const cy = head.y + yOffset + (isFront ? 5 : 4);
    const lensW = isFront ? 8.5 : 7;
    const lensH = isFront ? 5.6 : 4.8;
    const gap = isFront ? 2.8 : 2.2;
    ctx.save();
    ctx.strokeStyle = "#16384d";
    ctx.lineWidth = 1.6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.ellipse(cx - lensW / 2 - gap, cy, lensW / 2, lensH / 2, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + lensW / 2 + gap, cy, lensW / 2, lensH / 2, 0, 0, Math.PI * 2);
    ctx.moveTo(cx - gap, cy);
    ctx.lineTo(cx + gap, cy);
    ctx.stroke();
    ctx.strokeStyle = "rgba(22, 56, 77, 0.42)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - lensW - gap, cy - 0.5);
    ctx.lineTo(cx - lensW - gap - 3, cy - 1.5);
    ctx.moveTo(cx + lensW + gap, cy - 0.5);
    ctx.lineTo(cx + lensW + gap + 3, cy - 1.5);
    ctx.stroke();
    ctx.restore();
  }

  drawFrontHead(ctx, head) {
    const droop = this.player.headDroop || 0;
    const faceY = head.y + droop * 6;
    ctx.fillStyle = THEME.player.hair;
    ctx.beginPath();
    ctx.arc(head.x - 7, faceY - 8, 8, 0, Math.PI * 2);
    ctx.arc(head.x + 5, faceY - 10, 9, 0, Math.PI * 2);
    ctx.arc(head.x + 10, faceY - 1, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = THEME.player.skin;
    ctx.beginPath();
    ctx.arc(head.x, faceY, CONFIG.headRadius * 0.86, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(92, 62, 54, 0.55)";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(head.x - 7, faceY + 2);
    ctx.quadraticCurveTo(head.x - 4, faceY + 4, head.x - 1, faceY + 2);
    ctx.moveTo(head.x + 3, faceY + 2);
    ctx.quadraticCurveTo(head.x + 6, faceY + 4, head.x + 9, faceY + 2);
    ctx.stroke();

    ctx.strokeStyle = "rgba(92, 62, 54, 0.45)";
    ctx.beginPath();
    ctx.moveTo(head.x - 4, faceY + 10);
    ctx.quadraticCurveTo(head.x, faceY + 8, head.x + 4, faceY + 10);
    ctx.stroke();
  }

  drawHair(ctx, head) {
    const curls = [
      [-10, -8, 8],
      [-14, 0, 8],
      [-10, 8, 7],
      [-2, -12, 8],
      [5, -9, 7],
      [-2, 4, 11],
      [5, 7, 7]
    ];
    ctx.fillStyle = THEME.player.hair;
    for (const [dx, dy, r] of curls) {
      ctx.beginPath();
      ctx.arc(head.x + dx, head.y + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawHarness(ctx) {
    ctx.strokeStyle = THEME.player.harness;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-15, CONFIG.torsoLength / 2 - 14);
    ctx.lineTo(15, CONFIG.torsoLength / 2 - 14);
    ctx.moveTo(-8, CONFIG.torsoLength / 2 - 15);
    ctx.lineTo(-16, CONFIG.torsoLength / 2 + 1);
    ctx.moveTo(8, CONFIG.torsoLength / 2 - 15);
    ctx.lineTo(16, CONFIG.torsoLength / 2 + 1);
    ctx.stroke();
    ctx.fillStyle = "#f2c94c";
    ctx.beginPath();
    ctx.arc(0, CONFIG.torsoLength / 2 - 12, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }

  drawChalkBag(ctx) {
    ctx.fillStyle = THEME.player.chalkBag;
    this.roundRect(ctx, -9, CONFIG.torsoLength / 2 - 5, 18, 22, 6);
    ctx.fill();
    ctx.strokeStyle = THEME.player.harness;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-5, CONFIG.torsoLength / 2 + 1);
    ctx.lineTo(5, CONFIG.torsoLength / 2 + 11);
    ctx.moveTo(5, CONFIG.torsoLength / 2 + 1);
    ctx.lineTo(-5, CONFIG.torsoLength / 2 + 11);
    ctx.stroke();

    const shakeHand = this.player.motion.idleShakeHand;
    const shakeT = clamp((this.player.motion.idleShakeTime || 0) / CONFIG.chalkShakeDuration, 0, 1);
    if (shakeHand && shakeT > 0.36 && shakeT < 0.94) {
      const side = shakeHand === "leftHand" ? -1 : 1;
      ctx.fillStyle = "rgba(255, 255, 255, 0.68)";
      for (let i = 0; i < 4; i += 1) {
        const flick = shakeT > 0.78 ? (shakeT - 0.78) / 0.16 : 0;
        const phase = shakeT * Math.PI * 10 + i;
        const px = side * (8 + i * 3 + flick * 11) + Math.sin(phase) * 2;
        const py = CONFIG.torsoLength / 2 + 4 + i * 3 - flick * 8 + Math.cos(phase) * 2;
        ctx.beginPath();
        ctx.arc(px, py, 1.3 + i * 0.25, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawHand(ctx, point) {
    const assetName = point.x < CONFIG.logicalWidth / 2 ? "leftHand" : "rightHand";
    if (this.drawEndpointSprite(ctx, assetName, point, 0.07)) {
      return;
    }
    ctx.fillStyle = THEME.player.skin;
    ctx.beginPath();
    ctx.arc(point.x, point.y, CONFIG.handRadius + 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  drawClimbingShoe(ctx, point, side, knee = null) {
    const assetName = side < 0 ? "leftFoot" : "rightFoot";
    const rotation = side * 0.08;
    if (this.drawEndpointSpriteAtAnchor(ctx, assetName, point, { x: 167, y: 145 }, 0.3, rotation)) {
      return;
    }
    ctx.save();
    ctx.translate(point.x, point.y);
    ctx.rotate(rotation);
    ctx.fillStyle = THEME.player.shoe;
    this.roundRect(ctx, -8, -4, 16, 8, 4);
    ctx.fill();
    ctx.fillStyle = THEME.player.shoeAccent;
    this.roundRect(ctx, side > 0 ? -5 : -1, -3, 6, 6, 3);
    ctx.fill();
    ctx.restore();
  }

  drawPoseDebug(ctx, pose) {
    const points = [
      pose.leftShoulder,
      pose.rightShoulder,
      pose.leftHip,
      pose.rightHip,
      pose.leftArm.joint,
      pose.rightArm.joint,
      pose.leftLeg.joint,
      pose.rightLeg.joint
    ];
    ctx.fillStyle = "rgba(216, 246, 255, 0.75)";
    for (const point of points) {
      const screen = this.worldToScreen(point);
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "rgba(216, 246, 255, 0.22)";
    ctx.lineWidth = 1;
    for (const limb of ["leftHand", "rightHand", "leftFoot", "rightFoot"]) {
      const hold = this.generator.getHoldById(this.player.contacts[limb]);
      if (!hold) {
        continue;
      }
      const body = this.worldToScreen({ x: this.player.worldX, y: this.player.worldY });
      const target = this.worldToScreen(hold);
      ctx.beginPath();
      ctx.moveTo(body.x, body.y);
      ctx.lineTo(target.x, target.y);
      ctx.stroke();
    }
  }

  drawHud(ctx) {
    const hudY = 22;
    const h = 126;
    ctx.fillStyle = "rgba(108, 203, 222, 0.42)";
    ctx.fillRect(0, hudY, CONFIG.logicalWidth, h);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText("得分", 30, hudY + 66);
    ctx.fillText(`${this.score}`, 72, hudY + 66);
    ctx.fillText(`连击 x${this.preciseCombo}`, 116, hudY + 66);
    this.drawPowerUpStatus(ctx, hudY);

    const scoreBarX = 30;
    const scoreBarY = hudY + 78;
    const scoreBarW = 142;
    const scoreBarH = 8;
    const scoreProgress = Math.min(1, (this.score % 1000) / 1000);
    ctx.fillStyle = "rgba(255, 255, 255, 0.56)";
    this.roundRect(ctx, scoreBarX, scoreBarY, scoreBarW, scoreBarH, scoreBarH / 2);
    ctx.fill();
    if (scoreProgress > 0) {
      ctx.fillStyle = "#ff3aa9";
      this.roundRect(ctx, scoreBarX, scoreBarY, Math.max(scoreBarH, scoreBarW * scoreProgress), scoreBarH, scoreBarH / 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText("当前高度", 30, hudY + 98);
    ctx.fillText("最高纪录：", 196, hudY + 98);

    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.fillText(formatMeters(this.climbHeight / CONFIG.pixelsPerMeter), 102, hudY + 98);
    ctx.fillText(formatMeters(this.scoreManager.best.height / CONFIG.pixelsPerMeter), 286, hudY + 98);

    this.drawChargeBar(ctx);
  }

  drawPowerUpStatus(ctx, yOffset = 0) {
    const active = [];
    if (this.powerUps.magnet > 0) {
      active.push(["magnet", this.powerUps.magnet]);
    }
    if (this.powerUps.magnifier > 0) {
      active.push(["magnifier", this.powerUps.magnifier]);
    }
    if (active.length === 0) {
      return;
    }
    let x = 30;
    const y = yOffset + 38;
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = "bold 11px Arial, Helvetica, sans-serif";
    for (const [type, timeLeft] of active) {
      const label = `${POWER_UPS[type].label} ${timeLeft.toFixed(1)}s`;
      const w = ctx.measureText(label).width + 14;
      ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
      this.roundRect(ctx, x, y - 12, w, 24, 12);
      ctx.fill();
      ctx.fillStyle = POWER_UPS[type].color;
      ctx.fillText(label, x + 7, y + 0.5);
      x += w + 6;
    }
    ctx.restore();
  }

  drawPowerUpAura(ctx) {
    if (!this.hasActivePowerUp()) {
      return;
    }
    const time = performance.now() * 0.008;
    const pulse = 0.55 + Math.sin(time) * 0.25 + Math.sin(time * 1.9) * 0.08;
    const alpha = clamp(pulse, 0.22, 0.9);
    const edge = 54;
    const gold = `rgba(255, 205, 64, ${0.30 * alpha})`;
    const clear = "rgba(255, 205, 64, 0)";

    ctx.save();
    ctx.globalCompositeOperation = "screen";

    let gradient = ctx.createLinearGradient(0, 0, edge, 0);
    gradient.addColorStop(0, gold);
    gradient.addColorStop(1, clear);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, edge, CONFIG.logicalHeight);

    gradient = ctx.createLinearGradient(CONFIG.logicalWidth, 0, CONFIG.logicalWidth - edge, 0);
    gradient.addColorStop(0, gold);
    gradient.addColorStop(1, clear);
    ctx.fillStyle = gradient;
    ctx.fillRect(CONFIG.logicalWidth - edge, 0, edge, CONFIG.logicalHeight);

    gradient = ctx.createLinearGradient(0, 0, 0, edge);
    gradient.addColorStop(0, gold);
    gradient.addColorStop(1, clear);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CONFIG.logicalWidth, edge);

    gradient = ctx.createLinearGradient(0, CONFIG.logicalHeight, 0, CONFIG.logicalHeight - edge);
    gradient.addColorStop(0, gold);
    gradient.addColorStop(1, clear);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, CONFIG.logicalHeight - edge, CONFIG.logicalWidth, edge);

    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = `rgba(255, 222, 90, ${0.48 * alpha})`;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, CONFIG.logicalWidth - 8, CONFIG.logicalHeight - 8);
    ctx.strokeStyle = `rgba(255, 255, 220, ${0.20 * alpha})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, CONFIG.logicalWidth - 24, CONFIG.logicalHeight - 24);
    ctx.restore();
  }

  drawAccuracyFeedback(ctx) {
    const tier = ACCURACY_TIERS[this.feedback.tier] || ACCURACY_TIERS.risky;
    const progress = clamp(this.feedbackTime / 1.15, 0, 1);
    const elapsed = 1 - progress;
    const enterT = easeOutCubic(clamp(elapsed / 0.24, 0, 1));
    const exitT = easeInCubic(clamp((elapsed - 0.72) / 0.28, 0, 1));
    const feedbackAlpha = 1 - exitT;
    const slideOffset = exitT > 0 ? lerp(0, -46, exitT) : lerp(52, 0, enterT);
    const layouts = {
      good: { badgeX: 97, badgeY: 103, badgeW: 180, pointsX: 239, pointsY: 149, comboX: 239, comboY: 168 },
      risky: { badgeX: 100, badgeY: 103, badgeW: 180, pointsX: 250, pointsY: 153, comboX: 239, comboY: 168 },
      precise: { badgeX: 98, badgeY: 103, badgeW: 180, pointsX: 241, pointsY: 153, comboX: 239, comboY: 168 }
    };
    const layout = layouts[this.feedback.tier] || layouts.risky;
    const badge = this.feedbackAssets[this.feedback.tier];
    ctx.save();
    ctx.globalAlpha = feedbackAlpha;
    if (badge && badge.loaded && !badge.failed && badge.image.complete) {
      this.drawImageContainWidth(ctx, badge.image, layout.badgeX + slideOffset, layout.badgeY, layout.badgeW);
    } else {
      ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
      this.roundRect(ctx, layout.badgeX + slideOffset, layout.badgeY + 22, 178, 50, 18);
      ctx.fill();
      ctx.fillStyle = tier.color;
      ctx.font = "900 30px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.feedback.label, layout.badgeX + slideOffset + 89, layout.badgeY + 47);
    }
    ctx.restore();
    this.drawFeedbackPoints(ctx, tier, this.feedback.points, layout.pointsX + slideOffset, layout.pointsY, feedbackAlpha);
    this.drawFeedbackCombo(ctx, this.feedback.combo, layout.comboX + slideOffset, layout.comboY, feedbackAlpha);
  }

  drawImageContainWidth(ctx, image, x, y, targetW) {
    const ratio = targetW / Math.max(1, image.width);
    ctx.drawImage(image, x, y, targetW, image.height * ratio);
  }

  drawFeedbackPoints(ctx, tier, points, x, y, alpha = 1) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 25px Arial, Helvetica, sans-serif";
    ctx.lineJoin = "round";
    ctx.lineWidth = 6;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.96)";
    ctx.fillStyle = tier.color;
    const text = `+${points}`;
    ctx.strokeText(text, x, y);
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  drawFeedbackCombo(ctx, combo, x, y, alpha = 1) {
    if (combo <= 1) {
      return;
    }
    const cappedCombo = Math.min(10, combo);
    const asset = this.feedbackAssets[`combo${cappedCombo}`];
    if (asset && asset.loaded && !asset.failed && asset.image.complete) {
      const w = 80;
      ctx.save();
      ctx.globalAlpha = alpha;
      this.drawImageContainWidth(ctx, asset.image, x, y, w);
      ctx.restore();
      return;
    }
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 16px Arial, Helvetica, sans-serif";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.fillStyle = ACCURACY_TIERS.precise.color;
    const text = `连击x${combo}`;
    ctx.strokeText(text, x + 4, y + 14);
    ctx.fillText(text, x + 4, y + 14);
    ctx.restore();
  }

  drawHudCard(ctx, x, y, w, h, rows) {
    ctx.save();
    ctx.shadowColor = THEME.ui.cardShadow;
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 5;
    ctx.fillStyle = THEME.ui.card;
    this.roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.restore();

    ctx.textBaseline = "top";
    rows.forEach((row, index) => {
      const textY = y + 19 + index * 35;
      const compact = row.label.length > 3;
      ctx.fillStyle = THEME.ui.text;
      ctx.font = `bold ${compact ? 16 : 18}px Arial, Helvetica, sans-serif`;
      ctx.fillText(row.label, x + 14, textY);
      const labelWidth = ctx.measureText(row.label).width;
      ctx.fillStyle = row.color;
      ctx.font = `bold ${compact ? 19 : 21}px Arial, Helvetica, sans-serif`;
      ctx.fillText(row.value, x + 14 + labelWidth + 3, textY - 2);
    });

    ctx.strokeStyle = "#63b4e4";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + w - 22, y + 18);
    ctx.lineTo(x + w - 18, y + 11);
    ctx.stroke();
    ctx.strokeStyle = "#f4c84c";
    ctx.beginPath();
    ctx.moveTo(x + w - 18, y + 30);
    ctx.lineTo(x + w - 12, y + 24);
    ctx.stroke();
    if (w > 143) {
      ctx.strokeStyle = "#ec6fa0";
      ctx.beginPath();
      ctx.moveTo(x + w - 19, y + 18);
      ctx.lineTo(x + w - 14, y + 9);
      ctx.stroke();
    }
  }

  drawChargeBar(ctx) {
    const w = CONFIG.logicalWidth * 0.78;
    const h = 27;
    const x = (CONFIG.logicalWidth - w) / 2;
    const y = CONFIG.logicalHeight - 164;
    const innerPad = 5;
    const innerX = x + innerPad;
    const innerY = y + innerPad;
    const innerW = w - innerPad * 2;
    const innerH = h - innerPad * 2;

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    this.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.fillStyle = THEME.charge.base;
    this.roundRect(ctx, innerX, innerY, innerW, innerH, innerH / 2);
    ctx.fill();

    const fillW = innerW * this.charge;
    if (fillW > 0.5) {
      ctx.save();
      this.roundRect(ctx, innerX, innerY, fillW, innerH, innerH / 2);
      ctx.clip();
      const gradient = ctx.createLinearGradient(innerX, 0, innerX + innerW, 0);
      gradient.addColorStop(0, THEME.charge.green);
      gradient.addColorStop(0.45, THEME.charge.yellow);
      gradient.addColorStop(0.68, THEME.charge.orange);
      gradient.addColorStop(1, THEME.charge.red);
      ctx.fillStyle = gradient;
      this.roundRect(ctx, innerX, innerY, innerW, innerH, innerH / 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.strokeStyle = "rgba(255,255,255,0.82)";
    ctx.lineWidth = 1.2;
    for (let i = 1; i <= 3; i += 1) {
      const dividerX = innerX + (innerW * i) / 4;
      ctx.beginPath();
      ctx.moveTo(dividerX, innerY + 2);
      ctx.lineTo(dividerX, innerY + innerH - 2);
      ctx.stroke();
    }
  }

  drawUiControls(ctx) {
    const size = 40;
    const gap = 9;
    const y = 32;
    const buttons = this.state === STATE.START
      ? [
          { id: "back", x: 24, y },
          { id: "sound", x: CONFIG.logicalWidth - 24 - size * 2 - gap, y },
          { id: "share", x: CONFIG.logicalWidth - 24 - size, y }
        ]
      : (() => {
          const ids = ["skin", "restart", "rank", "sound", "share"];
          const marginRight = 24;
          const totalW = ids.length * size + (ids.length - 1) * gap;
          let x = CONFIG.logicalWidth - marginRight - totalW;
          const rightButtons = ids.map((id) => {
            const button = { id, x, y };
            x += size + gap;
            return button;
          });
          return [{ id: "start", x: 24, y }, ...rightButtons];
        })();
    this.uiButtons = [];
    ctx.save();
    buttons.forEach(({ id, x }) => {
      const button = { id, x, y, w: size, h: size };
      this.uiButtons.push(button);
      const cx = x + size / 2;
      const cy = y + size / 2;
      if (!this.drawUiIconImage(ctx, id, x, y, size)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#bdf7ff";
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, size / 2 - 1, 0, Math.PI * 2);
        ctx.stroke();
        this.drawUiIcon(ctx, id, cx, cy, size);
      }
    });
    ctx.restore();
  }

  getUiIconAssetName(id) {
    if (id === "start" || id === "back") {
      return "back";
    }
    if (id === "sound") {
      return this.soundMuted ? "soundOff" : "soundOn";
    }
    return id;
  }

  drawUiIconImage(ctx, id, x, y, size) {
    const assetName = this.getUiIconAssetName(id);
    const asset = this.uiIconAssets[assetName];
    if (!asset || !asset.loaded || asset.failed || !asset.image.complete) {
      return false;
    }
    ctx.drawImage(asset.image, x, y, size, size);
    return true;
  }

  drawUiIcon(ctx, id, cx, cy, size) {
    const iconBlue = "#0876bd";
    ctx.save();
    ctx.strokeStyle = iconBlue;
    ctx.fillStyle = iconBlue;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (id === "start" || id === "back") {
      ctx.beginPath();
      ctx.moveTo(cx + 6, cy - 10);
      ctx.lineTo(cx - 5, cy);
      ctx.lineTo(cx + 6, cy + 10);
      ctx.stroke();
    } else if (id === "restart") {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy + 1, 10, 0.18, Math.PI * 1.78, false);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 10);
      ctx.lineTo(cx + 14, cy - 9);
      ctx.lineTo(cx + 11, cy - 3);
      ctx.stroke();
    } else if (id === "rank") {
      const barW = 5.5;
      this.roundRect(ctx, cx - 12, cy + 2, barW, 10, 2);
      ctx.fill();
      this.roundRect(ctx, cx - 3, cy - 4, barW, 16, 2);
      ctx.fill();
      this.roundRect(ctx, cx + 6, cy - 10, barW, 22, 2);
      ctx.fill();
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 14);
      ctx.lineTo(cx + 14, cy + 14);
      ctx.stroke();
    } else if (id === "skin" || id === "shop") {
      ctx.lineWidth = 3.6;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 5);
      ctx.quadraticCurveTo(cx - 4, cy - 13, cx, cy - 6);
      ctx.quadraticCurveTo(cx + 4, cy - 13, cx + 10, cy - 5);
      ctx.lineTo(cx + 8, cy + 12);
      ctx.lineTo(cx - 8, cy + 12);
      ctx.closePath();
      ctx.stroke();
    } else if (id === "sound") {
      if (this.soundMuted) {
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - 12);
        ctx.lineTo(cx - 2, cy + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 7, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(cx - 10, cy + 10);
        ctx.lineTo(cx + 10, cy - 10);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - 13);
        ctx.lineTo(cx - 2, cy + 5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 7, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 4.2;
        ctx.beginPath();
        ctx.moveTo(cx - 2, cy - 13);
        ctx.quadraticCurveTo(cx + 8, cy - 14, cx + 8, cy - 5);
        ctx.stroke();
      }
    } else if (id === "share") {
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 8);
      ctx.quadraticCurveTo(cx - 4, cy - 6, cx + 10, cy - 7);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 14);
      ctx.lineTo(cx + 17, cy - 6);
      ctx.lineTo(cx + 7, cy + 2);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  drawStartScreen(ctx) {
    this.menuButtons = [];
    ctx.save();
    ctx.fillStyle = "rgba(181, 235, 243, 0.34)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.font = "900 50px Arial, Helvetica, sans-serif";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "rgba(52, 154, 180, 0.42)";
    ctx.strokeText("攀了个岩", CONFIG.logicalWidth / 2, 158);
    ctx.fillText("攀了个岩", CONFIG.logicalWidth / 2, 158);

    ctx.fillStyle = "rgba(49, 95, 114, 0.78)";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText("抓准时机，向上出手", CONFIG.logicalWidth / 2, 204);

    const buttonW = 230;
    const buttonH = 58;
    const x = (CONFIG.logicalWidth - buttonW) / 2;
    const startY = 314;
    const gap = 18;
    const items = [
      ["play", "开始游戏"],
      ["rank", "排行榜"],
      ["shop", "换装商城"]
    ];

    items.forEach(([id, label], index) => {
      const y = startY + index * (buttonH + gap);
      this.menuButtons.push({ id, x, y, w: buttonW, h: buttonH });
      ctx.save();
      ctx.shadowColor = "rgba(73, 116, 133, 0.18)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      this.roundRect(ctx, x, y, buttonW, buttonH, 29);
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = id === "play" ? "#ff3aa9" : "#315f72";
      ctx.font = "bold 21px Arial, Helvetica, sans-serif";
      ctx.fillText(label, CONFIG.logicalWidth / 2, y + buttonH / 2 + 1);
    });
    ctx.restore();
  }

  drawUiPanel(ctx) {
    if (this.uiPanel.type === "outfit") {
      this.drawOutfitPanel(ctx);
      return;
    }
    if (this.uiPanel.type !== "rank") {
      return;
    }
    this.uiPanel.buttons = [];
    const x = 52;
    const y = 226;
    const w = CONFIG.logicalWidth - 104;
    const h = 210;
    this.uiPanel.bounds = { x, y, w, h };
    this.uiPanel.closeRect = { x: x + w - 43, y: y + 12, w: 30, h: 30 };

    ctx.save();
    ctx.fillStyle = "rgba(221, 244, 250, 0.58)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    ctx.shadowColor = THEME.ui.cardShadow;
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
    this.roundRect(ctx, x, y, w, h, 16);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = THEME.ui.text;
    ctx.font = "bold 22px Arial, Helvetica, sans-serif";
    ctx.fillText("排行榜", CONFIG.logicalWidth / 2, y + 38);
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.fillText(`最高高度：${formatMeters(this.scoreManager.best.height / CONFIG.pixelsPerMeter)}`, CONFIG.logicalWidth / 2, y + 88);
    ctx.fillText(`最多岩点：${this.scoreManager.best.holds}`, CONFIG.logicalWidth / 2, y + 122);
    ctx.fillText(`最高分：${this.scoreManager.best.score || 0}`, CONFIG.logicalWidth / 2, y + 154);
    ctx.fillStyle = "#657a82";
    ctx.font = "14px Arial, Helvetica, sans-serif";
    ctx.fillText("本机本地纪录", CONFIG.logicalWidth / 2, y + 184);

    const close = this.uiPanel.closeRect;
    ctx.fillStyle = "rgba(49, 95, 114, 0.10)";
    this.roundRect(ctx, close.x, close.y, close.w, close.h, 9);
    ctx.fill();
    ctx.fillStyle = "#315f72";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.fillText("×", close.x + close.w / 2, close.y + close.h / 2 - 1);
    ctx.restore();
  }

  drawOutfitPanel(ctx) {
    const x = 31;
    const y = 158;
    const w = 314;
    const h = 496;
    const leftW = 174;
    const optionX = x + 186;
    const secondOptionX = x + 250;
    this.uiPanel.bounds = { x, y, w, h };
    this.uiPanel.closeRect = { x: x + 9, y: y + 7, w: 40, h: 40 };
    this.uiPanel.buttons = [{ id: "outfit-close", ...this.uiPanel.closeRect }];

    ctx.save();
    ctx.fillStyle = "rgba(37, 81, 99, 0.28)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);

    ctx.shadowColor = "rgba(63, 112, 132, 0.20)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(250, 253, 254, 0.98)";
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    this.roundRect(ctx, x, y, leftW, h, 18);
    ctx.clip();
    ctx.fillStyle = "#f8dce5";
    ctx.fillRect(x, y, leftW, h);
    ctx.fillStyle = "rgba(255, 255, 255, 0.42)";
    [17, 49, 81, 113, 145].forEach((offset) => {
      this.roundRect(ctx, x + offset, y, 11, h, 5.5);
      ctx.fill();
    });
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#5f6c72";
    ctx.font = "bold 16px Arial, Helvetica, sans-serif";
    ctx.fillText("试衣间", x + 92, y + 27);
    ctx.restore();

    this.drawOutfitShopBackButton(ctx, x + 9, y + 7);
    this.drawOutfitShopPreview(ctx, x + 88, y + 330);

    ctx.save();
    ctx.strokeStyle = "rgba(141, 177, 190, 0.34)";
    ctx.lineWidth = 1;
    [104, 196, 288, 380].forEach((offset) => {
      ctx.beginPath();
      ctx.moveTo(x + 175, y + offset);
      ctx.lineTo(x + w - 1, y + offset);
      ctx.stroke();
    });
    ctx.restore();

    const sections = [
      { part: "hair", label: "发型", y: y + 20, options: ["hair_female", "hair_male"] },
      { part: "shirt", label: "上装", y: y + 113, options: ["shirt_01", "shirt_male"] },
      { part: "pants", label: "下装", y: y + 205, options: ["pants_blue", "pants_brown"] },
      { part: "chalkBag", label: "镁粉袋", y: y + 297, options: ["chalk_01", "chalk_02"] },
      { part: "accessory", label: "配饰", y: y + 391, options: ["none", "glasses_01"], note: "敬请期待..." }
    ];

    sections.forEach((section) => {
      this.drawOutfitShopSection(ctx, section, optionX, secondOptionX);
    });
  }

  drawOutfitShopBackButton(ctx, x, y) {
    const size = 40;
    this.uiPanel.buttons.push({ id: "outfit-close", x, y, w: size, h: size });
    if (this.drawUiIconImage(ctx, "back", x, y, size)) {
      return;
    }
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d3f6fc";
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2 - 5, 0, Math.PI * 2);
    ctx.fill();
    this.drawUiIcon(ctx, "back", x + size / 2, y + size / 2, size);
    ctx.restore();
  }

  drawOutfitShopPreview(ctx, cx, cy) {
    ctx.save();
    ctx.globalAlpha = 0.96;
    this.drawOutfitPreviewCharacter(ctx, cx, cy, true);
    ctx.restore();
  }

  drawOutfitShopSection(ctx, section, x1, x2) {
    ctx.save();
    ctx.fillStyle = "#52636b";
    ctx.font = "bold 13px Arial, Helvetica, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(section.label, x1, section.y + 7);
    ctx.restore();

    const cardY = section.y + 21;
    const cardSize = 52;
    section.options.forEach((optionId, index) => {
      const optionX = index === 0 ? x1 : x2;
      this.drawOutfitShopOptionCard(ctx, section.part, optionId, optionX, cardY, cardSize);
    });

    if (section.note) {
      ctx.save();
      ctx.fillStyle = "rgba(82, 99, 107, 0.58)";
      ctx.font = "bold 10px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(section.note, (x1 + x2 + cardSize) / 2, section.y + 87);
      ctx.restore();
    }
  }

  drawOutfitShopOptionCard(ctx, part, optionId, x, y, size) {
    const selected = this.outfit[part] === optionId;
    this.uiPanel.buttons.push({ id: `outfit-option-${part}:${optionId}`, x, y, w: size, h: size });
    ctx.save();
    ctx.fillStyle = selected ? "rgba(229, 252, 255, 0.98)" : "rgba(244, 249, 251, 0.98)";
    this.roundRect(ctx, x, y, size, size, 8);
    ctx.fill();
    ctx.strokeStyle = selected ? "#5bd8ee" : "rgba(91, 125, 138, 0.16)";
    ctx.lineWidth = selected ? 2.5 : 1;
    ctx.stroke();
    this.drawOutfitOptionPreview(ctx, optionId, x + size / 2, y + size / 2);
    ctx.restore();
  }
  drawOutfitPreview(ctx, cx, cy) {
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.24)";
    this.roundRect(ctx, cx - 160, cy - 130, 320, 260, 18);
    ctx.fill();
    this.drawOutfitPreviewCharacter(ctx, cx - 70, cy + 12, false);
    this.drawOutfitPreviewCharacter(ctx, cx + 70, cy + 12, true);
    ctx.fillStyle = "rgba(70, 78, 82, 0.58)";
    ctx.font = "bold 13px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("背面", cx - 70, cy + 118);
    ctx.fillText("正面", cx + 70, cy + 118);
    ctx.restore();
  }

  drawOutfitPreviewCharacter(ctx, cx, cy, isFront) {
    const previous = {
      cameraY: this.camera.y,
      worldX: this.player.worldX,
      worldY: this.player.worldY,
      bodyAngle: this.player.bodyAngle,
      frontFacingAmount: this.player.frontFacingAmount,
      animTime: this.player.animTime
    };
    this.camera.y = 0;
    this.player.worldX = cx;
    this.player.worldY = cy;
    this.player.bodyAngle = 0;
    this.player.frontFacingAmount = isFront ? 1 : 0;
    this.player.animTime = previous.animTime || 0;

    const pose = {
      body: { x: cx, y: cy },
      head: { x: cx, y: cy - 47 },
      leftShoulder: { x: cx - 14, y: cy - 24 },
      rightShoulder: { x: cx + 14, y: cy - 24 },
      leftHip: { x: cx - 11, y: cy + 28 },
      rightHip: { x: cx + 11, y: cy + 28 },
      leftArm: {
        joint: { x: cx - 43, y: cy + 5 },
        end: { x: cx - 61, y: cy - 22 }
      },
      rightArm: {
        joint: { x: cx + 34, y: cy - 48 },
        end: { x: cx + 55, y: cy - 87 }
      },
      leftLeg: {
        joint: { x: cx - 41, y: cy + 75 },
        end: { x: cx - 75, y: cy + 105 }
      },
      rightLeg: {
        joint: { x: cx + 41, y: cy + 73 },
        end: { x: cx + 74, y: cy + 109 }
      }
    };
    const toScreen = (point) => this.worldToScreen(point);
    const leftHipScreen = toScreen(pose.leftHip);
    const rightHipScreen = toScreen(pose.rightHip);
    const leftKneeScreen = toScreen(pose.leftLeg.joint);
    const rightKneeScreen = toScreen(pose.rightLeg.joint);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(1.08, 1.08);
    ctx.translate(-cx, -cy);
    this.drawHipPatchBehindThighs(ctx, leftHipScreen, rightHipScreen);
    this.drawLimb(ctx, rightHipScreen, rightKneeScreen, toScreen(pose.rightLeg.end), THEME.player.skin, 7, {
      upperAsset: "rightThigh",
      upperSourceStart: { x: 208, y: 71 },
      upperSourceEnd: { x: 131.98, y: 210 },
      lowerAsset: "rightShin",
      lowerSourceStart: { x: 178, y: 50 },
      lowerSourceEnd: { x: 122, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawLimb(ctx, toScreen(pose.rightShoulder), toScreen(pose.rightArm.joint), toScreen(pose.rightArm.end), THEME.player.skin, 7, {
      upperAsset: "rightUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      lowerAsset: "rightLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 }
    });
    this.drawClimbingShoe(ctx, toScreen(pose.rightLeg.end), 1, rightKneeScreen);
    this.drawLimb(ctx, leftHipScreen, leftKneeScreen, toScreen(pose.leftLeg.end), THEME.player.skin, 7, {
      upperAsset: "leftThigh",
      upperSourceStart: { x: 92, y: 71 },
      upperSourceEnd: { x: 168.02, y: 210 },
      lowerAsset: "leftShin",
      lowerSourceStart: { x: 122, y: 50 },
      lowerSourceEnd: { x: 178, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawOutfitPantsOverlay(ctx, pose);
    this.drawTorso(ctx, pose);
    this.drawLowerBodyAssets(ctx, pose);
    this.drawHead(ctx, toScreen(pose.head));
    this.drawLimb(ctx, toScreen(pose.leftShoulder), toScreen(pose.leftArm.joint), toScreen(pose.leftArm.end), THEME.player.skin, 7, {
      upperAsset: "leftUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      lowerAsset: "leftLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 }
    });
    this.drawClimbingShoe(ctx, toScreen(pose.leftLeg.end), -1, leftKneeScreen);
    this.drawHand(ctx, toScreen(pose.leftArm.end));
    this.drawHand(ctx, toScreen(pose.rightArm.end));
    ctx.restore();

    this.camera.y = previous.cameraY;
    this.player.worldX = previous.worldX;
    this.player.worldY = previous.worldY;
    this.player.bodyAngle = previous.bodyAngle;
    this.player.frontFacingAmount = previous.frontFacingAmount;
    this.player.animTime = previous.animTime;
  }

  drawOutfitPartTabs(ctx, y) {
    const tabW = CONFIG.logicalWidth / OUTFIT_PARTS.length;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.98)";
    ctx.fillRect(0, y, CONFIG.logicalWidth, 56);
    ctx.strokeStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CONFIG.logicalWidth, y);
    ctx.moveTo(0, y + 56);
    ctx.lineTo(CONFIG.logicalWidth, y + 56);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    OUTFIT_PARTS.forEach((part, index) => {
      const x = index * tabW;
      this.uiPanel.buttons.push({ id: `outfit-part-${part.id}`, x, y, w: tabW, h: 56 });
      const selected = this.selectedOutfitPart === part.id;
      ctx.fillStyle = selected ? "#12a9df" : "#a9aeb1";
      ctx.font = "bold 15px Arial, Helvetica, sans-serif";
      ctx.fillText(part.label, x + tabW / 2, y + 28);
      if (selected) {
        ctx.fillStyle = "#12a9df";
        this.roundRect(ctx, x + 8, y + 53, tabW - 16, 3, 1.5);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  drawOutfitOptions(ctx, y) {
    const options = OUTFIT_OPTIONS[this.selectedOutfitPart] || [];
    const label = OUTFIT_PARTS.find((part) => part.id === this.selectedOutfitPart)?.label || "换装";
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = THEME.ui.text;
    ctx.font = "bold 19px Arial, Helvetica, sans-serif";
    ctx.fillText(label, 28, y + 18);
    const card = 62;
    const gap = 16;
    options.forEach((option, index) => {
      const x = 28 + index * (card + gap);
      const optionY = y + 52;
      const selected = this.outfit[this.selectedOutfitPart] === option.id;
      this.uiPanel.buttons.push({ id: `outfit-option-${option.id}`, x, y: optionY, w: card, h: card + 25 });
      ctx.fillStyle = "rgba(255,255,255,0.96)";
      this.roundRect(ctx, x, optionY, card, card, 13);
      ctx.fill();
      ctx.strokeStyle = selected ? "#63d9f0" : "rgba(0,0,0,0.10)";
      ctx.lineWidth = selected ? 3 : 1.5;
      ctx.stroke();
      this.drawOutfitOptionPreview(ctx, option.id, x + card / 2, optionY + card / 2);
      ctx.fillStyle = selected ? "#0876bd" : "#8a9398";
      ctx.font = "bold 12px Arial, Helvetica, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(option.label, x + card / 2, optionY + card + 18);
    });
    ctx.restore();
  }

  drawOutfitOptionPreview(ctx, optionId, cx, cy) {
    ctx.save();
    ctx.translate(cx, cy);
    const sprite = this.getOutfitOptionPreviewAsset(optionId);
    if (sprite && this.playerAssets.isReady(sprite.name)) {
      this.drawOptionSprite(ctx, sprite.name, sprite.scale, sprite.y || 0);
    } else if (optionId === "none") {
      ctx.strokeStyle = "#a9aeb1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-14, 14);
      ctx.lineTo(14, -14);
      ctx.stroke();
    } else if (optionId === "glasses_01") {
      ctx.strokeStyle = "#16384d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(-10, 0, 8, 6, 0, 0, Math.PI * 2);
      ctx.ellipse(10, 0, 8, 6, 0, 0, Math.PI * 2);
      ctx.moveTo(-2, 0);
      ctx.lineTo(2, 0);
      ctx.stroke();
    } else if (optionId.startsWith("shirt")) {
      ctx.fillStyle = optionId === "shirt_01" ? "#e760ad" : "#0ea8c8";
      this.roundRect(ctx, -15, -18, 30, 36, 5);
      ctx.fill();
    } else if (optionId.startsWith("pants")) {
      ctx.fillStyle = optionId === "pants_brown" ? "#9a633c" : "#4abed0";
      this.roundRect(ctx, -22, -8, 20, 26, 8);
      this.roundRect(ctx, 2, -8, 20, 26, 8);
      ctx.fill();
    } else if (optionId.startsWith("chalk")) {
      ctx.fillStyle = optionId === "chalk_02" ? "#e66bb8" : "#e45fb5";
      this.roundRect(ctx, -13, -15, 26, 30, 9);
      ctx.fill();
    }
    ctx.restore();
  }

  getOutfitOptionPreviewAsset(optionId) {
    const map = {
      hair_01: { name: "headBack", scale: 0.115, y: 1 },
      hair_female: { name: "hairFemaleBack", scale: 0.165, y: 1 },
      hair_male: { name: "hairMaleBack", scale: 0.168, y: 1 },
      glasses_01: { name: "glasses01", scale: 0.20, y: 0 },
      shirt_01: { name: "shirt", scale: 0.22, y: 1 },
      shirt_female: { name: "shirtFemale", scale: 0.22, y: 1 },
      shirt_male: { name: "shirtMale", scale: 0.22, y: 1 },
      pants_blue: { name: "pantsBlue", scale: 0.15, y: 0 },
      pants_brown: { name: "pantsBrown", scale: 0.15, y: 0 },
      chalk_01: { name: "chalkBag01", scale: 0.25, y: 0 },
      chalk_02: { name: "chalkBag02", scale: 0.25, y: 0 }
    };
    return map[optionId] || null;
  }

  drawOptionSprite(ctx, assetName, maxScale, yOffset = 0) {
    const asset = this.playerAssets.get(assetName);
    if (!asset) {
      return;
    }
    const source = this.getOutfitSpriteImage(assetName, asset.image);
    const maxSize = 40;
    const scale = Math.min(maxScale, maxSize / Math.max(source.width, source.height));
    ctx.drawImage(
      source,
      -source.width * scale * 0.5,
      -source.height * scale * 0.5 + yOffset,
      source.width * scale,
      source.height * scale
    );
  }

  drawOutfitChoiceButton(ctx, id, label, x, y, w, h, selected) {
    this.uiPanel.buttons.push({ id, x, y, w, h });
    ctx.save();
    ctx.fillStyle = selected ? "rgba(189, 247, 255, 0.95)" : "rgba(238, 250, 253, 0.92)";
    this.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.strokeStyle = selected ? "#0876bd" : "rgba(49, 95, 114, 0.18)";
    ctx.lineWidth = selected ? 2 : 1;
    ctx.stroke();
    ctx.fillStyle = selected ? "#0876bd" : "#315f72";
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(selected ? `${label} ✓` : label, x + w / 2, y + h / 2 + 0.5);
    ctx.restore();
  }

  drawToast(ctx) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px Arial, Helvetica, sans-serif";
    const paddingX = 18;
    const w = ctx.measureText(this.uiToast).width + paddingX * 2;
    const h = 36;
    const x = (CONFIG.logicalWidth - w) / 2;
    const y = CONFIG.logicalHeight - 164;
    ctx.fillStyle = "rgba(49, 95, 114, 0.84)";
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(this.uiToast, CONFIG.logicalWidth / 2, y + h / 2);
    ctx.restore();
  }

  drawStartHint(ctx) {
    const w = 218;
    const x = (CONFIG.logicalWidth - w) / 2;
    const y = 248;
    ctx.fillStyle = "rgba(255,255,255,0.88)";
    this.roundRect(ctx, x, y, w, 70, 13);
    ctx.fill();
    ctx.fillStyle = "#315f72";
    ctx.font = "bold 18px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("按住屏幕蓄力", CONFIG.logicalWidth / 2, y + 25);
    ctx.font = "15px Arial, Helvetica, sans-serif";
    ctx.fillText("松开后出手", CONFIG.logicalWidth / 2, y + 49);
    ctx.textAlign = "left";
  }

  drawGameOver(ctx) {
    ctx.fillStyle = "rgba(221, 244, 250, 0.58)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    const x = 48;
    const y = 244;
    const w = CONFIG.logicalWidth - 96;
    const h = 220;
    ctx.save();
    ctx.shadowColor = THEME.ui.cardShadow;
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = THEME.ui.card;
    this.roundRect(ctx, x, y, w, h, 16);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = THEME.ui.text;
    ctx.font = "bold 24px Arial, Helvetica, sans-serif";
    ctx.fillText("本轮结束", CONFIG.logicalWidth / 2, y + 36);
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.fillText(`得分：${this.score}`, CONFIG.logicalWidth / 2, y + 72);
    ctx.fillText(`岩点：${this.holdCount}  高度：${formatMeters(this.climbHeight / CONFIG.pixelsPerMeter)}`, CONFIG.logicalWidth / 2, y + 102);
    ctx.fillStyle = this.failureReason === "力量过大" ? THEME.ui.pointAccent : "#315f72";
    ctx.font = "bold 19px Arial, Helvetica, sans-serif";
    ctx.fillText(this.failureReason || "挑战结束", CONFIG.logicalWidth / 2, y + 137);
    ctx.fillStyle = this.newBest ? THEME.ui.heightAccent : "#657a82";
    ctx.font = "15px Arial, Helvetica, sans-serif";
    ctx.fillText(this.newBest ? "刷新纪录" : "未刷新纪录", CONFIG.logicalWidth / 2, y + 166);
    ctx.fillStyle = "#315f72";
    ctx.fillText("点击屏幕重新开始", CONFIG.logicalWidth / 2, y + 196);
    ctx.textAlign = "left";
  }

  drawRoundEndedBadge(ctx) {
    const x = 58;
    const y = 132;
    const w = CONFIG.logicalWidth - 116;
    const h = 154;
    ctx.save();
    ctx.shadowColor = THEME.ui.cardShadow;
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 7;
    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    this.roundRect(ctx, x, y, w, h, 15);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = THEME.ui.text;
    ctx.font = "bold 23px Arial, Helvetica, sans-serif";
    ctx.fillText("本轮结束", CONFIG.logicalWidth / 2, y + 30);
    ctx.fillStyle = this.failureReason === "力量过大" ? THEME.ui.pointAccent : "#315f72";
    ctx.font = "bold 17px Arial, Helvetica, sans-serif";
    ctx.fillText(this.failureReason || "挑战结束", CONFIG.logicalWidth / 2, y + 61);
    ctx.fillStyle = THEME.ui.text;
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText(`本次得分：${this.score}`, CONFIG.logicalWidth / 2, y + 91);
    ctx.fillText(`本次岩点：${this.holdCount}  最高岩点：${this.scoreManager.best.holds}`, CONFIG.logicalWidth / 2, y + 115);
    ctx.fillStyle = "#657a82";
    ctx.font = "14px Arial, Helvetica, sans-serif";
    ctx.fillText("点击屏幕开始下一轮", CONFIG.logicalWidth / 2, y + 139);
    ctx.textAlign = "left";
  }

  drawDebug(ctx) {
    const contactCount = this.player.getContactCount();
    const lines = [
      `state: ${this.state}`,
      `stage: ${this.player.animationStage}`,
      `charge: ${this.charge.toFixed(2)}`,
      `chargeDir: ${this.chargeDirection > 0 ? "up" : "down"}`,
      `route id: ${this.currentHold ? this.currentHold.id : "--"}`,
      `target id: ${this.targetHold ? this.targetHold.id : "--"}`,
      `LH/RH: ${this.player.contacts.leftHand ?? "--"} / ${this.player.contacts.rightHand ?? "--"}`,
      `LF/RF: ${this.player.contacts.leftFoot ?? "--"} / ${this.player.contacts.rightFoot ?? "--"}`,
      `feet on: ${(this.player.contacts.leftFoot != null ? 1 : 0) + (this.player.contacts.rightFoot != null ? 1 : 0)}`,
      `contacts: ${contactCount}`,
      `action: ${this.pendingAttempt ? this.pendingAttempt.actionType : this.player.actionType}`,
      `posture: ${this.player.postureType}`,
      `lead: ${this.player.activeHand}`,
      `targetDist: ${this.calculateTargetDistance().toFixed(1)}`,
      `actualReach: ${this.lastAttempt ? this.lastAttempt.actualReach.toFixed(1) : this.calculateReachDistance().toFixed(1)}`,
      `error: ${this.lastAttempt ? this.lastAttempt.distanceError.toFixed(1) : "--"}`,
      `tol: ${this.getReachTolerance().toFixed(1)}`,
      `backswing: ${(this.player.motion.backswingDistance || 0).toFixed(1)}`,
      `arm L/R: ${this.player.debugLengths.leftArm ? this.player.debugLengths.leftArm.toFixed(1) : "--"} / ${this.player.debugLengths.rightArm ? this.player.debugLengths.rightArm.toFixed(1) : "--"}`,
      `leg L/R: ${this.player.debugLengths.leftLeg ? this.player.debugLengths.leftLeg.toFixed(1) : "--"} / ${this.player.debugLengths.rightLeg ? this.player.debugLengths.rightLeg.toFixed(1) : "--"}`,
      `route/support: ${this.routeHolds.length} / ${this.generator.supportHolds.length}`,
      `cameraY: ${this.camera.y.toFixed(1)}`
    ];
    ctx.font = "10px Arial";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.fillRect(10, 104, 182, lines.length * 13 + 8);
    ctx.fillStyle = "#234450";
    lines.forEach((line, index) => {
      ctx.fillText(line, 16, 110 + index * 13);
    });
  }

  roundRect(ctx, x, y, width, height, radius) {
    if (width <= 0 || height <= 0) {
      return;
    }
    const r = Math.min(radius, Math.abs(width) / 2, Math.abs(height) / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");
  window.__climbGame = new Game(canvas);
});
