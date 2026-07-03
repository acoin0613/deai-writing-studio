# DeAI Writing Studio

一个可发布的去 AI 味写作网页工具。用户打开网页后，可以在右上角“模型设置”里填写自己的 API Key、Base URL 和模型名，然后直接分析和改写文本。

## 本地运行

```bash
npm start
```

Windows 也可以双击：

```text
start-windows.bat
```

打开后进入网页，点击“模型设置”，选择供应商并填写：

```text
API Key
接口地址
模型名
接口模式
```

配置保存在当前浏览器的 `localStorage`，不会写入仓库，也不会保存到服务器文件。

## 支持的模型入口

设置面板内置这些预设：

- OpenAI / GPT：`https://api.openai.com/v1`
- DeepSeek：`https://api.deepseek.com/v1`
- Claude 官方：`https://api.anthropic.com`，走 Anthropic Messages API
- OpenRouter：`https://openrouter.ai/api/v1`
- 自定义 OpenAI 兼容接口：适合硅基流动、OneAPI、NewAPI、LiteLLM 等

DeepSeek、OpenRouter、硅基流动等一般使用 `chat` 模式。Claude 官方不用 OpenAI 格式，选择“Claude 官方”即可。

## 发布方式

这个项目需要 Node 后端代理模型请求，不能只用 GitHub Pages。推荐流程：

1. 新建 GitHub 仓库。
2. 上传本目录全部文件，但不要上传 `.env`。
3. 在 Render、Railway、Fly.io、Vercel Node Server 等平台连接 GitHub 仓库。
4. 启动命令使用：

```bash
npm start
```

5. 部署完成后，把生成的网页链接发给别人。
6. 别人打开链接后，在网页右上角“模型设置”填自己的 API，即可使用。

## 安全说明

- API Key 由用户自己填写，保存在用户自己的浏览器里。
- 后端只在当前请求中临时使用 API Key 转发到模型服务，不写入磁盘。
- 如果你把自己的 API Key 配到云平台环境变量里，所有访问者都会默认使用你的额度，不建议公开链接这样做。

## 内置 Skill

项目内置：

```text
skills/deai-skill-kernel/SKILL.md
skills/deai-skill-kernel/references/
```

后端每次调用模型时都会读取这些文件，并把它们作为 `deai-skill-kernel` 的执行规则注入给模型。
