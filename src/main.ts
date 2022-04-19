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

  const changelogEntry = createChangelogEntry(changes)

  if (changelogEntry != null) {
    await addChangelogEntry(options, changelogEntry)
    await fs.writeFile(options.schemaFile, printSchema(currentSchema))
  }

  core.info("Finished executing without errors.")
}

void run().catch((error: Error) => {
  core.error(error)
  core.setFailed(error.message)
})
