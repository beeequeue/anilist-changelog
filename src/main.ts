import * as core from "@actions/core"

import { commands } from "./commands"

const run = async () => {
  const inputCommand = core.getInput("command", { required: true, trimWhitespace: true })
  const command = commands.find(({ name }) => name === inputCommand)

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
