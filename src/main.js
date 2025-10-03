const core = require('@actions/core')
const exec = require('@actions/exec')

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

async function installCLI() {
  core.startGroup('Installing IBM Cloud CLI')
  if (process.platform == 'win32') {
    // Download the script to a local file
    await exec.exec(`powershell -command "(New-Object Net.WebClient).DownloadString('https://clis.cloud.ibm.com/install/powershell') | Out-File -FilePath ibmcloud_install.ps1"`)
    // Add @echo on as the first line
    await exec.exec(`powershell -command "'Set-PSDebug -Trace 2' + [Environment]::NewLine + (Get-Content -Path ibmcloud_install.ps1 -Raw) | Set-Content -Path ibmcloud_install.ps1"`)
    // Insert the new line at line 60
    await exec.exec(`powershell -command "$content = Get-Content -Path ibmcloud_install.ps1; $content[59] = $content[59] + [Environment]::NewLine + 'Write-Host $downloadUrl'; $content | Set-Content -Path ibmcloud_install.ps1"`)
    // Try a new download method
    await exec.exec(`powershell -command "$content = Get-Content -Path ibmcloud_install.ps1; $content[61] = 'Invoke-WebRequest $downloadUrl -OutFile $DownloadedInstaller'; $content[62] = ''; $content[63] = ''; $content | Set-Content -Path ibmcloud_install.ps1"`)
    // Print out the script content for debugging
    core.info('Contents of the modified script:')
    await exec.exec(`powershell -command "Get-Content -Path ibmcloud_install.ps1 | ForEach-Object { Write-Output $_ }"`)
    // Execute the modified script
    await exec.exec(`powershell -File ibmcloud_install.ps1`)
    // Add to PATH for the current step
    process.env.PATH += ';C:\\Program Files\\IBM\\Cloud\\bin'
    // Add to GITHUB_PATH for future steps
    await exec.exec(`powershell -command "Add-Content $env:GITHUB_PATH 'C:\\Program Files\\IBM\\Cloud\\bin'"`)
  } else if (process.platform == 'darwin') {
    await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/osx | sh"')
  } else {
    await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/linux | sh"')
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
  const plugins = core.getInput('plugins').replace('\n', ' ').replace(',', ' ').split(' ').map(p => p.trim()).filter(p => p)
  if (plugins.length > 0) {
    core.startGroup('Installing IBM Cloud CLI plugins')
    await exec.exec('ibmcloud', ['plugin', 'install', ...plugins])
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

async function login() {
  const apiKey = core.getInput('api_key')
  if (apiKey.length > 0) {
    const api    = core.getInput('api')
    const region = core.getInput('region')
    const group  = core.getInput('group')

    core.startGroup('Login to IBM Cloud')

    // Mimic the ibmcloud login output since we will run it silent later
    core.info(`[command]/usr/local/bin/ibmcloud login -r ${region} -g ${group}`)
    core.info(`API endpoint: ${colorize(api, 'cyan')}`)
    core.info('Logging in with API key from environment variable...')
    core.info('Authenticating...')

    try {
      await exec.exec('ibmcloud', ['login', '-r', region, '-g', group], {
        env: {
          'IBMCLOUD_API_KEY': apiKey,
          ...process.env
        },
        silent: true // Intentionally suppress the output to avoid the ibmcloud target at the end of login
      })
      core.info(colorize('OK', 'green'))
    } catch(e) {
      core.info(colorize('FAILED', 'red'))
      core.info('Unable to authenticate')
      throw e
    } finally {
      core.endGroup()
    }
  }
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    await installCLI()
    await disableVersionChecking()
    await captureVersion()
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
