import { Octokit } from '@octokit/rest'

export async function createGhIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
  comment: string,
  assignees: string[],
  labels: string[]
): Promise<void> {
  const issue = await octokit.rest.issues.create({
    owner,
    repo,
    title,
    body,
    assignees,
    labels
  })

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number: issue.data.number,
    body: comment
  })
}

export async function findIssueWithTitle(
  octokit: Octokit,
  owner: string,
  repo: string,
  titleEnd: string
): Promise<{ title: string; number: number } | undefined> {
  const issues = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    state: 'all'
  })

  const deadLinksIsssue = issues.data.find((issue: { title: string }) =>
    issue.title.endsWith(titleEnd)
  )

  if (deadLinksIsssue && deadLinksIsssue.state === 'closed') {
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: deadLinksIsssue.number,
      state: 'open'
    })
  }

  return deadLinksIsssue
}

export async function getDeadLinksComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issue_number: number
): Promise<string> {
  if (issue_number === 0) {
    return ''
  }
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number
  })

  const botComment = comments.data.find(
    comment =>
      comment.user &&
      (comment.user.login === owner ||
        comment.user.login === 'github-actions[bot]') &&
      comment.body?.startsWith('## Dead links')
  )

  if (botComment) {
    return botComment.body || ''
  }

  return ''
}

export async function createOrUpdateComment(
  octokit: Octokit,
  owner: string,
  repo: string,
  issueNumber: number,
  body: string,
  botUsername: string
): Promise<void> {
  const comments = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber
  })

  const botComment = comments.data.find(
    comment => comment.user && comment.user.login === botUsername
  )

  if (botComment) {
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: botComment.id,
      body
    })
  } else {
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body
    })
  }
}
