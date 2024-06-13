const core = require('@actions/core')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    // Debug logs are only output if the `ACTIONS_STEP_DEBUG` secret is true
    // Log the current timestamp, wait, then log the new timestamp
    core.debug(new Date().toTimeString())

    // Set outputs for other workflow steps to use
    core.setOutput('version', "v0.0.1")
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
