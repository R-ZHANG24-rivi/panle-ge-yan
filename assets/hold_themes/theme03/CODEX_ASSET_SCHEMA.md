# theme03_holds_manifest 数据格式说明

## 用途
本包与 `theme01_codex_final`、`theme02_codex_final_v2` 使用统一资产 schema。

Codex 应通过同一套主题加载器读取 Theme03，不要为 Theme03 单独复制生成逻辑。

## 顶层结构

```json
{
  "schemaVersion": "1.0",
  "themeId": "theme03",
  "themeName": "blue_black",
  "coordinateSystem": {
    "x": "0-1 normalized by hold native width",
    "y": "0-1 normalized by hold native height",
    "origin": "top-left"
  },
  "holds": []
}
```

## 单个岩点结构

```json
{
  "id": "theme03_hold_001",
  "image": "images/theme03_hold_001.png",
  "outline": "outlines/theme03_hold_001.svg",
  "grip": "grip/theme03_hold_001.svg",
  "nativeSize": {
    "width": 101,
    "height": 148
  },
  "type": "unknown",
  "difficulty": null,
  "tags": [],
  "grips": [
    {
      "x": 0.69307,
      "y": 0.39865,
      "type": "primary"
    }
  ]
}
```

## 接入规则

### 1. 尺寸
`nativeSize` 是岩点的设计基准尺寸。

禁止对单个岩点使用随机 scale：

```js
// 禁止
scale = random(0.5, 1.5);
```

不同屏幕适配只能统一使用：

```js
drawWidth = hold.nativeSize.width * globalHoldScale;
drawHeight = hold.nativeSize.height * globalHoldScale;
```

同一主题内全部岩点必须共享同一个 `globalHoldScale`，以保持美术资产之间的原始大小关系。

### 2. outline
`outline` 用于生成阶段的岩点防交叉检测。

不要使用 PNG 外接矩形作为最终重叠判断。候选岩点应用随机位置和旋转后，需要把 outline 转换到世界坐标，再执行 polygon intersection / SAT 检测。

碰撞则重新采样候选位置或候选岩点。

### 3. grips
`grips` 已经由 Figma 整体 SVG 中的 circle / ellipse 圆心转换为 0-1 归一化坐标。

运行时需要从局部坐标转换到世界坐标，并考虑岩点旋转：

```js
localX = grip.x * drawWidth;
localY = grip.y * drawHeight;
```

随后围绕岩点的实际旋转中心旋转局部坐标，再叠加岩点世界位置。

不要在 `rotation !== 0` 时直接使用：

```js
worldX = hold.x + grip.x * drawWidth;
worldY = hold.y + grip.y * drawHeight;
```

### 4. 无限随机生成
Theme03 仍属于无限向上攀爬的程序化生成资产，不是固定关卡。

保留：
- 随机抽取岩点资产
- 随机位置
- 随机旋转
- 可达距离约束
- outline 防交叉
- 无限向上生成
- 每局线路不同

### 5. type / difficulty / tags
当前尚未人工分类，因此：
- `type = "unknown"`
- `difficulty = null`
- `tags = []`

Codex 暂时不能根据这些字段调整概率或难度。

## 统一主题加载建议

```js
const THEMES = {
  theme01: "assets/themes/theme01/theme01_holds_manifest.json",
  theme02: "assets/themes/theme02/theme02_holds_manifest.json",
  theme03: "assets/themes/theme03/theme03_holds_manifest.json"
};
```

推荐生成器继续使用统一接口：

```js
loadTheme(themeId);
chooseRandomHold(theme.holds);
createCandidateHold(...);
checkReachability(...);
checkOutlineOverlap(...);
```

禁止为 Theme03 新写一套平行的岩点生成器。
