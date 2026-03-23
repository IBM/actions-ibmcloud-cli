import * as core from '@actions/core'
import * as exec from '@actions/exec'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { downloadFile, calculateSha256, getVersionMetadata } from './install-util.js'

function detectWindowsPlatform() {
  const arch = process.arch
  const platform = process.platform

  if (platform !== 'win32') {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  // Map Node.js arch to IBM Cloud CLI platform identifiers
  const archMap = {
    'x64': 'win64',
    'ia32': 'win32'
  }

  const mappedArch = archMap[arch]
  if (!mappedArch) {
    throw new Error(`Unsupported architecture: ${arch}`)
  }

  return mappedArch
}

async function installWindows() {
  const platform = detectWindowsPlatform()
  core.info(`Detected platform: ${platform}`)

  core.info('Fetching version metadata...')
  const { version, installer, sha256 } = await getVersionMetadata(platform)
  core.info(`Latest version: ${version}`)
  core.info(`Download URL: ${installer}`)

  const tmpDir = tmpdir()
  const installerPath = join(tmpDir, 'IBM_Cloud_CLI.exe')
  core.info('Downloading IBM Cloud CLI...')
  await downloadFile(installer, installerPath)

  core.info('Verifying checksum...')
  const actualSha256 = await calculateSha256(installerPath)
  if (actualSha256 !== sha256) {
    fs.unlinkSync(installerPath)
    throw new Error(`Checksum mismatch! Expected: ${sha256}, Got: ${actualSha256}`)
  }
  core.info('Checksum verified successfully')

  core.info('Running installer...')
  await exec.exec('powershell', ['-command', `& "${installerPath}" /s /v"REBOOT=ReallySuppress /qn"`])

  core.info('Cleaning up temporary files...')
  fs.unlinkSync(installerPath)

  // Add to PATH for the current step
  process.env.PATH += ';C:\\Program Files\\IBM\\Cloud\\bin'
  // Add to GITHUB_PATH for future steps
  await exec.exec('powershell', ['-command', `Add-Content $env:GITHUB_PATH 'C:\\Program Files\\IBM\\Cloud\\bin'`])

  core.info('IBM Cloud CLI installed successfully')
}

export { installWindows }
