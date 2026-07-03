# AI Trace Patterns

## Table Of Contents

- Universal patterns
- Chinese high-risk patterns
- English high-risk patterns
- Structure patterns
- False positives

## Universal Patterns

### Meaning Inflation

Signals:

- "标志着", "象征着", "体现了", "彰显", "关键时刻", "里程碑", "不可磨灭".
- "stands as", "serves as", "testament", "pivotal", "underscores".

Fix:

- Replace the meaning claim with what happened, who did it, and what changed.

### Promotional Language

Signals:

- "无缝", "直观", "强大", "革命性", "引领", "卓越", "激动人心".
- "seamless", "vibrant", "groundbreaking", "must-visit", "transformative".

Fix:

- Use feature, constraint, cost, result, or direct evidence.

### Vague Attribution

Signals:

- "研究表明", "数据显示", "专家认为", "业内人士指出", "多方认为".
- "studies show", "experts say", "industry reports suggest".

Fix:

- Add a real source if supplied.
- Otherwise use fact-gate modes.

### Shallow Tail Analysis

Signals:

- "从而", "进而", "以此", "确保", "反映了", "为...奠定基础".
- English `-ing` tails that add fake depth.

Fix:

- Cut the tail if it adds no new information.
- Replace with a visible action or consequence.

## Chinese High-Risk Patterns

### Analysis-Teacher Posture

Signals:

- "先看", "接着看", "说完 A 再看 B", "拆一拆", "盘一盘", "捋一捋".
- "把 X 拆完，回头看 Y".

Fix:

- Delete the process narration. Start the next paragraph with the fact or judgment.

### Dramatic Reveal

Signals:

- "遮羞布", "面具", "外衣", "画皮", "揭开真面目", "戳穿真相".

Fix:

- Remove the reveal metaphor. State the mechanism or evidence.

### Data Display Gesture

Signals:

- "数据摆出来", "数字摆得更清楚", "事实摆在那里".

Fix:

- Give the data directly. Do not stage the data as a performance.

### Extreme Judgment Shells

Signals:

- "最残酷的是", "真正可怕的是", "讽刺之处在于", "更荒谬的是".

Fix:

- Remove the shell. Let the fact or consequence carry severity.

### Pseudo-Academic Register

Signals:

- "舆论场", "宏大叙事", "底层逻辑", "赛道", "闭环", "抓手", "范式".

Fix:

- Replace with specific platform, claim, process, cause, or actor.

### Binary Contrast Shell

Signals:

- "不是 A，而是 B", "并非 A，而是 B", "不在于 A，而在于 B".
- "靠的不是 A，靠的是 B", "不是 AI 看，是活人看".
- Single use can be normal. Treat it as high-risk when it appears repeatedly, sounds over-balanced, or turns a simple point into a slogan.

Fix:

- If A is not a needed boundary, delete A and say B directly.
- If A is a real caveat, convert to a natural concession.
- If the contrast is only there for rhythm, keep B and drop the staged opposition.

### Hedge And Balance Overuse

Signals:

- "可能", "大概率", "当然取决于具体情况", "具体情况具体分析", "这取决于", "某种程度上".
- "一方面...另一方面...", "既要...也要...", "需要辩证地看", "不能一概而论".
- The text keeps leaving escape routes instead of making a bounded claim.

Fix:

- Keep real uncertainty in academic, legal, medical, financial, or policy text.
- In ordinary writing, replace vague hedging with the exact boundary: who, when, under what condition, or what exception.
- If the sentence says both sides without a decision, ask what the writer actually wants to claim.

### Conditional Over-Marking

Signals:

- "一旦...就...", "只有...才...", "无论...都...", "正是因为...所以...", "通过...来...".

Fix:

- Use lighter syntax or implicit logic. Keep only necessary markers.

## English High-Risk Patterns

Fix these unless the source text intentionally uses them:

- "Here's the thing", "Let me be clear", "The truth is".
- "not X, but Y", "X isn't the problem. Y is".
- Three-item abstract lists.
- Em dash as default dramatic punctuation.
- "At its core", "in today's landscape", "moving forward".
- Inanimate agency: "the data tells us", "the decision emerges".

## Structure Patterns

### Paragraph Isomorphism

Signal:

- Three or more adjacent paragraphs follow "topic sentence + explanation + summary".
- Adjacent paragraphs have very similar length, similar number of lines, or matching rhetorical shape.
- The text feels too evenly cut: every paragraph lands the same way.

Fix:

- Vary entry points: fact, scene, objection, quote, consequence, or direct claim.
- Vary sentence length. Human rhythm can be short-short-long, long-short, or abrupt; do not make every sentence carry the same weight.

### Empty Conclusions

Signals:

- "综上所述", "总而言之", "未来可期", "让我们拭目以待".

Fix:

- Delete. If a conclusion is needed, end on a concrete consequence or next action.

### Inline Header Lists

Signals:

- Bold label + colon repeated vertically.

Fix:

- Convert to prose, a real table, or a shorter list with no performative labels.

## False Positives

Do not fix automatically:

- Technical terms in docs.
- Academic hedging.
- Necessary passive voice in methods or legal prose.
- Exact quotes.
- Known brand voice.
- Real source names and report titles.
- Repetition used for rhythm or emphasis.
