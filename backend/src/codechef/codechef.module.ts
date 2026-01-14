import { Module } from "@nestjs/common";
import { CodeChefService } from "./codechef.service";

@Module({
  providers: [CodeChefService],
  exports: [CodeChefService],
})
export class CodeChefModule {}