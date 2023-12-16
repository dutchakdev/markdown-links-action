import { Octokit } from '@octokit/rest'
import * as core from '@actions/core'
import fs from 'fs'
import path from 'path'
import getFilesToCheck, { FileCheckOptions } from './utils/filesUtils'
import { checkLinks, deadLinksToMarkdown } from './utils/deadLinks'
import { DeadLink } from './types/types'
import {
  createGhIssue,
  findIssueWithTitle,
  createOrUpdateComment
} from './utils/githubUtils'
const readFileAsync = fs.promises.readFile

export async function run(): Promise<void> {
  try {
    const createIssue = core.getInput('create-issue') === 'yes'
    const repoToken = core.getInput('repo-token', { required: createIssue })
    const repository = core.getInput('repository', { required: createIssue })
    const [owner, repo] = repository.split('/')

    if (createIssue && (!owner || !repo)) {
      core.setFailed('Invalid repository format. Expected format: owner/repo')
      return
    }

    const folderPath = core.getInput('folder-path') || '.'
    const maxDepth = parseInt(core.getInput('max-depth'), 10) || -1
    const checkModifiedFilesOnly =
      core.getInput('check-modified-files-only') === 'yes'
    const baseBranch = core.getInput('base-branch') || 'master'
    const fileExtension = core.getInput('file-extension') || '.md'
    const filePath = core.getInput('file-path') || ''
    const issueTitle =
      core.getInput('issue-title') ||
      '🔥 Dead {n} Links Found in Markdown Files'
    const ghAssignees = core.getInput('gh-assignees')
      ? core.getInput('gh-assignees').split(',')
      : []
    const ghLabels = core.getInput('gh-labels')
      ? core.getInput('gh-labels').split(',')
      : []

    core.debug(`folderPath: ${folderPath}`)
    core.debug(`maxDepth: ${maxDepth}`)
    core.debug(`checkModifiedFilesOnly: ${checkModifiedFilesOnly}`)
    core.debug(`baseBranch: ${baseBranch}`)
    core.debug(`fileExtension: ${fileExtension}`)
    core.debug(`filePath: ${filePath}`)
    core.debug(`createIssue: ${createIssue}`)
    core.debug(`ghAssignees: ${ghAssignees}`)
    core.debug(`ghLabels: ${ghLabels}`)

    if (isNaN(maxDepth) || maxDepth < -1) {
      core.error(
        `Invalid value for max-depth. It must be a non-negative integer or -1.`
      )
      core.setFailed(
        'Invalid value for max-depth. It must be a non-negative integer or -1.'
      )
      return
    }

    const options: FileCheckOptions = {
      folderPaths: folderPath.split(',').map(_fPath => _fPath.trim()),
      fileExtension,
      maxDepth,
      checkModifiedFilesOnly,
      baseBranch,
      additionalFilePaths: filePath
        .split(',')
        .map(_fPath => path.resolve(_fPath.trim()))
    }

    core.debug(`FileCheckOptions options: ${JSON.stringify(options)}`)
    const filesToCheck = await getFilesToCheck(options)

    core.debug(`Files to check: ${filesToCheck}`)

    const deadLinks: DeadLink[] = []

    const linkCheckPromises = filesToCheck.map(async file => {
      core.debug(`Checking links in file ${file}`)
      try {
        const concurrencyLevel = 5
        const result = await checkLinks(file, concurrencyLevel)
        core.debug(`Result for file ${file}: ${JSON.stringify(result)}`)

        return result
      } catch (error) {
        if (error instanceof Error) {
          core.error(
            `Error while checking links in file ${file}. Error: ${error.message}`
          )
        }
        return { deadLinks: [], relativeLinks: [] }
      }
    })

    const checker = async (): Promise<void> => {
      try {
        const results = await Promise.all(linkCheckPromises)
        for (const result of results) {
          deadLinks.push(...result.deadLinks)
        }
        core.debug('All files processed.')
        core.debug(`Dead links: ${JSON.stringify(deadLinks)}`)
      } catch (error) {
        core.error('An error occurred while processing the files.')
        core.setFailed('An error occurred while processing the files.')
      }
    }

    if (createIssue) {
      const octokit = new Octokit({ auth: repoToken })
      const issueTitleEnd = ' [mlc action]'
      const fullIssueTitle =
        issueTitle.replace('{n}', deadLinks.length.toString()) + issueTitleEnd

      await checker()

      const issueBody = deadLinksToMarkdown(deadLinks)
      const deadLinksIssue = await findIssueWithTitle(
        octokit,
        owner,
        repo,
        issueTitleEnd
      )

      try {
        if (deadLinksIssue) {
          core.debug(`======`)
          core.debug(
            `existingIssue: #${deadLinksIssue.number} ${JSON.stringify(
              deadLinksIssue
            )}`
          )
          core.debug(`======`)
          await createOrUpdateComment(
            octokit,
            owner,
            repo,
            deadLinksIssue.number,
            issueBody,
            owner
          )
          core.info(`Comment updated/created successfully 🤙`)
        } else {
          const issueHeaderPath = `${process.env.GITHUB_WORKSPACE}/.mdl-issue-header.md`
          const issueHeader = await readFileAsync(issueHeaderPath, 'utf8')

          await createGhIssue(
            octokit,
            owner,
            repo,
            `${fullIssueTitle.replace('{n}', deadLinks.length.toString())}`,
            issueHeader,
            issueBody,
            ghAssignees,
            ghLabels
          )
          core.info(`Issue created successfully 🤙`)
        }
      } catch (error) {
        if (error instanceof Error) {
          core.error(`Error while creating issue: ${error.message}`)
          core.setFailed(`Error while creating issue: ${error.message}`)
        }
      }
    } else {
      await checker()
    }

    core.setOutput('dead-links', JSON.stringify(deadLinks))
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message)
      core.setFailed(error.message)
    }
  }
}
