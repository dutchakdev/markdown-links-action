import fs from 'fs'
import path from 'path'
import { Transform, TransformCallback } from 'stream'
import axios, { isAxiosError } from 'axios'
import { Semaphore } from 'async-mutex'
import { DeadLink } from '../types/types'

export interface LinkFilePair {
  link: string
  file: string
}

export const createLinkProcessor = (file: string): Transform => {
  let buffer = ''

  return new Transform({
    readableObjectMode: true,

    transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
      buffer += chunk.toString()
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const linkMatch = line.match(/\[.*?\]\((.*?)\)|<a href="(.*?)"/g)
        if (linkMatch) {
          for (const match of linkMatch) {
            const link =
              match.match(/href="(.*?)"/)?.[1] || match.match(/\((.*?)\)/)?.[1]
            if (link) {
              this.push({ link, file } as LinkFilePair)
            }
          }
        }
      }

      callback()
    },

    flush(callback: TransformCallback) {
      if (buffer) {
        const linkMatch = buffer.match(/\[.*?\]\((.*?)\)|<a href="(.*?)"/g)
        if (linkMatch) {
          for (const match of linkMatch) {
            const link =
              match.match(/href="(.*?)"/)?.[1] || match.match(/\((.*?)\)/)?.[1]
            if (link) {
              this.push({ link, file } as LinkFilePair)
            }
          }
        }
      }
      callback()
    }
  })
}

export const deadLinksToMarkdown = (deadLinks: DeadLink[]): string => {
  const markdownLines = deadLinks.map(
    deadLink =>
      `| ${deadLink.file} | ${deadLink.link} | ${deadLink.statusCode} | ${deadLink.statusEmo} |\n`
  )

  return `## Dead links\n| File | Link | Status | Emoji |\n| --- | --- | --- | --- |\n${markdownLines.join(
    ''
  )}`
}

export const fileExists = async (filePath: string): Promise<boolean> => {
  return new Promise(resolve => {
    fs.access(filePath, err => {
      resolve(!err)
    })
  })
}

export const checkWebLink = async (
  link: string,
  file: string,
  semaphore: Semaphore
): Promise<DeadLink | null> => {
  const [, release] = await semaphore.acquire()
  try {
    const response = await axios.get(link)
    release()
    if (response.status !== 200) {
      return {
        file,
        link,
        statusCode: response.status,
        status: 'dead',
        statusEmo: '☠️',
        error: 'Link not reachable'
      }
    }
    return null
  } catch (error) {
    release()
    if (isAxiosError(error)) {
      return {
        file,
        link,
        statusCode: error.response?.status || 0,
        status: 'dead',
        statusEmo: '☠️',
        error: error.message
      }
    } else {
      return {
        file,
        link,
        statusCode: 0,
        status: 'dead',
        statusEmo: '☠️',
        error: 'Unknown error'
      }
    }
  }
}

export const checkLinks = async (
  file: string,
  concurrency = 5
): Promise<{ deadLinks: DeadLink[]; relativeLinks: string[] }> => {
  const deadLinks: DeadLink[] = []
  const relativeLinks: string[] = []
  const semaphore = new Semaphore(concurrency)
  const linkProcessor = createLinkProcessor(file)

  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(file).pipe(linkProcessor)

    const handleDataEvent = async (
      linkFilePair: LinkFilePair
    ): Promise<void> => {
      stream.pause() // Pause the stream to process this link
      try {
        await semaphore.runExclusive(async () => {
          if (
            linkFilePair.link.startsWith('http://') ||
            linkFilePair.link.startsWith('https://')
          ) {
            const deadLink = await checkWebLink(
              linkFilePair.link,
              linkFilePair.file,
              semaphore
            )
            if (deadLink) {
              deadLinks.push(deadLink)
            }
          } else {
            const directoryPath = path.dirname(linkFilePair.file)
            const relativeFilePath = path.join(directoryPath, linkFilePair.link)
            const exists = await fileExists(relativeFilePath)
            if (!exists) {
              deadLinks.push({
                file: linkFilePair.file,
                link: relativeFilePath,
                statusCode: 404,
                status: 'dead',
                statusEmo: '🌚',
                error: 'File not found.'
              })
            } else {
              relativeLinks.push(linkFilePair.link)
            }
          }
        })
      } catch (error) {
        reject(error)
        return
      }
      stream.resume() // Resume the stream for next link
    }

    stream.on('data', handleDataEvent)
    stream.on('end', () => resolve({ deadLinks, relativeLinks }))
    stream.on('error', err => reject(err))
  })
}
