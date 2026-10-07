export const sampleMarkdown = `Here's a comprehensive example showing **markdown rendering issues** during streaming.

## The Problem

When streaming markdown token-by-token, naive renderers struggle with **unterminated syntax** like this bold text that spans multiple lines and might not be closed immediately in the token stream.

### Common Edge Cases

1. **Bold text** that opens but doesn't close right away
2. *Italic text* with similar problems
3. \`Inline code\` that might be split mid-token
4. Links like [this one](https://example.com) where the URL arrives late

## Code Blocks

Here's a code fence that causes major problems mid-stream:

\`\`\`javascript
function demonstrateStreamingBug() {
  const partial = "When this fence isn't closed...";
  // Everything after gets swallowed!
  return "You won't see this in naive renderers";
}
\`\`\`

## Tables

Tables are particularly tricky when cells arrive token-by-token:

| Feature | Naive Renderer | Streamdown |
|---------|---------------|------------|
| Bold handling | ❌ Breaks | ✅ Works |
| Code fences | ❌ Swallows text | ✅ Renders correctly |
| Tables | ❌ Malformed | ✅ Builds progressively |

## Nested Structures

- Unordered lists
- With **bold items**
- And \`inline code\`
  - Nested sublists
  - That include *italic* text

### Inline Code Edge Cases

Consider \`const x = "unclosed string\` or \`Object.keys({a: 1})\` — these break when split across tokens.

## Final Notes

The key issue: **unterminated markdown syntax** creates visual glitches as tokens arrive. Streamdown solves this by tracking parser state and repairing incomplete structures on the fly.`;
