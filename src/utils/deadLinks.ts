import markdownLinkCheck from 'markdown-link-check'
import { DeadLink } from '../types/types'

export function deadLinksToMarkdown(deadLinks: DeadLink[]): string {
  let markdown = `| File | Link | Status |\n| --- | --- | --- |\n`
  for (const deadLink of deadLinks) {
    markdown += `| ${deadLink.file} | ${deadLink.link} | ${deadLink.status} |\n`
  }
  return markdown
}

export async function checkLinks(
  fileContent: string,
  config: import('markdown-link-check').Options
): Promise<import('markdown-link-check').Link[]> {
  return new Promise((resolve, reject) => {
    markdownLinkCheck(fileContent, config, (err, results) => {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}
