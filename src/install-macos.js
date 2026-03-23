import * as core from '@actions/core'
import * as exec from '@actions/exec'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { downloadFile, calculateSha256, getVersionMetadata } from './install-util.js'

function detectMacOSPlatform() {
  const arch = process.arch
  const platform = process.platform

  if (platform !== 'darwin') {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  // Map Node.js arch to IBM Cloud CLI platform identifiers
  const archMap = {
    'x64': 'osx',
    'arm64': 'osx-arm64'
  }

  const mappedArch = archMap[arch]
  if (!mappedArch) {
    throw new Error(`Unsupported architecture: ${arch}`)
  }

  return mappedArch
}

async function installMacOS() {
  const platform = detectMacOSPlatform()
  core.info(`Detected platform: ${platform}`)

  core.info('Fetching version metadata...')
  const { version, installer, sha256 } = await getVersionMetadata(platform)
  core.info(`Latest version: ${version}`)
  core.info(`Download URL: ${installer}`)

  const tmpDir = tmpdir()
  const pkgPath = join(tmpDir, 'IBM_Cloud_CLI.pkg')
  core.info('Downloading IBM Cloud CLI...')
  await downloadFile(installer, pkgPath)

  core.info('Verifying checksum...')
  const actualSha256 = await calculateSha256(pkgPath)
  if (actualSha256 !== sha256) {
    fs.unlinkSync(pkgPath)
    throw new Error(`Checksum mismatch! Expected: ${sha256}, Got: ${actualSha256}`)
  }
  core.info('Checksum verified successfully')

  core.info('Running installer...')
  await exec.exec('sudo', ['installer', '-pkg', pkgPath, '-target', '/'])

  core.info('Cleaning up temporary files...')
  fs.unlinkSync(pkgPath)

  core.info('IBM Cloud CLI installed successfully')
}

export { installMacOS }
