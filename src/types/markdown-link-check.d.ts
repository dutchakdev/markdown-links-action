declare module 'markdown-link-check' {
    function markdownLinkCheck(markdown: string, options: any, callback: (err: Error | null, results: any[]) => void): void;
    export = markdownLinkCheck;
}