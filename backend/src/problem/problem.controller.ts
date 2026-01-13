import { Controller, Get, Query } from "@nestjs/common";
import { ProblemService } from "./problem.service";

@Controller("problem")
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get("fetch")
  async fetchProblem(@Query("url") url: string) {
    return this.problemService.fetchProblem(url);
  }
}
