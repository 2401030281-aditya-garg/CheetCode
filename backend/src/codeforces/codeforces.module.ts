import { Module } from "@nestjs/common";
import { CodeforcesService } from "./codeforces.service";

@Module({
  providers: [CodeforcesService],
  exports: [CodeforcesService],
})
export class CodeforcesModule {}
