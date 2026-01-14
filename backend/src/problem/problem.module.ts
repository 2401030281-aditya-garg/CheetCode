import { Module } from "@nestjs/common";
import { ProblemController } from "./problem.controller";
import { ProblemService } from "./problem.service";
import { LeetCodeModule } from "../leetcode/leetcode.module";
import { CodeforcesModule } from "../codeforces/codeforces.module";
import { HackerRankModule } from "../hackerrank/hackerrank.module";
import { CodeChefModule } from "../codechef/codechef.module";

@Module({
  imports: [LeetCodeModule, CodeforcesModule, HackerRankModule, CodeChefModule],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
