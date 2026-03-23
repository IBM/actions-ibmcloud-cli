import fs from 'fs'
import crypto from 'crypto'
import { writeFile } from 'fs/promises'

async function downloadFile(url, destPath) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`)
  }

  const buffer = await response.arrayBuffer()
  await writeFile(destPath, Buffer.from(buffer))
}

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

async function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256')
  const stream = fs.createReadStream(filePath)

  for await (const chunk of stream) {
    hash.update(chunk)
  }

  return hash.digest('hex')
}

async function getVersionMetadata(platform) {
  const infoUrl = 'https://download.clis.cloud.ibm.com/ibm-cloud-cli-metadata-dn/info.json'
  const info = await fetchJson(infoUrl)
  const latestVersion = info.latestVersion

  const allVersionsUrl = 'https://download.clis.cloud.ibm.com/ibm-cloud-cli-metadata-dn/all_versions.json'
  const allVersions = await fetchJson(allVersionsUrl)

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

export { downloadFile, fetchJson, calculateSha256, getVersionMetadata }
