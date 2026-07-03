const http = require("http");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

const root = __dirname;
const startPort = Number(process.env.PORT || 4173);
const skillRoot = path.join(root, "skills", "deai-skill-kernel");
const listenHost = process.env.HOST || (process.env.PORT ? "0.0.0.0" : "127.0.0.1");

const defaultConfig = {
  apiKey: process.env.OPENAI_API_KEY || "",
  provider: "openai-compatible",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4.1-mini",
  apiMode: "chat",
  timeoutMs: 75000
};

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8",
  ".ico": "image/x-icon"
};

function openBrowser(url) {
  const command = process.platform === "win32"
    ? `start "" "${url}"`
    : process.platform === "darwin"
      ? `open "${url}"`
      : `xdg-open "${url}"`;
  exec(command);
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function sanitizeConfig(input = {}) {
  const config = {
    apiKey: String(input.apiKey || process.env.OPENAI_API_KEY || "").trim(),
    provider: String(input.provider || process.env.MODEL_PROVIDER || defaultConfig.provider).trim().toLowerCase(),
    baseUrl: String(input.baseUrl || process.env.OPENAI_BASE_URL || defaultConfig.baseUrl).trim().replace(/\/+$/, ""),
    model: String(input.model || process.env.OPENAI_MODEL || defaultConfig.model).trim(),
    apiMode: String(input.apiMode || process.env.OPENAI_API_MODE || defaultConfig.apiMode).trim().toLowerCase(),
    timeoutMs: Number(input.timeoutMs || process.env.OPENAI_TIMEOUT_MS || defaultConfig.timeoutMs)
  };
  if (!["openai-compatible", "anthropic"].includes(config.provider)) config.provider = "openai-compatible";
  if (config.provider === "anthropic") {
    config.apiMode = "messages";
    if (!input.baseUrl) config.baseUrl = "https://api.anthropic.com";
  } else if (!["chat", "responses"].includes(config.apiMode)) {
    config.apiMode = "chat";
  }
  if (!Number.isFinite(config.timeoutMs) || config.timeoutMs < 10000) config.timeoutMs = defaultConfig.timeoutMs;
  config.timeoutMs = Math.min(config.timeoutMs, 180000);
  return config;
}

function publicConfig(config) {
  return {
    hasApiKey: Boolean(config.apiKey),
    provider: config.provider,
    baseUrl: config.baseUrl,
    model: config.model,
    apiMode: config.apiMode,
    timeoutMs: config.timeoutMs
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 120000) {
        reject(new Error("文本太长，请先缩短到 10 万字符以内。"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function extractOutputText(payload) {
  const chatText = payload && payload.choices && payload.choices[0] && payload.choices[0].message && payload.choices[0].message.content;
  if (typeof chatText === "string") return chatText;
  if (typeof payload.output_text === "string") return payload.output_text;
  const parts = [];
  for (const item of payload.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) parts.push(content.text);
      if (content.type === "text" && content.text) parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function anthropicToText(payload) {
  return (payload.content || [])
    .map((part) => typeof part.text === "string" ? part.text : "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

async function postModelJson(config, messages, options = {}) {
  const timeout = options.timeoutMs || config.timeoutMs;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    if (config.provider === "anthropic") {
      const system = messages.filter((item) => item.role === "system").map((item) => item.content).join("\n\n");
      const userMessages = messages.filter((item) => item.role !== "system");
      const response = await fetch(`${config.baseUrl || "https://api.anthropic.com"}/v1/messages`, {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-api-key": config.apiKey,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: config.model,
          system,
          messages: userMessages,
          max_tokens: options.maxTokens || 4096,
          temperature: options.temperature ?? 0.2
        })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const message = payload.error && payload.error.message ? payload.error.message : "Claude API 请求失败。";
        throw new Error(message);
      }
      return parseJsonText(anthropicToText(payload));
    }

    const isResponsesMode = config.apiMode === "responses";
    const endpoint = isResponsesMode ? `${config.baseUrl}/responses` : `${config.baseUrl}/chat/completions`;
    const body = isResponsesMode ? {
      model: config.model,
      input: messages,
      temperature: options.temperature ?? 0.2,
      text: { format: { type: "json_object" } }
    } : {
      model: config.model,
      messages,
      temperature: options.temperature ?? 0.2,
      response_format: { type: "json_object" }
    };

    let response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`
      },
      body: JSON.stringify(body)
    });
    let payload = await response.json().catch(() => ({}));
    if (!response.ok && !isResponsesMode && payload && payload.error) {
      const message = String(payload.error.message || "");
      if (/response_format|json_object|unsupported|not support|不支持/i.test(message)) {
        response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.apiKey}`
          },
          body: JSON.stringify({ model: config.model, messages, temperature: options.temperature ?? 0.2 })
        });
        payload = await response.json().catch(() => ({}));
      }
    }
    if (!response.ok) {
      const message = payload && payload.error && payload.error.message ? payload.error.message : "模型 API 请求失败。";
      throw new Error(message);
    }
    return parseJsonText(extractOutputText(payload));
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`模型请求超时：${Math.round(timeout / 1000)} 秒内没有返回。请检查接口地址、模型名、网络或服务状态。`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function parseJsonText(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/```json\s*([\s\S]*?)```|({[\s\S]*})/);
    if (!match) throw new Error("模型没有返回合法 JSON。");
    return JSON.parse(match[1] || match[2]);
  }
}

const transitionPattern = /(不是[^。！？\n]{0,28}而是|并不是[^。！？\n]{0,28}而是|靠的不是[^。！？\n]{0,28}靠的是|这不仅仅是[^。！？\n]{0,28}更是|然而|但是|不过|同时|此外|进一步|从本质上看|值得注意的是|综上所述|在未来的发展过程中)/g;

function transitionDensityReport(result) {
  const outputs = result && result.outputs;
  if (!outputs || typeof outputs !== "object") return {};
  return Object.fromEntries(["safe", "natural", "voice"].map((key) => {
    const value = typeof outputs[key] === "string" ? outputs[key] : "";
    const hits = value.match(transitionPattern) || [];
    return [key, {
      hits: hits.length,
      chars: value.length,
      density: value.length ? Number((hits.length / Math.max(1, value.length / 500)).toFixed(2)) : 0
    }];
  }));
}

function readTextIfExists(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function loadSkillContext() {
  const parts = [
    ["SKILL.md", readTextIfExists(path.join(skillRoot, "SKILL.md"))],
    ["references/scene-scope.md", readTextIfExists(path.join(skillRoot, "references", "scene-scope.md"))],
    ["references/ai-trace-patterns.md", readTextIfExists(path.join(skillRoot, "references", "ai-trace-patterns.md"))],
    ["references/fact-gate.md", readTextIfExists(path.join(skillRoot, "references", "fact-gate.md"))]
  ];

  const content = parts
    .filter(([, text]) => text.trim())
    .map(([name, text]) => `\n\n===== ${name} =====\n${text.trim()}`)
    .join("");

  return content || "Skill files were not found. Use built-in DeAI behavior.";
}

const skillContext = loadSkillContext();
const sentenceSkillContext = skillContext;

const strictRewriteContract = `
STRICT DEAI CONTRACT:
You are not merely polishing text. You must reduce mechanical transition density while preserving meaning, logic, and academic caution.

Transition policy:
1. Do not treat "不是...而是...", "然而", "但是", "同时", "此外", "进一步" or similar connectors as forbidden words.
2. Keep necessary contrast, causal relation, concession, and academic hedging when they carry real logic.
3. Reduce repeated or decorative transition shells, especially stacked contrast formulas, balanced slogan-like clauses, and template openings.
4. In academic scene, preserve rigorous logical relations first. Prefer quieter connectors, sentence splitting, or direct factual sequencing over promotional contrast.
5. In public-writing or chat scene, be more aggressive about removing stiff contrast shells and neat parallel rhythm.
6. Unsupported authority such as "研究表明" should be kept only if the input gives a source or the phrase is part of the original claim that must be preserved; otherwise weaken or mark it as attribution needed.

Before returning, silently audit every output field:
- Are transition words necessary, or just making the paragraph look smooth?
- Are there multiple similar contrast shells in a short passage?
- Did any academic uncertainty or logical relation get wrongly deleted?

Return JSON only after the output reduces unnecessary transitions without flattening the argument.
`;

const strictSentenceContract = `
STRICT SENTENCE AUDIT CONTRACT:
Analyze sentence issues using the same deai-skill-kernel rules. Prioritize clustered AI traces and concrete sentence-level causes.
Flag rigid or repeated contrast shells, unsupported authority, over-balanced hedging, overly neat paragraph rhythm, and empty academic-sounding scaffolding.
Do not mark a connector as a problem merely because it is present. In academic scene, only flag it when it is decorative, repetitive, slogan-like, or weakens the logical precision.
Do not rewrite the whole text here. Return concise sentence issues only.
`;

function buildPrompt(input) {
  return [
    {
      role: "system",
      content: [
        "你正在网页应用中调用已封包的 Codex skill：$deai-skill-kernel。",
        "必须严格按照下面的 skill 文件执行分析、逐句诊断、保真检查和改写。",
        "如果用户选择的场景、强度、语气与 skill 规则冲突，以 skill 的保真和事实门禁为最高优先级。",
        "不要编造来源、数据、机构、年份、专家身份或背景信息。",
        "只返回 JSON，不要 Markdown，不要解释 JSON 外的内容。",
        strictRewriteContract,
        skillContext
      ].join("\n")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "analyze_and_rewrite",
        requiredSchema: {
          signals: [
            { name: "问题类型", severity: "high|mid|low", value: "触发片段", family: "template|authority|jargon|balance|structure|inflation|service|fidelity" }
          ],
          outputs: {
            safe: "保守版，尽量保留原结构",
            natural: "自然版，允许适度重组",
            voice: "风格版，更像真人写，但不改变事实"
          },
          fidelity: {
            numbers: "通过/风险说明",
            dates: "通过/风险说明",
            names: "通过/风险说明",
            addedClaims: "无新增/风险说明",
            claimStrength: "一致/风险说明",
            attribution: "一致/风险说明"
          }
        },
        scene: input.scene,
        sceneLabel: input.sceneLabel,
        strength: input.strength,
        tone: input.tone,
        fidelityLevel: input.fidelity,
        styleSample: input.styleSample,
        localSignals: input.localSignals,
        text: input.text,
        extraRules: [
          "重点识别：不是 A 而是 B、靠的不是 A 靠的是 B、不是 AI 看 是活人看。",
          "重点识别：可能、大概率、当然取决于具体情况、两边都说的端水表达。",
          "重点识别：每段行数接近、对仗工整、句长过于平均。",
          "人写作常有节奏波动：短句、长句、突然的判断都可能合理。",
          "如果原句有必要保留学术 hedging，不要误删。",
          "本次完整改写不要输出 sentenceIssues；语句问题由 /api/sentence-issues 单独处理。"
        ]
      }, null, 2)
    }
  ];
}

