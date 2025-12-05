import { Root, RootContent } from "mdast";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toString } from "mdast-util-to-string";
import { u } from "unist-builder";

export type RagSection = {
  content: string;
  heading?: string;
  part?: number;
  total?: number;
};

function splitTreeBy(
  tree: Root,
  predicate: (node: RootContent) => boolean,
): Root[] {
  return tree.children.reduce<Root[]>((trees, node) => {
    const [lastTree] = trees.slice(-1);

    if (!lastTree || predicate(node)) {
      const tree: Root = u("root", [node]);
      return trees.concat(tree);
    }

    lastTree.children.push(node);
    return trees;
  }, []);
}

export function processMarkdown(
  content: string,
  maxSectionLength = 2000,
): RagSection[] {
  const mdTree = fromMarkdown(content);
  const sectionTrees = splitTreeBy(mdTree, (node) => node.type === "heading");

  const sections = sectionTrees.flatMap<RagSection>((tree) => {
    const [firstNode] = tree.children;
    const sectionContent = toMarkdown(tree);
    const heading =
      firstNode?.type === "heading" ? toString(firstNode) : undefined;

    if (sectionContent.length > maxSectionLength) {
      const numberChunks = Math.ceil(sectionContent.length / maxSectionLength);
      const chunkSize = Math.ceil(sectionContent.length / numberChunks);

      return Array.from({ length: numberChunks }, (_, index) => ({
        content: sectionContent.substring(index * chunkSize, (index + 1) * chunkSize),
        heading,
        part: index + 1,
        total: numberChunks,
      }));
    }

    return { content: sectionContent, heading };
  });

  return sections.filter((section) => Boolean(section.content?.trim()));
}

export function processPlainText(
  content: string,
  maxSectionLength = 2000,
): RagSection[] {
  if (!content.trim()) return [];

  const sections: RagSection[] = [];
  const words = content.split(/\s+/);
  let buffer: string[] = [];

  for (const word of words) {
    buffer.push(word);
    const current = buffer.join(" ");
    if (current.length >= maxSectionLength) {
      sections.push({ content: current });
      buffer = [];
    }
  }

  const remaining = buffer.join(" ").trim();
  if (remaining) {
    sections.push({ content: remaining });
  }

  return sections;
}

export function chunkContent(
  content: string,
  fileName: string,
  maxSectionLength?: number,
): RagSection[] {
  const effectiveMax = maxSectionLength ?? 2000;
  const lower = fileName.toLowerCase();

  if (lower.endsWith(".md") || lower.endsWith(".markdown")) {
    return processMarkdown(content, effectiveMax);
  }

  return processPlainText(content, effectiveMax);
}
