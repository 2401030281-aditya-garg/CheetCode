import { Module } from "@nestjs/common";
import { ProblemController } from "./problem.controller";
import { ProblemService } from "./problem.service";
import { LeetCodeModule } from "../leetcode/leetcode.module";
import { CodeforcesModule } from "../codeforces/codeforces.module";
import { HackerRankModule } from "../hackerrank/hackerrank.module";

@Module({
  imports: [LeetCodeModule, CodeforcesModule, HackerRankModule],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
