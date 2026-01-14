import { Injectable } from "@nestjs/common";
import { detectPlatform } from "./problem.utils";
import { LeetCodeService } from "../leetcode/leetcode.service";
import { CodeforcesService } from "../codeforces/codeforces.service";
import { HackerRankService } from "../hackerrank/hackerrank.service";

@Injectable()
export class ProblemService {
  constructor(
    private readonly leetcodeService: LeetCodeService,
    private readonly codeforcesService: CodeforcesService,
    private readonly hackerrankService: HackerRankService

  ) {}

  async fetchProblem(url: string) {
    const platform = detectPlatform(url);

    if (platform === "leetcode") {
      return this.leetcodeService.fetchProblem(url);
    }

    if (platform === "codeforces") {
      return this.codeforcesService.fetchProblem(url);
    }

    if (platform === "hackerrank") {
        return this.hackerrankService.fetchProblem(url);
    }


    return {
      error: "Platform not supported yet",
    };
  }
}
