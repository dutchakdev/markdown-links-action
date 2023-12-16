import {
  createLinkProcessor,
  deadLinksToMarkdown,
  fileExists,
  checkWebLink
} from '../src/utils/deadLinks'
import { Transform } from 'stream'
import axios from 'axios'
import { Semaphore } from 'async-mutex'
import fs from 'fs'

jest.mock('axios')
jest.mock('fs')

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedFs = fs as jest.Mocked<typeof fs>

describe('deadLinks', () => {
  const mockFile = 'mockFile.md'
  const mockLink = 'http://mocklink.com'
  const mockDeadLink = {
    file: mockFile,
    link: mockLink,
    statusCode: 404,
    status: 'dead',
    statusEmo: '☠️',
    error: 'Link not reachable'
  }

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('createLinkProcessor returns a Transform stream', () => {
    const result = createLinkProcessor(mockFile)
    expect(result).toBeInstanceOf(Transform)
  })

  test('deadLinksToMarkdown returns a markdown string', () => {
    const result = deadLinksToMarkdown([mockDeadLink])
    expect(result).toContain('| File | Link | Status | Emoji |')
    expect(result).toContain(
      `| mockFile.md | http://mocklink.com | ![](https://img.shields.io/badge/_404-red) | ☠️ |`
    )
  })

  test('fileExists returns true for an existing file', async () => {
    mockedFs.access.mockImplementation((path, callback) => {
      callback(null)
    })
    const result = await fileExists(mockFile)
    expect(result).toBe(true)
  })

  test('fileExists returns false for a non-existing file', async () => {
    mockedFs.access.mockImplementation((path, callback) =>
      callback(new Error('File not found'))
    )
    const result = await fileExists('nonExistingFile.md')
    expect(result).toBe(false)
  })

  test('checkWebLink returns a dead link if the status is not 200', async () => {
    mockedAxios.get.mockResolvedValue({ status: 404 })
    const result = await checkWebLink(mockLink, mockFile, new Semaphore(1))
    expect(result).toEqual(mockDeadLink)
  })
})
