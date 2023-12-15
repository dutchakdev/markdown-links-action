import { DeadLink } from '../types/types'

export function deadLinksToMarkdown(deadLinks: DeadLink[]): string {
  let markdown = `| File | Link | Status |\n| --- | --- | --- |\n`
  for (const deadLink of deadLinks) {
    markdown += `| ${deadLink.file} | ${deadLink.link} | ${deadLink.status} |\n`
  }
  return markdown
}
