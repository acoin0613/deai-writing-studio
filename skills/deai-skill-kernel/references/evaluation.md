# Evaluation

## Table Of Contents

- Quality dimensions
- Pass thresholds
- Should Fix / Should Not Fix tests
- Failure modes

## Quality Dimensions

Score internally on six dimensions:

| Dimension | Question |
|---|---|
| Fidelity | Did facts, terms, attribution, and intent stay intact? |
| Density | Did empty language shrink without deleting useful reasoning? |
| Register | Does the output fit the scene? |
| Voice | Does it match the author or requested voice? |
| Residual Trace | Are obvious AI patterns still visible? |
| False Positive Control | Were valid professional or academic expressions preserved? |

Do not optimize one dimension at the expense of fidelity.

## Pass Thresholds

- 90-100: publishable.
- 75-89: usable, minor residual traces.
- 60-74: needs another patch pass.
- Below 60: structure-level rewrite required.

## Should Fix Tests

The skill should fix:

- Empty openings and conclusions.
- Unsourced authority.
- Value inflation.
- Binary contrast shells.
- Dramatic reveal metaphors.
- Paragraph isomorphism.
- Chatbot collaboration residue.
- Over-comforting or identity-certifying praise.

## Should Not Fix Tests

The skill should not rewrite:

- Exact quotes.
- Code, commands, logs, paths, fields.
- Academic caveats that protect truth.
- Technical terms needed for searchability.
- Real source titles.
- Repetition that carries rhythm or emphasis.
- User-requested official or brand voice.

## Failure Modes

If output becomes shorter but thinner, restore content.

If output becomes casual in a professional scene, restore register.

If output becomes "smooth generic prose", re-apply author voice.

If factual strength increases, roll back and run fact gate.

