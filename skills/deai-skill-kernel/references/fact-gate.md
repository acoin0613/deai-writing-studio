# Fact Gate

## Table Of Contents

- When to run
- Claim extraction
- Handling modes
- Risk categories
- Final check

## When To Run

Run the fact gate when text includes:

- Numbers, percentages, money, rankings, dates, timelines.
- Policies, laws, institutions, companies, people, products.
- Reports, papers, studies, surveys.
- URLs or named sources.
- Strong claims: "首次", "唯一", "最大", "已经证实", "所有".
- "数据显示", "研究表明", "报告指出", "专家认为".

## Claim Extraction

For each factual claim, note:

- Claim text.
- Claim type.
- Location.
- Source present or missing.
- Whether the claim is objective fact, author opinion, or interpretation.

## Handling Modes

### rewrite-safe

Use for chat and public writing by default.

Action:

- Remove unsupported authority framing.
- Keep only the claim that stands without the source.
- If it cannot stand, delete or convert to opinion.

### audit-only

Use for docs, status, academic review, or when rewriting might imply verification.

Action:

- Flag "缺来源 / 缺归属 / 需要核对".
- Do not rewrite as if verified.

### rewrite-with-placeholder

Use only when the user asks to preserve the argument slot.

Action:

- Keep the sentence position.
- Add an explicit placeholder such as "此处待补来源".
- Do not invent source details.

## Risk Categories

### Red

- Contradicted by known source.
- Broken link.
- Unsupported high-stakes factual claim.
- Needs private/user source.

Stop and ask for source or permission to rewrite.

### Yellow

- Weak attribution.
- Strong wording without enough support.
- Ambiguous comparison.

Soften, qualify, or flag.

### Green

- Source supplied and claim matches it.
- Pure opinion clearly presented as opinion.
- Common noncontroversial context not central to argument.

## Final Check

Do not let humanization introduce:

- New numbers.
- New names.
- New reports.
- New causality.
- Stronger certainty than the source supports.

