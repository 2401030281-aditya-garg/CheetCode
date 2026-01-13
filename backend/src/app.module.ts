import { Module } from '@nestjs/common';
import { AnalysisModule } from './analysis/analysis.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LeetCodeModule } from './leetcode/leetcode.module';
import { ProblemModule } from "./problem/problem.module";

@Module({
  imports: [

    LeetCodeModule, PrismaModule, AnalysisModule, UserModule, AuthModule, ProblemModule
  ],
})
export class AppModule {}
