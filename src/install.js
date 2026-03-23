import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as io from '@actions/io'

async function installWindows() {
  await exec.exec(`powershell -command "iex (New-Object Net.WebClient).DownloadString('https://clis.cloud.ibm.com/install/powershell')"`)
  // Add to PATH for the current step
  process.env.PATH += ';C:\\Program Files\\IBM\\Cloud\\bin'
  // Add to GITHUB_PATH for future steps
  await exec.exec(`powershell -command "Add-Content $env:GITHUB_PATH 'C:\\Program Files\\IBM\\Cloud\\bin'"`)
}

async function installMacOS() {
  await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/osx | sh"')
}

async function installLinux() {
  await exec.exec('/bin/bash -c "curl -fsSL https://clis.cloud.ibm.com/install/linux | sh"')
}

async function install() {
  core.startGroup('Installing IBM Cloud CLI')
  const cliPath = await io.which("ibmcloud")
  if (cliPath) {
    core.info("IBM Cloud CLI is already installed.")
  } else {
    if (process.platform == 'win32') {
      await installWindows()
    } else if (process.platform == 'darwin') {
      await installMacOS()
    } else {
      await installLinux()
    }
  }
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

export { install, captureVersion, installPlugins }
