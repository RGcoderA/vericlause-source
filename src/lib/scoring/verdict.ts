import type { Finding, Severity } from "@/types/finding";
import type { Verdict } from "@/types/review";

export function verdictFromFindings(findings: Finding[]): Verdict {
  const issues = findings.filter((finding) => finding.severity !== "green");
  if (issues.some((finding) => finding.severity === "red")) return "red";
  if (issues.some((finding) => finding.severity === "amber")) return "amber";
  return "green";
}

export function rankSeverity(severity: Severity): number {
  if (severity === "red") return 2;
  if (severity === "amber") return 1;
  return 0;
}

export function sortFindings(findings: Finding[]): Finding[] {
  return [...findings].sort((a, b) => {
    const bySeverity = rankSeverity(b.severity) - rankSeverity(a.severity);
    if (bySeverity !== 0) return bySeverity;
    return a.sectionNumber.localeCompare(b.sectionNumber, undefined, {
      numeric: true,
    });
  });
}
