import config from "../../config";

const baseUrl = new URL(config.faqEndpoint ?? "https://www.tg.no").origin;

export default function formatStripper(htmlInjectedText: string): string {
  return htmlInjectedText
    .replace(/<b>/gu, "**")
    .replace(/<\/b>/gu, "**")
    .replace(/<br\s*\/?>/gu, "\n")
    .replace(/<a href="([^"]+)">([^<]+)<\/a>/gu, (_, url: string, hypertext: string) => `[${hypertext}](${url.startsWith("/") ? baseUrl : ""}${url})`)
    .replace(/<p[^>]*>/gu, "")
    .replace(/<\/p>/gu, "");
}
