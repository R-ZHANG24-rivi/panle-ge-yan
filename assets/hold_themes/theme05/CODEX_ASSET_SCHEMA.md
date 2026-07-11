# theme05_holds_manifest 数据格式说明

## 用途
本包与 `theme01_codex_final`、`theme02_codex_final_v2`、`theme03_codex_final`、`theme04_codex_final` 使用统一资产 schema。

Codex 应通过同一套主题加载器读取 Theme05，不要为 Theme05 单独复制生成逻辑。

## 单个岩点结构

```json
{
  "id": "theme05_hold_001",
  "image": "images/theme05_hold_001.png",
  "outline": "outlines/theme05_hold_001.svg",
  "grip": "grip/theme05_hold_001.svg",
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
2. 屏幕适配时，整套岩点统一使用 `globalHoldScale`。
3. `outline` 用于候选岩点防交叉检测，不要使用 PNG 外接矩形作为最终碰撞判定。
4. `grips` 是 0-1 归一化局部坐标，转换到世界坐标时必须考虑岩点 rotation。
5. Theme05 仍属于无限向上程序化随机生成资产，不是固定关卡。
6. 保留随机抽取资产、随机位置、随机旋转、可达距离检查和 outline 防交叉。
7. 当前 `type`、`difficulty`、`tags` 尚未人工分类，暂时不要用于生成权重。

## 统一主题加载建议

```js
const THEMES = {
  theme01: "assets/themes/theme01/theme01_holds_manifest.json",
  theme02: "assets/themes/theme02/theme02_holds_manifest.json",
  theme03: "assets/themes/theme03/theme03_holds_manifest.json",
  theme04: "assets/themes/theme04/theme04_holds_manifest.json",
  theme05: "assets/themes/theme05/theme05_holds_manifest.json"
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

禁止为 Theme05 新写一套平行生成逻辑。

## Theme05 文件编号说明
源文件包中不存在 `theme05_hold_015`，现有 ID 为 `001-014`、`016-018`。manifest 保留原始 ID，不自动重排，避免 PNG / SVG /数据库对应关系发生错位。
