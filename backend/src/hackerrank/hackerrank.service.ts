import { Injectable } from "@nestjs/common";

@Injectable()
export class HackerRankService {
  async fetchProblem(url: string) {
    // Title from URL
    const parts = url.split("/").filter(Boolean);
    const titleSlug = parts[parts.length - 1];

    const title = titleSlug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    return {
      platform: "hackerrank",
      title,
      difficulty: "unknown",
      description: `
This is a HackerRank problem.

Please analyze the provided code and explain:
- the logic used
- time and space complexity
- edge cases
- better approaches if any

Original problem link:
${url}
      `.trim(),
    };
  }
}
