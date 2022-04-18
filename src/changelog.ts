import fs from "fs/promises"

import dedent from "ts-dedent"

import { Change, CriticalityLevel } from "@graphql-inspector/core"

const leadingZero = (num: number) => `${num < 10 ? "0" : ""}${num}`

export const createChangelogEntry = (changes: Change[]) => {
  const now = new Date()

  const breaking = changes.filter(
    ({ criticality }) => criticality.level === CriticalityLevel.Breaking,
  )
  const dangerous = changes.filter(
    ({ criticality }) => criticality.level === CriticalityLevel.Dangerous,
  )
  const normal = changes.filter(
    ({ criticality }) => criticality.level === CriticalityLevel.NonBreaking,
  )

  return dedent`
    ## ${now.getFullYear()}-${leadingZero(now.getMonth())}-${leadingZero(
    now.getDay(),
  )} ${leadingZero(now.getHours())}:${leadingZero(now.getMinutes())}
    ${
      breaking.length > 0
        ? dedent`
          ### 🔺 Breaking

          ${breaking
            .map(
              (change) => `- \`${change.path!}\`: ${change.message.replace(/'/g, "`")}`,
            )
            .join("\n")}\n
        `
        : ""
    }
    ${
      dangerous.length > 0
        ? dedent`
          ### ⚠ Dangerous

          ${dangerous
            .map(
              (change) => `- \`${change.path!}\`: ${change.message.replace(/'/g, "`")}`,
            )
            .join("\n")}\n
        `
        : ""
    }
    ${
      normal.length > 0
        ? dedent`
          ### ✅ Non-breaking

          ${normal
            .map(
              (change) => `- \`${change.path!}\`: ${change.message.replace(/'/g, "`")}`,
            )
            .join("\n")}\n
        `
        : ""
    }
  `
}

export const addChangelogEntry = async (entry: string) => {
  const contents = await fs.readFile("CHANGELOG.md", "utf8")
  const contentLines = contents.split("\n")
  const entryLine = contentLines.findIndex((line) => line.startsWith("## 20"))

  const newContents = [
    ...contentLines.slice(0, entryLine),
    ...entry.split("\n"),
    ...contentLines.slice(entryLine),
  ].join("\n")

  console.log({
    contentLines,
    entryLine,
    split: contentLines.slice(entryLine),
  })

  await fs.writeFile("CHANGELOG.md", newContents)
}
