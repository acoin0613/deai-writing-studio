---
name: deai-skill-kernel
description: Chinese and English writing humanization skill for removing AI-flavored prose while preserving facts, terms, citations, structure, and author voice. Use for "去 AI 味", "说人话", "别像 ChatGPT", "保留原意改写", "检查哪里像 AI", Chinese polishing, style-preserving rewriting, translation cleanup, and author voice calibration.
---

# DeAI Skill Kernel

## Purpose

Turn text from "a model performing writing" into "a concrete person writing in a concrete situation." Preserve meaning, facts, terminology, source attribution, and the user's intended register. Do not make professional writing casual unless the scene calls for it.

## 中文说明

这个 skill 的目标不是把文本改得更花、更口语、或者更像某种固定的“人味模板”，而是把模型写作中常见的空泛、顺滑、表演性和模板感压下去，让文字重新贴近具体作者、具体场景和具体事实。

使用时要先判断文本属于哪类场景：论文、文档、汇报、公众号/小红书/评论、聊天回复、翻译稿，还是混合文本。不同场景的“自然”标准不同：论文需要稳、准、有出处；文档需要清楚、可检索；聊天需要像真人在当前关系里说话；公众写作需要有判断、有节奏，但不能靠夸张词撑气势。

“去 AI 味”优先处理三类问题：第一，明显的 AI 痕迹，例如“值得注意的是”“综上所述”“这不仅仅是 X 更是 Y”；第二，虚假的权威感，例如没有来源的“研究表明”“专家认为”；第三，空洞的结构和语气，例如三段式排比、过度安慰、客服式回应、宏大但没有信息量的总结。

改写必须保真。数字、日期、姓名、机构、引用、代码、术语、责任归属和不确定表达都要先保护起来。宁可保留一点生硬，也不要为了自然感改掉事实、偷换判断、增加来源、编造背景或改变作者立场。

如果用户只要求“润色”，默认做轻到中等强度的去味；如果用户明确说“大胆改”“说人话”“别像 AI”，才允许更强的结构调整。最终输出优先给一版可直接使用的结果，除非用户要求诊断，否则不要输出过长的分析清单。

## Operating Contract

Follow this sequence for every task:

1. Classify the task: rewrite, review, translation cleanup, continuation, generation, or final polish.
2. Classify the scene: `academic`, `docs`, `status`, `public-writing`, `chat`, `translation`, or `mixed`.
3. Mark protected spans before editing: numbers, dates, names, citations, quotes, terms, code, commands, paths, fields, logs, metrics, and responsibility attribution.
4. Diagnose AI traces by pattern family, not by isolated words.
5. Choose severity: `Tier 1`, `Tier 2`, or `Tier 3`.
6. Choose edit level: `minimal`, `standard`, or `aggressive`.
7. Choose edit scope: `in-place`, `bounded`, or `structural`.
8. Rewrite in this order: structure, register, sentence form, then words.
9. Reread for fidelity first.
10. Run a residual AI trace audit only after fidelity passes.
11. If the text contains factual claims, run the fact gate.

## Scene Defaults

Use [references/scene-scope.md](references/scene-scope.md) when the scene or scope is unclear.

| Scene | Default | Rule |
|---|---|---|
| `academic` | `standard + bounded` | Keep claims, evidence, citations, terms, hedging, and logical steps. |
| `docs` | `minimal + in-place` | Keep searchable terms, exact commands, parameters, and system subjects. |
| `status` | `minimal/standard + in-place` | Keep timeline, action, result, risk, and owner clear. |
| `public-writing` short text | `standard + structural` | Remove template structure and empty insight performance. |
| `public-writing` long text | `standard + bounded` | Do not shrink unpredictably; list removable empty sentences. |
| `chat` | `minimal + structural` | Remove flattery, customer-service tone, meta comments, and over-comforting. |
| `translation` | `minimal + in-place` | Preserve structure; do not add commentary, headings, or claims. |

## Protected Spans

Before editing, preserve:

- Numbers, percentages, money, dates, times, versions, ranges, units.
- Names, organizations, products, modules, services, issue/PR/RFC IDs.
- Quoted text, titles, report names, standards, exact terms.
- Code, commands, APIs, parameters, fields, paths, environment variables.
- Errors, logs, HTTP status codes, metrics, experiment results, baselines.
- Sources, claim attribution, responsibility owners, and uncertainty markers.

