# theme04_holds_manifest 数据格式说明

## 用途
本包与 `theme01_codex_final`、`theme02_codex_final_v2`、`theme03_codex_final` 使用统一资产 schema。

Codex 应通过同一套主题加载器读取 Theme04，不要为 Theme04 单独复制生成逻辑。

## 单个岩点结构

```json
{
  "id": "theme04_hold_001",
  "image": "images/theme04_hold_001.png",
  "outline": "outlines/theme04_hold_001.svg",
  "grip": "grip/theme04_hold_001.svg",
  "nativeSize": {
    "width": 100,
    "height": 120
  },
  "type": "unknown",
  "difficulty": null,
  "tags": [],
  "grips": [
    {
      "x": 0.5,
      "y": 0.4,
      "type": "primary"
    }
  ]
}
```

## 接入规则

1. `nativeSize` 是设计基准尺寸，禁止对单个岩点随机 scale。
2. 如需屏幕适配，整套岩点统一乘 `globalHoldScale`。
3. `outline` 用于候选岩点防交叉检测，不要使用 PNG 外接矩形作为最终判定。
4. `grips` 是 0-1 归一化坐标，运行时转换到局部坐标后必须考虑岩点旋转。
5. Theme04 仍然用于无限向上程序化随机生成，不是固定关卡。
6. 保留随机抽取岩点、随机位置、随机旋转、可达距离检查、outline 防交叉。
7. 当前 `type`、`difficulty`、`tags` 尚未人工分类，暂时不要用于调整生成权重。

## 统一主题加载建议

```js
const THEMES = {
  theme01: "assets/themes/theme01/theme01_holds_manifest.json",
  theme02: "assets/themes/theme02/theme02_holds_manifest.json",
  theme03: "assets/themes/theme03/theme03_holds_manifest.json",
  theme04: "assets/themes/theme04/theme04_holds_manifest.json"
};
```

继续使用统一生成器：

```js
loadTheme(themeId);
chooseRandomHold(theme.holds);
createCandidateHold(...);
checkReachability(...);
checkOutlineOverlap(...);
```

禁止为 Theme04 新写平行生成逻辑。


## Theme04 尺寸修正

本资产包已在资产层将 Theme04 整体缩放为约 `0.8x`。
Codex 不需要再对 Theme04 额外乘 `0.8`，直接使用 manifest 中更新后的 `nativeSize`。

禁止在运行时再次为 Theme04 单独缩放，否则会重复缩小。
