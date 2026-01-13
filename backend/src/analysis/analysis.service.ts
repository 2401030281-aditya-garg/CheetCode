import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Groq from 'groq-sdk';

@Injectable()
export class AnalysisService {
  private groq: Groq;

  constructor(private readonly prisma: PrismaService) {
    this.groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  // ===================== NORMALIZER =====================
  private normalizeAnalysis(parsed: any) {
    return {
      explanation: parsed?.explanation ?? '',
      timeComplexity: parsed?.timeComplexity ?? '',
      spaceComplexity: parsed?.spaceComplexity ?? '',
      betterApproaches: Array.isArray(parsed?.betterApproaches)
        ? parsed.betterApproaches.map((a: any) => ({
            title: a?.title ?? '',
            description: a?.description ?? '',
            code: a?.code ?? '',
            timeComplexity: a?.timeComplexity ?? '',
            spaceComplexity: a?.spaceComplexity ?? '',
          }))
        : [],
      nextSteps: parsed?.nextSteps ?? '',
    };
  }

  private isBoilerplateOrEmpty(code: string): boolean {
    const stripped = code
      .replace(/\s+/g, '')
      .toLowerCase();

    return (
      stripped.length < 120 || // very small code
      stripped.includes('writeyourcodehere') ||
      stripped.includes('return0') &&
      !stripped.includes('for') &&
      !stripped.includes('while') &&
      !stripped.includes('if') &&
      !stripped.includes('map') &&
      !stripped.includes('vector') &&
      !stripped.includes('array')
    );
  }


  // ===================== ANALYZE =====================
  async analyze(data: any) {
    try {
      // 🔐 Auth guard
      if (!data.email) {
        return { error: 'Please login to continue.' };
      }

      const user = await this.prisma.user.findUnique({
        where: { email: data.email },
      });

      if (!user) {
        return { error: 'User not found.' };
      }

      // ✅ SINGLE SOURCE OF TRUTH FOR LEVEL
      const finalLevel =
        data.leetcodeDifficulty &&
        ['easy', 'medium', 'hard'].includes(data.leetcodeDifficulty)
          ? data.leetcodeDifficulty
          : 'medium';

      // 🧠 STRICT STRUCTURED PROMPT (FINAL)
const prompt = `
You are a competitive programming mentor.

Difficulty: ${finalLevel}

You MUST return VALID JSON ONLY.
NO markdown.
NO extra text.
NO merging of sections.

CRITICAL RULES (ABSOLUTE):
1. You MUST analyze ONLY the USER SUBMITTED CODE.
2. If the code is boilerplate, incomplete, or does not solve the problem:
   - timeComplexity MUST be "N/A"
   - spaceComplexity MUST be "N/A"
3. DO NOT infer problem-level or optimal complexity.
4. DO NOT assume missing logic.
5. If loops/DS are NOT PRESENT in code, DO NOT invent complexity.

SECTION RULES:
- explanation → explain WHAT THE CODE CURRENTLY DOES (even if useless)
- timeComplexity → based ONLY on visible operations
- spaceComplexity → based ONLY on visible variables
- betterApproaches → optional
- nextSteps → advice

JSON FORMAT (EXACT):
{
  "explanation": "",
  "timeComplexity": "",
  "spaceComplexity": "",
  "betterApproaches": [
    {
      "title": "",
      "description": "",
      "code": "",
      "timeComplexity": "",
      "spaceComplexity": ""
    }
  ],
  "nextSteps": ""
}

Problem:
${data.problem}

User Code:
${data.code}
`;

      const response = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        max_tokens: 900,
      });

      const raw = response.choices[0]?.message?.content || '{}';

      // 🛡️ SAFE PARSE
      let parsed: any = {};
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = {};
      }

      const normalized = this.normalizeAnalysis(parsed);
          
      // 🚨 HARD OVERRIDE FOR INCOMPLETE CODE
      if (this.isBoilerplateOrEmpty(data.code)) {
        normalized.timeComplexity = 'N/A';
        normalized.spaceComplexity = 'N/A';
        normalized.explanation =
          'The submitted code is incomplete or boilerplate and does not implement a solution.';
      }
      

      // 💾 SAVE SUBMISSION (NO topics!)
      const submission = await this.prisma.submission.create({
        data: {
          problem: data.problem,
          code: data.code,
          analysis: JSON.stringify(normalized),
          level: finalLevel,
          user: { connect: { id: user.id } },
        },
      });

      return {
        id: submission.id,
        level: finalLevel,
        analysis: normalized,
      };
    } catch (err) {
      console.error('Groq analyze error:', err);
      return {
        error: 'Analysis failed. Please try again later.',
      };
    }
  }

  async getStats(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        total: 0,
        easy: 0,
        medium: 0,
        hard: 0,
      };
    }

    const submissions = await this.prisma.submission.findMany({
      where: {
        userId: user.id,
      },
      select: {
        level: true,
      },
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

  // ===================== ACTIVITY (SUBMISSIONS OVER TIME) =====================
async getActivity(email: string) {
  if (!email) {
    throw new Error('Email required');
  }

  const submissions = await this.prisma.submission.findMany({
    where: {
      user: { email },
    },
    select: {
      createdAt: true,
    },
  });

  // Group by date (YYYY-MM-DD)
  const map: Record<string, number> = {};

  submissions.forEach((s) => {
    const date = s.createdAt.toISOString().split('T')[0];
    map[date] = (map[date] || 0) + 1;
  });

  // Convert to array & sort
  return Object.entries(map)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7); // last 7 days
}


  // ===================== RECOMMENDATIONS =====================
  async getRecommendations(email: string) {
    try {
      const submissions = await this.prisma.submission.findMany({
        where: { user: { email } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      if (submissions.length === 0) {
        return 'Not enough data yet.';
      }

      const summary = submissions
        .map(
          (s) =>
            `Difficulty: ${s.level}\nProblem: ${s.problem.substring(0, 120)}`
        )
        .join('\n\n');

      const prompt = `
You are a competitive programming mentor.

Based on these submissions:
- Weak areas
- Topics to improve
- 3 next LeetCode problems

Keep it concise.

${summary}
`;

      const res = await this.groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 300,
      });

      return res.choices[0]?.message?.content || '';
    } catch (err: any) {
      if (err?.status === 429) {
        console.warn('Groq rate limit hit');
        return 'Recommendations temporarily unavailable.';
      }
      throw err;
    }
  }
}
