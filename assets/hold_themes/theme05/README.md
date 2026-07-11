# Theme05 Codex Final Asset Package

本包参考 Theme01–Theme04 的统一 Codex 资产格式整理。

## 文件结构
- `images/`：透明 PNG
- `outlines/`：碰撞轮廓 SVG
- `grip/`：抓握点 SVG
- `theme05_holds_manifest.json`：程序读取数据库
- `CODEX_ASSET_SCHEMA.md`：Codex 接入说明
- `QC_REPORT.json`：自动校验报告

PNG、outline、grip 均通过 `theme05_hold_XXX` ID 一一配对。
抓握点已经转换为 manifest 中的 0-1 归一化坐标。

注意：源包没有 `theme05_hold_015`。本包保留原始编号，不自动改名。
