import * as core from "@actions/core"

import { optionsSchema } from "./options"

const { endpoint, outputFile } = optionsSchema.parse({
  endpoint: core.getInput("endpoint", { required: true, trimWhitespace: true }),
  outputFile: core.getInput("outputFile", { required: true, trimWhitespace: true }),
})

const run = async () => {
  if (command == null) {
    throw new Error("Invalid command! See `action.yaml` for more info.")
  }

  core.info(`Executing ${command.name}...`)

  await command.action()

  core.info(`Finished executing ${command.name} without errors.`)
}

void run().catch((err) => {
  core.error(err)
  core.setFailed(err.message)
})
