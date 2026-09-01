export const INPUT_EXHAUSTED_MESSAGE = "Your program requested more input than was provided.";

/**
 * Parse multiline Program input — one value per line.
 * Preserves deliberate blank lines; strips a single trailing empty line
 * caused by a textarea's final newline.
 */
export function parseProgramInput(text: string): string[] {
  if (text.length === 0) return [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  if (lines.length > 1 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  return lines;
}

export function formatProgramInput(lines: string[]): string {
  return lines.join("\n");
}

export function createStdinReader(lines: string[]) {
  let index = 0;
  return {
    readLine(): string | null {
      if (index >= lines.length) return null;
      return lines[index++];
    },
    remaining(): number {
      return Math.max(0, lines.length - index);
    }
  };
}

export function inputExhaustedMessage(stdout = "", lastPrompt?: string | null): string {
  const prompt = String(lastPrompt || "").trim();
  if (prompt) {
    return `${INPUT_EXHAUSTED_MESSAGE} Last prompt: ${prompt}`;
  }
  const lines = stdout.replace(/\r\n/g, "\n").split("\n");
  const tail = (lines[lines.length - 1] || "").trim();
  if (tail.endsWith(":") || tail.endsWith("?")) {
    return `${INPUT_EXHAUSTED_MESSAGE} Last prompt: ${tail}`;
  }
  return INPUT_EXHAUSTED_MESSAGE;
}

export function formatLearnerPythonError(raw: string, stdout = ""): string {
  const message = raw.replace(/^PythonError:\s*/i, "").trim();
  if (!message) return "Python error";

  if (/OSError.*\[Errno 29\]|I\/O error/i.test(message)) {
    return inputExhaustedMessage(stdout);
  }
  if (/EOFError/i.test(message) && /reading a line|EOF when reading/i.test(message)) {
    return inputExhaustedMessage(stdout);
  }

  const lines = message.split("\n");
  const filtered = lines.filter(function (line) {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (trimmed.includes("_pyodide/_base.py")) return false;
    if (trimmed.includes("/lib/python") && trimmed.includes(".zip/")) return false;
    if (trimmed.includes("pyodide.asm")) return false;
    if (/^\s*File ".*site-packages\/pyodide\//.test(line)) return false;
    return true;
  });

  const compact = filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  return compact || message;
}
