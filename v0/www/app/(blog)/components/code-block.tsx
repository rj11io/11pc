import { codeToHtml } from "shiki"

import { CopyCodeButton } from "./copy-code-button"

const LANGUAGE_LABELS: Record<string, string> = {
  ts: "TypeScript",
  tsx: "TSX",
  js: "JavaScript",
  jsx: "JSX",
  json: "JSON",
  bash: "Bash",
  sh: "Shell",
  shell: "Shell",
  zsh: "Shell",
  css: "CSS",
  html: "HTML",
  yaml: "YAML",
  yml: "YAML",
  md: "Markdown",
  mdx: "MDX",
  py: "Python",
  python: "Python",
  sql: "SQL",
  text: "Text",
}

const SHIKI_THEMES = {
  light: "github-light-default",
  dark: "github-dark-default",
} as const

async function highlight(code: string, language: string) {
  try {
    return await codeToHtml(code, {
      lang: language,
      themes: SHIKI_THEMES,
      defaultColor: false,
    })
  } catch {
    return codeToHtml(code, {
      lang: "text",
      themes: SHIKI_THEMES,
      defaultColor: false,
    })
  }
}

export async function CodeBlock({
  code,
  language,
}: {
  code: string
  language?: string
}) {
  const lang = language?.toLowerCase() ?? "text"
  const html = await highlight(code, lang)
  const label = LANGUAGE_LABELS[lang] ?? lang

  return (
    <div className="not-prose my-8 overflow-hidden border border-border bg-muted/30">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2">
        <span className="font-mono text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </span>
        <CopyCodeButton code={code} />
      </div>
      <div
        className="overflow-x-auto py-4 text-sm leading-6 [&_pre]:px-4 [&_pre]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  )
}
