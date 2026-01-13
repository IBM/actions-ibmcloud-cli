const core = require('@actions/core')
const exec = require('@actions/exec')
const io = require('@actions/io')

/**
 * Colorize a string with ANSI codes.
 * @param {string} string - The string to colorize
 * @param {string} color - The color
 * @returns {string} The colorized string
 */
function colorize(string, color) {
  code = {red: 31, green: 32, cyan: 36}[color] || 0
  return `\u001b[${code};1m${string}\u001b[0m`
}

/**
 * Mimics the command output of calling `ibmcloud` where we want to silence the
 * output of the command, but still show the command being called.
 * @param {string[]} params The params to the ibmcloud command.
 */
async function mimicCommandOutput(params) {
  let cliPath = await io.which("ibmcloud")
  if (cliPath && process.platform == 'win32') {
    cliPath = `"${cliPath}"`
  }

  core.info(`[command]${cliPath} ${params.join(' ')}`)
}

async function installCLI() {
  core.startGroup('Installing IBM Cloud CLI')
  const cliPath = await io.which("ibmcloud")
  if (cliPath) {
    core.info("IBM Cloud CLI is already installed.")
  } else {
    if (process.platform == 'win32') {
      await exec.exec(`powershell -command "iex (New-Object Net.WebClient).DownloadString('https://clis.cloud.ibm.com/install/powershell')"`)
      // Add to PATH for the current step
      process.env.PATH += ';C:\\Program Files\\IBM\\Cloud\\bin'
      // Add to GITHUB_PATH for future steps
      await exec.exec(`powershell -command "Add-Content $env:GITHUB_PATH 'C:\\Program Files\\IBM\\Cloud\\bin'"`)
    } else if (process.platform == 'darwin') {
      await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/osx | sh"')
    } else {
      await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/linux | sh"')
    }
  }
  core.endGroup()
}

async function disableVersionChecking() {
  core.startGroup('Disable version checking')
  await exec.exec('ibmcloud', ['config', '--check-version=false'])
  core.endGroup()
}

async function captureVersion() {
  let version = ''
  await exec.exec('ibmcloud', ['--version'], {
    listeners: {stdout: (data) => { version += data.toString() }}
  });
  version = version.match(/\d+\.\d+\.\d+/)?.[0]
  core.setOutput('version', version)
}

async function installPlugins() {
  const plugins = core.getInput('plugins').replace(/\n/g, ' ').replace(/,/g, ' ').split(' ').map(p => p.trim()).filter(p => p)
  if (plugins.length > 0) {
    core.startGroup('Installing IBM Cloud CLI plugins')
    await exec.exec('ibmcloud', ['plugin', 'install', ...plugins, '-f'])
    core.endGroup()
    await exec.exec('ibmcloud', ['plugin', 'list'])
  }
}

async function setApiEndpoint() {
  core.startGroup('Set API endpoint')
  const api = core.getInput('api')
  await exec.exec('ibmcloud', ['api', api])
  core.endGroup()
}

async function getDefaultGroup() {
  const params = ['resource', 'groups', '--default', '--output', 'json']
  let output = ''

  // Mimic the ibmcloud resource groups output since we will run it silent later
  await mimicCommandOutput(params)

  await exec.exec('ibmcloud', params, {
    listeners: {stdout: (data) => { output += data.toString() }},
    silent: true
  })

  let groups = null
  try {
    groups = JSON.parse(output)
  } catch (e) {
    // Ignore JSON parsing errors
  }

  if (groups && groups.length > 0 && groups[0].name) {
    const defaultGroup = groups[0].name
    core.info(`Detected default resource group: ${colorize(defaultGroup, 'cyan')}`)
    return defaultGroup
  } else {
    core.warning('Could not determine the default resource group.')
    return null
  }
}

async function targetGroup(group) {
  const params = ['target', '-g', group]

  // Mimic the ibmcloud target output since we will run it silent later
  await mimicCommandOutput(params)

  try {
    await exec.exec('ibmcloud', params, {
      silent: true // Intentionally suppress the output to avoid the ibmcloud target at the end
    })

    // Mimic the ibmcloud target results on success
    core.info(`Targeted resource group ${colorize(group, 'cyan')}`)
  } catch(e) {
    // Mimic the ibmcloud target results on failure
    core.info(colorize('FAILED', 'red'))
    throw e
  }
}

async function loginWithParams(apiKey, params) {
  params = ['login', ...params]

  // Mimic the ibmcloud login output since we will run it silent later
  await mimicCommandOutput(params)
  const api = core.getInput('api')
  core.info(`API endpoint: ${colorize(api, 'cyan')}`)
  core.info('Logging in with API key from environment variable...')
  core.info('Retrieving API key token...')
  core.info('Authenticating...')

  try {
    await exec.exec('ibmcloud', params, {
      env: {
        'IBMCLOUD_API_KEY': apiKey,
        ...process.env
      },
      silent: true // Intentionally suppress the output to avoid the ibmcloud target at the end
    })

    // Mimic the ibmcloud login results on success
    core.info(colorize('OK', 'green'))
  } catch(e) {
    // Mimic the ibmcloud login results on failure
    core.info(colorize('FAILED', 'red'))
    core.info('Unable to authenticate')
    throw e
  }
}

async function login() {
  const apiKey = core.getInput('api_key')
  if (apiKey.length == 0) {
    return
  }

  // Determine login behavior based on group input
  // - empty string: detect and target default group
  // - "false": no group targeting
  // - any other value: use specified group
  const group = core.getInput('group')
  const detectDefaultGroup = group === ''
  const loginWithGroup = group && group !== 'false'

  const region = core.getInput('region')
  const loginParams = ['-r', region]
  if (loginWithGroup) {
    loginParams.push('-g', group)
  }

  await core.group('Login to IBM Cloud', async () => {
    await loginWithParams(apiKey, loginParams)
  })

  if (!detectDefaultGroup) {
    return
  }

  const defaultGroup = await core.group('Detect default resource group', getDefaultGroup)

  if (defaultGroup) {
    await core.group('Target default resource group', async () => {
      await targetGroup(defaultGroup)
    })
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    await installCLI()
    await captureVersion()
    await disableVersionChecking()
    await installPlugins()
    await setApiEndpoint()
    await login()
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
