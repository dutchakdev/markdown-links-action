import * as core from '@actions/core'
import { run } from '../src/main' // Replace with the actual path
// import { Octokit } from '@octokit/rest'

jest.mock('@actions/core')
jest.mock('fs', () => {
  return {
    promises: {
      readFile: jest.fn().mockResolvedValue('Mock file content'),
      readdir: jest.fn().mockResolvedValue([
        { name: 'file1.md', isDirectory: () => false },
        { name: 'file2.md', isDirectory: () => false }
      ])
    }
  }
})
jest.mock('markdown-link-check')
jest.mock('@octokit/rest', () => ({
  Octokit: jest.fn()
}))

describe('run', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle errors', async () => {
    jest.spyOn(core, 'getInput').mockImplementation(() => {
      throw new Error('Mock error')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Mock error')
  })
})
