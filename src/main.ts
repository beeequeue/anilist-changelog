import fs from "fs/promises"

import { printSchema } from "graphql"

import * as core from "@actions/core"
import { diff } from "@graphql-inspector/core"

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

  const result = await diff(oldSchema, currentSchema)

  console.log(result)

  await fs.writeFile(options.data.schemaFile, printSchema(currentSchema))

  core.info(`Finished executing without errors.`)
}

void run().catch((error: Error) => {
  console.error(error)
  core.error(error)
  core.setFailed(error.message)
})
