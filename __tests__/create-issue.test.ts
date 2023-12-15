import { Octokit } from '@octokit/rest'
import { createGhIssue } from '../src/main'

describe('createIssue', () => {
  it('should create an issue', async () => {
    const mockOctokit = {
      issues: {
        create: jest.fn().mockResolvedValue({})
      }
    } as unknown as Octokit

    await createGhIssue(
      mockOctokit,
      'owner',
      'repo',
      'Test Issue',
      'This is a test issue',
      [],
      []
    )

    expect(mockOctokit.issues.create).toHaveBeenCalledWith({
      owner: 'owner',
      repo: 'repo',
      title: 'Test Issue',
      body: 'This is a test issue',
      assignees: [],
      labels: []
    })
  })
})
