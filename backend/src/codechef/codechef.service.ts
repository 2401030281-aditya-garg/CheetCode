import axios from "axios";
import * as cheerio from "cheerio";
import { Injectable } from "@nestjs/common";

@Injectable()
export class CodeChefService {
  async fetchProblem(url: string) {
    const htmlRes = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      timeout: 8000,
    });

    const $ = cheerio.load(htmlRes.data);

    // Title
    const title =
      $("h1").first().text().trim() ||
      $(".problem-title").text().trim() ||
      "CodeChef Problem";

    // Description
    let description = "";
    $(".problem-statement p").each((_, el) => {
      description += $(el).text().trim() + "\n\n";
    });

    description = description.trim();

    if (!description) {
      description = "Refer to the CodeChef problem page for full description.";
    }

    // Difficulty (CodeChef does not provide reliably)
    const difficulty = "unknown";

    return {
      platform: "codechef",
      title,
      description: `
    This is a CodeChef problem.
        
    Problem URL:
    ${url}
        
    Please refer to the original problem statement on CodeChef
    and analyze the solution accordingly.
    `,
      difficulty: "unknown",
    };
    
  }
}
