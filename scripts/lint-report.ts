// Summarizes Oxlint diagnostics by rule and by file, for planning lint cleanups.
// Exits with Oxlint's status.
import { $ } from "bun";

interface Diagnostic {
  code?: string;
  filename?: string;
}

const countBy = (values: string[]) => {
  const counts = new Map<string, number>();
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts].toSorted((left, right) => right[1] - left[1]);
};

const printCounts = (label: string, counts: [string, number][]) => {
  console.log(`\n${label}`);
  for (const [name, count] of counts) {
    console.log(`${count}\t${name}`);
  }
};

const result = await $`bunx oxlint -f json .`.nothrow().quiet();
const report: { diagnostics: Diagnostic[] } = JSON.parse(
  result.stdout.toString()
);
const rules = countBy(report.diagnostics.map(({ code }) => code ?? "unknown"));
const files = countBy(
  report.diagnostics.map(({ filename }) => filename ?? "unknown")
);

console.log(
  `exit=${result.exitCode} diagnostics=${report.diagnostics.length} files=${files.length} rules=${rules.length}`
);
printCounts("RULES", rules);
printCounts("FILES", files);
process.exitCode = result.exitCode;
