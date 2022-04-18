import fs from "fs/promises"

import {
  buildClientSchema,
  buildSchema,
  getIntrospectionQuery,
  IntrospectionQuery,
} from "graphql"
import { request } from "undici"

export const getOldSchema = async (schemaFilePath: string) => {
  const ast = await fs.readFile(schemaFilePath, "utf8")

  return buildSchema(ast)
}
export const getCurrentSchema = async (endpoint: string) => {
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
