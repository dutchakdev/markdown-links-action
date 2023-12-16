import * as core from '@actions/core'
import { Octokit } from '@octokit/rest'
import fs from 'fs'
import path from 'path'
import getFilesToCheck, { FileCheckOptions } from './utils/filesUtils'
import {
  info as _info,
  error as _error,
  debug as _debug,
  parseVerbosityInput,
  Verbosity
} from './utils/logUtils'
import { validateAndGetConfig } from './utils/configUtils'
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
    // Retrieving inputs from action.yml
    const createIssue = core.getInput('create-issue') === 'yes'

    const repoToken = core.getInput('repo-token', { required: createIssue })
    const repository = core.getInput('repository', { required: createIssue })
    const [owner, repo] = repository.split('/')

    if (createIssue && (!owner || !repo)) {
      core.setFailed('Invalid repository format. Expected format: owner/repo')
      return
    }

    const useVerboseModeInput =
      core.getInput('use-verbose-mode') || 'DEBUG_INFO_WARN_ERROR'
    const configFile = core.getInput('config-file') || './.markdown-links.json'
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
    _debug(`ghLabels: ${ghLabels}`)

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
      folderPaths: folderPath.split(',').map(_fPath => _fPath.trim()),
      fileExtension,
      maxDepth,
      checkModifiedFilesOnly,
      baseBranch,
      additionalFilePaths: filePath
        .split(',')
        .map(_fPath => path.resolve(_fPath.trim()))
    }

    _info(`FileCheckOptions options: ${JSON.stringify(options)}`)
    const filesToCheck = await getFilesToCheck(options)

    _info(`Files to check: ${filesToCheck}`)

    const configFilePath = path.resolve(`${configFile}`)
    const config = await validateAndGetConfig(configFilePath)
    _info(`configFilePath: ${configFilePath}`)

    const deadLinks: DeadLink[] = []

    const linkCheckPromises = filesToCheck.map(async file => {
      const fileContent = await readFileAsync(file, 'utf8')
      _info(`Checking links in file ${file}`)
      try {
        const results = await checkLinks(fileContent, config)
        for (const result of results) {
          if (result.statusCode !== 200) {
            deadLinks.push({
              file,
              link: result.link,
              statusCode: result.statusCode,
              status: result.status,
              error: result.error
            })
          }
        }
      } catch (err) {
        _error(`Error while checking links in file ${file}. Error: ${err}`)
      }
    })

    await Promise.all(linkCheckPromises)

    _info(`Dead links: ${JSON.stringify(deadLinks)}`)

    // Set output
    core.setOutput('dead-links', JSON.stringify(deadLinks))

    if (createIssue) {
      const issueTitleEnd = ' [mlc action]'
      const fullIssueTitle =
        issueTitle.replace('{n}', deadLinks.length.toString()) + issueTitleEnd
      const issueBody = deadLinksToMarkdown(deadLinks)

      try {
        const octokit = new Octokit({ auth: repoToken })
        const existingIssue = await findIssueWithTitle(
          octokit,
          owner,
          repo,
          issueTitleEnd
        )

        if (existingIssue) {
          await createOrUpdateComment(
            octokit,
            owner,
            repo,
            existingIssue.id,
            issueBody,
            'github-actions[bot]'
          )
          _info(`Comment updated/created successfully 🤙`)
        } else {
          // Include issue header if exists
          const issueHeaderPath = `${process.env.GITHUB_WORKSPACE}/.mdl-issue-header.md`
          const issueHeader = await readFileAsync(issueHeaderPath, 'utf8')

          _info(`issueBody: ${issueBody}`)

          await createGhIssue(
            octokit,
            owner,
            repo,
            `${fullIssueTitle.replace(
              '{n}',
              deadLinks.length.toString()
            )} [mlc action]`,
            issueHeader ? issueHeader + issueBody : issueBody,
            ghAssignees,
            ghLabels
          )
          _info(`Issue created successfully 🤙`)
        }
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
