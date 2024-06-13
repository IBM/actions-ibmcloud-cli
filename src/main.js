const core = require('@actions/core')
const exec = require('@actions/exec')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/linux | sh"')

    // Disable version checking
    await exec.exec('ibmcloud', ['config', '--check-version=false'])

    // Capture the version output
    let version = ''
    await exec.exec('ibmcloud', ['--version'], {
      listeners: {stdout: (data) => { version += data.toString() }}
    });
    version = version.split('+')[0].split(' ')[2]
    core.setOutput('version', version)
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
