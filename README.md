# 📍 多地址城市匹配系统

这是一个基于前端 HTML + JavaScript 实现的多地址城市匹配工具，支持自动解析多个地址、匹配共同城市、计算距离并可视化展示在地图上。

🚀 支持多地图数据源：

- 高德地图（AMap）
- OpenStreetMap（Nominatim）
- 腾讯地图（Tencent LBS）
- Geoapify（基于 OSM）

---

## 🔧 功能特色

- ✅ 多地址输入（最多支持 5 个地址）
- ✅ 多数据源解析（可自由勾选启用）
- ✅ 动态加载地图 SDK（避免暴露 API Key）
- ✅ 支持前端输入 API Key 并保存本地
- ✅ 城市级匹配逻辑（确保所有地址在同一城市）
- ✅ 距离判断（通过半径阈值）
- ✅ 匹配结果地图可视化
- ✅ 自动缓存解析结果（减少重复请求）
- ✅ OpenStreetMap 防封 IP 节流
- ✅ 支持移动端、深色模式优化

---

## 🧪 在线预览

> ✅ 可部署于 GitHub Pages，无需后端。

https://harry-sunhao.github.io/multi-address-matcher/
---

## 🖥️ 使用方式

1. 克隆仓库 / 下载 `index.html`  
2. 使用浏览器打开（推荐 Chrome / Edge / Firefox）
3. 输入多个地址，选择地图服务源
4. 填写各个 API Key（保存本地）
5. 点击【开始匹配】，查看地图与匹配过程日志

---

## 🗺️ 各地图服务申请地址

| 服务名称                     | 申请地址                                                     |
| ---------------------------- | ------------------------------------------------------------ |
| 🟢 高德地图                   | https://lbs.amap.com/dev/                                    |
| 🔵 腾讯位置服务               | https://lbs.qq.com/dev                                       |
| 🟠 Geoapify                   | https://www.geoapify.com/get-started-with-maps-api           |
| ⚪ OpenStreetMap（Nominatim） | https://nominatim.org/release-docs/latest/api/Search/（无需注册） |

---

## 📦 技术栈

- HTML / JavaScript（原生）
- 高德地图 SDK（动态加载）
- 多地图 Web API（fetch）
- 无后端，无打包构建（适合快速部署）

---

## 🛡️ 安全说明

- 所有 API Key 仅保存在用户本地（使用 `localStorage`）
- 不上传、不暴露、不依赖后端
- 高德 JS SDK 通过用户输入动态加载，避免在 HTML 中明文泄露

---

## 📱 移动端支持

- ✅ 响应式布局
- ✅ 输入框宽度自适应
- ✅ 可直接在手机浏览器使用

---

## 📌 TODO / 可拓展方向

- [ ] 匹配日志导出 CSV
- [ ] Vue3 + Composition API 重构版本
- [ ] 后端代理 GeoCoder 实现全私有化
- [ ] 区域轮廓判断、行政区划匹配
- [ ] 用户数据同步（LocalStorage → IndexedDB）

---

## 📄 许可协议

本项目基于 MIT 协议开源，地图数据服务的使用需遵守各平台 API 使用条款。