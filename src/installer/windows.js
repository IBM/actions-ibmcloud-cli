import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { BaseInstaller } from './base.js'

class WindowsInstaller extends BaseInstaller {
  constructor() {
    super({
      expectedPlatform: 'win32',
      archMap: {
        'x64': 'win64',
        'ia32': 'win32'
      },
      fileExtension: '.exe',
      fileName: 'IBM_Cloud_CLI.exe'
    })
  }

  async runInstaller(installerPath) {
    core.info('Running installer...')
    const exitCode = await exec.exec('powershell', ['-command', `& "${installerPath}" /s /v"REBOOT=ReallySuppress /qn"`])
    if (exitCode !== 0) {
      throw new Error(`Installation failed (exit code: ${exitCode})`)
    }
  }

  async postInstall() {
    // Add to PATH for the current step
    process.env.PATH += ';C:\\Program Files\\IBM\\Cloud\\bin'
    // Add to GITHUB_PATH for future steps
    const exitCode = await exec.exec('powershell', ['-command', `Add-Content $env:GITHUB_PATH 'C:\\Program Files\\IBM\\Cloud\\bin'`])
    if (exitCode !== 0) {
      core.warning(`Failed to add IBM Cloud CLI to GITHUB_PATH (exit code: ${exitCode})`)
    }
  }
}

export { WindowsInstaller }