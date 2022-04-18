import fs from "fs/promises"

import { printSchema } from "graphql"

import * as core from "@actions/core"
import { diff } from "@graphql-inspector/core"

import { addChangelogEntry, createChangelogEntry } from "./changelog"
import { options } from "./options"
import { getCurrentSchema, getOldSchema } from "./schemas"

const run = async () => {
  core.info(`endpoint: ${options.endpoint}, schemaFile: ${options.schemaFile}`)

  const [oldSchema, currentSchema] = await Promise.all([
    getOldSchema(options),
    getCurrentSchema(options),
  ] as const)

  const changes = await diff(oldSchema, currentSchema)

  // Filter out changes that are detected every time
  const filteredChanges = changes.filter(
    (change) =>
      !change.path?.startsWith("@deprecated") && !change.path?.startsWith("@specifiedBy"),
  )

  if (filteredChanges.length === 0) return core.info("No changes detected. Exiting ealy.")

  const changelogEntry = createChangelogEntry(filteredChanges)

  await addChangelogEntry(options, changelogEntry)
  await fs.writeFile(options.schemaFile, printSchema(currentSchema))

  core.info("Finished executing without errors.")
}

void run().catch((error: Error) => {
  core.error(error)
  core.setFailed(error.message)
})
