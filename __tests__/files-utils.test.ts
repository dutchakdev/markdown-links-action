import fs from 'fs'
import getFilesToCheck, { FileCheckOptions } from '../src/utils/filesUtils'

jest.mock('path', () => ({
  resolve: jest.fn((...args) => args.join('/'))
}))
jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs')
  return {
    ...originalModule,
    promises: {
      readdir: jest.fn(),
      stat: jest.fn()
    }
  }
})
jest.mock('child_process', () => {
  return {
    exec: jest.fn().mockImplementation((command, callback) => {
      console.log(`Executing command: ${command}`)
      callback(null, { stdout: '' })
    }),
    __promisify__: jest.fn().mockImplementation(async command => {
      console.log(`Executing command: ${command}`)
      return Promise.resolve({ stdout: '' })
    })
  }
})

// const mockedExec = exec as jest.MockedFunction<typeof exec>
// const mockedExecPromise = promisify(exec) as jest.MockedFunction<
//   typeof exec.__promisify__
// >

describe('filesUtils', () => {
  const readdirAsync = fs.promises.readdir as jest.Mock
  const statAsync = fs.promises.stat as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should list files in given folder paths', async () => {
    readdirAsync.mockResolvedValue([
      { name: 'file1.md', isDirectory: () => false },
      { name: 'file2.md', isDirectory: () => false }
    ])
    statAsync.mockResolvedValue({ isDirectory: () => false })

    const options: FileCheckOptions = {
      folderPaths: ['docs'],
      fileExtension: '.md',
      maxDepth: -1,
      checkModifiedFilesOnly: false,
      baseBranch: 'master',
      additionalFilePaths: []
    }

    const files = await getFilesToCheck(options)

    expect(files).toEqual(['docs/file1.md', 'docs/file2.md'])
  })

  it('should respect maxDepth in folder structure', async () => {
    readdirAsync
      .mockResolvedValueOnce([{ name: 'subfolder', isDirectory: () => true }])
      .mockResolvedValueOnce([{ name: 'file1.md', isDirectory: () => false }])

    statAsync.mockImplementation(async filePath => {
      const isDir = filePath.includes('subfolder')
      return Promise.resolve({ isDirectory: () => isDir })
    })

    const options: FileCheckOptions = {
      folderPaths: ['docs'],
      fileExtension: '.md',
      maxDepth: 1,
      checkModifiedFilesOnly: false,
      baseBranch: 'master',
      additionalFilePaths: []
    }

    const files = await getFilesToCheck(options)
    expect(files).toEqual(['docs/subfolder/file1.md'])
  })

  it('should filter files by file extension', async () => {
    readdirAsync.mockResolvedValue([
      { name: 'file1.md', isDirectory: () => false },
      { name: 'file2.txt', isDirectory: () => false }
    ])
    statAsync.mockResolvedValue({ isDirectory: () => false })

    const options: FileCheckOptions = {
      folderPaths: ['docs'],
      fileExtension: '.md', // Looking for markdown files only
      maxDepth: -1,
      checkModifiedFilesOnly: false,
      baseBranch: 'master',
      additionalFilePaths: []
    }

    const files = await getFilesToCheck(options)
    expect(files).toEqual(['docs/file1.md']) // Expecting only markdown files
  })
})
