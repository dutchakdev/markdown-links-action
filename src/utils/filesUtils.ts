import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'
const readdirAsync = fs.promises.readdir

export interface FileCheckOptions {
  folderPaths: string[]
  fileExtension: string
  maxDepth: number
  checkModifiedFilesOnly: boolean
  baseBranch: string
  additionalFilePaths: string[]
}

async function getFiles(
  dir: string,
  fileExtension: string,
  maxDepth: number,
  currentDepth = 0
): Promise<string[]> {
  if (maxDepth >= 0 && currentDepth > maxDepth) {
    return []
  }

  const dirents = await readdirAsync(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(async dirent => {
      const res = path.resolve(dir, dirent.name)
      return dirent.isDirectory()
        ? getFiles(res, fileExtension, maxDepth, currentDepth + 1)
        : res
    })
  )

  return Array.prototype
    .concat(...files)
    .filter(file => file.endsWith(fileExtension))
}

export async function getModifiedFiles(baseBranch: string): Promise<string[]> {
  const execAsync = promisify(exec)
  try {
    const { stdout } = await execAsync(`git diff --name-only ${baseBranch}`)
    return stdout.split('\n').filter(line => line)
  } catch (error) {
    console.error('Error occurred while getting modified files:', error)
    return []
  }
}

async function getFilesToCheck(options: FileCheckOptions): Promise<string[]> {
  const allFiles = []

  for (const folderPath of options.folderPaths) {
    const files = await getFiles(
      folderPath,
      options.fileExtension,
      options.maxDepth
    )
    allFiles.push(...files)
  }
  for (const filePath of options.additionalFilePaths) {
    allFiles.push(path.resolve(filePath))
  }

  if (options.checkModifiedFilesOnly) {
    const modifiedFiles = await getModifiedFiles(options.baseBranch)
    return allFiles.filter(file => modifiedFiles.includes(file))
  }

  return allFiles
}

export default getFilesToCheck
