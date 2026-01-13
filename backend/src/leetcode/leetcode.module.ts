import { Module } from "@nestjs/common";
import { LeetCodeController } from "./leetcode.controller";
import { LeetCodeService } from "./leetcode.service";

@Module({
  controllers: [LeetCodeController],
  providers: [LeetCodeService],
  exports: [LeetCodeService], // 🔥 THIS LINE IS IMPORTANT
})
export class LeetCodeModule {}
