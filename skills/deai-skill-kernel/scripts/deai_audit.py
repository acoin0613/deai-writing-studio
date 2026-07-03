#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


PATTERNS = {
    "opening_slop": [
        r"值得注意的是",
        r"值得一提的是",
        r"不难发现",
        r"众所周知",
        r"接下来(?:我们|我)",
        r"让我们",
    ],
    "empty_conclusion": [
        r"综上所述",
        r"总而言之",
        r"总的来说",
        r"归根结底",
        r"未来可期",
        r"让我们拭目以待",
    ],
    "binary_shell": [
        r"不(?:是|在于).{0,24}而(?:是|在于)",
        r"并非.{0,24}而是",
        r"不仅仅?是.{0,30}(?:更是|而是)",
        r"靠的不是.{0,24}靠的是",
        r"不是\s*AI\s*看[，,]\s*是活人看",
    ],
    "hedging_balance": [
        r"可能",
        r"大概率",
        r"当然取决于具体情况",
        r"取决于具体情况",
        r"具体情况具体分析",
        r"某种程度上",
        r"一方面.{0,40}另一方面",
        r"既要.{0,28}也要",
        r"需要辩证地看",
        r"不能一概而论",
    ],
    "vague_authority": [
        r"研究表明",
        r"数据显示",
        r"专家认为",
        r"业内人士(?:指出|认为)",
        r"报告指出",
    ],
    "business_jargon": [
        r"赋能",
        r"抓手",
        r"闭环",
        r"沉淀(?:方法论)?",
        r"降本增效",
        r"底层逻辑",
    ],
    "dramatic_reveal": [
        r"遮羞布",
        r"面具",
        r"外衣",
        r"揭开.{0,8}真面目",
        r"戳穿.{0,8}真相",
    ],
    "extreme_judgment": [
        r"最(?:残酷|可怕|荒谬|讽刺)的是",
        r"真正(?:可怕|残酷|荒谬|讽刺)的是",
        r"(?:残酷|讽刺|荒谬|吊诡)之处在于",
    ],
    "chatbot_residue": [
        r"作为(?:一个)?AI",
        r"我的知识(?:截止|基于)",
        r"希望这(?:能|会)帮助",
        r"如果你(?:还)?(?:有|需要)",
    ],
}


def sentence_lengths(text: str) -> list[int]:
    sentences = re.split(r"(?<=[。！？.!?\n])", text)
    return [len(sentence.strip()) for sentence in sentences if len(sentence.strip()) > 3]


def structural_hits(text: str) -> list[tuple[int, str, str]]:
    hits: list[tuple[int, str, str]] = []
    paragraphs = [paragraph.strip() for paragraph in re.split(r"\n\s*\n", text) if len(paragraph.strip()) > 16]
    if len(paragraphs) >= 3:
        lengths = [len(paragraph) for paragraph in paragraphs]
        mean = sum(lengths) / len(lengths)
        variance = sum((length - mean) ** 2 for length in lengths) / len(lengths)
        coefficient = (variance ** 0.5) / mean if mean else 1
        if coefficient < 0.18:
            hits.append((1, "paragraph_isomorphism", f"paragraph lengths too similar: {lengths[:8]}"))

    lengths = sentence_lengths(text)
    if len(lengths) >= 5:
        mean = sum(lengths) / len(lengths)
        variance = sum((length - mean) ** 2 for length in lengths) / len(lengths)
        if max(lengths) - min(lengths) < 24 and variance ** 0.5 < 12:
            hits.append((1, "flat_sentence_rhythm", f"sentence lengths too even: {lengths[:12]}"))
    return hits


def line_hits(text: str) -> list[tuple[int, str, str]]:
    hits: list[tuple[int, str, str]] = []
    for line_no, line in enumerate(text.splitlines(), start=1):
        for family, patterns in PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, line, flags=re.IGNORECASE):
                    hits.append((line_no, family, line.strip()))
                    break
    hits.extend(structural_hits(text))
    return hits


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Collect likely AI-trace signals in Chinese/English prose.")
    parser.add_argument("path", help="Text or markdown file to audit")
    args = parser.parse_args()

    path = Path(args.path)
    text = path.read_text(encoding="utf-8-sig")
    hits = line_hits(text)

    print(f"deai_audit: {path}")
    print(f"signals: {len(hits)}")
    by_family: dict[str, int] = {}
    for _, family, _ in hits:
        by_family[family] = by_family.get(family, 0) + 1
    for family, count in sorted(by_family.items(), key=lambda item: (-item[1], item[0])):
        print(f"- {family}: {count}")

    if hits:
        print("\nTop hits:")
        for line_no, family, line in hits[:20]:
            snippet = line[:120] + ("..." if len(line) > 120 else "")
            print(f"{line_no}: [{family}] {snippet}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
