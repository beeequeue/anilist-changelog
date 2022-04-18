import fs from "fs/promises"

import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  IntrospectionQuery,
  printSchema,
} from "graphql"
import { request } from "undici"

import * as core from "@actions/core"
import { diff } from "@graphql-inspector/core"

import { optionsSchema } from "./options"

const options = optionsSchema.safeParse({
  endpoint: core.getInput("endpoint", { required: false, trimWhitespace: true }),
  schemaFile: core.getInput("schema-file", { required: false, trimWhitespace: true }),
})

if (!options.success) {
  throw options.error.format()
}

const getOldSchema = async () => {
  const ast = await fs.readFile(options.data.schemaFile, "utf8")

  return buildSchema(ast)
}

const getCurrentSchema = async () => {
  const introspectionResponse = await request(options.data.endpoint, {
    method: "POST",
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "content-type": "application/json",
    },
    body: JSON.stringify({
      operationName: "IntrospectionQuery",
      query: getIntrospectionQuery(),
    }),
  })

  const introspectionResult = (await introspectionResponse.body.json()) as {
    data: IntrospectionQuery
  }

  return buildClientSchema(introspectionResult.data)
}

const run = async () => {
  core.info(`endpoint: ${options.data.endpoint}, schemaFile: ${options.data.schemaFile}`)

  const [oldSchema, currentSchema] = await Promise.all([
    getOldSchema(),
    getCurrentSchema(),
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
