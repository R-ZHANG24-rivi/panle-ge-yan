# Theme01 Codex Final Updated Asset Package

这是根据最新 `theme1_hold.zip` 重新生成的 Theme01 正式资产包。

## 文件结构
- `images/`：透明 PNG
- `outlines/`：碰撞轮廓 SVG
- `grip/`：抓握点 SVG
- `theme01_holds_manifest.json`：程序读取数据库
- `CODEX_ASSET_SCHEMA.md`：Codex 接入说明
- `QC_REPORT.json`：自动校验报告

共整理 16 个岩点。
PNG、outline、grip 均通过 `theme01_hold_XXX` ID 一一对应。
抓握点已转换为 manifest 中的 0-1 归一化坐标。

此包用于替换旧版 `theme01_codex_final`。
