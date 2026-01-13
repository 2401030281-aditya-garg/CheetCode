export type Platform =
  | "leetcode"
  | "codeforces"
  | "codechef"
  | "hackerrank";

export function detectPlatform(url: string): Platform {
  if (url.includes("leetcode.com")) {
    return "leetcode";
  }

  if (url.includes("codeforces.com")) {
    return "codeforces";
  }

  if (url.includes("codechef.com")) {
    return "codechef";
  }

  if (url.includes("hackerrank.com")) {
    return "hackerrank";
  }

  throw new Error("Unsupported platform");
}
