import axios from "axios";

export class CodeforcesService {
  async fetchProblem(url: string) {
    const match = url.match(/problem\/(\d+)\/([A-Z0-9]+)/i);
    if (!match) throw new Error("Invalid Codeforces URL");

    const contestId = match[1];
    const index = match[2];

    const apiUrl = `https://codeforces.com/api/problemset.problems`;
    const res = await axios.get(apiUrl);

    const problem = res.data.result.problems.find(
      (p) => p.contestId == contestId && p.index == index
    );

    if (!problem) throw new Error("Problem not found");

    return {
      platform: "codeforces",
      title: problem.name,
      description: "Description available on Codeforces page",
      difficulty: problem.rating
        ? problem.rating <= 1200
          ? "easy"
          : problem.rating <= 1800
          ? "medium"
          : "hard"
        : null,
    };
  }
}
