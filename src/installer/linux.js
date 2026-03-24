import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { tmpdir } from 'os'
import { join } from 'path'
import { BaseInstaller } from './base.js'

class LinuxInstaller extends BaseInstaller {
  constructor() {
    super({
      expectedPlatform: 'linux',
      archMap: {
        'x64': 'linux64',
        'ia32': 'linux32',
        'ppc64': 'ppc64le',
        's390x': 's390x',
        'arm64': 'linux-arm64'
      },
      fileExtension: '.tar.gz',
      fileName: 'IBM_Cloud_CLI.tar.gz'
    })
  }

  async runInstaller(tarballPath) {
    const tmpDir = tmpdir()

    core.info('Extracting installer...')
    let exitCode = await exec.exec('tar', ['-xzvf', tarballPath, '-C', tmpDir])
    if (exitCode !== 0) {
      throw new Error(`Failed to extract installer (exit code: ${exitCode})`)
    }

    const extractDir = join(tmpDir, 'Bluemix_CLI')
    core.info('Running installer...')
    const installScript = join(extractDir, 'install')
    exitCode = await exec.exec('chmod', ['755', installScript])
    if (exitCode !== 0) {
      throw new Error(`Failed to set permissions on install script (exit code: ${exitCode})`)
    }

    exitCode = await exec.exec(installScript, ['-q'])
    if (exitCode !== 0) {
      throw new Error(`Installation failed (exit code: ${exitCode})`)
    }

    // Clean up extracted directory
    exitCode = await exec.exec('rm', ['-rf', extractDir])
    if (exitCode !== 0) {
      core.warning(`Failed to clean up temporary directory (exit code: ${exitCode})`)
    }
  }
}

export { LinuxInstaller }