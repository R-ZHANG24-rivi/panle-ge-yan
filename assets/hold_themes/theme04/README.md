# Theme04 Codex Final Asset Package

本包参考 Theme01、Theme02、Theme03 的统一 Codex 资产格式整理。

## 文件结构
- `images/`：透明 PNG
- `outlines/`：碰撞轮廓 SVG
- `grip/`：抓握点 SVG
- `theme04_holds_manifest.json`：程序读取数据库
- `CODEX_ASSET_SCHEMA.md`：Codex 接入说明
- `QC_REPORT.json`：自动校验报告

PNG、outline、grip 均通过 `theme04_hold_XXX` ID 一一配对。
抓握点已经转换为 manifest 中的 0-1 归一化坐标。


## Theme04 0.8x 尺寸调整

由于 Theme04 岩点相较其他主题整体偏大，本版本已将 Theme04 全套岩点统一缩小至约 `0.8x`。

同步调整内容：
- PNG 显示资产
- outline SVG 坐标空间
- grip SVG 坐标空间
- manifest 中的 `nativeSize`

`grips` 为 0-1 归一化坐标，因此保持不变。

该调整是整套主题统一缩放，不改变 Theme04 内部各岩点之间的相对大小关系。
