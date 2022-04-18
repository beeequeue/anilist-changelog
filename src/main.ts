import fs from "fs/promises"

import { printSchema } from "graphql"

import * as core from "@actions/core"
import { diff } from "@graphql-inspector/core"

import { addChangelogEntry, createChangelogEntry } from "./changelog"
import { optionsSchema } from "./options"
import { getCurrentSchema, getOldSchema } from "./schemas"

const options = optionsSchema.safeParse({
  endpoint: core.getInput("endpoint", { required: false, trimWhitespace: true }),
  schemaFile: core.getInput("schema-file", { required: false, trimWhitespace: true }),
})

if (!options.success) {
  throw options.error.format()
}

const run = async () => {
  core.info(`endpoint: ${options.data.endpoint}, schemaFile: ${options.data.schemaFile}`)

  const [oldSchema, currentSchema] = await Promise.all([
    getOldSchema(options.data.schemaFile),
    getCurrentSchema(options.data.endpoint),
  ] as const)

  const changes = await diff(oldSchema, currentSchema)

  const filteredChanges = changes.filter(
    (change) =>
      !change.path?.startsWith("@deprecated") && !change.path?.startsWith("@specifiedBy"),
  )

  if (filteredChanges.length === 0) return

  const changelogEntry = createChangelogEntry(filteredChanges)

  await addChangelogEntry(changelogEntry)
  await fs.writeFile(options.data.schemaFile, printSchema(currentSchema))

  core.info(`Finished executing without errors.`)
}

void run().catch((error: Error) => {
  console.error(error)
  core.error(error)
  core.setFailed(error.message)
})
