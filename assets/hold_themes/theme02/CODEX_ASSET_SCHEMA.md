# theme02_holds_manifest 数据格式说明

## 用途
该文件是攀岩 H5 游戏岩点资产数据库。
Codex 根据该文件完成：
- 岩点随机生成
- 岩点尺寸保持
- 防交叉碰撞
- 抓握点判定
- 主题切换

## 数据结构

```json
{
  "themeId":"theme02",
  "holds":[
    {
      "id":"theme02_hold_001",
      "image":"images/theme02_hold_001.png",
      "outline":"outlines/theme02_hold_001.svg",
      "grip":"grip/theme02_hold_001.svg",
      "nativeSize":{
        "width":250,
        "height":321
      },
      "grips":[
        {
          "x":0.56,
          "y":0.58,
          "type":"primary"
        }
      ]
    }
  ]
}
```

## 字段说明

### id
唯一资产 ID。
必须与 PNG/SVG 文件名一致。

### image
游戏渲染使用的岩点图片。

### outline
岩点外轮廓。
用于：
- 碰撞检测
- 岩点间距判断
- 防止线路重叠

不要使用图片透明边界。

### nativeSize
原始设计尺寸。
禁止随机缩放。
随机系统只能改变：
- x位置
- y位置
- rotation

保持视觉比例。

### grips
抓握点。
坐标为归一化比例：

x = pixelX / nativeWidth

y = pixelY / nativeHeight

例如：
x=0.5 表示岩点水平中心。

## 随机生成规则建议

程序生成时：

1. 从当前 theme holds 中随机选择岩点
2. 根据 difficulty 权重控制出现概率
3. 保留 nativeSize
4. 随机旋转 -30°~30°
5. 使用 outline polygon 做碰撞检测
6. 检查与已有岩点距离
7. 生成失败则重新采样

## 五套主题结构

theme02_holds_manifest.json
theme02_holds_manifest.json
theme03_holds_manifest.json

保持同一 schema。


## Theme02 本包补充说明

- `images/`、`outlines/`、`grip/` 三类文件均按相同 `id` 一一对应。
- 本包使用 Figma “整体 SVG”的完整 `width / height / viewBox` 作为统一坐标空间。
- `grips` 已从整体 SVG 中的 circle / ellipse 圆心计算为 0-1 归一化坐标。
- `theme02_hold_011` 的原 PNG 内容尺寸小于完整 Figma Frame，本包已补透明画布到 `nativeSize`，不会拉伸图片，确保 outline 与 grip 坐标准确对应。
- 当前 `type`、`difficulty`、`tags` 尚未人工分类，Codex 暂时不要根据这些字段调整随机概率。