async function callOpenAI(input, config) {
  if (!config.apiKey) {
    throw new Error("Missing API Key. Open Model Settings and fill your key first.");
  }
  return postModelJson(config, buildPrompt(input), { temperature: 0.18 });
}

async function callModelMessages(messages, config, options = {}) {
  if (!config.apiKey) {
    throw new Error("Missing API Key. Open Model Settings and fill your key first.");
  }
  return postModelJson(config, messages, options);
}

function buildSentencePrompt(input) {
  return [
    {
      role: "system",
      content: [
        "你正在网页应用中调用已封包的 Codex skill：$deai-skill-kernel。",
        "本次只做语句问题分析，不做全文改写。必须按 skill 判断 AI 味、端水、工整、黑话、假权威和保真风险。",
        "只返回 JSON，不要 Markdown。",
        strictSentenceContract,
        sentenceSkillContext
      ].join("\n")
    },
    {
      role: "user",
      content: JSON.stringify({
        task: "sentence_issues_only",
        requiredSchema: {
          sentenceIssues: [
            { index: 1, sentence: "原句", severity: "high|mid|low", issues: ["问题"], suggestion: "修改建议" }
          ],
          signals: [
            { name: "问题类型", severity: "high|mid|low", value: "触发片段", family: "template|authority|jargon|balance|structure|inflation|service|fidelity" }
          ]
        },
        scene: input.scene,
        sceneLabel: input.sceneLabel,
        text: input.text
      }, null, 2)
    }
  ];
}

