import fs from "fs/promises"

import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  IntrospectionQuery,
} from "graphql"
import { request } from "undici"

import { Options } from "./options"

export const getOldSchema = async ({ schemaFile }: Pick<Options, "schemaFile">) => {
  const ast = await fs.readFile(schemaFile, "utf8")

  return buildSchema(ast)
}
export const getCurrentSchema = async ({ endpoint }: Pick<Options, "endpoint">) => {
  const introspectionResponse = await request(endpoint, {
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
