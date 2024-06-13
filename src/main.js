const core = require('@actions/core')
const exec = require('@actions/exec')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    await exec.exec(`/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/linux | sh"`)

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
