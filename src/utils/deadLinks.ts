export interface DeadLink {
    file: string;
    link: string;
    status: number;
}

export function deadLinksToMarkdown(deadLinks: DeadLink[]): string {
    let markdown = `| File | Link | Status |\n| --- | --- | --- |\n`;
    deadLinks.forEach((deadLink) => {
        markdown += `| ${deadLink.file} | ${deadLink.link} | ${deadLink.status} |\n`;
    });
    return markdown;
}