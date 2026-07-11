# theme01_holds_manifest 数据格式说明

## 用途
这是更新后的 Theme01 Codex 资产包，与 Theme02–Theme06 使用统一 schema。

Codex 应继续通过同一套主题加载器读取 Theme01，不要为 Theme01 单独创建新的生成逻辑。

## 接入规则

1. `nativeSize` 是岩点设计基准尺寸，禁止对单个岩点随机 scale。
2. 如需屏幕适配，整套岩点统一使用 `globalHoldScale`。
3. `outline` 用于候选岩点防交叉检测，不使用 PNG 外接矩形作为最终重叠判断。
4. `grips` 是 0-1 归一化局部坐标；转换到世界坐标时必须考虑岩点 rotation。
5. Theme01 继续用于无限向上程序化随机生成，不是固定关卡。
6. 保留随机抽取岩点、随机位置、随机旋转、可达距离检查与 outline 防交叉。
7. 当前 `type`、`difficulty`、`tags` 尚未人工分类，暂时不要据此调整生成概率。

## 单个岩点数据示例

```json
{
  "id": "theme01_hold_001",
  "image": "images/theme01_hold_001.png",
  "outline": "outlines/theme01_hold_001.svg",
  "grip": "grip/theme01_hold_001.svg",
  "nativeSize": {
    "width": 174,
    "height": 184
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

## 统一主题加载建议

```js
const THEMES = {
  theme01: "assets/themes/theme01/theme01_holds_manifest.json",
  theme02: "assets/themes/theme02/theme02_holds_manifest.json",
  theme03: "assets/themes/theme03/theme03_holds_manifest.json",
  theme04: "assets/themes/theme04/theme04_holds_manifest.json",
  theme05: "assets/themes/theme05/theme05_holds_manifest.json",
  theme06: "assets/themes/theme06/theme06_holds_manifest.json"
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

禁止为更新后的 Theme01 新写一套平行生成逻辑。
