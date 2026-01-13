import { Controller, Get, Query } from "@nestjs/common";
import { LeetCodeService } from "./leetcode.service";

@Controller("leetcode")
export class LeetCodeController {
  constructor(private readonly leetcodeService: LeetCodeService) {}

  @Get("fetch")
  fetch(@Query("input") input: string) {
    return this.leetcodeService.fetchProblem(input);
  }
}
