# DistillHub 部署指南

## 已完成

- GitHub 仓库：https://github.com/leo-bone/distillhub
- 分支：main
- 构建命令：`npm run build`
- 输出目录：`dist`

## 步骤 1：Cloudflare Pages 创建项目

1. 打开 https://dash.cloudflare.com
2. 左侧菜单点击 **Workers & Pages**
3. 点击 **Create** 按钮
4. 选择 **Pages** → **Connect to Git**
5. 授权 GitHub，选择仓库 **leo-bone/distillhub**
6. 配置构建设置：
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
7. 点击 **Save and Deploy**
8. 等待构建完成（约1-2分钟）

## 步骤 2：绑定自定义域名

构建成功后：

1. 进入项目 → **Custom domains** 标签
2. 点击 **Set up a custom domain**
3. 输入：`distill.uichain.org`
4. 点击 **Continue** → **Activate domain**
5. Cloudflare 会自动添加 DNS 记录（因为 uichain.org 本身就在 Cloudflare 管理）
6. 等待 SSL 证书签发（通常1-5分钟）

## 步骤 3：验证

访问 https://distill.uichain.org 确认网站正常加载。

## 注意事项

- 每次 push 到 main 分支，Cloudflare Pages 会自动重新构建部署
- 如果构建失败，在 Cloudflare Dashboard 查看构建日志
