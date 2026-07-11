# Theme02 Codex Final Asset Package

本包参考 `theme01_codex_final` 的目录和 manifest schema 整理。

## 文件结构

- `images/`：透明 PNG
- `outlines/`：碰撞轮廓 SVG
- `grip/`：抓握点 SVG
- `theme02_holds_manifest.json`：Codex / 游戏程序读取的数据
- `CODEX_ASSET_SCHEMA.md`：数据格式与接入规则
- `QC_REPORT.json`：自动检查报告

本版 grip 数据来自 Figma 整体 SVG，已经计算为 0-1 归一化坐标。
所有导出资产都统一到对应岩点的完整 Figma Frame 坐标空间。
