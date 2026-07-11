# theme06_holds_manifest 数据格式说明

## 用途
本包与 Theme01–Theme05 使用统一资产 schema。

Codex 应通过同一套主题加载器读取 Theme06，不要为 Theme06 单独复制生成逻辑。

## 接入规则

1. `nativeSize` 是设计基准尺寸，禁止对单个岩点随机 scale。
2. 屏幕适配时，整套岩点统一使用 `globalHoldScale`。
3. `outline` 用于候选岩点防交叉检测，不使用 PNG 外接矩形作为最终判定。
4. `grips` 是 0-1 归一化局部坐标，转换到世界坐标时必须考虑岩点 rotation。
5. Theme06 继续用于无限向上程序化随机生成，不是固定关卡。
6. 保留随机抽取资产、随机位置、随机旋转、可达距离检查和 outline 防交叉。
7. 当前 `type`、`difficulty`、`tags` 尚未人工分类，暂时不要用于生成权重。

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

禁止为 Theme06 新写平行生成逻辑。
