import config from "../../config";

const baseUrl = new URL(config.faqEndpoint ?? "https://www.tg.no").origin;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/gsu, "").trim();
}

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<b>(.*?)<\/b>/gsu, "**$1**")
    .replace(/<br\s*\/?>/gu, "\n")
    .replace(/<a href="([^"]+)">([^<]+)<\/a>/gu, (_, url: string, hypertext: string) => `[${hypertext}](${url.startsWith("/") ? baseUrl : ""}${url})`)
    .replace(/<p[^>]*>/gu, "")
    .replace(/<\/p>/gu, "\n\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

export default function formatStripper(htmlInjectedText: string): Record<string, string> {
  const result: Record<string, string> = {};
  const sectionRegex = /<h2[^>]*>(.*?)<\/h2>(.*?)(?=<h2|$)/gsu;

  let match: null | RegExpExecArray = sectionRegex.exec(htmlInjectedText);
  while (match !== null) {
    const question = stripTags(match[1]!);
    const answer = htmlToMarkdown(match[2]!);
    if (question) result[question] = answer;
    match = sectionRegex.exec(htmlInjectedText);
  }

  return result;
}
