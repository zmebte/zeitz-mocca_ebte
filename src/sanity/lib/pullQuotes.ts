import type { PortableTextBlock, PortableTextSpan } from "./types";

export const PULL_QUOTE_MARK = "pullQuote";

export interface PullQuoteRun {
  blockIndex: number;
  endChildIndex: number;
  contextAfter: string;
  contextBefore: string;
  quote: string;
  quoteBlocks: PortableTextBlock[];
  startChildIndex: number;
  targetId: string;
}

const CONTEXT_RADIUS = 110;

function normalizeQuotedRange(
  text: string,
  startOffset: number,
  endOffset: number
) {
  const rawQuote = text.slice(startOffset, endOffset);
  const leadingWhitespace = rawQuote.length - rawQuote.trimStart().length;
  const trailingWhitespace = rawQuote.length - rawQuote.trimEnd().length;

  const normalizedStart = startOffset + leadingWhitespace;
  const normalizedEnd = endOffset - trailingWhitespace;
  const quote = text.slice(normalizedStart, normalizedEnd).trim();

  return {
    normalizedEnd,
    normalizedStart,
    quote
  };
}

function buildContextSnippet(
  text: string,
  startOffset: number,
  endOffset: number
) {
  const excerptStart = Math.max(0, startOffset - CONTEXT_RADIUS);
  const excerptEnd = Math.min(text.length, endOffset + CONTEXT_RADIUS);

  const before = text.slice(excerptStart, startOffset).trimStart();
  const after = text.slice(endOffset, excerptEnd).trimEnd();

  return {
    contextAfter: `${after}${excerptEnd < text.length ? "…" : ""}`,
    contextBefore: `${excerptStart > 0 ? "…" : ""}${before}`
  };
}

function createTargetId(block: PortableTextBlock, blockIndex: number, runIndex: number) {
  const blockKey = block._key ? block._key.replace(/[^a-zA-Z0-9_-]/g, "") : `block-${blockIndex}`;
  return `pull-quote-target-${blockKey}-${runIndex}`;
}

export function extractPullQuoteRuns(blocks: PortableTextBlock[] = []) {
  const runs: PullQuoteRun[] = [];

  blocks.forEach((block, blockIndex) => {
    const children = block.children || [];
    const blockText = children.map((child) => child.text || "").join("");

    let cursor = 0;
    let runIndex = 0;
    let currentRunChildren: PortableTextSpan[] = [];
    let currentRunStartChildIndex = 0;
    let currentRunStartOffset = 0;

    const flushCurrentRun = (endChildIndex: number, runEndOffset: number) => {
      if (currentRunChildren.length === 0) {
        return;
      }

      const { normalizedEnd, normalizedStart, quote } = normalizeQuotedRange(
        blockText,
        currentRunStartOffset,
        runEndOffset
      );

      // Keep inline formatting while trimming only the edges of the selected run.
      let childOffset = currentRunStartOffset;
      const quoteChildren = currentRunChildren.flatMap((child) => {
        const start = Math.max(0, normalizedStart - childOffset);
        const end = Math.min(child.text.length, normalizedEnd - childOffset);
        childOffset += child.text.length;
        return end > start ? [{
          ...child,
          text: child.text.slice(start, end),
          marks: child.marks?.filter((mark) => mark !== PULL_QUOTE_MARK)
        }] : [];
      });
      currentRunChildren = [];

      if (!quote) {
        return;
      }

      const { contextAfter, contextBefore } = buildContextSnippet(
        blockText,
        normalizedStart,
        normalizedEnd
      );

      runs.push({
        blockIndex,
        contextAfter,
        contextBefore,
        endChildIndex,
        quote,
        quoteBlocks: [{
          _type: "block",
          style: "normal",
          markDefs: block.markDefs,
          children: quoteChildren
        }],
        startChildIndex: currentRunStartChildIndex,
        targetId: createTargetId(block, blockIndex, runIndex)
      });

      runIndex += 1;
    };

    children.forEach((child, childIndex) => {
      const childText = child.text || "";
      const hasPullQuote = child.marks?.includes(PULL_QUOTE_MARK);

      if (hasPullQuote && currentRunChildren.length === 0) {
        currentRunStartChildIndex = childIndex;
        currentRunStartOffset = cursor;
      }

      if (hasPullQuote) {
        currentRunChildren.push(child);
      }

      if (!hasPullQuote && currentRunChildren.length > 0) {
        flushCurrentRun(childIndex, cursor);
      }

      cursor += childText.length;
    });

    if (currentRunChildren.length > 0) {
      flushCurrentRun(children.length, cursor);
    }
  });

  return runs;
}
