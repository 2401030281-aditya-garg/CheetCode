import { Controller, Get, Query } from '@nestjs/common';
import { LeetCodeService } from './leetcode.service';

@Controller('leetcode')
export class LeetCodeController {
  constructor(private readonly leetcode: LeetCodeService) {}

  @Get('fetch')
  async fetch(@Query('input') input: string) {
    return this.leetcode.fetchProblem(input);
  }
}