If a sentence can become natural only by changing a protected span, keep the protected span and accept slight stiffness.

## Severity

### Tier 1: default fix

Fix or delete direct AI tells:

- Throat-clearing, empty conclusions, sycophancy, chatbot disclaimers.
- Unsourced authority: "研究表明", "专家认为", "业内人士指出" without a source.
- Value inflation: "这不仅仅是 X, 更是 Y", "真正的 X 不是 A, 而是 B".
- Business jargon and platform slop: "赋能", "抓手", "闭环", "沉淀方法论".
- Performative empathy or certification: "你问到了问题的核心", "你不是敏感".
- Dramatic reveal: "遮羞布", "面具", "揭开真面目", "戳穿真相".

### Tier 2: fix when clustered

Fix when repeated in the same paragraph or across adjacent paragraphs:

- Connectors: "此外", "然而", "与此同时", "进一步", "事实上".
- Inflated modifiers: "显著", "有效", "全面", "积极", "持续".
- Analysis posture: "深入探讨", "聚焦", "洞察", "解构", "梳理", "拆解".

### Tier 3: fix only when dense

Common words are not problems alone: "重要", "关键", "核心", "基础", "创新", "优化", "提升", "推动", "确保", "实现".

## Edit Scope

### `in-place`

Do not delete whole sentences, merge adjacent sentences, or reorder paragraphs. Only reduce tone, remove sentence-internal scaffolding, and simplify overloaded syntax.

Use for translation, docs, academic passages requiring structure preservation, and user requests to keep sentence count.

### `bounded`

Clean within sentences. Put whole empty sentences into a "建议删除（待确认）" list instead of deleting them directly. A sentence may enter the list only if:

- Removing it loses no fact, number, judgment, action, or instruction.
- It is not the only transition between two factual sentences.
- It is an empty conclusion, value-inflation shell, unsourced authority setup, flattery opener, or narrator sentence.

### `structural`

You may delete empty sentences, merge adjacent factual sentences, lightly reorder, and rewrite local structure. Use for short public-writing, chat, and explicit rewrite requests.

## AI Trace Pattern Library

Use [references/ai-trace-patterns.md](references/ai-trace-patterns.md) for detailed Chinese and English pattern families. Prioritize:

- Meaning inflation and legacy language.
- Promotional language.
- Vague attribution.
- Shallow sentence-tail analysis.
- Binary contrast shells.
- Rigid contrast slogans such as "不是 A，而是 B" and "靠的不是 A，靠的是 B" when overused or stiff.
- Excessive hedging and balance: too many "可能", "大概率", "取决于具体情况", or both-sides framing.
- Three-part list overuse.
- Analysis-teacher posture.
- Dramatic reveal metaphors.
- Extreme judgment shells.
- Pseudo-academic register.
- Paragraph isomorphism and overly even sentence rhythm.
- Chatbot collaboration residue.

## Author Voice Calibration

If the user provides writing samples, read [references/style-dna.md](references/style-dna.md) and extract style DNA before rewriting:

- Sentence length and paragraph thickness.
- Register, certainty, first/second-person habits.
- Vocabulary preferences and forbidden phrases.
- Argument rhythm: fact-first, claim-first, anecdote-first, or analogy-first.
- Punctuation habits.
- What this author would not say.

Apply HOW the author writes, not WHAT they have said. Do not caricature.

## Fact Gate

Use [references/fact-gate.md](references/fact-gate.md) when the text contains numbers, dates, policies, institutions, reports, studies, URLs, strong factual claims, or "数据显示/研究表明/报告指出".

Allowed modes:

- `rewrite-safe`: remove unsupported authority framing and keep only claims that stand without it.
- `audit-only`: flag missing source or attribution without rewriting as if verified.
- `rewrite-with-placeholder`: preserve the argument slot with an explicit "source needed" placeholder.

Never invent organizations, years, sample sizes, paper names, links, or expert identities.

## Output Modes

Default: output one recommended version only.

Use annotation mode only when the user asks to diagnose first. List 1-5 issues, each with:

- Problem family.
- Trigger.
- Suggested action.
- Whether rewriting is recommended.

Review mode: list only the top 5-10 issues. Do not dump the full blacklist.

## Validation

Use [references/evaluation.md](references/evaluation.md) for quality gates. When auditing files locally, optionally run:

```bash
python scripts/deai_audit.py path/to/text.md
```

Treat the script as a signal collector, not a final judge.
