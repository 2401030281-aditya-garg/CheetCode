import { Module } from "@nestjs/common";
import { HackerRankService } from "./hackerrank.service";

@Module({
  providers: [HackerRankService],
  exports: [HackerRankService],
})
export class HackerRankModule {}
