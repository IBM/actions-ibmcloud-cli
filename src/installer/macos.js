import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { BaseInstaller } from './base.js'

class MacOSInstaller extends BaseInstaller {
  constructor() {
    super({
      expectedPlatform: 'darwin',
      archMap: {
        'x64': 'osx',
        'arm64': 'osx-arm64'
      },
      fileExtension: '.pkg',
      fileName: 'IBM_Cloud_CLI.pkg'
    })
  }

  async runInstaller(pkgPath) {
    core.info('Running installer...')
    const exitCode = await exec.exec('sudo', ['installer', '-pkg', pkgPath, '-target', '/'])
    if (exitCode !== 0) {
      throw new Error(`Installation failed (exit code: ${exitCode})`)
    }
  }
}

export { MacOSInstaller }