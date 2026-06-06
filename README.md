# Anne刷服器

Anne刷服器是一个独立的《Left 4 Dead 2》服务器浏览/刷服工具。它可以从 Steam Master Server、手动分组、SourceBans 页面和普通网页订阅里收集服务器地址，并通过 A2S 协议查询服务器名、地图、人数、延迟、VAC、标签、玩家列表和公开 rules。

项目现在已从 `CompetitiveWithAnne/tools/l4d2_server_browser` 拆出，作为单独工具维护。桌面版基于 Tauri，核心查询逻辑使用 Rust；仓库也保留命令行查询和原生 egui 界面，方便调试或自动化使用。

## 主要功能

- Tauri 桌面界面：服务器列表、分组筛选、搜索、只看有人/空服、隐藏超时。
- 服务器管理：手动添加服务器、网页订阅、粘贴网页 HTML/纯文本解析服务器地址。
- 服务器工具：Steam 连接、玩家列表、RCON、CVAR/公开 rules、延迟历史、网络归属信息。
- AnneWeb 集成：Steam 登录、全服消息、在线玩家统计、玩家积分/时长/PPM/季度分。
- 自动更新检查：从本独立项目的 GitHub Release 检查新版，并下载对应平台绿色包。

## 下载和运行

到 GitHub Release 下载对应系统的压缩包，解压后直接运行：

- Windows：双击 `Anne刷服器.exe`
- macOS：打开 `Anne刷服器.app`
- Linux：运行 `Anne刷服器`

第一次启动 Tauri 桌面版时，应用会进入设置页让你确认配置文件位置。默认配置文件会放在程序同级目录：

```text
anne-server-browser.toml
anne-server-browser-servers.json
```

`anne-server-browser.toml` 保存分组、订阅、语言、主题、API、RCON 密码等设置；`anne-server-browser-servers.json` 是上次服务器列表缓存。你也可以在首次启动时改成任意 TOML 路径，之后可在“设置 -> 配置文件”里继续调整。

## 配置文件

配置文件使用 TOML。示例见 [browser.example.toml](browser.example.toml)：

```toml
[gui]
language = "zh-CN"
anne_stats = true
theme_mode = "light"
accent_color = "#0f766e"

[updater]
auto_check = true

[api]
base_url = "https://anne.trygek.com"

[master]
enabled = true
group = "公网大厅"
address = "hl2master.steampowered.com:27011"
region = "all"
filter = "\\appid\\550"
extra_filter = ["\\secure\\1"]
limit = 200

[[groups]]
name = "我的服务器"
servers = [
  "127.0.0.1:27015",
  "steam://connect/127.0.0.1:27016",
]

[[sourcebans]]
name = "Anne 网页订阅"
url = "https://anne.trygek.com/bans/index.php?p=servers"
```

`sourcebans` 是兼容旧配置的字段名，现在也用于普通网页订阅。`url` 可以填 SourceBans 站点、`index.php?p=servers` 页面或普通网页链接；工具会从页面正文和同源 `.js` / `.json` / `.txt` / `.csv` 资源中提取 `IP:port`、`域名:port` 和 `steam://connect/...`。也可以填写 `text`，直接保存复制来的 HTML 或纯文本；同时填写 `url` 和 `text` 时优先解析 `text`。

## 开发

准备 Rust、Node.js 和系统 Tauri 依赖后，在仓库根目录运行：

```bash
npm install
npm run dev
```

构建桌面版：

```bash
npm run build
```

运行命令行查询：

```bash
cargo run --release -- --limit 200
cargo run --release -- --json --name anne
cargo run --release -- --config browser.example.toml --only-group Anne
```

运行原生 egui 界面：

```bash
cargo run --release -- --gui --config browser.example.toml
```

如果不传 `--config`，GUI 会默认使用程序同级目录的 `anne-server-browser.toml`。

## GitHub Actions

仓库包含 `.github/workflows/build.yml`。它会在 PR、推送、手动触发和发布标签时构建：

- `x86_64-pc-windows-msvc`
- `x86_64-unknown-linux-gnu`
- `x86_64-apple-darwin`
- `aarch64-apple-darwin`

普通分支推送会上传 artifact。推送 `Anne刷服器-v*` 标签，或手动运行 workflow 并填写 `release_tag`，会发布 GitHub Release。

发布示例：

```bash
git tag Anne刷服器-v1.3.1
git push origin Anne刷服器-v1.3.1
```

更新检查默认读取 `fantasylidong/anne-server-browser` 的 GitHub Release。Actions 构建时会自动把当前仓库 `${{ github.repository }}` 注入到程序里；如果以后仓库名变化，不需要改源码。

## 注意事项

- 默认 master server 是 `hl2master.steampowered.com:27011`，默认过滤条件是 `\appid\550`。
- 这是查询工具，不会对服务器发送高频请求；每个服务器最多做一次 `A2S_INFO` 查询，遇到 challenge 会按协议补发一次。
- 网页订阅只读取公开页面和同源静态资源；遇到登录墙、人机验证或站点反爬时，抓取结果会受对方限制。
- 网络归属信息使用 `ip-api.com` 免费 JSON 接口：无需 API key，但免费版仅 HTTP、45 次/分钟且不允许商用。
