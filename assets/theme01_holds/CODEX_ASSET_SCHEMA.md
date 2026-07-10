# theme01_holds_manifest 数据格式说明

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
  "themeId":"theme01",
  "holds":[
    {
      "id":"theme01_hold_001",
      "image":"images/theme01_hold_001.png",
      "outline":"outlines/theme01_hold_001.svg",
      "grip":"grip/theme01_hold_001.svg",
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

theme01_holds_manifest.json
theme02_holds_manifest.json
theme03_holds_manifest.json

保持同一 schema。
