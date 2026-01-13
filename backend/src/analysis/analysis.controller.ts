import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('analyze')
export class AnalysisController {
  constructor(
    private readonly analysisService: AnalysisService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async analyze(@Body() body: any) {
    return this.analysisService.analyze(body);
  }

  @Get('my-submissions')
  async mySubmissions(@Query('email') email: string) {
    if (!email) return [];

    return this.prisma.submission.findMany({
      where: { user: { email } },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('stats')
  async stats(@Query('email') email: string) {
    if (!email) {
      return { total: 0, easy: 0, medium: 0, hard: 0 };
    }

    const submissions = await this.prisma.submission.findMany({
      where: { user: { email } },
      select: { level: true },
    });

    const stats = {
      total: submissions.length,
      easy: 0,
      medium: 0,
      hard: 0,
    };

    for (const s of submissions) {
      if (s.level === 'easy') stats.easy++;
      if (s.level === 'medium') stats.medium++;
      if (s.level === 'hard') stats.hard++;
    }

    return stats;
  }

  // ===================== ACTIVITY =====================
  @Get('activity')
  async activity(@Query('email') email: string) {
    return this.analysisService.getActivity(email);
  }
  

  @Get('recommendations')
  async recommendations(@Query('email') email: string) {
    if (!email) {
      return { result: 'Email is required.' };
    }

    const result = await this.analysisService.getRecommendations(email);
    return { result };
  }
}
