import * as zod from "zod"

import * as core from "@actions/core"

const trim = (str: string) => str.trim()

export const optionsSchema = zod.object({
  endpoint: zod.string().url().transform(trim),
  schemaFile: zod
    .string()
    .regex(/^(\/)?([^/0]+(\/)?)+$/)
    .transform(trim),
  changelogFile: zod
    .string()
    .regex(/^(\/)?([^/0]+(\/)?)+$/)
    .transform(trim),
})

export type Options = zod.TypeOf<typeof optionsSchema>

const result = optionsSchema.safeParse({
  endpoint: core.getInput("endpoint", { required: false, trimWhitespace: true }),
  schemaFile: core.getInput("schema-file", { required: false, trimWhitespace: true }),
  changelogFile: core.getInput("changelog-file", {
    required: false,
    trimWhitespace: true,
  }),
})

if (!result.success) {
  throw result.error.format()
}

export const options = result.data
