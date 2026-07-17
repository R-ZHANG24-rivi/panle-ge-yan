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
  targetGrabRingPadding: 14,
  maxLives: 3,
  pixelsPerMeter: 100,
  wallPadding: 48,
  safeTop: 40,
  safeBottom: 60,
  safeSide: 20,
  topControlsY: 28,
  playerBodyOffsetY: 96,
  chargePlayerBodyOffsetY: 66,
  cameraPlayerScreenY: 545,
  startDemoPlayerScreenY: 400,
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
  themeHoldScale: 0.32,
  themeHoldRotationMax: Math.PI / 6,
  themeHoldCollisionPadding: 4,
  themeHoldWallBleed: 24,

  // ===================== IK 骨骼尺寸（换图时永远不要改） =====================
  // 这些是 IK 解算关节点（肩/肘/髋/膝/踝）的依据，决定角色骨架大小。
  // 贴图是"拉伸去贴合骨骼"，不是骨骼去贴合贴图，所以换新贴图时这些值保持不变。
  upperArmLength: 36,   // 上臂骨长（肩→肘）
  forearmLength: 36,    // 前臂骨长（肘→腕）
  thighLength: 45,      // 大腿骨长（髋→膝）
  shinLength: 45,       // 小腿骨长（膝→踝）
  torsoLength: 52,      // 躯干长（肩线→髋线）
  shoulderWidth: 28,    // 肩宽
  hipWidth: 22,         // 髋宽
  headRadius: 14,       // 头部基准半径
  // ===================== 贴图缩放系数（比例"总开关"，已固定） =====================
  // 这是"定下来的比例"。想整体调大/调小某部位，只改这里一个数字，
  // 攀爬 / 下落 / 试衣间三态会同步生效。换图本身不需要动这些值。
  headSpriteScale: 1.17,   // 头部贴图（头发/表情/刘海/配饰）整体缩放倍数
  shirtSpriteScale: 0.75,  // 上衣贴图缩放倍数（实际绘制 = 0.26 * 本值）
  pantsSpriteScale: 0.75,  // 裤子（大腿/小腿）贴图宽度缩放倍数
  beltOffsetFromShirt: -7, // 腰带相对上衣底端的纵向偏移（负=上移贴住上衣底边）
  beltSpriteScale: 0.7,    // 腰带贴图缩放倍数（实际绘制 = 0.30 * 本值）
  thighKneeOverlap: 0.95,  // 大腿贴图长度微调（仅改长度不改宽度/锚点，用于膝盖衔接）
  rightShoeAnchorDX: -6,   // 背面右脚鞋子脚踝锚点横向微调（源锚点x偏移，正=贴图相对脚踝点往左，仅右脚）
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
  retryDescentDuration: 0.55,

  restSwayPeriod: 2.8,
  restSwayAmplitude: 0.045,
  chalkShakeInterval: 2,
  chalkShakeDuration: 1.05,
  chalkShakeAmplitude: 7,
  swingHandInterval: 3.0,
  swingHandDuration: 2.4,
  swingHandAmplitude: 24,
  bendSignDeadband: 0.2,
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

const HOLD_THEME_ASSET_SETS = [
  { id: "theme01", basePath: "assets/hold_themes/theme01", manifestFile: "assets/hold_themes/theme01/theme01_holds_manifest.json" },
  { id: "theme02", basePath: "assets/hold_themes/theme02", manifestFile: "assets/hold_themes/theme02/theme02_holds_manifest.json" },
  { id: "theme03", basePath: "assets/hold_themes/theme03", manifestFile: "assets/hold_themes/theme03/theme03_holds_manifest.json" },
  { id: "theme04", basePath: "assets/hold_themes/theme04", manifestFile: "assets/hold_themes/theme04/theme04_holds_manifest.json" },
  { id: "theme05", basePath: "assets/hold_themes/theme05", manifestFile: "assets/hold_themes/theme05/theme05_holds_manifest.json" },
  { id: "theme06", basePath: "assets/hold_themes/theme06", manifestFile: "assets/hold_themes/theme06/theme06_holds_manifest.json" }
];
const PLAYER_ASSET_FILES = {
  fallingPose: "assets/player/falling_pose.png",
  climbingPose: "assets/player/climbing_pose.png",
  headFront: "assets/player/head_front.png",
  headBack: "assets/player/head_back.png",
  hair02Front: "assets/player/outfit/hair_02_front.png",
  hair02Back: "assets/player/outfit/hair_02_back.png",
  hairFemaleFront: "assets/player/outfit/hair_female_front.png",
  hairFemaleBack: "assets/player/outfit/hair_female_back.png",
  hairMaleFront: "assets/player/outfit/hair_male_front.png",
  hairMaleBack: "assets/player/outfit/hair_male_back.png",
  headMaleFront: "assets/player/outfit/head_male_back.png",
  glasses01: "assets/player/outfit/glasses_01.png",
  shirt: "assets/player/shirt.png?v=20260708-rounded",
  shirtFemale: "assets/player/outfit/shirt_female.png",
  shirtMale: "assets/player/outfit/shirt_male.png",
  pantsBlue: "assets/player/outfit/pants_blue.png",
  pantsBrown: "assets/player/outfit/pants_brown.png",
  shorts: "assets/player/shorts.png",
  leftUpperArm: "assets/player/left_upper_arm.png",
  leftLowerArm: "assets/player/left_lower_arm.png",
  rightUpperArm: "assets/player/right_upper_arm.png",
  rightLowerArm: "assets/player/right_lower_arm.png",
  leftHand: "assets/player/left_hand.png",
  rightHand: "assets/player/right_hand.png",
  leftThigh: "assets/player/left_thigh.png",
  leftShin: "assets/player/left_shin.png",
  rightThigh: "assets/player/right_thigh.png",
  rightShin: "assets/player/right_shin.png",
  hips: "assets/player/hips.png",
  belt: "assets/player/belt.png",
  chalkBagSprite: "assets/player/chalk_bag.png",
  chalkBag01: "assets/player/outfit/chalk_bag_01.png",
  chalkBag02: "assets/player/outfit/chalk_bag_02.png",
  leftFoot: "assets/player/left_foot.png",
  rightFoot: "assets/player/right_foot.png"
};

const UI_ICON_FILES = {
  back: "assets/ui/icon_back.png",
  skin: "assets/ui/icon_skin.png?v=20260710-shirt-1",
  restart: "assets/ui/icon_restart.png",
  rank: "assets/ui/icon_rank.png",
  soundOn: "assets/ui/icon_sound_on.png",
  soundOff: "assets/ui/icon_sound_off.png",
  share: "assets/ui/icon_share.png"
};

const FIGMA_UI_ASSET_FILES = {
  coverTitle: "assets/ui/figma/cover_title.png?v=20260712-figma-cover-1",
  startButton: "assets/ui/figma/btn_start.png?v=20260712-figma-cover-1",
  outfitButton: "assets/ui/figma/btn_outfit.png?v=20260712-figma-cover-1",
  rankButton: "assets/ui/figma/btn_rank.png?v=20260712-figma-cover-1",
  rankingTitle: "assets/ui/figma/ranking_title.png?v=20260717-figma-title-1",
  magnet: "assets/ui/figma/powerup_magnet.png?v=20260712-figma-cover-1",
  magnifier: "assets/ui/figma/powerup_magnifier.png?v=20260712-figma-cover-1",
  tutorialHand: "assets/ui/tutorial_hand.png?v=20260717-tutorial-hand"
};
const FEEDBACK_ASSET_FILES = {
  good: "assets/ui/feedback/feedback_good.png?v=20260710-feedback-2",
  risky: "assets/ui/feedback/feedback_risky.png?v=20260710-feedback-2",
  precise: "assets/ui/feedback/feedback_precise.png?v=20260710-feedback-2",
  combo2: "assets/ui/feedback/combo_2.png?v=20260710-feedback-2",
  combo3: "assets/ui/feedback/combo_3.png?v=20260710-feedback-2",
  combo4: "assets/ui/feedback/combo_4.png?v=20260710-feedback-2",
  combo5: "assets/ui/feedback/combo_5.png?v=20260710-feedback-2",
  combo6: "assets/ui/feedback/combo_6.png?v=20260710-feedback-2",
  combo7: "assets/ui/feedback/combo_7.png?v=20260710-feedback-2",
  combo8: "assets/ui/feedback/combo_8.png?v=20260710-feedback-2",
  combo9: "assets/ui/feedback/combo_9.png?v=20260710-feedback-2",
  combo10: "assets/ui/feedback/combo_10.png?v=20260710-feedback-2",
  combo11: "assets/ui/feedback/combo_11.png?v=20260713-combo11-20",
  combo12: "assets/ui/feedback/combo_12.png?v=20260713-combo11-20",
  combo13: "assets/ui/feedback/combo_13.png?v=20260713-combo11-20",
  combo14: "assets/ui/feedback/combo_14.png?v=20260713-combo11-20",
  combo15: "assets/ui/feedback/combo_15.png?v=20260713-combo11-20",
  combo16: "assets/ui/feedback/combo_16.png?v=20260713-combo11-20",
  combo17: "assets/ui/feedback/combo_17.png?v=20260713-combo11-20",
  combo18: "assets/ui/feedback/combo_18.png?v=20260713-combo11-20",
  combo19: "assets/ui/feedback/combo_19.png?v=20260713-combo11-20",
  combo20: "assets/ui/feedback/combo_20.png?v=20260713-combo11-20"
};

const AUDIO_FILES = {
  bgm: "assets/audio/bgm_main.mp3?v=20260717-new-bgm",
  grabSuccess: "assets/audio/sfx_grab_success.mp3?v=20260716-optimized-1",
  charge: "assets/audio/sfx_charge.mp3?v=20260716-optimized-1",
  powerUp: "assets/audio/sfx_power_up.mp3?v=20260716-optimized-1",
  miss: "assets/audio/sfx_miss.mp3?v=20260716-optimized-1"
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

function transformPolygon(points, origin, angle) {
  return points.map((point) => {
    const rotated = rotate(point, angle);
    return {
      x: origin.x + rotated.x,
      y: origin.y + rotated.y
    };
  });
}

function getPolygonBounds(points) {
  if (!points || points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const point of points) {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  }
  return { minX, maxX, minY, maxY };
}

function boundsOverlap(a, b, padding = 0) {
  return !(
    a.maxX + padding < b.minX ||
    b.maxX + padding < a.minX ||
    a.maxY + padding < b.minY ||
    b.maxY + padding < a.minY
  );
}

function projectPolygon(points, axis) {
  let min = Infinity;
  let max = -Infinity;
  for (const point of points) {
    const projected = point.x * axis.x + point.y * axis.y;
    min = Math.min(min, projected);
    max = Math.max(max, projected);
  }
  return { min, max };
}

function polygonAxes(points) {
  const axes = [];
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const edge = subtract(next, current);
    const normal = normalize({ x: -edge.y, y: edge.x });
    if (Math.hypot(normal.x, normal.y) > 0.0001) {
      axes.push(normal);
    }
  }
  return axes;
}

function polygonsIntersect(a, b, padding = 0) {
  if (!a || !b || a.length < 3 || b.length < 3) {
    return false;
  }
  const boundsA = getPolygonBounds(a);
  const boundsB = getPolygonBounds(b);
  if (!boundsOverlap(boundsA, boundsB, padding)) {
    return false;
  }
  const axes = [...polygonAxes(a), ...polygonAxes(b)];
  for (const axis of axes) {
    const projectedA = projectPolygon(a, axis);
    const projectedB = projectPolygon(b, axis);
    if (projectedA.max + padding < projectedB.min || projectedB.max + padding < projectedA.min) {
      return false;
    }
  }
  return true;
}

function parseSvgNumber(source, attr) {
  const match = source.match(new RegExp(`${attr}="([^"]+)"`));
  return match ? Number.parseFloat(match[1]) : 0;
}

function sampleSvgPath(pathData, sampleCount = 44) {
  if (!pathData || typeof document === "undefined") {
    return [];
  }
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", pathData);
  let length = 0;
  try {
    length = path.getTotalLength();
  } catch (error) {
    return [];
  }
  if (!Number.isFinite(length) || length <= 0) {
    return [];
  }
  const points = [];
  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleCount;
    const point = path.getPointAtLength(length * t);
    points.push({ x: point.x, y: point.y });
  }
  return points;
}

function parseOutlineSvg(svgText, nativeSize, gripPx, renderScale) {
  const width = parseSvgNumber(svgText, "width") || nativeSize.width;
  const height = parseSvgNumber(svgText, "height") || nativeSize.height;
  const pathMatch = svgText.match(/<path[^>]*\sd="([^"]+)"/);
  const sampled = pathMatch ? sampleSvgPath(pathMatch[1]) : [];
  const sourcePoints = sampled.length >= 3
    ? sampled
    : [
      { x: 0, y: 0 },
      { x: width, y: 0 },
      { x: width, y: height },
      { x: 0, y: height }
    ];
  return sourcePoints.map((point) => ({
    x: ((point.x / Math.max(1, width)) * nativeSize.width - gripPx.x) * renderScale,
    y: ((point.y / Math.max(1, height)) * nativeSize.height - gripPx.y) * renderScale
  }));
}

