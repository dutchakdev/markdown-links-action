import * as core from '@actions/core'
import { run } from '../src/main' // Replace with the actual path
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import markdownLinkCheck from 'markdown-link-check'

jest.mock('@actions/core')
jest.mock('fs', () => {
  return {
    promises: {
      readFile: jest.fn().mockResolvedValue('Mock file content')
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

  it('should execute without errors', async () => {
    jest.spyOn(core, 'getInput').mockImplementation(name => {
      switch (name) {
        case 'repo-token':
          return 'mock-token'
        case 'repository':
          return 'mock-owner/mock-repo'
        case 'use-quiet-mode':
          return 'no'
        case 'use-verbose-mode':
          return 'no'
        case 'config-file':
          return 'mlc_config.json'
        case 'folder-path':
          return '.'
        case 'max-depth':
          return '-1'
        case 'check-modified-files-only':
          return 'no'
        case 'base-branch':
          return 'master'
        case 'file-extension':
          return '.md'
        case 'file-path':
          return ''
        case 'create-issue':
          return 'no'
        case 'gh-assignees':
          return ''
        case 'gh-labels':
          return ''
        default:
          return ''
      }
    })

    const mockOctokit = {} as unknown as Octokit // Mock Octokit instance

    await run()
  })

  it('should handle errors', async () => {
    jest.spyOn(core, 'getInput').mockImplementation(() => {
      throw new Error('Mock error')
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('Mock error')
  })
})
