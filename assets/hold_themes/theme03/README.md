# Theme03 Codex Final Asset Package

本包参考 `theme01_codex_final` 和 `theme02_codex_final_v2` 整理。

## 文件结构
- `images/`：透明 PNG
- `outlines/`：碰撞轮廓 SVG
- `grip/`：抓握点 SVG
- `theme03_holds_manifest.json`：程序读取的岩点数据库
- `CODEX_ASSET_SCHEMA.md`：Codex 接入与数据格式说明
- `QC_REPORT.json`：自动校验报告

所有 PNG、outline、grip 均以同一 `theme03_hold_XXX` ID 配对。
grip 已转换为 manifest 中的 0-1 归一化坐标。