function parseGripSvg(svgText, nativeSize) {
  if (!svgText) {
    return null;
  }
  const width = parseSvgNumber(svgText, "width") || nativeSize.width;
  const height = parseSvgNumber(svgText, "height") || nativeSize.height;
  if (width < nativeSize.width * 0.5 || height < nativeSize.height * 0.5) {
    return null;
  }
  const circleMatch = svgText.match(/<[^>]*circle[^>]*>/);
  if (!circleMatch) {
    return null;
  }
  const circleTag = circleMatch[0];
  const cxMatch = circleTag.match(/\bcx="([^"]+)"/);
  const cyMatch = circleTag.match(/\bcy="([^"]+)"/);
  if (!cxMatch || !cyMatch) {
    return null;
  }
  let x = Number(cxMatch[1]);
  let y = Number(cyMatch[1]);
  const scaleMatch = svgText.match(/transform="scale\(([-0-9.]+)(?:[ ,]+([-0-9.]+))?\)"/);
  if (scaleMatch) {
    const sx = Number(scaleMatch[1]);
    const sy = Number(scaleMatch[2] || scaleMatch[1]);
    if (Number.isFinite(sx)) {
      x *= sx;
    }
    if (Number.isFinite(sy)) {
      y *= sy;
    }
  }
  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return null;
  }
  return {
    x: clamp(x / Math.max(1, width), 0, 1),
    y: clamp(y / Math.max(1, height), 0, 1),
    type: "primary"
  };
}
function formatMeters(value) {
  return `${value.toFixed(1)} m`;
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Math.round(Number(seconds) || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
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

function solveTwoBoneIK(root, target, upperLength, lowerLength, bendDirection, forceBendSign) {
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
  // forceBendSign（蓄力期间锁定弯向用）：指定则不随方向旋转而翻转
  const bendSign = forceBendSign !== undefined ? forceBendSign : (perpendicular.x * bend.x + perpendicular.y * bend.y < 0 ? -1 : 1);
  const normal = scale(perpendicular, bendSign);
  const mid = add(root, scale(direction, a));
  const joint = add(mid, scale(normal, h));
  return {
    joint,
    end,
    clipped: rawDistance > maxReach,
    bendSign,
    upperActual: distance(root, joint),
    lowerActual: distance(joint, end)
  };
}

// 弯向迟滞选择：非蓄力态下锁定四肢弯向，仅当目标明显越过翻转边界(deadband)时才切换，
// 避免肩/髋 IK 弯向在几何边界附近平移时反复翻面（不同方向反复开合）。
function chooseBendSign(root, target, bendDirection, storedSign, deadband) {
  const toTarget = subtract(target, root);
  const rawDistance = Math.hypot(toTarget.x, toTarget.y);
  const direction = rawDistance < 0.001 ? { x: 0, y: 1 } : scale(toTarget, 1 / rawDistance);
  const perpendicular = { x: -direction.y, y: direction.x };
  const bend = bendDirection || perpendicular;
  const dot = perpendicular.x * bend.x + perpendicular.y * bend.y;
  const naturalSign = dot < 0 ? -1 : 1;
  if (storedSign !== -1 && storedSign !== 1) {
    return naturalSign;
  }
  if (naturalSign !== storedSign && Math.abs(dot) > deadband) {
    return naturalSign;
  }
  return storedSign;
}

class ScoreManager {
  constructor() {
    this.storageKey = "ropeClimbJumpBestScore";
    this.rankingsKey = "ropeClimbJumpRankings";
    this.best = this.loadBestScore();
    this.rankings = this.loadRankings();
  }

  loadBestScore() {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        return { holds: 0, height: 0, score: 0, duration: 0 };
      }
      const parsed = JSON.parse(raw);
      return {
        holds: Number(parsed.holds) || 0,
        height: Number(parsed.height) || 0,
        score: Number(parsed.score) || 0,
        duration: Number(parsed.duration) || 0
      };
    } catch (error) {
      return { holds: 0, height: 0, score: 0, duration: 0 };
    }
  }

  loadRankings() {
    try {
      const raw = window.localStorage.getItem(this.rankingsKey);
      if (!raw) {
        return { height: [], score: [] };
      }
      const parsed = JSON.parse(raw);
      return {
        height: Array.isArray(parsed.height) ? parsed.height.map((item) => this.normalizeRecord(item)) : [],
        score: Array.isArray(parsed.score) ? parsed.score.map((item) => this.normalizeRecord(item)) : []
      };
    } catch (error) {
      return { height: [], score: [] };
    }
  }

  normalizeRecord(item) {
    return {
      holds: Number(item && item.holds) || 0,
      height: Number(item && item.height) || 0,
      score: Number(item && item.score) || 0,
      duration: Number(item && item.duration) || 0,
      time: Number(item && item.time) || Date.now()
    };
  }

  pushRanking(record) {
    const normalized = this.normalizeRecord({ ...record, time: Date.now() });
    if (normalized.height <= 0 && normalized.score <= 0 && normalized.holds <= 0) {
      return;
    }
    this.rankings.height = [normalized, ...this.rankings.height]
      .sort((a, b) => b.height - a.height || b.score - a.score || b.holds - a.holds)
      .slice(0, 5);
    this.rankings.score = [normalized, ...this.rankings.score]
      .sort((a, b) => b.score - a.score || b.height - a.height || b.holds - a.holds)
      .slice(0, 5);
  }

  saveBestScore(score) {
    const scoreImproved = (score.score || 0) > (this.best.score || 0);
    const nextBest = {
      holds: Math.max(this.best.holds, score.holds),
      height: Math.max(this.best.height, score.height),
      score: Math.max(this.best.score || 0, score.score || 0),
      duration: scoreImproved || !this.best.duration
        ? (Number(score.duration) || 0)
        : this.best.duration
    };
    const changed = nextBest.holds !== this.best.holds
      || nextBest.height !== this.best.height
      || nextBest.score !== this.best.score;
    this.best = nextBest;
    this.pushRanking(score);
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.best));
      window.localStorage.setItem(this.rankingsKey, JSON.stringify(this.rankings));
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
  constructor(themeSets) {
    this.themeSets = Array.isArray(themeSets) ? themeSets : [];
    this.themeAssets = new Map();
    this.themeAssetsById = new Map();
    this.currentThemeId = null;
    this.assets = [];
    this.assetsById = new Map();
    this.ready = false;
    this.failed = false;
    this.readyPromise = this.loadThemes();
  }

  async loadThemes() {
    try {
      const loadedThemes = await Promise.all(this.themeSets.map((theme) => this.loadTheme(theme)));
      const validThemes = loadedThemes.filter((theme) => theme && theme.assets.length > 0);
      for (const theme of validThemes) {
        this.themeAssets.set(theme.id, theme.assets);
        this.themeAssetsById.set(theme.id, new Map(theme.assets.map((asset) => [asset.id, asset])));
      }
      this.ready = validThemes.length > 0;
      this.failed = !this.ready;
      if (this.ready) {
        const forcedTheme = this.getForcedThemeId();
        if (forcedTheme && this.themeAssets.has(forcedTheme)) {
          this.useTheme(forcedTheme);
        } else {
          this.selectRandomTheme(false);
        }
      }
      return this.ready;
    } catch (error) {
      console.warn("Theme hold assets unavailable", error);
      this.ready = false;
      this.failed = true;
      return false;
    }
  }

  getForcedThemeId() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const value = params.get("forceTheme");
      return value && /^theme\d+$/.test(value) ? value : null;
    } catch (error) {
      return null;
    }
  }
  async loadTheme(theme) {
    const response = await fetch(theme.manifestFile);
    if (!response.ok) {
      throw new Error(`Failed to load hold manifest: ${response.status}`);
    }
    const manifest = await response.json();
    const themeId = manifest.themeId || theme.id;
    const themeInfo = { ...theme, id: themeId };
    const loadedAssets = await Promise.all((manifest.holds || []).map((entry, index) => this.loadHoldAsset(themeInfo, entry, index)));
    return {
      id: themeId,
      assets: loadedAssets.filter(Boolean)
    };
  }

  async loadHoldAsset(theme, entry, index) {
    const nativeSize = {
      width: Math.max(1, Number(entry.nativeSize && entry.nativeSize.width) || 1),
      height: Math.max(1, Number(entry.nativeSize && entry.nativeSize.height) || 1)
    };
    const manifestGrip = Array.isArray(entry.grips) && entry.grips.length > 0
      ? entry.grips[0]
      : null;
    let gripFromSvg = null;
    if (entry.grip) {
      try {
        const gripResponse = await fetch(`${theme.basePath}/${entry.grip}`);
        const gripText = gripResponse.ok ? await gripResponse.text() : "";
        gripFromSvg = parseGripSvg(gripText, nativeSize);
      } catch (error) {
        gripFromSvg = null;
      }
    }
    const primaryGrip = gripFromSvg || {
      x: clamp(Number(manifestGrip && manifestGrip.x) || 0.5, 0, 1),
      y: clamp(Number(manifestGrip && manifestGrip.y) || 0.5, 0, 1),
      type: manifestGrip && manifestGrip.type || "primary"
    };
    const gripPx = {
      x: clamp(Number(primaryGrip.x) || 0.5, 0, 1) * nativeSize.width,
      y: clamp(Number(primaryGrip.y) || 0.5, 0, 1) * nativeSize.height
    };
    const src = `${theme.basePath}/${entry.image}`;
    const image = new Image();
    const manifestGrips = (entry.grips || []).map((grip) => ({
      x: clamp(Number(grip.x) || 0.5, 0, 1),
      y: clamp(Number(grip.y) || 0.5, 0, 1),
      type: grip.type || "primary"
    }));
    const asset = {
      id: `${theme.id}:${entry.id}`,
      sourceId: entry.id,
      src,
      image,
      loaded: false,
      failed: false,
      index,
      group: theme.id,
      nativeSize,
      renderScale: CONFIG.themeHoldScale,
      gripPx,
      grips: manifestGrips.length > 0 ? manifestGrips : [primaryGrip],
      primaryGrip,
      manifestGrips
    };
    image.onload = () => {
      asset.loaded = true;
    };
    image.onerror = () => {
      asset.failed = true;
    };
    image.src = src;

    let outlineText = "";
    try {
      const outlineResponse = await fetch(`${theme.basePath}/${entry.outline}`);
      outlineText = outlineResponse.ok ? await outlineResponse.text() : "";
    } catch (error) {
      outlineText = "";
    }
    asset.outlineLocal = parseOutlineSvg(outlineText, nativeSize, gripPx, asset.renderScale);
    asset.outlineBounds = getPolygonBounds(asset.outlineLocal);
    asset.imageDraw = {
      x: -gripPx.x * asset.renderScale,
      y: -gripPx.y * asset.renderScale,
      width: nativeSize.width * asset.renderScale,
      height: nativeSize.height * asset.renderScale
    };
    asset.radius = Math.max(10, Math.min(34, Math.max(asset.imageDraw.width, asset.imageDraw.height) * 0.22));
    await waitForImageAsset(asset);
    return asset;
  }

  selectRandomTheme(requireDifferent = false) {
    const themeIds = Array.from(this.themeAssets.keys());
    if (themeIds.length === 0) {
      this.currentThemeId = null;
      this.assets = [];
      this.assetsById = new Map();
      return null;
    }
    let candidates = themeIds;
    if (requireDifferent && themeIds.length > 1 && this.currentThemeId) {
      candidates = themeIds.filter((id) => id !== this.currentThemeId);
    }
    const nextThemeId = candidates[Math.floor(Math.random() * candidates.length)] || themeIds[0];
    this.useTheme(nextThemeId);
    return this.currentThemeId;
  }

  useTheme(themeId) {
    const assets = this.themeAssets.get(themeId) || [];
    this.currentThemeId = themeId;
    this.assets = assets;
    this.assetsById = this.themeAssetsById.get(themeId) || new Map();
    return assets.length > 0;
  }

  getRandomAsset(seed = Math.random()) {
    if (!this.assets.length) {
      return null;
    }
    const index = Math.floor(clamp(seed, 0, 0.999999) * this.assets.length);
    return this.assets[index];
  }

  getAssetForHold(hold) {
    if (hold && hold.asset) {
      return hold.asset;
    }
    return hold && hold.assetId ? this.assetsById.get(hold.assetId) || null : null;
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
  constructor(holdAssets = null) {
    this.holdAssets = holdAssets;
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
    return this.createHold({
      id: this.nextId++,
      type: "route",
      x,
      y,
      radius: 15,
      sequence,
      powerUp: null,
      state: "normal"
    });
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
    return this.createHold({
      id: this.nextId++,
      type: "support",
      x,
      y,
      radius: 12,
      routeId,
      state: "normal",
      hidden,
      isFootRoute
    });
  }

  createHold(base) {
    const asset = this.holdAssets && this.holdAssets.ready
      ? this.holdAssets.getRandomAsset(Math.random())
      : null;
    const hold = {
      ...base,
      asset,
      assetId: asset ? asset.id : null,
      rotation: (Math.random() * 2 - 1) * CONFIG.themeHoldRotationMax,
      grips: []
    };
    if (asset) {
      hold.radius = asset.radius;
    }
    this.updateHoldGeometry(hold);
    return hold;
  }

  updateHoldGeometry(hold) {
    const asset = hold.asset || (this.holdAssets && this.holdAssets.getAssetForHold(hold));
    if (!asset) {
      hold.outlineWorld = null;
      hold.outlineBounds = null;
      hold.grips = [{ x: hold.x, y: hold.y, type: "primary" }];
      return hold;
    }
    hold.asset = asset;
    hold.assetId = asset.id;
    const origin = { x: hold.x, y: hold.y };
    hold.outlineWorld = transformPolygon(asset.outlineLocal, origin, hold.rotation);
    hold.outlineBounds = getPolygonBounds(hold.outlineWorld);
    hold.grips = asset.grips.map((grip) => {
      const local = {
        x: (grip.x * asset.nativeSize.width - asset.gripPx.x) * asset.renderScale,
        y: (grip.y * asset.nativeSize.height - asset.gripPx.y) * asset.renderScale
      };
      const world = add(origin, rotate(local, hold.rotation));
      return { ...world, type: grip.type || "primary" };
    });
    if (hold.grips.length === 0) {
      hold.grips = [{ x: hold.x, y: hold.y, type: "primary" }];
    }
    return hold;
  }

  getCollisionHolds(extra = []) {
    return [...this.routeHolds, ...this.supportHolds, ...extra].filter((hold) => hold && hold.outlineWorld);
  }

  isInsideWallBounds(hold) {
    if (!hold.outlineBounds) {
      return hold.x >= CONFIG.wallPadding && hold.x <= CONFIG.logicalWidth - CONFIG.wallPadding;
    }
    const bleed = CONFIG.themeHoldWallBleed;
    return hold.outlineBounds.minX >= -bleed && hold.outlineBounds.maxX <= CONFIG.logicalWidth + bleed;
  }

  overlapsExisting(candidate, extra = []) {
    if (!candidate.outlineWorld) {
      return false;
    }
    for (const hold of this.getCollisionHolds(extra)) {
      if (hold.id === candidate.id) {
        continue;
      }
      if (polygonsIntersect(candidate.outlineWorld, hold.outlineWorld, CONFIG.themeHoldCollisionPadding)) {
        return true;
      }
    }
    return false;
  }

  isCandidateClear(candidate, extra = []) {
    return this.isInsideWallBounds(candidate) && !this.overlapsExisting(candidate, extra);
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
      if (this.isHoldReachable(previousHold, hold, band.min, band.max) && this.isCandidateClear(hold)) {
        hold.powerUp = this.choosePowerUp(sequence);
        return hold;
      }
    }

    const safeDistance = clamp(140 + Math.min(sequence, 35) * 1.6, band.min, Math.min(band.max, 220));
    const verticalGap = Math.min(safeDistance * 0.88, band.verticalMax);
    const horizontal = Math.sqrt(Math.max(0, safeDistance * safeDistance - verticalGap * verticalGap));
    const direction = previousHold.x > CONFIG.logicalWidth / 2 ? -1 : 1;
    const x = clamp(previousHold.x + direction * horizontal, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding);
    const y = previousHold.y - verticalGap;
    for (let attempt = 0; attempt < 32; attempt += 1) {
      const jitterX = attempt === 0 ? 0 : lerp(-36, 36, Math.random());
      const hold = this.createRouteHold(
        clamp(x + jitterX, CONFIG.wallPadding, CONFIG.logicalWidth - CONFIG.wallPadding),
        y - attempt * 4,
        sequence
      );
      if (this.isCandidateClear(hold)) {
        hold.powerUp = this.choosePowerUp(sequence);
        return hold;
      }
    }
    const fallback = this.createRouteHold(x, y, sequence);
    fallback.powerUp = this.choosePowerUp(sequence);
    return fallback;
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
          if (this.isCandidateClear(hold, created)) {
            this.supportHolds.push(hold);
            created.push(hold);
            break;
          }
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
    this.chargeBendSigns = null; // 蓄力期间锁定的四肢弯向（charge=0 捕获，离开蓄力作废）
    this.limbBendSigns = { leftArm: null, rightArm: null, leftLeg: null, rightLeg: null }; // 非蓄力态弯向迟滞锁定
    this.motion = {};
    this.animTime = 0;
    this.animDuration = 0;
    this.swingPhase = 0;
    this.bodyAngle = 0;
    this.debugLengths = {};
    this.restElapsed = 0;
    this.chalkShakeTimer = 0;
    this.nextChalkShakeHand = "leftHand";
    this.swingHandTimer = 0;
    this.nextSwingHand = "rightHand";
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
    const releasePoint = attempt && attempt.releasePoint ? attempt.releasePoint : target;
    return lerpPoint(current, releasePoint, easeOutCubic(t));
  }

  beginLeadHandContact(targetHold, contactPoint = null) {
    this.animationStage = STATE.LEAD_HAND_CONTACT;
    this.animTime = 0;
    this.animDuration = CONFIG.leadHandContactDuration;
    this.contacts[this.leadHandName] = targetHold.id;
    this.handAims[this.leadHandName] = contactPoint || { x: targetHold.x, y: targetHold.y };
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

  updateReadyRest(deltaTime, currentHold, enableChalkShake, leftHold, rightHold) {
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
      this.motion.idleSwingHand = null;
      this.chalkShakeTimer = 0;
      this.swingHandTimer = 0;
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

    // 进行中的甩手休息：推进并在到期时收回（期间不触发其它闲置动作）
    if (this.motion.idleSwingHand) {
      this.motion.idleSwingTime += deltaTime;
      if (this.motion.idleSwingTime >= CONFIG.swingHandDuration) {
        this.nextSwingHand = this.motion.idleSwingHand === "leftHand" ? "rightHand" : "leftHand";
        this.motion.idleSwingHand = null;
        this.motion.idleSwingTime = 0;
        this.swingHandTimer = 0;
      }
      return;
    }

    // 两者皆无：掏粉袋按原间隔触发；甩手在空闲时段按自身间隔错峰触发（互不重叠）
    this.chalkShakeTimer += deltaTime;
    if (this.chalkShakeTimer >= CONFIG.chalkShakeInterval) {
      const handName = this.pickChalkShakeHand(leftHold, rightHold);
      this.motion.idleShakeHand = handName;
      this.motion.idleShakeTime = 0;
      this.motion.idleShakeStart = { ...this.handAims[handName] };
      return;
    }

    this.swingHandTimer += deltaTime;
    if (this.swingHandTimer >= CONFIG.swingHandInterval) {
      const handName = this.pickSwingHand(leftHold, rightHold);
      this.motion.idleSwingHand = handName;
      this.motion.idleSwingTime = 0;
      this.motion.idleSwingStart = { ...this.handAims[handName] };
      const side = handName === "leftHand" ? -1 : 1;
      const shoulder = add(
        { x: this.worldX, y: this.worldY },
        rotate({ x: side * CONFIG.shoulderWidth / 2, y: -CONFIG.torsoLength / 2 }, this.bodyAngle)
      );
      this.motion.idleSwingAnchor = add(shoulder, rotate({ x: side * 22, y: 42 }, this.bodyAngle));
      this.swingHandTimer = 0;
    }
  }

  pickChalkShakeHand(leftHold, rightHold) {
    // 摸粉袋同样保留较高握点，只解放较低握点的手去摸粉袋；
    // 两只手握同一岩点时，任选一只。
    if (leftHold && rightHold && leftHold.id === rightHold.id) {
      return this.nextChalkShakeHand;
    }
    if (leftHold && rightHold) {
      return leftHold.y >= rightHold.y ? "leftHand" : "rightHand";
    }
    return this.nextChalkShakeHand;
  }

  pickSwingHand(leftHold, rightHold) {
    // 永远保留较高处(y 较小)的握点，只甩较低处(y 较大)握点的手；
    // 两只手握同一岩点时，任选一只甩（另一只可交换/摸粉袋）。
    if (leftHold && rightHold && leftHold.id === rightHold.id) {
      return this.nextSwingHand;
    }
    if (leftHold && rightHold) {
      return leftHold.y >= rightHold.y ? "leftHand" : "rightHand";
    }
    return leftHold ? "leftHand" : "rightHand";
  }

  getSwingHandAim(handName) {
    const rawT = clamp((this.motion.idleSwingTime || 0) / CONFIG.swingHandDuration, 0, 1);
    const start = this.motion.idleSwingStart || this.handAims[handName];
    const anchor = this.motion.idleSwingAnchor || this.handAims[handName];
    const side = handName === "leftHand" ? -1 : 1;
    let target;
    if (rawT < 0.28) {
      // 手从握住点移到肩部下方的悬垂甩动位
      target = lerpPoint(start, anchor, easeInOutCubic(rawT / 0.28));
    } else if (rawT < 0.72) {
      // 在锚点附近来回甩动（钟摆），幅度随时间轻微衰减
      const localT = (rawT - 0.28) / 0.44;
      const swing = Math.sin(localT * Math.PI * 2 * 2.2) * CONFIG.swingHandAmplitude * (1 - localT * 0.35);
      const lift = Math.sin(localT * Math.PI) * 9;
      target = { x: anchor.x + swing * side, y: anchor.y - lift };
    } else {
      // 收回握住点
      const localT = (rawT - 0.72) / 0.28;
      target = lerpPoint(anchor, start, easeInOutCubic(localT));
    }
    return target;
  }

  stopIdleRest() {
    this.motion.idleShakeHand = null;
    this.motion.idleShakeTime = 0;
    this.chalkShakeTimer = 0;
    this.motion.idleSwingHand = null;
    this.motion.idleSwingTime = 0;
    this.swingHandTimer = 0;
  }

  getChalkBagWorldPoint() {
    // 优先使用渲染时缓存的粉袋局部坐标，保证手摸的目标点与实际粉袋位置一致
    const local = this._chalkBagLocal;
    let hangX;
    let hangY;
    if (local) {
      hangX = local.x;
      hangY = local.y + 12; // 袋体中心在锚点下方一点
    } else {
      // 兜底：与渲染方向一致，背面(front=0)右侧、正面(front=1)左侧
      const front = this.frontFacingAmount || 0;
      hangX = lerp(11, -11, front);
      hangY = CONFIG.torsoLength / 2 + 6;
    }
    return add(
      { x: this.worldX, y: this.worldY },
      rotate({ x: hangX, y: hangY }, this.bodyAngle)
    );
  }

  getIdleHandAim(handName) {
    if (this.animationStage !== STATE.READY) {
      return null;
    }
    if (this.motion.idleShakeHand === handName) {
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
    if (this.motion.idleSwingHand === handName) {
      return this.getSwingHandAim(handName);
    }
    return null;
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

  beginFall(reason, targetHold, keepBackFacing = false) {
    const push = reason === "tooStrong" ? 36 : -10;
    const side = targetHold.x >= this.worldX ? 1 : -1;
    this.keepBackFacingDuringFall = keepBackFacing;
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
    if (keepBackFacing) {
      this.updateBackDanglingAims();
    } else {
      this.updateDanglingAims(0);
    }
    this.animationStage = STATE.FALLING;
  }

  updateFall(deltaTime) {
    this.animTime += deltaTime;
    const t = easeInCubic(this.animTime / this.animDuration);
    this.worldX = lerp(this.fallStart.x, this.fallEnd.x, t);
    this.worldY = lerp(this.fallStart.y, this.fallEnd.y, t);
    this.frontFacingAmount = this.keepBackFacingDuringFall ? 0 : easeOutCubic(t);
    this.headDroop = this.frontFacingAmount;
    this.bodyAngle = Math.sin(t * Math.PI) * 0.18;
    if (this.keepBackFacingDuringFall) {
      this.updateBackDanglingAims();
    } else {
      this.updateDanglingAims(this.frontFacingAmount);
    }
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

  beginRetryDescent(targetBody, keepBackFacing = false, limbTargets = null) {
    this.animTime = 0;
    this.animDuration = CONFIG.retryDescentDuration;
    this.motion.retryStart = { x: this.worldX, y: this.worldY };
    this.motion.retryEnd = targetBody;
    this.motion.retryLimbTargets = limbTargets;
    this.keepBackFacingDuringRetry = keepBackFacing;
    this.swingPhase = 0;
    this.frontFacingAmount = keepBackFacing ? 0 : 1;
    this.headDroop = this.frontFacingAmount;
    this.animationStage = STATE.AUTO_DESCEND;
  }

  updateRetryDescent(deltaTime) {
    this.animTime += deltaTime;
    this.swingPhase += deltaTime * 4;
    const rawT = clamp(this.animTime / this.animDuration, 0, 1);
    const t = easeOutCubic(rawT);
    this.worldX = lerp(this.motion.retryStart.x, this.motion.retryEnd.x, t) + Math.sin(this.swingPhase) * 1.2 * (1 - t);
    this.worldY = lerp(this.motion.retryStart.y, this.motion.retryEnd.y, t);
    this.bodyAngle = Math.sin(this.swingPhase) * 0.06 * (1 - t);
    this.frontFacingAmount = this.keepBackFacingDuringRetry ? 0 : 1 - t;
    this.headDroop = this.frontFacingAmount;
    this.updateRetryLimbAims(rawT);
    return rawT >= 1;
  }

  updateRetryLimbAims(rawT) {
    const hang = {
      leftHand: { x: this.worldX - 28, y: this.worldY + 34 },
      rightHand: { x: this.worldX + 28, y: this.worldY + 34 },
      leftFoot: { x: this.worldX - 19, y: this.worldY + 98 },
      rightFoot: { x: this.worldX + 19, y: this.worldY + 98 }
    };
    const reachT = easeInOutCubic(clamp((rawT - 0.38) / 0.62, 0, 1));
    const targets = this.motion.retryLimbTargets || {};
    for (const limb of ["leftHand", "rightHand", "leftFoot", "rightFoot"]) {
      const aim = targets[limb] || hang[limb];
      const value = lerpPoint(hang[limb], aim, reachT);
      if (limb.endsWith("Hand")) {
        this.handAims[limb] = value;
      } else {
        this.footAims[limb] = value;
      }
    }
  }
  updateBackDanglingAims() {
    this.handAims.leftHand = { x: this.worldX - 28, y: this.worldY + 34 };
    this.handAims.rightHand = { x: this.worldX + 28, y: this.worldY + 34 };
    this.footAims.leftFoot = { x: this.worldX - 19, y: this.worldY + 98 };
    this.footAims.rightFoot = { x: this.worldX + 19, y: this.worldY + 98 };
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

class AudioManager {
  constructor(files) {
    this.files = files;
    this.enabled = true;
    this.unlocked = false;
    this.context = null;
    this.buffers = new Map();
    this.reverseBuffers = new Map();
    this.loadingPromises = new Map();
    this.failedSfx = new Set();
    this.loopingSfx = new Map();
    this.sfxFiles = {
      grabSuccess: files.grabSuccess,
      charge: files.charge,
      powerUp: files.powerUp,
      miss: files.miss
    };
    this.grabRankSettings = {
      lucky: { playbackRate: 0.84, volume: 0.75 },
      good: { playbackRate: 1, volume: 0.8 },
      perfect: { playbackRate: 1.18, volume: 0.9 }
    };
    this.bgm = this.createAudio(files.bgm, {
      loop: true,
      volume: 0.07,
      preload: "none"
    });
    this.initContext();
  }

  createAudio(src, options = {}) {
    const audio = new Audio(src);
    audio.loop = Boolean(options.loop);
    audio.volume = options.volume ?? 1;
    audio.preload = options.preload || "auto";
    audio.playsInline = true;
    return audio;
  }

  initContext() {
    if (this.context) {
      return this.context;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      return null;
    }
    try {
      this.context = new AudioContextClass();
    } catch (error) {
      this.context = null;
    }
    return this.context;
  }

  preload() {
    return Promise.all([
      this.preloadSfx("grabSuccess"),
      this.preloadSfx("charge"),
      this.preloadSfx("powerUp"),
      this.preloadSfx("miss")
    ]).then((results) => results.some(Boolean));
  }

  createReversedBuffer(buffer) {
    const context = this.initContext();
    if (!context || !buffer) {
      return null;
    }
    try {
      const reversed = context.createBuffer(buffer.numberOfChannels, buffer.length, buffer.sampleRate);
      for (let channel = 0; channel < buffer.numberOfChannels; channel += 1) {
        const sourceData = buffer.getChannelData(channel);
        const targetData = reversed.getChannelData(channel);
        for (let i = 0, j = sourceData.length - 1; i < sourceData.length; i += 1, j -= 1) {
          targetData[i] = sourceData[j];
        }
      }
      return reversed;
    } catch (error) {
      return null;
    }
  }
  preloadSfx(name) {
    const src = this.sfxFiles[name];
    if (!src || this.buffers.has(name)) {
      return Promise.resolve(this.buffers.has(name));
    }
    if (this.loadingPromises.has(name)) {
      return this.loadingPromises.get(name);
    }
    const context = this.initContext();
    if (!context || !window.fetch) {
      this.failedSfx.add(name);
      return Promise.resolve(false);
    }
    const loadPromise = fetch(src)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Audio load failed: ${response.status}`);
        }
        return response.arrayBuffer();
      })
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => {
        this.buffers.set(name, buffer);
        if (name === "charge") {
          const reversed = this.createReversedBuffer(buffer);
          if (reversed) {
            this.reverseBuffers.set(name, reversed);
          }
        }
        this.failedSfx.delete(name);
        return true;
      })
      .catch(() => {
        this.failedSfx.add(name);
        return false;
      });
    this.loadingPromises.set(name, loadPromise);
    return loadPromise;
  }

  unlock() {
    if (this.unlocked || !this.enabled) {
      return;
    }
    this.unlocked = true;
    const context = this.initContext();
    if (context && context.state === "suspended") {
      context.resume().catch(() => {});
    }
    this.preload();
    this.playBgm();
  }

  setMuted(muted) {
    this.enabled = !muted;
    this.bgm.muted = muted;
    if (muted) {
      this.stopCharge();
      this.bgm.pause();
      return;
    }
    this.unlock();
    this.playBgm();
  }

  playBgm() {
    if (!this.enabled || !this.unlocked) {
      return;
    }
    const playPromise = this.bgm.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  }

  playSfx(name, options = {}) {
    if (!this.enabled || !this.unlocked) {
      return false;
    }
    const context = this.initContext();
    const buffer = this.buffers.get(name);
    if (!context || !buffer) {
      if (!this.failedSfx.has(name)) {
        this.preloadSfx(name);
      }
      return false;
    }
    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.playbackRate.value = options.playbackRate ?? 1;
      gain.gain.value = options.volume ?? 1;
      source.connect(gain);
      gain.connect(context.destination);
      source.onended = () => {
        try {
          source.disconnect();
          gain.disconnect();
        } catch (error) {}
      };
      source.start(0);
      return true;
    } catch (error) {
      return false;
    }
  }

  startLoopSfx(name, options = {}) {
    const mode = options.mode || "forward";
    if (!this.enabled || !this.unlocked) {
      return false;
    }
    const active = this.loopingSfx.get(name);
    if (active && active.mode === mode) {
      return true;
    }
    if (active) {
      this.stopLoopSfx(name);
    }
    const context = this.initContext();
    const buffer = mode === "reverse" && this.reverseBuffers.has(name)
      ? this.reverseBuffers.get(name)
      : this.buffers.get(name);
    if (!context || !buffer) {
      if (!this.failedSfx.has(name)) {
        this.preloadSfx(name);
      }
      return false;
    }
    try {
      const source = context.createBufferSource();
      const gain = context.createGain();
      source.buffer = buffer;
      source.loop = true;
      source.playbackRate.value = options.playbackRate ?? 1;
      gain.gain.value = options.volume ?? 0.665;
      source.connect(gain);
      gain.connect(context.destination);
      source.start(0);
      this.loopingSfx.set(name, { source, gain, mode });
      return true;
    } catch (error) {
      return false;
    }
  }
  stopLoopSfx(name) {
    const active = this.loopingSfx.get(name);
    if (!active) {
      return;
    }
    this.loopingSfx.delete(name);
    try {
      active.source.stop(0);
      active.source.disconnect();
      active.gain.disconnect();
    } catch (error) {}
  }

  playCharge(direction = 1) {
    return this.startLoopSfx("charge", {
      mode: direction < 0 ? "reverse" : "forward",
      playbackRate: 1,
      volume: 0.665
    });
  }
  stopCharge() {
    this.stopLoopSfx("charge");
  }
  playMiss() {
    this.playSfx("miss", {
      playbackRate: 1,
      volume: 0.9
    });
  }

  playPowerUp() {
    this.playSfx("powerUp", {
      playbackRate: 1,
      volume: 0.85
    });
  }

  playGrabRank(rank, comboCount = 0) {
    const normalizedRank = rank === "precise" ? "perfect" : rank === "risky" ? "lucky" : rank;
    const base = this.grabRankSettings[normalizedRank] || this.grabRankSettings.good;
    const comboPitchBonus = Math.min(Math.max(comboCount || 0, 0), 6) * 0.04;
    const playbackRate = Math.min(1.35, base.playbackRate + comboPitchBonus);
    this.playSfx("grabSuccess", {
      playbackRate,
      volume: base.volume
    });
    this.playPerfectAccent(normalizedRank, comboCount);
  }

  playPerfectAccent(rank, comboCount = 0) {
    // Future hook: layer a short ding over perfect or high-combo grabs.
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
    this.holdAssets = new HoldAssetManager(HOLD_THEME_ASSET_SETS);
    this.generator = new HoldGenerator(this.holdAssets);
    this.playerAssets = new PlayerAssetManager(PLAYER_ASSET_FILES);
    this.outfitAssetCache = new Map();
    this.uiIconAssets = this.loadUiIconAssets();
    this.feedbackAssets = this.loadFeedbackAssets();
    this.figmaUiAssets = this.loadFigmaUiAssets();
    this.audio = new AudioManager(AUDIO_FILES);
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

  loadImageAssetMap(files) {
    const assets = {};
    for (const [name, src] of Object.entries(files)) {
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

  loadFigmaUiAssets() {
    return this.loadImageAssetMap(FIGMA_UI_ASSET_FILES);
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
      ...Object.values(this.playerAssets.assets),
      ...Object.values(this.uiIconAssets),
      ...Object.values(this.feedbackAssets),
      ...Object.values(this.figmaUiAssets)
    ];
    const tasks = [
      () => this.holdAssets.readyPromise,
      ...imageAssets.map((asset) => () => waitForImageAsset(asset))
    ];
    this.loadingTotal = Math.max(1, tasks.length);
    this.loadingLoaded = 0;
    this.loadingProgress = 0;

    const TASK_TIMEOUT = 8000;
    const promises = tasks.map((task) => Promise.race([
      task().catch(() => false),
      new Promise((resolve) => setTimeout(() => resolve(false), TASK_TIMEOUT))
    ]).then((loaded) => {
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

    // 全局安全网：无论哪个 task 意外挂起，最多 12 秒后强制进入游戏
    setTimeout(() => {
      if (this.loading || this.state === STATE.LOADING) {
        console.warn("[preload] Safety timeout reached, forcing entry");
        this.loadingProgress = 1;
        this.loading = false;
        this.loadingMessage = "加载完成";
        this.enterStartScreen();
        this.lastTime = performance.now();
      }
    }, 12000);
  }

  resetGame(options = {}) {
    this.state = STATE.RESTARTING;
    if (options.switchTheme) {
      this.holdAssets.selectRandomTheme(true);
    }
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
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
    this.livesRemaining = CONFIG.maxLives;
    this.recoveringFromMiss = false;
    this.tutorialDismissed = false;
    this.tutorialPhase = "hold";
    this.tutorialTargetCharge = 0.62;
    this.tutorialEarlyRelease = false;
    this.tutorialCompletionPending = false;
    this.tutorialCompleteTime = 0;
    this.tutorialCompleteDuration = 6;
    this.roundElapsed = 0;
    this.finalRoundDuration = 0;
    this.gameOverStage = "summary";
    this.failureReason = "";
    this.roundEnded = false;
    this.newBest = false;
    this.lastAttempt = null;
    this.animationResult = null;
    this.pendingAttempt = null;
    this.pendingRestHand = null;
    this.startDemoPhase = "rest";
    this.startDemoTimer = 0;
    this.startDemoRestDuration = 0.46;
    this.startDemoMoveDuration = 0.74;
    this.startDemoChargeDuration = 0.56;
    this.startDemoChargeTarget = 0.62;
    this.startDemoAttempt = null;
    this.startDemoActionType = "far";
    this.currentIndex = 0;
    this.player.reset(CONFIG.logicalWidth / 2, 760);
    this.routeHolds = this.generator.generateInitialHolds(CONFIG.logicalWidth / 2, 760);
    this.currentHold = this.routeHolds[0];
    this.targetHold = this.routeHolds[1];
    this.tutorialTargetCharge = this.calculateTutorialTargetCharge();
    this.previousHold = null;
    this.settlePlayerPose(null, "far");
    this.camera.snapToPlayer(this.player);
    this.state = STATE.READY;
  }

  enterStartScreen() {
    this.resetGame();
    this.uiPanel = null;
    this.charge = 0;
    this.poseCharge = 0;
    this.prepareStartDemoClimb();
    this.state = STATE.START;
    if (this.audio) {
      this.audio.playBgm();
    }
  }

  startGame() {
    this.resetGame();
  }

  prepareStartDemoClimb() {
    this.startDemoPhase = "rest";
    this.startDemoTimer = 0;
    this.startDemoRestDuration = 0.46;
    this.startDemoMoveDuration = 0.74;
    this.startDemoChargeDuration = 0.56;
    this.startDemoChargeTarget = 0.62;
    this.startDemoAttempt = null;
    this.startDemoActionType = "far";
    this.generator.ensureHoldBuffer(this.currentIndex);
    this.settlePlayerPose(null, "far");
    this.snapStartDemoCameraToPlayer();
  }

  getStartDemoCameraY(worldY) {
    return worldY - CONFIG.startDemoPlayerScreenY;
  }

  snapStartDemoCameraToPlayer() {
    this.camera.y = this.getStartDemoCameraY(this.player.worldY);
    this.camera.startY = this.camera.y;
    this.camera.targetY = this.camera.y;
    this.camera.elapsed = 0;
    this.camera.active = false;
  }

  beginStartDemoCameraFollow(worldY, duration = CONFIG.cameraFollowDuration) {
    this.camera.startY = this.camera.y;
    this.camera.targetY = this.getStartDemoCameraY(worldY);
    this.camera.elapsed = 0;
    this.camera.duration = duration;
    this.camera.active = Math.abs(this.camera.targetY - this.camera.startY) > 0.5;
  }

  updateStartDemoClimb(deltaTime) {
    if (!this.currentHold || !this.targetHold) {
      this.prepareStartDemoClimb();
      return;
    }

    if (this.startDemoPhase === "charge") {
      this.startDemoTimer += deltaTime;
      const t = clamp(this.startDemoTimer / this.startDemoChargeDuration, 0, 1);
      this.charge = this.startDemoChargeTarget * easeOutCubic(t);
      this.poseCharge = Math.max(this.poseCharge, this.charge);
      this.player.applyChargePose(this.currentHold, this.targetHold, this.charge);
      if (t >= 1) {
        this.startDemoAttempt = this.createStartDemoAttempt();
        this.startDemoActionType = this.startDemoAttempt.actionType;
        this.player.beginRelease();
        this.startDemoPhase = "release";
        this.startDemoTimer = 0;
      }
      return;
    }

    if (this.startDemoPhase === "release") {
      if (this.player.updateTimed(deltaTime) >= 1) {
        this.player.beginLaunch(this.currentHold, this.targetHold, this.startDemoAttempt, this.startDemoActionType);
        this.player.animDuration = CONFIG.launchDuration * 1.35;
        this.startDemoPhase = "launch";
      }
      return;
    }

    if (this.startDemoPhase === "launch") {
      if (this.player.updateLaunch(deltaTime)) {
        this.player.beginLeadHandContact(this.targetHold, this.startDemoAttempt.releasePoint);
        this.startDemoPhase = "contact";
      }
      return;
    }

    if (this.startDemoPhase === "contact") {
      if (this.player.updateTimed(deltaTime) >= 1) {
        this.advanceStartDemoHold();
      }
      return;
    }

    if (this.startDemoPhase === "bodyFollow") {
      this.updateCameraDuringClimb(deltaTime);
      if (this.player.updateBodyFollow(deltaTime)) {
        if (this.player.motion.feetSyncActive) {
          this.player.finishFeetReposition();
        }
        this.settlePlayerPose(this.previousHold, this.startDemoActionType);
        this.player.switchActiveHand();
        this.player.animationStage = STATE.READY;
        this.completeStartDemoCameraFollowImmediately();
        this.startDemoPhase = "rest";
        this.startDemoTimer = 0;
        this.charge = 0;
      }
      return;
    }

    this.player.updateReadyRest(deltaTime, this.currentHold, false, this.generator.getHoldById(this.player.contacts.leftHand), this.generator.getHoldById(this.player.contacts.rightHand));
    this.startDemoTimer += deltaTime;
    if (this.startDemoTimer >= this.startDemoRestDuration) {
      this.beginStartDemoStep();
    }
  }

  createStartDemoAttempt() {
    const targetDistance = distance(this.currentHold, this.targetHold);
    const grabRadius = this.getTargetGrabRadius();
    const actionType = targetDistance <= CONFIG.nearMoveThreshold ? "near" : "far";
    return {
      result: "success",
      targetDistance,
      actualReach: targetDistance,
      releasePoint: { x: this.targetHold.x, y: this.targetHold.y },
      grabDistance: 0,
      grabRadius,
      accuracyRatio: 0,
      accuracyTier: "precise",
      actionType,
      magnetBoosted: false,
      magnifierBoosted: false,
      handSwitched: false,
      scoreConfirmed: true
    };
  }

  beginStartDemoStep() {
    if (!this.targetHold) {
      this.prepareStartDemoClimb();
      return;
    }
    const d = distance(this.currentHold, this.targetHold);
    this.startDemoChargeTarget = clamp(
      (d - CONFIG.minReachDistance) / Math.max(1, CONFIG.maxReachDistance - CONFIG.minReachDistance),
      0.38,
      0.82
    );
    this.startDemoPhase = "charge";
    this.startDemoTimer = 0;
    this.poseCharge = 0;
    this.player.stopIdleRest();
  }

  advanceStartDemoHold() {
    const oldHold = this.currentHold;
    const nextHold = this.targetHold;
    this.previousHold = oldHold;
    oldHold.state = "grabbed";
    nextHold.state = "current";
    this.currentIndex += 1;
    this.currentHold = nextHold;
    this.generator.ensureHoldBuffer(this.currentIndex);
    this.routeHolds = this.generator.routeHolds;
    this.targetHold = this.routeHolds[this.currentIndex + 1];
    if (this.targetHold) {
      this.targetHold.state = "target";
    }
    this.holdCount += 1;
    this.climbHeight = this.calculateClimbHeightFromCurrentHold();
    const neutral = this.player.getNeutralBodyForHold(this.currentHold);
    const feet = this.chooseFeetSupportsForBody("front", neutral);
    this.player.beginBodyFollow(this.currentHold, feet.leftFoot, feet.rightFoot);
    this.player.animDuration = this.startDemoMoveDuration;
    this.beginStartDemoCameraFollow(neutral.y, this.startDemoMoveDuration);
    this.startDemoPhase = "bodyFollow";
    this.startDemoTimer = 0;
  }

  completeStartDemoCameraFollowImmediately() {
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
    if (this.tutorialCompleteTime > 0) {
      this.tutorialCompleteTime = Math.max(0, this.tutorialCompleteTime - deltaTime);
    }
    this.updatePowerUps(deltaTime);

    if (this.loading || this.state === STATE.LOADING) {
      return;
    }

    if (!this.roundEnded && this.state !== STATE.START) {
      this.roundElapsed += deltaTime;
    }

    if (this.state === STATE.START) {
      this.updateStartDemoClimb(deltaTime);
      return;
    }

    if (this.state === STATE.READY) {
      this.player.updateReadyRest(deltaTime, this.currentHold, this.holdCount > 0, this.generator.getHoldById(this.player.contacts.leftHand), this.generator.getHoldById(this.player.contacts.rightHand));
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
          this.player.beginLeadHandContact(this.targetHold, this.animationResult.releasePoint);
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
        if (this.recoveringFromMiss) {
          const recoveryBody = this.player.getNeutralBodyForHold(this.currentHold);
          this.player.beginRetryDescent(recoveryBody, true, this.getMissRecoveryLimbTargets(recoveryBody));
        } else {
          this.player.beginAutoBelayDescent();
        }
        this.state = STATE.AUTO_DESCEND;
      }
    } else if (this.state === STATE.AUTO_DESCEND) {
      if (this.recoveringFromMiss) {
        if (this.player.updateRetryDescent(deltaTime)) {
          this.finishMissRecovery();
        }
      } else if (this.player.updateAutoBelayDescent(deltaTime, this.camera.y)) {
        this.finalizeGameOver();
        this.gameOverStage = "ranking";
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
    if (this.state === STATE.GAME_OVER || this.roundEnded) {
      if (this.gameOverStage === "summary") {
        this.gameOverStage = "ranking";
      }
      this.state = STATE.GAME_OVER;
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
      this.resetGame({ switchTheme: true });
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
    if (id === "gameover-restart") {
      this.resetGame({ switchTheme: true });
      return;
    }
    if (id === "gameover-close") {
      this.resetGame({ switchTheme: true });
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
    const isTutorialCharge = this.holdCount === 0 && !this.tutorialDismissed;
    if (isTutorialCharge) {
      this.tutorialPhase = "charging";
      this.tutorialEarlyRelease = false;
    } else {
      this.tutorialDismissed = true;
      this.tutorialPhase = "done";
    }
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
    this.player.stopIdleRest();
    this.player.applyChargePose(this.currentHold, this.targetHold, this.charge);
    this.audio.playCharge(this.chargeDirection);
    this.state = STATE.CHARGING;
  }
  updateCharge(deltaTime) {
    const isTutorialCharge = this.holdCount === 0 && !this.tutorialDismissed;
    if (isTutorialCharge) {
      if (this.tutorialPhase === "release") {
        this.charge = this.tutorialTargetCharge;
        this.poseCharge = Math.max(this.poseCharge, this.charge);
        return;
      }
      this.charge = Math.min(
        this.tutorialTargetCharge,
        this.charge + deltaTime / CONFIG.chargeDuration
      );
      this.poseCharge = Math.max(this.poseCharge, this.charge);
      if (this.charge >= this.tutorialTargetCharge - 0.0001) {
        this.charge = this.tutorialTargetCharge;
        this.chargeDirection = 0;
        this.tutorialPhase = "release";
        this.audio.stopCharge();
        if (navigator.vibrate) {
          navigator.vibrate(24);
        }
      }
      return;
    }
    const previousDirection = this.chargeDirection;
    this.charge += this.chargeDirection * (deltaTime / CONFIG.chargeDuration);
    if (this.charge >= 1) {
      this.charge = 2 - this.charge;
      this.chargeDirection = -1;
    } else if (this.charge <= 0) {
      this.charge = -this.charge;
      this.chargeDirection = 1;
    }
    if (this.chargeDirection !== previousDirection) {
      this.audio.playCharge(this.chargeDirection);
    }
    this.charge = clamp(this.charge, 0, 1);
    this.poseCharge = Math.max(this.poseCharge, this.charge);
  }
  handlePressEnd() {
    if (this.state !== STATE.CHARGING) {
      return;
    }
    if (this.holdCount === 0 && !this.tutorialDismissed && this.tutorialPhase !== "release") {
      this.tutorialEarlyRelease = true;
      this.resetTutorialCharge();
      return;
    }
    this.audio.stopCharge();
    if (this.holdCount === 0 && !this.tutorialDismissed) {
      this.tutorialCompletionPending = true;
      this.tutorialDismissed = true;
      this.tutorialPhase = "done";
    }
    this.startAttempt();
  }

  handlePressCancel() {
    if (this.state === STATE.CHARGING) {
      if (this.holdCount === 0 && !this.tutorialDismissed) {
        this.resetTutorialCharge();
        return;
      }
      this.audio.stopCharge();
      this.charge = 0;
      this.chargeDirection = 1;
      this.poseCharge = 0;
      this.player.stopIdleRest();
      this.player.worldX = this.player.neutralX;
      this.player.worldY = this.player.neutralY;
      this.player.bodyAngle = 0;
      this.state = STATE.READY;
    }
  }

  resetTutorialCharge() {
    this.audio.stopCharge();
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
    this.tutorialPhase = "hold";
    this.player.stopIdleRest();
    this.player.worldX = this.player.neutralX;
    this.player.worldY = this.player.neutralY;
    this.player.bodyAngle = 0;
    this.state = STATE.READY;
  }

  calculateTutorialTargetCharge() {
    if (!this.currentHold || !this.targetHold) {
      return 0.62;
    }
    const targetDistance = distance(this.currentHold, this.targetHold);
    const reachRange = CONFIG.maxReachDistance - CONFIG.minReachDistance;
    return clamp((targetDistance - CONFIG.minReachDistance) / reachRange, 0.08, 0.92);
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
    this.audio.playPowerUp();
    this.showToast(`${POWER_UPS[type].label}生效 ${duration} 秒`);
  }

  hasActivePowerUp() {
    return Boolean(this.powerUps && (this.powerUps.magnet > 0 || this.powerUps.magnifier > 0));
  }

  calculateClimbHeightFromCurrentHold() {
    return Math.max(0, this.player.startWorldY - (this.currentHold.y + CONFIG.playerBodyOffsetY));
  }

  getTargetGrabRadius() {
    if (!this.targetHold) {
      return 0;
    }
    const targetScale = this.powerUps.magnifier > 0 ? 1.5 : 1;
    return (this.getHoldVisualRadius(this.targetHold) + CONFIG.targetGrabRingPadding) * 1.04 * targetScale + 3 + CONFIG.handRadius;
  }

  calculateReleasePoint(actualReach) {
    const direction = normalize(subtract(this.targetHold, this.currentHold));
    return add(this.currentHold, scale(direction, actualReach));
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
    const releasePoint = this.calculateReleasePoint(actualReach);
    const grabDistance = distance(releasePoint, this.targetHold);
    const grabRadius = this.getTargetGrabRadius();
    const accuracyRatio = Math.min(1, grabDistance / Math.max(grabRadius, 1));
    const accuracyTier = this.getAccuracyTier(accuracyRatio);
    let result = "success";
    if (grabDistance > grabRadius) {
      result = distanceError < 0 ? "tooWeak" : "tooStrong";
    }
    return {
      result,
      actualReach,
      targetDistance,
      distanceError,
      reachTolerance,
      releasePoint,
      grabDistance,
      grabRadius,
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
    this.audio.playGrabRank(this.feedback.tier, this.feedback.combo);
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
    if (this.tutorialCompletionPending) {
      this.tutorialCompletionPending = false;
      this.tutorialCompleteTime = this.tutorialCompleteDuration;
    }
    if (grabbedPowerUp) {
      this.activatePowerUp(grabbedPowerUp);
    }
    const feet = this.chooseFeetSupportsForBody("front", this.player.getNeutralBodyForHold(this.currentHold));
    this.player.beginBodyFollow(this.currentHold, feet.leftFoot, feet.rightFoot);
    this.camera.beginFollowToWorldY(this.player.getNeutralBodyForHold(this.currentHold).y);
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
    this.state = STATE.BODY_FOLLOW;
  }

  handleFailedGrab(result) {
    this.tutorialCompletionPending = false;
    this.audio.playMiss();
    this.failureReason = result === "tooStrong" ? "力量过大" : "力量不足";
    this.preciseCombo = 0;
    this.livesRemaining = Math.max(0, this.livesRemaining - 1);
    this.recoveringFromMiss = this.livesRemaining > 0;
    if (!this.recoveringFromMiss) {
      this.finalizeRoundScore();
    } else {
      this.showToast(`没抓住，还剩 ${this.livesRemaining} 次机会`);
    }
    this.player.beginFall(result, this.targetHold, this.recoveringFromMiss);
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
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

  getMissRecoveryLimbTargets(bodyPosition) {
    const actionType = this.pendingAttempt ? this.pendingAttempt.actionType : "far";
    const lead = this.player.leadHandName;
    const trailing = this.player.trailingHandName;
    const targets = {
      leftHand: { x: this.currentHold.x, y: this.currentHold.y },
      rightHand: { x: this.currentHold.x, y: this.currentHold.y }
    };
    if (actionType === "near" && this.previousHold) {
      targets[lead] = { x: this.currentHold.x, y: this.currentHold.y };
      targets[trailing] = { x: this.previousHold.x, y: this.previousHold.y };
    }
    const feet = this.chooseFeetSupportsForBody("front", bodyPosition);
    targets.leftFoot = feet.leftFoot
      ? { x: feet.leftFoot.x, y: feet.leftFoot.y }
      : { x: bodyPosition.x - 18, y: bodyPosition.y + 98 };
    targets.rightFoot = feet.rightFoot
      ? { x: feet.rightFoot.x, y: feet.rightFoot.y }
      : { x: bodyPosition.x + 18, y: bodyPosition.y + 98 };
    return targets;
  }
  finishMissRecovery() {
    this.recoveringFromMiss = false;
    this.tutorialDismissed = true;
    this.failureReason = "";
    const actionType = this.pendingAttempt ? this.pendingAttempt.actionType : "far";
    this.animationResult = null;
    this.pendingAttempt = null;
    this.pendingRestHand = null;
    this.charge = 0;
    this.chargeDirection = 1;
    this.poseCharge = 0;
    this.settlePlayerPose(this.previousHold, actionType);
    this.camera.beginFollowToWorldY(this.player.getNeutralBodyForHold(this.currentHold).y);
    if (this.camera.active) {
      this.state = STATE.CAMERA_FOLLOW;
    } else {
      this.state = STATE.READY;
    }
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
    this.finalRoundDuration = this.roundElapsed;
    this.gameOverStage = "summary";
    this.newBest = this.scoreManager.saveBestScore({
      holds: this.holdCount,
      height: this.climbHeight,
      score: this.score,
      duration: this.finalRoundDuration
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
      const shouldUseHandAim = limbName.endsWith("Hand")
        && [STATE.LEAD_HAND_CONTACT, STATE.BODY_FOLLOW].includes(this.state)
        && this.player.handAims[limbName];
      return shouldUseHandAim ? this.player.handAims[limbName] : { x: hold.x, y: hold.y };
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
    // 蓄力态（游戏蓄力 + 开始页自动演示蓄力）锁定每条四肢的弯向，
    // 避免 IK 弯向随身体 2D 移动跨过 90° 而翻转，导致肩/髋关节中途翻面、反复开合。
    // 弯向在蓄力起点(charge≈0)捕获一次，整段蓄力保持，离开蓄力即作废。
    const isChargingPose = this.state === STATE.CHARGING || this.startDemoPhase === "charge";
    let chargeBendSigns = null;
    if (isChargingPose) {
      if (!this.player.chargeBendSigns) {
        this.player.chargeBendSigns = {
          leftArm: solveTwoBoneIK(anchors.leftShoulder, leftHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: -1, y: 0.35 }).bendSign,
          rightArm: solveTwoBoneIK(anchors.rightShoulder, rightHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: 1, y: 0.35 }).bendSign,
          leftLeg: solveTwoBoneIK(anchors.leftHip, leftFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: -1, y: 0.15 }).bendSign,
          rightLeg: solveTwoBoneIK(anchors.rightHip, rightFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: 1, y: 0.15 }).bendSign
        };
      }
      chargeBendSigns = this.player.chargeBendSigns;
    } else {
      this.player.chargeBendSigns = null;
    }
    const deadband = CONFIG.bendSignDeadband;
    const lb = this.player.limbBendSigns;
    const leftArmSign = isChargingPose ? chargeBendSigns.leftArm : chooseBendSign(anchors.leftShoulder, leftHandTarget, { x: -1, y: 0.35 }, lb.leftArm, deadband);
    const rightArmSign = isChargingPose ? chargeBendSigns.rightArm : chooseBendSign(anchors.rightShoulder, rightHandTarget, { x: 1, y: 0.35 }, lb.rightArm, deadband);
    const leftLegSign = isChargingPose ? chargeBendSigns.leftLeg : chooseBendSign(anchors.leftHip, leftFootTarget, { x: -1, y: 0.15 }, lb.leftLeg, deadband);
    const rightLegSign = isChargingPose ? chargeBendSigns.rightLeg : chooseBendSign(anchors.rightHip, rightFootTarget, { x: 1, y: 0.15 }, lb.rightLeg, deadband);
    if (isChargingPose) {
      lb.leftArm = chargeBendSigns.leftArm;
      lb.rightArm = chargeBendSigns.rightArm;
      lb.leftLeg = chargeBendSigns.leftLeg;
      lb.rightLeg = chargeBendSigns.rightLeg;
    } else {
      lb.leftArm = leftArmSign;
      lb.rightArm = rightArmSign;
      lb.leftLeg = leftLegSign;
      lb.rightLeg = rightLegSign;
    }
    const leftArm = solveTwoBoneIK(anchors.leftShoulder, leftHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: -1, y: 0.35 }, leftArmSign);
    const rightArm = solveTwoBoneIK(anchors.rightShoulder, rightHandTarget, CONFIG.upperArmLength, CONFIG.forearmLength, { x: 1, y: 0.35 }, rightArmSign);
    const leftLeg = solveTwoBoneIK(anchors.leftHip, leftFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: -1, y: 0.15 }, leftLegSign);
    const rightLeg = solveTwoBoneIK(anchors.rightHip, rightFootTarget, CONFIG.thighLength, CONFIG.shinLength, { x: 1, y: 0.15 }, rightLegSign);
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
    if (this.state !== STATE.START) {
      this.drawPowerUpIcons(ctx);
    }
    if (this.state === STATE.START) {
      this.drawStartScreen(ctx);
    } else {
      this.drawHud(ctx);
      if (this.state === STATE.GAME_OVER || this.roundEnded) {
        this.drawGameOver(ctx);
      } else if (
        this.holdCount === 0
        && [STATE.READY, STATE.CHARGING].includes(this.state)
        && !this.tutorialDismissed
      ) {
        this.drawStartHint(ctx);
      }
      if (!this.roundEnded && this.state !== STATE.GAME_OVER && this.feedback) {
        this.drawAccuracyFeedback(ctx);
      }
    }
    if (this.state !== STATE.GAME_OVER && !this.roundEnded) {
      this.drawPowerUpAura(ctx);
    }
    if (this.state !== STATE.GAME_OVER && !this.roundEnded) {
      this.drawUiControls(ctx);
    }
    if (this.state !== STATE.GAME_OVER && !this.roundEnded && this.tutorialCompleteTime > 0 && !this.uiPanel) {
      this.drawTutorialComplete(ctx);
    }
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

    const titleAsset = this.figmaUiAssets && this.figmaUiAssets.coverTitle;
    if (!this.drawImageAssetContain(ctx, titleAsset, 57, 120, 261, 261)) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 0.98)";
      ctx.font = "900 42px Arial, Helvetica, sans-serif";
      ctx.lineWidth = 7;
      ctx.strokeStyle = "rgba(52, 154, 180, 0.42)";
      ctx.strokeText("攀了个岩", CONFIG.logicalWidth / 2, 250);
      ctx.fillText("攀了个岩", CONFIG.logicalWidth / 2, 250);
    }

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

  getWallTheme() {
    const themeId = this.holdAssets && this.holdAssets.currentThemeId;
    if (themeId === "theme04") {
      return {
        ...THEME.wall,
        base: "#d1ebe8",
        light: "#c7d9e9",
        mid: "#bfcbd2",
        blue: "#80a8bf",
        deepBlue: "#d1ebe8",
        pink: "#8dded8",
        seam: "rgba(77, 112, 128, 0.18)",
        bolt: "rgba(76, 111, 128, 0.23)",
        boltHighlight: "rgba(255, 255, 255, 0.55)",
        texture: "rgba(74, 108, 126, 0.065)"
      };
    }
    if (themeId === "theme05" || themeId === "theme06") {
      return {
        ...THEME.wall,
        base: "#fbf8ef",
        light: "#fffaf0",
        mid: "#f2ead4",
        blue: "#f3dfa6",
        deepBlue: "#fff8ea",
        pink: "#d4bde9",
        seam: "rgba(196, 166, 96, 0.18)",
        bolt: "rgba(177, 148, 91, 0.24)",
        boltHighlight: "rgba(255, 255, 255, 0.60)",
        texture: "rgba(170, 139, 78, 0.06)"
      };
    }
    return {
      ...THEME.wall,
      boltHighlight: "rgba(255, 255, 255, 0.58)",
      texture: "rgba(86, 136, 154, 0.10)"
    };
  }
  drawWall(ctx) {
    const wallTheme = this.getWallTheme();
    ctx.fillStyle = wallTheme.base;
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    this.drawWallPanels(ctx, wallTheme);
    this.drawWallBoltHoles(ctx, wallTheme);
    this.drawWallTexture(ctx, wallTheme);
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

  drawWallPanels(ctx, wallTheme = this.getWallTheme()) {
    const segmentHeight = 520;
    const startIndex = Math.floor(this.camera.y / segmentHeight) - 2;
    const endIndex = Math.floor((this.camera.y + CONFIG.logicalHeight) / segmentHeight) + 2;
    for (let index = startIndex; index <= endIndex; index += 1) {
      const worldTop = index * segmentHeight;
      const y = worldTop - this.camera.y;
      const flip = index % 2 === 0 ? 1 : -1;
      const shift = (hashUnit(index) - 0.5) * 42;

      ctx.fillStyle = index % 3 === 0 ? wallTheme.light : wallTheme.mid;
      ctx.beginPath();
      ctx.moveTo(0, y + 10);
      ctx.lineTo(CONFIG.logicalWidth, y - 28);
      ctx.lineTo(CONFIG.logicalWidth, y + segmentHeight * 0.58);
      ctx.lineTo(0, y + segmentHeight * 0.92);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = wallTheme.blue;
      ctx.beginPath();
      ctx.moveTo(flip > 0 ? -60 : CONFIG.logicalWidth + 60, y + 40);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.34 : 0.66) + shift, y + segmentHeight * 0.08);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.16 : 0.84) + shift * 0.3, y + segmentHeight * 0.76);
      ctx.lineTo(flip > 0 ? -36 : CONFIG.logicalWidth + 36, y + segmentHeight * 0.52);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = index % 4 === 0 ? wallTheme.deepBlue : wallTheme.light;
      ctx.beginPath();
      ctx.moveTo(CONFIG.logicalWidth * (flip > 0 ? 0.74 : 0.26) + shift, y - 16);
      ctx.lineTo(CONFIG.logicalWidth + (flip > 0 ? 48 : -48), y + segmentHeight * 0.22);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.88 : 0.12), y + segmentHeight * 0.62);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.50 : 0.50) + shift * 0.2, y + segmentHeight * 0.35);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = wallTheme.seam;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + segmentHeight * 0.92);
      ctx.lineTo(CONFIG.logicalWidth, y + segmentHeight * 0.58);
      ctx.stroke();

      ctx.strokeStyle = wallTheme.pink;
      ctx.lineWidth = 7;
      ctx.globalAlpha = 0.62;
      ctx.beginPath();
      ctx.moveTo(flip > 0 ? -20 : CONFIG.logicalWidth + 20, y + segmentHeight * 0.92);
      ctx.lineTo(CONFIG.logicalWidth * (flip > 0 ? 0.82 : 0.18), y + segmentHeight * 0.60);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  drawWallBoltHoles(ctx, wallTheme = this.getWallTheme()) {
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
        ctx.fillStyle = wallTheme.bolt || "rgba(130, 160, 172, 0.26)";
        ctx.beginPath();
        ctx.arc(x, y + jitterY, 2.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = wallTheme.boltHighlight || "rgba(255, 255, 255, 0.58)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
  }

  drawWallTexture(ctx, wallTheme = this.getWallTheme()) {
    ctx.fillStyle = wallTheme.texture || "rgba(86, 136, 154, 0.10)";
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
    let imageWidth = Math.max(18, hold.radius * 2);
    let imageHeight = imageWidth;
    let imageDrawX = -imageWidth / 2;
    let imageDrawY = -imageHeight / 2;
    if (assetReady) {
      imageWidth = asset.imageDraw.width;
      imageHeight = asset.imageDraw.height;
      imageDrawX = asset.imageDraw.x;
      imageDrawY = asset.imageDraw.y;
    }
    return {
      radius: assetReady ? hold.radius : this.getVectorHoldRadius(hold),
      shape: HOLD_SHAPES[hashNumber(hold.id) % HOLD_SHAPES.length],
      color,
      angle: hold.rotation ?? ((hashUnit(hold.id + 23) - 0.5) * Math.PI * 0.8),
      asset,
      assetReady,
      imageWidth,
      imageHeight,
      imageDrawX,
      imageDrawY
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
    ctx.globalAlpha *= options.alpha ?? 1;
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
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
    }
    ctx.shadowOffsetY = isContact || hold.state === "target" ? 2 : 0;
    ctx.drawImage(
      visual.asset.image,
      visual.imageDrawX,
      visual.imageDrawY,
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
      this.drawHold(ctx, hold, isContact, {
        useRouteAsset: hold.isFootRoute,
        alpha: isContact ? 1 : 0.4
      });
    }
  }

  drawRouteHolds(ctx) {
    const contactIds = this.getProtectedHoldIds();
    for (const hold of this.routeHolds) {
      const isImportant = contactIds.has(hold.id);
      this.drawHold(ctx, hold, isImportant, {
        alpha: isImportant ? 1 : 0.4
      });
    }
  }
  drawPowerUpIcons(ctx) {
    for (const hold of this.routeHolds) {
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
    const y = screen.y - this.getHoldVisualRadius(hold) - 18;
    const asset = this.figmaUiAssets && this.figmaUiAssets[type];
    if (asset && asset.loaded && !asset.failed && asset.image.complete) {
      const size = 34;
      ctx.save();
      ctx.shadowColor = "rgba(46, 108, 128, 0.24)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.drawImage(asset.image, screen.x - size / 2, y - size / 2, size, size);
      ctx.restore();
      return;
    }
    const color = POWER_UPS[type] ? POWER_UPS[type].color : "#ff3aa9";
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
    const glowPulse = 0.72 + Math.sin(time * 1.35) * 0.16;
    const glowRadius = ringRadius + 20 * targetScale;
    const glow = ctx.createRadialGradient(screen.x, screen.y, ringRadius * 0.42, screen.x, screen.y, glowRadius);
    glow.addColorStop(0, `rgba(255, 239, 118, ${0.18 * glowPulse})`);
    glow.addColorStop(0.48, `rgba(255, 221, 64, ${0.16 * glowPulse})`);
    glow.addColorStop(1, "rgba(255, 221, 64, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255, 222, 74, ${0.28 * glowPulse})`;
    ctx.lineWidth = 8.5;
    ctx.beginPath();
    ctx.arc(screen.x, screen.y, ringRadius + 8, 0, Math.PI * 2);
    ctx.stroke();
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

  // 【贴图原语·图片中心对齐】以图片几何中心为锚点，按 scale 等比缩放绘制。
  // 换图规则：新图必须与旧图画布尺寸相同，且"人物内容在画布中的居中位置一致"，
  // 否则中心会偏。上衣即用此方式，scale = 0.26 * CONFIG.shirtSpriteScale。
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

  // 【贴图原语·指定像素锚点对齐】以图片内的 sourceAnchor(像素坐标) 为锚点缩放绘制。
  // 换图规则：新图需同尺寸，且图内锚点(如腰带扣中心)像素坐标与旧图一致。腰带即用此方式，
  // sourceAnchor={x:150,y:98}，scale = 0.30 * CONFIG.beltSpriteScale。
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

  // 【贴图原语·端点中心对齐】以骨骼端点(如头顶/手/脚)为中心缩放绘制。
  // 换图规则：新图同尺寸 + 人物内容在画布中的居中位置一致即可。
  // 头/发/表情/配饰即用此方式，scale 含 CONFIG.headSpriteScale。
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

  // 【贴图原语·沿骨两点拉伸（换图最严格）】把贴图从 sourceStart→sourceEnd 这段
  // "贴图内骨骼线"拉伸对齐到骨骼实际的 root→end。用于大腿/小腿/上臂/前臂。
  // 换图规则（务必遵守）：新图除同尺寸外，图内"起点锚点(如髋/肩)、终点锚点(如膝/腕)"
  // 的像素坐标必须与旧图完全一致，否则会错位或斜切。
  //   - sourceStart/sourceEnd：贴图里骨骼两端的像素坐标（换图时按新图重新量并同步）
  //   - crossScale：横向(宽度)缩放；为 null 时用等比。裤子部件额外乘 CONFIG.pantsSpriteScale
  //   - lengthExtend：仅拉长贴图长度不改宽度/锚点（大腿膝盖衔接用 CONFIG.thighKneeOverlap）
  drawAnchoredSegmentSprite(ctx, assetName, root, end, sourceStart, sourceEnd, crossScale = null, lengthExtend = 1) {
    if (!this.playerAssets.isReady(assetName)) {
      return false;
    }
    const asset = this.playerAssets.get(assetName);
    const image = this.getOutfitSpriteImage(assetName, asset.image);
    const sourceVector = subtract(sourceEnd, sourceStart);
    const targetVector = subtract(end, root);
    const sourceLength = Math.max(1, Math.hypot(sourceVector.x, sourceVector.y));
    const targetLength = Math.max(1, Math.hypot(targetVector.x, targetVector.y));
    const lengthScale = targetLength / sourceLength * lengthExtend;
    const rawLengthScale = targetLength / sourceLength;
    const isPantsPart = ["leftThigh", "rightThigh", "leftShin", "rightShin"].includes(assetName);
    const pantsWidthMul = isPantsPart ? CONFIG.pantsSpriteScale : 1;
    const baseWidth = crossScale ?? rawLengthScale;
    const widthScale = baseWidth * pantsWidthMul;
    const angle = Math.atan2(targetVector.y, targetVector.x) - Math.atan2(sourceVector.y, sourceVector.x);
    ctx.save();
    ctx.translate(root.x, root.y);
    ctx.rotate(angle);
    ctx.filter = this.getPantsImageFilter(assetName);
    if (widthScale === lengthScale) {
      // 等比缩放，无错切
      ctx.transform(lengthScale, 0, 0, lengthScale, 0, 0);
      ctx.drawImage(image, -sourceStart.x, -sourceStart.y);
    } else {
      // 非等比：沿 source 向量方向缩放长度、垂直方向缩放宽度，
      // 通过旋转进 source 向量坐标系再缩放，避免对角贴图被斜向错切
      const srcAngle = Math.atan2(sourceVector.y, sourceVector.x);
      ctx.rotate(srcAngle);
      ctx.scale(lengthScale, widthScale);
      ctx.rotate(-srcAngle);
      ctx.drawImage(image, -sourceStart.x, -sourceStart.y);
    }
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
    // 掏粉袋动作中，被抬起摸粉袋的那只手需绘制在粉袋/上衣/腿部图层最上方
    const chalkHand = this.player.motion.idleShakeHand || null;
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
      upperLengthExtend: CONFIG.thighKneeOverlap,
      upperCrossScale: 0.284,
      lowerAsset: "rightShin",
      lowerSourceStart: { x: 178, y: 50 },
      lowerSourceEnd: { x: 122, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawLimb(ctx, toScreen(pose.rightShoulder), toScreen(pose.rightArm.joint), toScreen(pose.rightArm.end), THEME.player.skin, 7, {
      upperAsset: "rightUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      upperCrossScale: 0.224,
      lowerAsset: "rightLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 },
      lowerCrossScale: 0.224
    });
    this.drawHand(ctx, toScreen(pose.rightArm.end));
    this.drawClimbingShoe(ctx, toScreen(pose.rightLeg.end), 1, rightKneeScreen);

    this.drawLimb(ctx, leftHipScreen, leftKneeScreen, toScreen(pose.leftLeg.end), THEME.player.skin, 7, {
      upperAsset: "leftThigh",
      upperSourceStart: { x: 92, y: 71 },
      upperSourceEnd: { x: 168.02, y: 210 },
      upperLengthExtend: CONFIG.thighKneeOverlap,
      upperCrossScale: 0.284,
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
      upperCrossScale: 0.224,
      lowerAsset: "leftLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 },
      lowerCrossScale: 0.224
    });
    this.drawClimbingShoe(ctx, toScreen(pose.leftLeg.end), -1, leftKneeScreen);
    this.drawHand(ctx, toScreen(pose.leftArm.end));

    // 掏粉袋动作：被抬起摸粉袋的手臂重绘到最上层，确保盖住粉袋/上衣/腿部
    if (chalkHand === "leftHand") {
      this.drawLimb(ctx, toScreen(pose.leftShoulder), toScreen(pose.leftArm.joint), toScreen(pose.leftArm.end), THEME.player.skin, 7, {
        upperAsset: "leftUpperArm",
        upperSourceStart: { x: 150, y: 231 },
        upperSourceEnd: { x: 150, y: 70 },
        upperCrossScale: 0.224,
        lowerAsset: "leftLowerArm",
        lowerSourceStart: { x: 150, y: 231 },
        lowerSourceEnd: { x: 150, y: 70 },
        lowerCrossScale: 0.224
      });
      this.drawHand(ctx, toScreen(pose.leftArm.end));
    } else if (chalkHand === "rightHand") {
      this.drawLimb(ctx, toScreen(pose.rightShoulder), toScreen(pose.rightArm.joint), toScreen(pose.rightArm.end), THEME.player.skin, 7, {
        upperAsset: "rightUpperArm",
        upperSourceStart: { x: 150, y: 231 },
        upperSourceEnd: { x: 150, y: 70 },
        upperCrossScale: 0.224,
        lowerAsset: "rightLowerArm",
        lowerSourceStart: { x: 150, y: 231 },
        lowerSourceEnd: { x: 150, y: 70 },
        lowerCrossScale: 0.224
      });
      this.drawHand(ctx, toScreen(pose.rightArm.end));
    }

    if (DEBUG) {
      this.drawPoseDebug(ctx, pose);
    }

  }

  drawLimb(ctx, root, joint, end, color, width, assets = {}) {
    const drawUpper = () => assets.upperAsset
      ? this.drawAnchoredSegmentSprite(ctx, assets.upperAsset, root, joint, assets.upperSourceStart, assets.upperSourceEnd, assets.upperCrossScale, assets.upperLengthExtend ?? 1)
      : false;
    const drawLower = () => assets.lowerAsset
      ? this.drawAnchoredSegmentSprite(ctx, assets.lowerAsset, joint, end, assets.lowerSourceStart, assets.lowerSourceEnd, assets.lowerCrossScale)
      : false;
    // 腿部：裤子贴图收窄后，膝盖处可能露出接缝，先在底层画一条肤色腿骨把关节补上
    const isLeg = ["leftThigh", "rightThigh"].includes(assets.upperAsset);
    if (isLeg) {
      ctx.save();
      ctx.strokeStyle = THEME.player.skinLine;
      ctx.lineWidth = width + 2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
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
      ctx.restore();
    }
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

  // 【上衣绘制】贴图挂在躯干中心锚点，绘制比例 = 0.26(基准) * CONFIG.shirtSpriteScale。
  // 换图：替换 assets/player 里对应上衣 PNG，保持同尺寸 + 人物居中位置一致，比例自动保持。
  drawTorso(ctx, pose) {
    const body = this.worldToScreen(pose.body);
    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);

    const drewShirt = this.drawBodyPartSprite(ctx, this.getOutfitShirtAssetName(), 0, -5, 0.26 * CONFIG.shirtSpriteScale);
    if (!drewShirt) {
      ctx.save();
      ctx.scale(CONFIG.shirtSpriteScale, CONFIG.shirtSpriteScale);
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
      ctx.restore();
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
    const visualHalfWidth = 8 * CONFIG.pantsSpriteScale;
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

  // 【下半身装饰绘制】负责腰带贴图 + 腰带连接带 + 粉袋。
  //   - beltY = 上衣底端 + CONFIG.beltOffsetFromShirt（腰带纵向位置，负值上移）
  //   - beltScale = 0.30(基准) * CONFIG.beltSpriteScale
  //   - 图层顺序：先连接带(下层) → 再腰带贴图(上层)，让腰带盖住连接带上端
  // 换图(腰带)：替换 belt.png 保持同尺寸，且图内腰扣中心锚点仍在 {x:150,y:98}。
  drawLowerBodyAssets(ctx, pose) {
    const body = this.worldToScreen(pose.body);
    const beltY = this.getShirtBottomLocalY() + CONFIG.beltOffsetFromShirt;
    const beltScale = 0.30 * CONFIG.beltSpriteScale;
    // 先画连接带（下层），再画腰带贴图（上层）盖住连接带上端
    this.drawBeltLegConnections(ctx, pose);

    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);
    this.drawBodyPartSpriteAtAnchor(ctx, "belt", 0, beltY, { x: 150, y: 98 }, beltScale);
    ctx.restore();

    ctx.save();
    ctx.translate(body.x, body.y);
    ctx.rotate(this.player.bodyAngle);
    // 粉袋挂在腰带侧边中段：背面朝向挂右侧（正X），正面朝向挂左侧（负X）
    const bagFront = this.player.frontFacingAmount || 0;
    const beltHalfWidth = 150 * beltScale; // 腰带贴图半宽（含空白），实际带体略窄
    const bagAnchorX = beltHalfWidth * 0.42; // 腰带侧边偏内
    // 背面朝向(front=0)挂右侧(+X)，正面朝向(front=1)挂左侧(-X)
    const bagHangX = lerp(bagAnchorX, -bagAnchorX, bagFront);
    const bagHangY = beltY - 6; // 让袋体中段与腰带纵向中心对齐
    // 缓存粉袋局部坐标（相对 body 中心，未含摆动），供摸粉袋动作对齐
    this.player._chalkBagLocal = { x: bagHangX, y: bagHangY };
    const bagSway = Math.sin((this.player.animTime || 0) * 6 + this.player.worldY * 0.02) * 1.5;
    this.drawBodyPartSpriteAtAnchor(ctx, this.getOutfitChalkBagAssetName(), bagHangX + bagSway, bagHangY, { x: 150, y: 60 }, 0.24, bagSway * 0.015);
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

  // 上衣底端在 body 局部坐标的 Y 值（用于让腰带对齐上衣下边缘）
  getShirtBottomLocalY() {
    const shirtCenterY = -5; // drawTorso 里上衣中心的 localY
    const shirtScale = 0.26 * CONFIG.shirtSpriteScale;
    const assetName = this.getOutfitShirtAssetName();
    if (this.playerAssets.isReady(assetName)) {
      const image = this.playerAssets.get(assetName).image;
      return shirtCenterY + (image.height * shirtScale) / 2;
    }
    // 矢量兜底：上衣底端约在 torso 下部（同样受 shirtSpriteScale 影响）
    return (-CONFIG.torsoLength / 2 + 3 + CONFIG.torsoLength * 0.70) * CONFIG.shirtSpriteScale;
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

  // 【腰带连接带（代码绘制，非贴图）】两根线：上端连腰带黄色腰扣左右两侧，
  // 下端连裤腿深色线段中点(mapAnchoredSegmentPoint 用大腿贴图源锚点映射)。颜色随腰带主色。
  // 换图注意：若换裤子导致深色线段位置变化，需同步下端映射锚点；换腰带若腰扣宽度变化，调 buckleSideX。
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
    // 上端连接到已下移腰带的黄色腰扣左右两侧
    const beltY = this.getShirtBottomLocalY() + CONFIG.beltOffsetFromShirt;
    const beltScale = 0.30 * CONFIG.beltSpriteScale;
    const buckleSideX = 17 * beltScale;          // 黄色腰扣半宽约17
    const beltBandY = beltY - 50.5 * beltScale;  // 腰带带体纵向中心
    const leftBeltSide = this.getBodyLocalPoint(pose, -buckleSideX, beltBandY);
    const rightBeltSide = this.getBodyLocalPoint(pose, buckleSideX, beltBandY);

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

  // 【头部绘制】头/发/表情/配饰均通过 drawEndpointSprite 以头顶端点为中心缩放，
  // 缩放含 CONFIG.headSpriteScale(1.3)。基准比例如 0.145，正/背面与不同发型分支。
  // 换图：替换对应头部 PNG，保持同尺寸 + 人物在画布中的居中位置一致，比例自动保持。
  drawHead(ctx, head) {
    const isFront = this.player.frontFacingAmount > 0.55;
    if (!isFront && this.outfit && this.outfit.hair !== "hair_01") {
      this.drawBackOutfitHead(ctx, head, 1);
      return;
    }
    if (isFront && this.outfit && this.outfit.hair === "hair_male" && this.playerAssets.isReady("headMaleFront")) {
      const yOffset = 3;
      this.drawEndpointSprite(ctx, "headMaleFront", { x: head.x, y: head.y + yOffset }, 0.145 * CONFIG.headSpriteScale);
      this.drawOutfitGlasses(ctx, head, true, yOffset);
      return;
    }
    const assetName = isFront ? "headFront" : "headBack";
    if (this.playerAssets.isReady(assetName)) {
      const yOffset = isFront ? 3 : 1;
      this.drawEndpointSprite(ctx, assetName, { x: head.x, y: head.y + yOffset }, 0.145 * CONFIG.headSpriteScale);
      this.drawOutfitHair(ctx, head, isFront, yOffset);
      this.drawOutfitGlasses(ctx, head, isFront, yOffset);
      return;
    }
    if (this.player.frontFacingAmount > 0.55) {
      ctx.save();
      ctx.translate(head.x, head.y);
      ctx.scale(CONFIG.headSpriteScale, CONFIG.headSpriteScale);
      ctx.translate(-head.x, -head.y);
      this.drawFrontHead(ctx, head);
      ctx.restore();
      this.drawOutfitHair(ctx, head, true, 0);
      this.drawOutfitGlasses(ctx, head, true, 0);
      return;
    }
    ctx.save();
    ctx.translate(head.x, head.y);
    ctx.scale(CONFIG.headSpriteScale, CONFIG.headSpriteScale);
    ctx.translate(-head.x, -head.y);
    ctx.fillStyle = THEME.player.skin;
    ctx.beginPath();
    ctx.arc(head.x + 2, head.y, CONFIG.headRadius * 0.88, 0, Math.PI * 2);
    ctx.fill();
    this.drawHair(ctx, head);
    ctx.restore();
    this.drawOutfitHair(ctx, head, false, 0);
    this.drawOutfitGlasses(ctx, head, false, 0);
  }

  drawBackOutfitHead(ctx, head, yOffset = 0) {
    const assetName = this.getOutfitHairAssetName(false);
    const center = { x: head.x, y: head.y + yOffset };
    const skinScale = 0.145;
    ctx.save();
    ctx.translate(center.x, center.y);
    ctx.scale(CONFIG.headSpriteScale, CONFIG.headSpriteScale);
    ctx.translate(-center.x, -center.y);
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

    if (assetName) {
      const hairScale = this.outfit.hair === "hair_male" ? 0.158 : 0.152;
      const hairYOffset = this.outfit.hair === "hair_male" ? -1.5 : -0.8;
      this.drawEndpointSprite(ctx, assetName, { x: center.x, y: center.y + hairYOffset }, hairScale);
    } else {
      this.drawHair(ctx, center);
    }
    ctx.restore();
  }

  drawOutfitHair(ctx, head, isFront, yOffset = 0) {
    const assetName = this.getOutfitHairAssetName(isFront);
    if (!assetName) {
      return;
    }
    const isMale = this.outfit.hair === "hair_male";
    const hairScale = (isFront
      ? (isMale ? 0.152 : 0.145)
      : (isMale ? 0.158 : 0.152)) * CONFIG.headSpriteScale;
    const backYOffset = isFront ? 0 : (isMale ? -1.5 : -0.8);
    this.drawEndpointSprite(ctx, assetName, { x: head.x, y: head.y + yOffset + backYOffset }, hairScale);
  }

  drawOutfitGlasses(ctx, head, isFront, yOffset = 0) {
    if (!isFront || !this.outfit || this.outfit.accessory !== "glasses_01") {
      return;
    }
    if (this.drawEndpointSprite(ctx, "glasses01", { x: head.x, y: head.y + yOffset }, 0.145 * CONFIG.headSpriteScale)) {
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
    // 底层：如果有手部贴图则画在圆球下方
    this.drawEndpointSprite(ctx, assetName, point, 0.07);
    // 手腕圆球——始终绘制，覆盖在手部贴图上方
    const r = 8; // 手腕圆球半径（世界坐标）
    ctx.fillStyle = "#FFC78F";
    ctx.beginPath();
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawClimbingShoe(ctx, point, side, knee = null) {
    const assetName = side < 0 ? "leftFoot" : "rightFoot";
    const rotation = side * 0.08;
    // 背面右脚(side>0)脚踝锚点横向微调，让小腿边缘与鞋子边缘对齐；左脚不动
    const anchorX = 167 + (side > 0 ? CONFIG.rightShoeAnchorDX : 0);
    if (this.drawEndpointSpriteAtAnchor(ctx, assetName, point, { x: anchorX, y: 145 }, 0.3, rotation)) {
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
    const hudY = 0;
    const h = CONFIG.safeTop + 106;
    ctx.fillStyle = "rgba(108, 203, 222, 0.42)";
    ctx.fillRect(0, hudY, CONFIG.logicalWidth, h);

    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.font = "900 22px Arial, Helvetica, sans-serif";
    ctx.fillText("得分", CONFIG.safeSide + 3, CONFIG.safeTop + 52);
    ctx.font = "900 25px Arial, Helvetica, sans-serif";
    ctx.fillText(String(this.score), CONFIG.safeSide + 62, CONFIG.safeTop + 52);
    this.drawLives(ctx, CONFIG.safeSide + 132, CONFIG.safeTop + 52);

    this.drawPowerUpStatus(ctx);

    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    ctx.font = "900 15px Arial, Helvetica, sans-serif";
    ctx.fillText("当前高度", CONFIG.safeSide + 3, CONFIG.safeTop + 84);
    ctx.fillText("最高纪录：", 200, CONFIG.safeTop + 84);

    ctx.font = "900 18px Arial, Helvetica, sans-serif";
    ctx.fillText(formatMeters(this.climbHeight / CONFIG.pixelsPerMeter), 118, CONFIG.safeTop + 84);
    ctx.fillText(formatMeters(this.scoreManager.best.height / CONFIG.pixelsPerMeter), 292, CONFIG.safeTop + 84);

    this.drawChargeBar(ctx);
  }

  drawLives(ctx, x, y) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "900 22px Arial, Helvetica, sans-serif";
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const gap = 22;
    for (let i = 0; i < CONFIG.maxLives; i += 1) {
      const alive = i < this.livesRemaining;
      ctx.fillStyle = alive ? "#ff5f8c" : "rgba(255, 255, 255, 0.42)";
      ctx.strokeStyle = alive ? "rgba(255, 255, 255, 0.9)" : "rgba(255, 255, 255, 0.58)";
      ctx.lineWidth = 4;
      const heartX = x + i * gap;
      ctx.strokeText("♥", heartX, y + 1);
      ctx.fillText("♥", heartX, y + 1);
    }
    ctx.restore();
  }
  drawPowerUpStatus(ctx) {
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
    ctx.save();
    ctx.textBaseline = "middle";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    const gap = 8;
    const padX = 12;
    const boxH = 30;
    const items = active.map(([type, timeLeft]) => {
      const label = `${POWER_UPS[type].label} ${timeLeft.toFixed(1)}s`;
      const w = ctx.measureText(label).width + padX * 2;
      return { type, label, w };
    });
    const totalW = items.reduce((sum, it) => sum + it.w, 0) + gap * (items.length - 1);
    const chargeBarY = CONFIG.logicalHeight - CONFIG.safeBottom - 36;
    const y = chargeBarY - 12 - boxH / 2;
    let x = (CONFIG.logicalWidth - totalW) / 2;
    for (const it of items) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      this.roundRect(ctx, x, y - boxH / 2, it.w, boxH, boxH / 2);
      ctx.fill();
      ctx.fillStyle = POWER_UPS[it.type].color;
      ctx.fillText(it.label, x + padX, y + 0.5);
      x += it.w + gap;
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
    const cappedCombo = Math.min(20, combo);
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
    const y = CONFIG.logicalHeight - CONFIG.safeBottom - 36;
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
    const y = CONFIG.topControlsY;
    const buttons = this.state === STATE.START
      ? [
          { id: "back", x: CONFIG.safeSide + 4, y },
          { id: "sound", x: CONFIG.logicalWidth - CONFIG.safeSide - 4 - size * 2 - gap, y },
          { id: "share", x: CONFIG.logicalWidth - CONFIG.safeSide - 4 - size, y }
        ]
      : (() => {
          const ids = ["skin", "restart", "rank", "sound", "share"];
          const marginRight = CONFIG.safeSide + 4;
          const totalW = ids.length * size + (ids.length - 1) * gap;
          let x = CONFIG.logicalWidth - marginRight - totalW;
          const rightButtons = ids.map((id) => {
            const button = { id, x, y };
            x += size + gap;
            return button;
          });
          return [{ id: "start", x: CONFIG.safeSide + 4, y }, ...rightButtons];
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

  drawImageAssetContain(ctx, asset, x, y, w, h) {
    if (!asset || !asset.loaded || asset.failed || !asset.image.complete) {
      return false;
    }
    const image = asset.image;
    const scale = Math.min(w / Math.max(1, image.width), h / Math.max(1, image.height));
    const drawW = image.width * scale;
    const drawH = image.height * scale;
    ctx.drawImage(image, x + (w - drawW) / 2, y + (h - drawH) / 2, drawW, drawH);
    return true;
  }

  drawFigmaStartButton(ctx, id, assetName, x, y, w, h) {
    this.menuButtons.push({ id, x, y, w, h });
    const asset = this.figmaUiAssets && this.figmaUiAssets[assetName];
    if (this.drawImageAssetContain(ctx, asset, x - 18, y - 18, w + 36, h + 36)) {
      return;
    }
    ctx.save();
    ctx.shadowColor = "rgba(73, 116, 133, 0.18)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
    this.roundRect(ctx, x, y, w, h, h / 2);
    ctx.fill();
    ctx.restore();
  }

  drawStartScreen(ctx) {
    this.menuButtons = [];
    ctx.save();
    ctx.fillStyle = "rgba(181, 235, 243, 0.34)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);

    const titleAsset = this.figmaUiAssets && this.figmaUiAssets.coverTitle;
    if (!this.drawImageAssetContain(ctx, titleAsset, 51, 38, 261, 261)) {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
      ctx.font = "900 50px Arial, Helvetica, sans-serif";
      ctx.lineWidth = 8;
      ctx.strokeStyle = "rgba(52, 154, 180, 0.42)";
      ctx.strokeText("攀了个岩", CONFIG.logicalWidth / 2, 158);
      ctx.fillText("攀了个岩", CONFIG.logicalWidth / 2, 158);
    }

    this.drawFigmaStartButton(ctx, "play", "startButton", 73, 544, 217, 56);
    this.drawFigmaStartButton(ctx, "shop", "outfitButton", 73, 622, 104, 56);
    this.drawFigmaStartButton(ctx, "rank", "rankButton", 186, 622, 104, 56);
    ctx.restore();
  }

  drawUiPanel(ctx) {
    if (this.uiPanel.type === "outfit") {
      this.drawOutfitPanel(ctx);
      return;
    }
    if (this.uiPanel.type === "rank") {
      this.drawLeaderboardPanel(ctx, false);
      return;
    }
    return;
  }

  getLeaderboardData() {
    const opponents = [
      { name: "岩壁飞鸟", score: 1280, heightMeters: 18.4, duration: 155, avatar: "hairFemaleFront" },
      { name: "向上生长", score: 1090, heightMeters: 17.1, duration: 132, avatar: "hairMaleFront" },
      { name: "粉袋不离身", score: 870, heightMeters: 16.2, duration: 118, avatar: "hair02Front" },
      { name: "今天也要登顶", score: 760, heightMeters: 15.3, duration: 105, avatar: "hairFemaleFront" },
      { name: "岩点观察员", score: 640, heightMeters: 14.7, duration: 98, avatar: "hairMaleFront" },
      { name: "动态选手", score: 540, heightMeters: 13.9, duration: 90, avatar: "hair02Front" },
      { name: "再高一点点", score: 470, heightMeters: 12.8, duration: 80, avatar: "hairFemaleFront" },
      { name: "稳稳抓住", score: 380, heightMeters: 11.6, duration: 72, avatar: "hairMaleFront" }
    ];
    const best = this.scoreManager.best;
    const own = {
      name: "我的最高记录",
      score: Number(best.score) || 0,
      heightMeters: (Number(best.height) || 0) / CONFIG.pixelsPerMeter,
      duration: Number(best.duration) || Math.max(32, Math.round(((Number(best.height) || 0) / CONFIG.pixelsPerMeter) * 6)),
      avatar: this.outfit.hair === "hair_female" ? "hairFemaleFront" : "hairMaleFront",
      isOwn: true
    };
    const ranked = [...opponents, own]
      .sort((a, b) => b.score - a.score || b.heightMeters - a.heightMeters || a.duration - b.duration)
      .map((row, index) => ({ ...row, rank: index + 1 }));
    const ownRanked = ranked.find((row) => row.isOwn) || { ...own, rank: ranked.length };
    const previous = ownRanked.rank > 1 ? ranked[ownRanked.rank - 2] : null;
    return {
      rows: ranked.slice(0, 7),
      own: ownRanked,
      gap: previous ? Math.max(0, previous.score - ownRanked.score) : 0
    };
  }

  drawLeaderboardTitle(ctx, centerX, centerY) {
    const titleAsset = this.figmaUiAssets && this.figmaUiAssets.rankingTitle;
    if (titleAsset && titleAsset.loaded && !titleAsset.failed) {
      this.drawImageAssetContain(ctx, titleAsset, centerX - 108, centerY - 43, 216, 86);
      return;
    }
    const glyphs = [
      { text: "排", color: "#4bb7ef" },
      { text: "行", color: "#ff5f8c" },
      { text: "榜", color: "#4bb7ef" }
    ];
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = '900 58px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    ctx.lineJoin = "round";
    ctx.lineWidth = 13;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
    ctx.shadowColor = "rgba(42, 114, 145, 0.20)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 5;
    const widths = glyphs.map((glyph) => ctx.measureText(glyph.text).width - 5);
    const totalW = widths.reduce((sum, width) => sum + width, 0);
    let cursorX = centerX - totalW / 2;
    for (let index = 0; index < glyphs.length; index += 1) {
      const glyph = glyphs[index];
      const glyphX = cursorX + widths[index] / 2;
      ctx.strokeText(glyph.text, glyphX, centerY);
      ctx.fillStyle = glyph.color;
      ctx.fillText(glyph.text, glyphX, centerY);
      cursorX += widths[index];
    }
    ctx.restore();
  }

  drawLeaderboardAvatar(ctx, row, x, y, radius) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.clip();
    const palette = ["#dceef7", "#f7e1e8", "#e7e0f5", "#dff3ea"];
    ctx.fillStyle = row.isOwn ? "#d8f3fb" : palette[row.rank % palette.length];
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
    const head = this.playerAssets.get("headFront");
    if (head && head.loaded && !head.failed) {
      const scale = (radius * 1.52) / Math.max(1, head.image.height);
      const drawW = head.image.width * scale;
      const drawH = head.image.height * scale;
      ctx.drawImage(head.image, x - drawW / 2, y - drawH / 2 + radius * 0.18, drawW, drawH);
    }
    const hair = this.playerAssets.get(row.avatar || "hairMaleFront");
    if (hair && hair.loaded && !hair.failed) {
      const scale = (radius * 1.72) / Math.max(1, hair.image.height);
      const drawW = hair.image.width * scale;
      const drawH = hair.image.height * scale;
      ctx.drawImage(hair.image, x - drawW / 2, y - drawH / 2 - radius * 0.08, drawW, drawH);
    }
    ctx.restore();
    ctx.strokeStyle = row.isOwn ? "rgba(75, 183, 239, 0.62)" : "rgba(255, 255, 255, 0.96)";
    ctx.lineWidth = row.isOwn ? 2.5 : 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  drawLeaderboardRank(ctx, rank, x, y) {
    const medalColors = ["#f8bd32", "#b7c6d0", "#e98a43"];
    if (rank <= 3) {
      ctx.fillStyle = medalColors[rank - 1];
      ctx.beginPath();
      ctx.arc(x, y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#ffffff";
      ctx.font = '900 14px "Arial Rounded MT Bold", sans-serif';
      ctx.fillText(String(rank), x, y + 1);
      return;
    }
    ctx.fillStyle = "#219bd3";
    ctx.font = '900 22px "Arial Rounded MT Bold", sans-serif';
    ctx.fillText(String(rank), x, y);
  }

  drawLeaderboardRow(ctx, row, x, y, w, h, highlighted = false) {
    ctx.save();
    ctx.shadowColor = highlighted ? "rgba(62, 174, 220, 0.20)" : "rgba(49, 95, 114, 0.10)";
    ctx.shadowBlur = 9;
    ctx.shadowOffsetY = 4;
    ctx.fillStyle = highlighted ? "rgba(176, 228, 248, 0.92)" : "rgba(255, 255, 255, 0.94)";
    this.roundRect(ctx, x, y, w, h, 14);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    this.drawLeaderboardRank(ctx, row.rank, x + 29, y + h / 2);
    this.drawLeaderboardAvatar(ctx, row, x + 72, y + h / 2, 20);
    ctx.textAlign = "left";
    ctx.fillStyle = highlighted ? "#178fc7" : "#163d70";
    ctx.font = '800 14px "PingFang SC", "Microsoft YaHei", sans-serif';
    ctx.fillText(row.name, x + 101, y + h / 2 - 7);
    ctx.textAlign = "right";
    ctx.fillStyle = "#168fc8";
    ctx.font = '900 20px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    ctx.fillText(`${row.score}分`, x + w - 14, y + h / 2 - 8);
    ctx.fillStyle = "#748097";
    ctx.font = '700 12px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    ctx.fillText(`${row.heightMeters.toFixed(1)} m | ${formatDuration(row.duration)}`, x + w - 14, y + h / 2 + 13);
    ctx.restore();
  }

  drawLeaderboardPanel(ctx, fromGameOver = false) {
    const data = this.getLeaderboardData();
    const panelX = 22;
    const panelY = 134;
    const panelW = CONFIG.logicalWidth - 44;
    const panelH = fromGameOver ? 642 : 620;
    const closeRect = { x: panelX + panelW - 47, y: panelY - 9, w: 42, h: 42 };
    if (fromGameOver) {
      this.uiButtons = [
        { id: "gameover-close", ...closeRect }
      ];
    } else {
      this.uiPanel.bounds = { x: panelX, y: panelY - 45, w: panelW, h: panelH + 45 };
      this.uiPanel.closeRect = closeRect;
      this.uiPanel.buttons = [];
    }

    ctx.save();
    ctx.fillStyle = "rgba(211, 241, 248, 0.80)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    ctx.shadowColor = "rgba(53, 117, 143, 0.22)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(247, 253, 255, 0.96)";
    this.roundRect(ctx, panelX, panelY, panelW, panelH, 25);
    ctx.fill();
    ctx.restore();

    this.drawLeaderboardTitle(ctx, CONFIG.logicalWidth / 2, 118);

    const rowX = panelX + 15;
    const rowW = panelW - 30;
    const rowH = 58;
    const rowGap = 7;
    const listY = panelY + 64;
    data.rows.forEach((row, index) => {
      this.drawLeaderboardRow(ctx, row, rowX, listY + index * (rowH + rowGap), rowW, rowH, Boolean(row.isOwn));
    });

    const ownY = panelY + panelH - 71;
    if (data.gap > 0) {
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#708096";
      ctx.font = '700 12px "PingFang SC", sans-serif';
      ctx.fillText(`距离上一名还差 ${data.gap} 分`, CONFIG.logicalWidth / 2, ownY - 13);
      ctx.restore();
    }
    this.drawLeaderboardRow(ctx, data.own, rowX, ownY, rowW, 58, true);

    ctx.save();
    ctx.fillStyle = "#ff6b8e";
    ctx.beginPath();
    ctx.arc(closeRect.x + closeRect.w / 2, closeRect.y + closeRect.h / 2, closeRect.w / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(closeRect.x + 13, closeRect.y + 13);
    ctx.lineTo(closeRect.x + 29, closeRect.y + 29);
    ctx.moveTo(closeRect.x + 29, closeRect.y + 13);
    ctx.lineTo(closeRect.x + 13, closeRect.y + 29);
    ctx.stroke();

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
    this.drawOutfitShopPreview(ctx, x + leftW / 2, y + h / 2 + 28);

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
    this.drawOutfitPreviewCharacter(ctx, cx, cy, true, 1.5);
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

  drawOutfitPreviewCharacter(ctx, cx, cy, isFront, scale = 1) {
    const previous = {
      cameraY: this.camera.y,
      worldX: this.player.worldX,
      worldY: this.player.worldY,
      bodyAngle: this.player.bodyAngle,
      frontFacingAmount: this.player.frontFacingAmount,
      animTime: this.player.animTime
    };
    this.camera.y = 0;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);
    this.player.worldX = cx;
    this.player.worldY = cy;
    this.player.bodyAngle = 0;
    this.player.frontFacingAmount = isFront ? 1 : 0;
    this.player.animTime = previous.animTime || 0;

    // 试衣间：正常直立姿势 + 轻微待机动作（呼吸起伏、手臂微摆、身体轻晃、头部微动）
    const t = this.player.animTime || 0;
    const breathe = Math.sin(t * 1.6);        // 呼吸起伏
    const sway = Math.sin(t * 0.9);           // 身体左右轻晃
    const armSwingL = Math.sin(t * 1.15);      // 左臂微摆
    const armSwingR = Math.sin(t * 1.15 + 0.6);// 右臂微摆（错开相位）
    const headBob = Math.sin(t * 1.4 + 0.4);   // 头部微动

    const bodyDX = sway * 1.4;                 // 身体整体轻微左右位移
    const bodyDY = breathe * 0.8;              // 身体整体上下呼吸位移
    const bx = cx + bodyDX;
    const by = cy + bodyDY;

    const pose = {
      body: { x: bx, y: by },
      head: { x: bx + headBob * 0.8, y: by - 47 - breathe * 0.6 },
      leftShoulder: { x: bx - 14, y: by - 24 + breathe * 0.5 },
      rightShoulder: { x: bx + 14, y: by - 24 + breathe * 0.5 },
      leftHip: { x: bx - 11, y: by + 28 },
      rightHip: { x: bx + 11, y: by + 28 },
      // 手臂自然下垂在身体两侧，肘、手随呼吸和微摆轻微晃动
      leftArm: {
        joint: { x: bx - 19 + armSwingL * 0.8, y: by + 2 + breathe * 0.4 },
        end: { x: bx - 20 + armSwingL * 1.6, y: by + 30 + armSwingL * 1.2 }
      },
      rightArm: {
        joint: { x: bx + 19 + armSwingR * 0.8, y: by + 2 + breathe * 0.4 },
        end: { x: bx + 20 + armSwingR * 1.6, y: by + 30 + armSwingR * 1.2 }
      },
      // 双腿自然直立在髋部正下方，膝盖微屈，脚略微分开
      leftLeg: {
        joint: { x: bx - 12, y: by + 62 },
        end: { x: bx - 13, y: by + 100 }
      },
      rightLeg: {
        joint: { x: bx + 12, y: by + 62 },
        end: { x: bx + 13, y: by + 100 }
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
      upperLengthExtend: CONFIG.thighKneeOverlap,
      upperCrossScale: 0.284,
      lowerAsset: "rightShin",
      lowerSourceStart: { x: 178, y: 50 },
      lowerSourceEnd: { x: 122, y: 251 },
      lowerCrossScale: 0.284
    });
    this.drawLimb(ctx, toScreen(pose.rightShoulder), toScreen(pose.rightArm.joint), toScreen(pose.rightArm.end), THEME.player.skin, 7, {
      upperAsset: "rightUpperArm",
      upperSourceStart: { x: 150, y: 231 },
      upperSourceEnd: { x: 150, y: 70 },
      upperCrossScale: 0.224,
      lowerAsset: "rightLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 },
      lowerCrossScale: 0.224
    });
    this.drawHand(ctx, toScreen(pose.rightArm.end));
    this.drawClimbingShoe(ctx, toScreen(pose.rightLeg.end), 1, rightKneeScreen);
    this.drawLimb(ctx, leftHipScreen, leftKneeScreen, toScreen(pose.leftLeg.end), THEME.player.skin, 7, {
      upperAsset: "leftThigh",
      upperSourceStart: { x: 92, y: 71 },
      upperSourceEnd: { x: 168.02, y: 210 },
      upperLengthExtend: CONFIG.thighKneeOverlap,
      upperCrossScale: 0.284,
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
      upperCrossScale: 0.224,
      lowerAsset: "leftLowerArm",
      lowerSourceStart: { x: 150, y: 231 },
      lowerSourceEnd: { x: 150, y: 70 },
      lowerCrossScale: 0.224
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
    ctx.restore();
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
    const y = CONFIG.logicalHeight - 220;
    ctx.fillStyle = "rgba(49, 95, 114, 0.84)";
    this.roundRect(ctx, x, y, w, h, 18);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.fillText(this.uiToast, CONFIG.logicalWidth / 2, y + h / 2);
    ctx.restore();
  }

  drawStartHint(ctx) {
    const pulse = 0.5 + Math.sin(performance.now() * 0.006) * 0.5;
    const isReleaseStep = this.tutorialPhase === "release";
    const w = 298;
    const h = 92;
    const x = (CONFIG.logicalWidth - w) / 2;
    const y = 548;

    // 参考移动游戏常见的新手引导：压暗场景，让操作说明和蓄力条成为视觉焦点。
    ctx.save();
    ctx.fillStyle = "rgba(13, 41, 51, 0.42)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    ctx.restore();

    // 遮罩会压暗 HUD，因此重新绘制蓄力条，并在正确松手位置添加目标标记。
    this.drawChargeBar(ctx);
    const barW = CONFIG.logicalWidth * 0.78;
    const barX = (CONFIG.logicalWidth - barW) / 2;
    const barY = CONFIG.logicalHeight - CONFIG.safeBottom - 36;
    const innerPad = 5;
    const targetX = barX + innerPad + (barW - innerPad * 2) * this.tutorialTargetCharge;

    ctx.save();
    ctx.shadowColor = "rgba(255, 255, 255, 0.82)";
    ctx.shadowBlur = 10 + pulse * 8;
    ctx.fillStyle = isReleaseStep ? "#ffffff" : "#ffcf47";
    ctx.beginPath();
    ctx.arc(targetX, barY + 13.5, 5.5 + pulse * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(49, 95, 114, 0.82)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(targetX, barY - 14);
    ctx.lineTo(targetX, barY + 4);
    ctx.stroke();
    ctx.fillStyle = isReleaseStep ? "rgba(255, 255, 255, 0.96)" : "#ffcf47";
    ctx.font = "900 12px Arial, Helvetica, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(isReleaseStep ? "到位，松手" : "蓄力到这里", targetX, barY - 17);
    ctx.restore();

    ctx.save();
    ctx.shadowColor = "rgba(5, 29, 38, 0.26)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = isReleaseStep ? "rgba(255, 95, 140, 0.97)" : "rgba(255, 255, 255, 0.97)";
    this.roundRect(ctx, x, y, w, h, 22);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = isReleaseStep ? "#ffffff" : "#315f72";
    ctx.font = "900 22px Arial, Helvetica, sans-serif";
    const title = isReleaseStep
      ? "现在松开手指"
      : (this.tutorialEarlyRelease ? "再试一次，持续按住" : "按住屏幕蓄力");
    ctx.fillText(title, CONFIG.logicalWidth / 2, y + 33);
    ctx.fillStyle = isReleaseStep ? "rgba(255,255,255,0.9)" : "#5d7480";
    ctx.font = "bold 15px Arial, Helvetica, sans-serif";
    ctx.fillText(
      isReleaseStep ? "蓄力完成，出手抓住发光岩点" : "等蓄力到达标记处，不要提前松手",
      CONFIG.logicalWidth / 2,
      y + 64
    );

    const stepW = 42;
    const stepX = x + w - stepW - 12;
    ctx.fillStyle = isReleaseStep ? "rgba(255,255,255,0.2)" : "rgba(49,95,114,0.1)";
    this.roundRect(ctx, stepX, y + 10, stepW, 22, 11);
    ctx.fill();
    ctx.fillStyle = isReleaseStep ? "#ffffff" : "#315f72";
    ctx.font = "900 11px Arial, Helvetica, sans-serif";
    ctx.fillText(isReleaseStep ? "2 / 2" : "1 / 2", stepX + stepW / 2, y + 21.5);
    ctx.restore();

    const fingerX = targetX >= CONFIG.logicalWidth / 2
      ? CONFIG.logicalWidth / 2 - 74
      : CONFIG.logicalWidth / 2 + 74;
    const fingerY = 682 + (isReleaseStep ? -8 - pulse * 5 : pulse * 2);
    ctx.save();
    const touchColor = isReleaseStep ? "255, 207, 71" : "255, 95, 140";
    ctx.strokeStyle = `rgba(${touchColor}, ${0.22 + pulse * 0.34})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fingerX, fingerY - 37, 9 + pulse * 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = `rgba(${touchColor}, ${0.62 + pulse * 0.28})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(fingerX, fingerY - 37, 5 + pulse * 3.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = `rgba(${touchColor}, 0.92)`;
    ctx.beginPath();
    ctx.arc(fingerX, fingerY - 37, 2.8, 0, Math.PI * 2);
    ctx.fill();
    this.drawTutorialHand(ctx, fingerX, fingerY);
    ctx.restore();
  }

  drawTutorialHand(ctx, x, y) {
    const handSize = 68;
    ctx.save();
    ctx.translate(0, 1);
    ctx.shadowColor = "rgba(8, 35, 45, 0.30)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 6;
    const asset = this.figmaUiAssets && this.figmaUiAssets.tutorialHand;
    if (asset && asset.image) {
      this.drawImageAssetContain(ctx, asset, x - handSize / 2, y - handSize / 2 - 8, handSize, handSize);
    } else {
      // fallback: 简单圆形占位（资源未加载时）
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x, y - 10, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(35, 70, 83, 0.96)";
      ctx.lineWidth = 3.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  drawTutorialComplete(ctx) {
    const duration = this.tutorialCompleteDuration;
    const elapsed = duration - this.tutorialCompleteTime;
    const enterT = easeOutCubic(clamp(elapsed / 0.28, 0, 1));
    const exitT = clamp(this.tutorialCompleteTime / 0.45, 0, 1);
    const alpha = Math.min(enterT, exitT);
    const yOffset = lerp(26, 0, enterT);
    const x = 24;
    const y = 438 + yOffset;
    const w = CONFIG.logicalWidth - 48;
    const h = 214;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.shadowColor = "rgba(20, 66, 80, 0.12)";
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 5;
    const gradient = ctx.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.80)");
    gradient.addColorStop(1, "rgba(232, 250, 253, 0.80)");
    ctx.fillStyle = gradient;
    this.roundRect(ctx, x, y, w, h, 22);
    ctx.fill();

    ctx.shadowColor = "rgba(0, 0, 0, 0)";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = "#ff5f8c";
    ctx.beginPath();
    ctx.arc(CONFIG.logicalWidth / 2, y + 19, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(CONFIG.logicalWidth / 2 - 5, y + 19);
    ctx.lineTo(CONFIG.logicalWidth / 2 - 1, y + 23);
    ctx.lineTo(CONFIG.logicalWidth / 2 + 6, y + 15);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#315f72";
    ctx.font = "900 21px Arial, Helvetica, sans-serif";
    ctx.fillText("就是这样！", CONFIG.logicalWidth / 2, y + 46);
    ctx.fillStyle = "#55727e";
    ctx.font = "bold 14px Arial, Helvetica, sans-serif";
    ctx.fillText("根据下一个发光岩点判断出手力度，", CONFIG.logicalWidth / 2, y + 70);
    ctx.fillText("继续攀爬吧！", CONFIG.logicalWidth / 2, y + 90);

    ctx.strokeStyle = "rgba(49, 95, 114, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 108);
    ctx.lineTo(x + w - 28, y + 108);
    ctx.stroke();

    const itemCenters = [x + w * 0.27, x + w * 0.73];
    const itemTypes = ["magnifier", "magnet"];
    for (let index = 0; index < itemTypes.length; index += 1) {
      const type = itemTypes[index];
      const centerX = itemCenters[index];
      const asset = this.figmaUiAssets && this.figmaUiAssets[type];
      this.drawImageAssetContain(ctx, asset, centerX - 28, y + 116, 56, 44);
      ctx.fillStyle = POWER_UPS[type].color;
      ctx.font = "900 15px Arial, Helvetica, sans-serif";
      ctx.fillText(POWER_UPS[type].label, centerX, y + 170);
      ctx.fillStyle = "#657a82";
      ctx.font = "bold 12px Arial, Helvetica, sans-serif";
      ctx.fillText(type === "magnifier" ? "判定范围扩大 10 秒" : "自动吸附岩点 5 秒", centerX, y + 192);
    }
    ctx.restore();
  }
  drawGameOver(ctx) {
    this.uiButtons = [];
    if (this.gameOverStage === "ranking") {
      this.drawLeaderboardPanel(ctx, true);
      return;
    }

    ctx.fillStyle = "rgba(36, 82, 100, 0.42)";
    ctx.fillRect(0, 0, CONFIG.logicalWidth, CONFIG.logicalHeight);
    const x = 35;
    const y = 205;
    const w = CONFIG.logicalWidth - 70;
    const h = 354;
    ctx.save();
    ctx.shadowColor = "rgba(38, 88, 107, 0.26)";
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = "rgba(249, 254, 255, 0.97)";
    this.roundRect(ctx, x, y, w, h, 24);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#4bb7ef";
    ctx.font = '900 38px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    ctx.lineWidth = 9;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.98)";
    ctx.strokeText("本轮成绩", CONFIG.logicalWidth / 2, y + 15);
    ctx.fillText("本轮成绩", CONFIG.logicalWidth / 2, y + 15);

    const scoreX = x + 29;
    const scoreY = y + 54;
    const scoreW = w - 58;
    const scoreH = 100;
    ctx.fillStyle = "rgba(226, 245, 250, 0.78)";
    this.roundRect(ctx, scoreX, scoreY, scoreW, scoreH, 18);
    ctx.fill();
    ctx.fillStyle = "#778494";
    ctx.font = '800 13px "PingFang SC", sans-serif';
    ctx.fillText("本轮得分", CONFIG.logicalWidth / 2, scoreY + 23);
    ctx.fillStyle = "#168fc8";
    ctx.font = '900 42px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
    ctx.fillText(`${this.score} 分`, CONFIG.logicalWidth / 2, scoreY + 67);

    const statW = 126;
    const statH = 64;
    const statGap = 13;
    const statsX = x + (w - statW * 2 - statGap) / 2;
    const statsY = y + 168;
    const stats = [
      { label: "攀爬高度", value: formatMeters(this.climbHeight / CONFIG.pixelsPerMeter), color: "#ff5f8c" },
      { label: "坚持时间", value: formatDuration(this.finalRoundDuration), color: "#27a98a" }
    ];
    stats.forEach((stat, index) => {
      const statX = statsX + index * (statW + statGap);
      ctx.fillStyle = "rgba(226, 245, 250, 0.66)";
      this.roundRect(ctx, statX, statsY, statW, statH, 14);
      ctx.fill();
      ctx.fillStyle = "#778494";
      ctx.font = '700 12px "PingFang SC", sans-serif';
      ctx.fillText(stat.label, statX + statW / 2, statsY + 19);
      ctx.fillStyle = stat.color;
      ctx.font = '900 20px "Arial Rounded MT Bold", "PingFang SC", sans-serif';
      ctx.fillText(stat.value, statX + statW / 2, statsY + 44);
    });

    const reasonY = y + 245;
    ctx.fillStyle = "rgba(255, 226, 234, 0.78)";
    this.roundRect(ctx, x + 29, reasonY, w - 58, 48, 15);
    ctx.fill();
    ctx.fillStyle = "#9b6674";
    ctx.font = '700 12px "PingFang SC", sans-serif';
    ctx.fillText("掉落原因", CONFIG.logicalWidth / 2, reasonY + 14);
    ctx.fillStyle = this.failureReason === "力量过大" ? "#ff5f8c" : "#315f72";
    ctx.font = '900 17px "PingFang SC", sans-serif';
    ctx.fillText(this.failureReason || "挑战结束", CONFIG.logicalWidth / 2, reasonY + 34);

    ctx.fillStyle = "#315f72";
    ctx.font = '800 15px "PingFang SC", sans-serif';
    ctx.fillText("点击屏幕查看排行榜", CONFIG.logicalWidth / 2, y + 316);
    ctx.fillStyle = "rgba(49, 95, 114, 0.50)";
    ctx.font = '700 11px "PingFang SC", sans-serif';
    ctx.fillText("看看你的最高纪录与上一名还有多远", CONFIG.logicalWidth / 2, y + 337);
    ctx.restore();
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
