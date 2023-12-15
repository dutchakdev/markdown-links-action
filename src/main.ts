import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import markdownLinkCheck from 'markdown-link-check'
import fs from 'fs'
import getFilesToCheck, { FileCheckOptions } from './utils/filesUtils'
import {
  info as _info,
  error as _error,
  debug as _debug,
  parseVerbosityInput,
  Verbosity
} from './utils/logUtils'
import { validateAndGetConfig } from './utils/configUtils'
import { deadLinksToMarkdown } from './utils/deadLinks'
import { DeadLink } from './types/types'

const readFileAsync = fs.promises.readFile

export async function createGhIssue(
  octokit: Octokit,
  owner: string,
  repo: string,
  title: string,
  body: string,
  assignees: string[],
  labels: string[]
): Promise<void> {
  await octokit.issues.create({
    owner,
    repo,
    title,
    body,
    assignees,
    labels
  })
}

export async function run(): Promise<void> {
  try {
    // Retrieving inputs from action.yml
    const repoToken = core.getInput('repo-token', { required: true })
    const repository = core.getInput('repository', { required: true })
    const [owner, repo] = repository.split('/')

    if (!owner || !repo) {
      core.setFailed('Invalid repository format. Expected format: owner/repo')
      return
    }

    const useVerboseModeInput =
      core.getInput('use-verbose-mode') || 'DEBUG_INFO_WARN_ERROR'
    const configFile = core.getInput('config-file') || '.markdown-links.json'
    const folderPath = core.getInput('folder-path') || '.'
    const maxDepth = parseInt(core.getInput('max-depth'), 10) || -1
    const checkModifiedFilesOnly =
      core.getInput('check-modified-files-only') === 'yes'
    const baseBranch = core.getInput('base-branch') || 'master'
    const fileExtension = core.getInput('file-extension') || '.md'
    const filePath = core.getInput('file-path') || ''
    const createIssue = core.getInput('create-issue') === 'yes'
    const issueTitle =
      core.getInput('issue-title') ||
      '🔥 Dead {n} Links Found in Markdown Files'
    const ghAssignees = core.getInput('gh-assignees')
      ? core.getInput('gh-assignees').split(',')
      : []
    const ghLabels = core.getInput('gh-labels')
      ? core.getInput('gh-labels').split(',')
      : []

    const useVerboseMode: Verbosity = parseVerbosityInput(useVerboseModeInput)

    _debug(`useVerboseMode: ${useVerboseMode}`)
    _debug(`configFile: ${configFile}`)
    _debug(`folderPath: ${folderPath}`)
    _debug(`maxDepth: ${maxDepth}`)
    _debug(`checkModifiedFilesOnly: ${checkModifiedFilesOnly}`)
    _debug(`baseBranch: ${baseBranch}`)
    _debug(`fileExtension: ${fileExtension}`)
    _debug(`filePath: ${filePath}`)
    _debug(`createIssue: ${createIssue}`)
    _debug(`ghAssignees: ${ghAssignees}`)

    if (isNaN(maxDepth) || maxDepth < -1) {
      _error(
        `Invalid value for max-depth. It must be a non-negative integer or -1.`
      )
      core.setFailed(
        'Invalid value for max-depth. It must be a non-negative integer or -1.'
      )
      return
    }

    const options: FileCheckOptions = {
      folderPaths: folderPath.split(',').map(path => path.trim()),
      fileExtension,
      maxDepth,
      checkModifiedFilesOnly,
      baseBranch,
      additionalFilePaths: filePath.split(',').map(path => path.trim())
    }

    _info(`ghAssignees: ${JSON.stringify(options)}`)
    const filesToCheck = await getFilesToCheck(options)

    _info(`Files to check: ${filesToCheck}`)

    const configFilePath = `${process.env.GITHUB_WORKSPACE}/${configFile}`
    const config = await validateAndGetConfig(configFilePath)

    const deadLinks: DeadLink[] = []
    for (const file of filesToCheck) {
      const fileContent = await readFileAsync(file, 'utf8')
      markdownLinkCheck(fileContent, config, (err, results) => {
        if (err) {
          _error(`Error while checking links in file ${file}. Error: ${err}`)
          return
        }
        for (const result of results) {
          if (result.statusCode !== 200) {
            const link: DeadLink = {
              file,
              link: result.link,
              statusCode: result.statusCode,
              status: result.status,
              error: result.error
            }
            deadLinks.push(link)
          }
        }
      })
    }

    // Set output
    core.setOutput('dead-links', JSON.stringify(deadLinks))

    if (createIssue) {
      try {
        const octokit = new Octokit({ auth: repoToken })
        let issueBody = deadLinksToMarkdown(deadLinks)
        const issueHeaderPath = `${process.env.GITHUB_WORKSPACE}/.mdl-issue-header.md`
        const issueHeader = await readFileAsync(issueHeaderPath, 'utf8')
        if (issueHeader) {
          issueBody = issueHeader + issueBody
        }
        _info(`issueBody: ${issueBody}`)

        await createGhIssue(
          octokit,
          owner,
          repo,
          issueTitle.replace('{n}', deadLinks.length.toString()),
          issueBody,
          ghAssignees,
          ghLabels
        )
        _info(`Issue created successfully 🤙`)
      } catch (error) {
        if (error instanceof Error) {
          _error(`Error while creating issue: ${error.message}`)
          core.setFailed(error.message)
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      _error(error.message)
      core.setFailed(error.message)
    }
  }
}
