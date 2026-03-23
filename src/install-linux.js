import * as core from '@actions/core'
import * as exec from '@actions/exec'
import fs from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'
import { downloadFile, calculateSha256, getVersionMetadata } from './install-util.js'

function detectLinuxPlatform() {
  const arch = process.arch
  const platform = process.platform

  if (platform !== 'linux') {
    throw new Error(`Unsupported platform: ${platform}`)
  }

  // Map Node.js arch to IBM Cloud CLI platform identifiers
  const archMap = {
    'x64': 'linux64',
    'ia32': 'linux32',
    'ppc64': 'ppc64le',
    's390x': 's390x',
    'arm64': 'linux-arm64'
  }

  const mappedArch = archMap[arch]
  if (!mappedArch) {
    throw new Error(`Unsupported architecture: ${arch}`)
  }

  return mappedArch
}

async function installLinux() {
  const platform = detectLinuxPlatform()
  core.info(`Detected platform: ${platform}`)

  core.info('Fetching version metadata...')
  const { version, installer, sha256 } = await getVersionMetadata(platform)
  core.info(`Latest version: ${version}`)
  core.info(`Download URL: ${installer}`)

  const tmpDir = tmpdir()
  const tarballPath = join(tmpDir, 'IBM_Cloud_CLI.tar.gz')
  core.info('Downloading IBM Cloud CLI...')
  await downloadFile(installer, tarballPath)

  core.info('Verifying checksum...')
  const actualSha256 = await calculateSha256(tarballPath)
  if (actualSha256 !== sha256) {
    fs.unlinkSync(tarballPath)
    throw new Error(`Checksum mismatch! Expected: ${sha256}, Got: ${actualSha256}`)
  }
  core.info('Checksum verified successfully')

  core.info('Extracting installer...')
  await exec.exec('tar', ['-xzvf', tarballPath, '-C', tmpDir])

  const extractDir = join(tmpDir, 'Bluemix_CLI')
  core.info('Running installer...')
  const installScript = join(extractDir, 'install')
  await exec.exec('chmod', ['755', installScript])
  await exec.exec(installScript, ['-q'])

  core.info('Cleaning up temporary files...')
  fs.unlinkSync(tarballPath)
  await exec.exec('rm', ['-rf', extractDir])

  core.info('IBM Cloud CLI installed successfully')
}

export { installLinux }
