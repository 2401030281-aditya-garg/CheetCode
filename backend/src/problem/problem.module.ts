import { Module } from "@nestjs/common";
import { ProblemController } from "./problem.controller";
import { ProblemService } from "./problem.service";
import { LeetCodeModule } from "../leetcode/leetcode.module";
import { CodeforcesModule } from "../codeforces/codeforces.module";

@Module({
  imports: [LeetCodeModule, CodeforcesModule],
  controllers: [ProblemController],
  providers: [ProblemService],
})
export class ProblemModule {}
