import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LeetCodeService {
  async fetchProblem(input: string) {
    // 1️⃣ Extract slug from URL
    const match = input.match(/problems\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid LeetCode URL');
    }

    const slug = match[1];

    // 2️⃣ GraphQL query
    const query = `
      query getQuestionDetail($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          title
          difficulty
          content
          exampleTestcases
          topicTags {
            name
          }
        }
      }
    `;

    const res = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: { titleSlug: slug },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const q = res.data?.data?.question;
    if (!q) {
      throw new Error('Problem not found');
    }

    return {
      title: q.title,
      difficulty: q.difficulty.toLowerCase(),
      description: this.cleanHTML(q.content),
      examples: q.exampleTestcases,
      tags: q.topicTags.map((t: any) => t.name),
    };
  }

  // 🧹 Remove HTML tags safely
  private cleanHTML(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();
  }
}