async function testModelConnection(config) {
  if (!config.apiKey) {
    throw new Error("Missing API Key. Open Model Settings and fill your key first.");
  }
  if (config.provider === "anthropic") {
    const messages = [
      { role: "system", content: "Return JSON only." },
      { role: "user", content: "{\"ok\":true}" }
    ];
    await postModelJson(config, messages, { temperature: 0, maxTokens: 256, timeoutMs: Math.min(config.timeoutMs, 30000) });
    return { ok: true, model: config.model, provider: config.provider, mode: "messages", baseUrl: config.baseUrl };
  }
  const isResponsesMode = config.apiMode === "responses";
  const endpoint = isResponsesMode ? config.baseUrl + "/responses" : config.baseUrl + "/chat/completions";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.min(config.timeoutMs, 30000));
  const body = isResponsesMode ? {
    model: config.model,
    input: [{ role: "user", content: "Reply ok only." }],
    temperature: 0
  } : {
    model: config.model,
    messages: [{ role: "user", content: "Reply ok only." }],
    temperature: 0
  };
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + config.apiKey
      },
      body: JSON.stringify(body)
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const message = payload && payload.error && payload.error.message ? payload.error.message : "Model API test failed.";
      throw new Error(message);
    }
    return {
      ok: true,
      model: config.model,
      provider: config.provider,
      mode: config.apiMode,
      baseUrl: config.baseUrl,
      sample: extractOutputText(payload).slice(0, 80)
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("API test timed out after 30 seconds.");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function handleAnalyze(req, res) {
  try {
    const raw = await readBody(req);
    const input = JSON.parse(raw || "{}");
    if (!input.text || typeof input.text !== "string") {
      sendJson(res, 400, { error: "缺少 text。" });
      return;
    }
    const config = sanitizeConfig(input.config || {});
    const result = await callOpenAI(input, config);
    result.transitionDensity = transitionDensityReport(result);
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleSentenceIssues(req, res) {
  try {
    const raw = await readBody(req);
    const input = JSON.parse(raw || "{}");
    if (!input.text || typeof input.text !== "string") {
      sendJson(res, 400, { error: "缺少 text。" });
      return;
    }
    const config = sanitizeConfig(input.config || {});
    const result = await callModelMessages(buildSentencePrompt(input), config, { timeoutMs: Math.min(config.timeoutMs, 45000), temperature: 0.15 });
    sendJson(res, 200, result);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
}

async function handleHealth(req, res) {
  try {
    let input = {};
    if (req.method === "POST") {
      const raw = await readBody(req);
      input = JSON.parse(raw || "{}");
    }
    const config = sanitizeConfig(input.config || {});
    const result = await testModelConnection(config);
    sendJson(res, 200, result);
  } catch (error) {
    const config = sanitizeConfig({});
    sendJson(res, 500, { error: error.message, ...publicConfig(config) });
  }
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const safePath = path.normalize(relativePath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);

  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function createServer(port) {
  const server = http.createServer((req, res) => {
    if ((req.method === "GET" || req.method === "POST") && req.url === "/api/health") {
      handleHealth(req, res);
      return;
    }
    if (req.method === "POST" && req.url === "/api/analyze") {
      handleAnalyze(req, res);
      return;
    }
    if (req.method === "POST" && req.url === "/api/sentence-issues") {
      handleSentenceIssues(req, res);
      return;
    }
    serveStatic(req, res);
  });

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      createServer(port + 1);
      return;
    }
    console.error(error);
    process.exit(1);
  });

  server.listen(port, listenHost, () => {
    const url = `http://127.0.0.1:${port}`;
    console.log(`DeAI Writing Studio is running at ${url}`);
    console.log(`Host: ${listenHost}`);
    console.log("Press Ctrl+C to stop.");
    if (listenHost === "127.0.0.1") openBrowser(url);
  });
}

createServer(startPort);
