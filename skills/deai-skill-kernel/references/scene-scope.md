# Scene And Scope Rules

## Table Of Contents

- Scene detection
- Edit level
- Edit scope
- Protected span handling
- Reread checks

## Scene Detection

### academic

Signals: paper draft, abstract, introduction, method, related work, reviewer response, research proposal.

Preserve:

- Terms, citations, claims, caveats, uncertainty, equations, named methods.
- Necessary passive voice when it keeps the focus on method or evidence.
- Logical markers that carry real reasoning.

Avoid:

- Turning formal prose into chat.
- Removing hedging that protects truth conditions.
- Replacing terms with vague synonyms.

### docs

Signals: README, API docs, SOP, FAQ, incident report, changelog, release note, configuration guide.

Preserve:

- Commands, file paths, flags, APIs, field names, logs, error messages.
- System subjects such as "the service", "the API", "the worker".
- Step order and preconditions.

Avoid:

- Marketing voice.
- Removing searchable terms.
- Rewriting code-adjacent text so behavior changes.

### status

Signals: standup, weekly report, project update, postmortem summary.

Preserve:

- Time, owner, action, result, risk, blocker, next step.
- Severity and uncertainty. Do not soften risk.

### public-writing

Signals: article, opinion post, newsletter, Xiaohongshu, forum post, public essay.

Goal:

- Keep judgment concrete.
- Remove "I am delivering insight" performance.
- Keep author edge if it exists.

For long pieces, prefer `bounded`: do not compress unpredictably.

### chat

Signals: short replies, comments, collaboration messages.

Fix:

- Flattery, "good question", "you're absolutely right".
- Over-comforting and psychology claims.
- "Let me..." / "I can..." meta comments.

### translation

Goal:

- Preserve original paragraphing and structure.
- Remove translationese only when it does not alter structure.

## Edit Level

### minimal

Use when the text is mostly fine. Remove local slop only.

Actions:

- Delete throat-clearing.
- Reduce inflated tone.
- Replace a few obvious AI phrases.

### standard

Use when the information is good but the voice has visible AI traces.

Actions:

- Unify register.
- Remove narrator voice.
- Replace false subjects with real actors.
- Merge or split local sentences only when scope allows.

### aggressive

Use when Tier 1 problems are dense or multiple structure problems stack.

Restrictions:

- Do not use by default for `academic` or `docs`.
- Never add facts to increase human feel.
- Stop if protected spans begin to drift.

## Reread Checks

### Pass 1: fidelity

Check:

1. Protected spans unchanged.
2. Facts and responsibility attribution preserved.
3. Terms and citations stable.
4. No new claims introduced.
5. Register still fits the scene.

### Pass 2: residual AI trace

Only after fidelity passes, check:

1. Opening residue.
2. Empty conclusion residue.
3. Narrator residue.
4. Vague judgment residue.
5. Over-uniform sentence rhythm.

Make only small corrections in Pass 2.

