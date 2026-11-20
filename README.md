# VPN 订阅链接自动分享系统

这个项目可以**自动获取**你的VPN订阅链接，并提供一个**固定网址**让Discord里的朋友访问，你完全不用手动更新！

## 📋 功能特点

- ✅ **全自动**：每小时自动登录网站获取最新订阅链接
- ✅ **零维护**：设置好后完全不用管
- ✅ **固定网址**：Discord里只需要发一次网址，永久有效
- ✅ **完全免费**：使用GitHub的免费服务
- ✅ **隐私安全**：账号密码加密存储在你的私有仓库

## 🚀 部署步骤（10分钟搞定）

### 第一步：创建 GitHub 仓库

1. 访问 [GitHub](https://github.com)，登录你的账号（没有的话先注册一个）
2. 点击右上角的 `+` → `New repository`
3. 填写信息：
   - **Repository name**（仓库名）：`vpn-link-share`（随便起个名字）
   - **描述**（可选）：自动分享VPN订阅链接
   - ⚠️ **重要**：选择 **Private**（私有），保护你的隐私
   - 不要勾选任何初始化选项（README、.gitignore等）
4. 点击 `Create repository`

### 第二步：上传代码文件

打开刚创建的空仓库，你会看到一些命令提示。

**在你电脑上打开命令行（Terminal/PowerShell/Git Bash）**，执行以下命令：

```bash
# 进入项目文件夹
cd C:\Users\34956\vpn-link-auto-share

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "初始化VPN订阅链接自动分享系统"

# 连接到你的GitHub仓库（替换成你自己的用户名和仓库名）
git remote add origin https://github.com/你的用户名/vpn-link-share.git

# 推送代码
git branch -M main
git push -u origin main
```

### 第三步：配置账号密码（关键步骤）

1. 在GitHub仓库页面，点击 `Settings`（设置）
2. 左侧菜单找到 `Secrets and variables` → `Actions`
3. 点击 `New repository secret`，添加两个密钥：

**第一个密钥：**
- Name: `VPN_EMAIL`
- Secret: 填入你的邮箱（3495650937@qq.com）
- 点击 `Add secret`

**第二个密钥：**
- Name: `VPN_PASSWORD`
- Secret: 填入你的新密码（记得先去改密码！）
- 点击 `Add secret`

⚠️ **安全提醒**：
- 这些信息只存在你的私有仓库里，别人看不到
- **建议去 https://gw-2.smjc2.com 修改密码**，用一个新密码专门给这个自动化用

### 第四步：启用 GitHub Pages

1. 在仓库的 `Settings` 页面
2. 左侧菜单找到 `Pages`
3. 在 **Source** 部分：
   - Branch: 选择 `main`
   - Folder: 选择 `/docs`
4. 点击 `Save`

等待1-2分钟，你会看到一个绿色提示框，显示你的网站地址：
```
Your site is live at https://你的用户名.github.io/vpn-link-share/
```

**这个网址就是最终要发到Discord的固定链接！**

### 第五步：手动运行一次测试

1. 在仓库页面点击 `Actions` 标签
2. 左侧选择 `自动更新订阅链接`
3. 点击 `Run workflow` → `Run workflow`
4. 等待30秒-1分钟，查看运行结果

✅ **如果显示绿色勾号 = 成功！**
❌ **如果显示红色叉号 = 有问题，点进去查看日志**

### 第六步：访问你的网站

打开浏览器，访问：
```
https://你的用户名.github.io/vpn-link-share/
```

你应该能看到一个漂亮的页面，显示订阅链接和更新时间！

## 🎉 使用方法

### 分享给Discord朋友

在Discord帖子里发这个链接：
```
https://你的用户名.github.io/vpn-link-share/
```

告诉大家：
> 这是最新的VPN订阅链接，点开就能看到，随时保持最新，不用等我更新帖子了！

### 自动更新机制

系统会**每小时自动运行一次**，检查并更新订阅链接。你完全不用管！

如果想手动触发更新：
1. 进入仓库的 `Actions` 标签
2. 点击 `自动更新订阅链接`
3. 点击 `Run workflow`

## 🔧 故障排查

### 问题1：GitHub Actions显示红色❌

**可能原因**：
- 账号密码配置错误
- 网站页面结构变化了

**解决方法**：
1. 点击失败的运行记录，查看日志
2. 如果提示登录失败，检查 Secrets 里的账号密码是否正确
3. 如果提示"未能找到订阅链接"，可能是网站页面改版了，需要调整脚本

### 问题2：网页显示"加载失败"

**可能原因**：
- GitHub Pages还没生效（刚部署需要等几分钟）
- 脚本还没运行过，没有生成 `subscription.json`

**解决方法**：
1. 等待5分钟后刷新
2. 手动运行一次 GitHub Actions
3. 检查 `docs` 文件夹里是否有 `subscription.json` 文件

### 问题3：想修改自动更新频率

编辑 `.github/workflows/update-subscription.yml` 文件：

```yaml
schedule:
  - cron: '0 * * * *'  # 每小时运行
  # 改成其他频率：
  # - cron: '*/30 * * * *'  # 每30分钟
  # - cron: '0 */2 * * *'   # 每2小时
  # - cron: '0 */6 * * *'   # 每6小时
```

## 📝 文件说明

```
vpn-link-auto-share/
├── fetch-subscription.js          # 自动获取订阅链接的脚本
├── docs/
│   ├── index.html                 # 用户访问的网页
│   └── subscription.json          # 存储订阅链接（自动生成）
├── .github/
│   └── workflows/
│       └── update-subscription.yml # GitHub Actions配置
├── package.json                   # Node.js依赖配置
└── README.md                      # 说明文档（本文件）
```

## ⚠️ 重要提醒

1. **修改密码**：建议专门为这个自动化创建一个新密码
2. **保持私有**：仓库务必设置为 Private
3. **不要泄露**：不要把 GitHub 仓库链接分享给别人，只分享 GitHub Pages 网址
4. **定期检查**：偶尔看看 Actions 是否正常运行

## 🎯 成功标志

当你完成部署后：
- ✅ Discord里的朋友访问固定网址就能获取最新链接
- ✅ 你完全不用再手动更新帖子
- ✅ 系统每小时自动检查并更新
- ✅ 一切都在后台自动运行

---

## 📞 需要帮助？

如果遇到问题：
1. 查看 GitHub Actions 的运行日志
2. 检查是否有截图文件 `debug-screenshot.png`（脚本会自动生成）
3. 检查网站页面结构是否变化

祝使用愉快！🎉
