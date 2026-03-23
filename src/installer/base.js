import * as core from '@actions/core'
import fs from 'fs'
import crypto from 'crypto'
import { writeFile } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

/**
 * Base installer class that provides common installation logic for all platforms
 */
class BaseInstaller {
  constructor(config) {
    this.expectedPlatform = config.expectedPlatform
    this.archMap = config.archMap
    this.fileExtension = config.fileExtension
    this.fileName = config.fileName || `IBM_Cloud_CLI${config.fileExtension}`
  }

  /**
   * Downloads a file from a URL to a destination path
   * @param {string} url - The URL to download from
   * @param {string} destPath - The destination file path
   */
  static async downloadFile(url, destPath) {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    await writeFile(destPath, Buffer.from(buffer))
  }

  /**
   * Fetches and parses JSON from a URL
   * @param {string} url - The URL to fetch from
   * @returns {Promise<any>} The parsed JSON response
   */
  static async fetchJson(url) {
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Calculates the SHA256 checksum of a file
   * @param {string} filePath - Path to the file
   * @returns {Promise<string>} The hex-encoded SHA256 hash
   */
  static async calculateSha256(filePath) {
    const hash = crypto.createHash('sha256')
    const stream = fs.createReadStream(filePath)

    for await (const chunk of stream) {
      hash.update(chunk)
    }

    return hash.digest('hex')
  }

  /**
   * Fetches version metadata for a specific platform
   * @param {string} platform - The platform identifier
   * @returns {Promise<{version: string, installer: string, sha256: string}>}
   */
  static async getVersionMetadata(platform) {
    const infoUrl = 'https://download.clis.cloud.ibm.com/ibm-cloud-cli-metadata-dn/info.json'
    const info = await BaseInstaller.fetchJson(infoUrl)
    const latestVersion = info.latestVersion

    const allVersionsUrl = 'https://download.clis.cloud.ibm.com/ibm-cloud-cli-metadata-dn/all_versions.json'
    const allVersions = await BaseInstaller.fetchJson(allVersionsUrl)

    // Find the version object matching latestVersion
    const versionData = allVersions.find(v => v.version === latestVersion)
    if (!versionData) {
      throw new Error(`Version ${latestVersion} not found in metadata`)
    }

    // Get installer from binaries section
    const platformData = versionData.binaries?.[platform]
    if (!platformData) {
      throw new Error(`No download available for platform: ${platform}`)
    }

    return {
      version: latestVersion,
      installer: platformData.url,
      sha256: platformData.sha256_checksum
    }
  }

  /**
   * Detects and validates the platform
   * @returns {string} The mapped platform identifier
   */
  detectPlatform() {
    const arch = process.arch
    const platform = process.platform

    if (platform !== this.expectedPlatform) {
      throw new Error(`Unsupported platform: ${platform}`)
    }

    const mappedArch = this.archMap[arch]
    if (!mappedArch) {
      throw new Error(`Unsupported architecture: ${arch}`)
    }

    return mappedArch
  }

  /**
   * Downloads and verifies the installer
   * @param {string} installer - Download URL
   * @param {string} sha256 - Expected checksum
   * @returns {string} Path to the downloaded file
   */
  async downloadAndVerify(installer, sha256) {
    const tmpDir = tmpdir()
    const installerPath = join(tmpDir, this.fileName)

    core.info('Downloading IBM Cloud CLI...')
    await BaseInstaller.downloadFile(installer, installerPath)

    core.info('Verifying checksum...')
    const actualSha256 = await BaseInstaller.calculateSha256(installerPath)
    if (actualSha256 !== sha256) {
      fs.unlinkSync(installerPath)
      throw new Error(`Checksum mismatch! Expected: ${sha256}, Got: ${actualSha256}`)
    }
    core.info('Checksum verified successfully')

    return installerPath
  }

  /**
   * Cleans up temporary files
   * @param {string} filePath - Path to the file to delete
   */
  cleanup(filePath) {
    core.info('Cleaning up temporary files...')
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }

  /**
   * Platform-specific installation logic (to be overridden)
   * @param {string} installerPath - Path to the downloaded installer
   */
  async runInstaller(installerPath) {
    throw new Error('runInstaller must be implemented by subclass')
  }

  /**
   * Optional post-installation steps (to be overridden if needed)
   */
  async postInstall() {
    // Default: no post-install steps
  }

  /**
   * Main installation flow
   */
  async install() {
    const platform = this.detectPlatform()
    core.info(`Detected platform: ${platform}`)

    core.info('Fetching version metadata...')
    const { version, installer, sha256 } = await BaseInstaller.getVersionMetadata(platform)
    core.info(`Latest version: ${version}`)
    core.info(`Download URL: ${installer}`)

    const installerPath = await this.downloadAndVerify(installer, sha256)

    await this.runInstaller(installerPath)

    this.cleanup(installerPath)

    await this.postInstall()

    core.info('IBM Cloud CLI installed successfully')
  }
}

export { BaseInstaller }