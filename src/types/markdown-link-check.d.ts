declare module 'markdown-link-check' {
  interface Link {
    link: string
    status: string
    statusCode: number
    error: string
  }

  interface Options {
    baseUrl?: string
    showProgressBar?: boolean
    timeout?: string
    httpHeaders?: Record<string, string>
    ignorePatterns?: { pattern: RegExp }[]
    replacementPatterns?: { pattern: RegExp; replacement: string }[]
    projectBaseUrl?: string
    ignoreDisable?: boolean
    retryOn429?: boolean
    retryCount?: number
    fallbackRetryDelay?: string
    aliveStatusCodes?: number[]
  }

  function markdownLinkCheck(
    markdown: string,
    options: Options,
    callback: (err: Error | null, results: Link[]) => void
  ): void

  export = markdownLinkCheck
}
