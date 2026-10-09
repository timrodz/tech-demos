function closeStructures(text) {
  let inString = false;
  let escaped = false;
  const stack = [];

  for (const ch of text) {
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') stack.push('}');
    else if (ch === '[') stack.push(']');
    else if (ch === '}' || ch === ']') stack.pop();
  }

  let suffix = '';
  if (inString) suffix += '"';
  for (let i = stack.length - 1; i >= 0; i--) {
    suffix += stack[i];
  }
  return text + suffix;
}

export function parsePartialJson(text) {
  const trimmed = text.trim();
  if (!trimmed) return {};

  try {
    const value = JSON.parse(trimmed);
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    // incomplete JSON — close open strings/braces and retry
  }

  try {
    const value = JSON.parse(closeStructures(trimmed));
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    // still incomplete (e.g. a key with no value) — walk back
  }

  for (let i = trimmed.length - 1; i >= 0; i--) {
    const slice = trimmed.slice(0, i).trimEnd();
    if (!slice) break;
    try {
      const value = JSON.parse(closeStructures(slice));
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value;
      }
    } catch {
      // keep walking
    }
  }

  return {};
}

function delay(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }
    const id = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(id);
        reject(new DOMException('Aborted', 'AbortError'));
      },
      { once: true }
    );
  });
}

export async function streamObject({
  source,
  recordedJson,
  mode,
  getIntervalMs,
  onPartial,
  signal
}) {
  if (mode === 'key') {
    const partial = {};
    const keys = Object.keys(source);
    for (let i = 0; i < keys.length; i++) {
      if (signal?.aborted) return;
      const key = keys[i];
      partial[key] = source[key];
      const snapshot = { ...partial };
      onPartial({
        object: snapshot,
        text: JSON.stringify(snapshot, null, 2),
        keysReceived: i + 1,
        totalKeys: keys.length
      });
      if (i < keys.length - 1) {
        await delay(getIntervalMs(), signal);
      }
    }
    return;
  }

  let acc = '';
  for (let i = 0; i < recordedJson.length; i++) {
    if (signal?.aborted) return;
    acc += recordedJson[i];
    const object = parsePartialJson(acc);
    onPartial({
      object,
      text: acc,
      keysReceived: Object.keys(object).length,
      totalKeys: Object.keys(source).length
    });
    if (i < recordedJson.length - 1) {
      await delay(getIntervalMs(), signal);
    }
  }
}
