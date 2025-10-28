# Mendix插件在线预览指南

## 🌐 当前可用的预览方式

### 1. **HTML预览页面** (已启动)
- **URL**: [http://localhost:8080/preview.html](http://localhost:8080/preview.html)
- **状态**: ✅ 服务器已启动在端口8080
- **用途**: 查看插件信息和功能描述

### 2. **Mendix Studio Pro预览** (推荐)
这是查看实际插件效果的最佳方式：

#### 步骤：
1. **打开Mendix Studio Pro**
2. **创建或打开项目**
3. **复制插件文件**：
   ```bash
   # 复制编译后的插件文件到Mendix项目
   cp dist/1.0.0/PMPDnDTree.mpk /path/to/your/mendix/project/userlib/
   ```
4. **在Studio Pro中刷新**：`F4` 或 Project → Synchronize Project Directory
5. **添加插件到页面**：
   - 打开页面编辑器
   - 在Toolbox中找到 "PMPDnDTree" 插件
   - 拖拽到页面上
6. **预览**：点击 `Run` 或 `F5`

### 3. **开发服务器** (用于开发)
```bash
# 启动开发服务器（监听文件变化）
npm run dev

# 构建生产版本
npm run build

# 启动服务器（连接到Mendix Studio Pro）
npm run start
```

## 🎯 实际效果预览

当插件在Mendix中运行时，你会看到：

### 视觉效果
- **表头**: "Group Plants"
- **每行包含**:
  - ☐ **Checkbox** (可选择)
  - ▶ **展开/折叠图标** (如果有子项)
  - **组名** (粗体，层级化字体)
  - **描述信息** (灰色，小字体)
  - **UUID** (等宽字体，最小尺寸)

### 交互功能
- ✅ 点击箭头展开/折叠子项
- ✅ 点击checkbox选择项目
- ✅ 鼠标悬停高亮效果
- ✅ 响应式设计

### 示例数据结构
```
☐ ▼ Platform Group
     1 line description about this Platform group.
     UUID: 123456-789012-345678
  ☐ ▶ Digital Marketing
       Comprehensive digital marketing strategies...
       UUID: 123456-789012-345679
    ☐ • Social Media
         Social media management and content creation.
         UUID: 123456-789012-345680
```

## 🔧 开发工作流

1. **代码修改** → 自动编译（如果运行了 `npm run dev`）
2. **在Studio Pro中** → `F4` 同步
3. **预览更新** → `F5` 运行项目

## 📱 文件位置

- **源代码**: `src/`
- **编译输出**: `dist/tmp/widgets/`
- **打包文件**: `dist/1.0.0/PMPDnDTree.mpk`
- **预览文件**: `dist/tmp/widgets/PMPDnDTree.editorPreview.js`

## 🎨 自定义样式

所有样式都在 `src/ui/PMPDnDTree.css` 中定义，可以自由修改以适应你的设计需求。

---

**注意**: 要看到完整的交互效果，建议使用Mendix Studio Pro进行预览，因为这是插件的实际运行环境。