#!/bin/sh

set -eu

project_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
report_file=$(mktemp)

cleanup() {
  rm -f "$report_file"
}

trap cleanup EXIT HUP INT TERM
cd "$project_root"

lint_status=0
bunx oxlint -f json . >"$report_file" 2>/dev/null || lint_status=$?

bun -e '
  const reportFile = Bun.argv[1];
  const lintStatus = Bun.argv[2];
  const parsed = JSON.parse(await Bun.file(reportFile).text());
  const diagnostics = Array.isArray(parsed) ? parsed : (parsed.diagnostics ?? []);
  const rules = new Map();
  const files = new Map();

  for (const diagnostic of diagnostics) {
    const rule = diagnostic.code ?? diagnostic.ruleId ?? "unknown";
    const file = (diagnostic.filename ?? diagnostic.filePath ?? "unknown").replace(
      `${process.cwd()}/`,
      ""
    );
    rules.set(rule, (rules.get(rule) ?? 0) + 1);
    files.set(file, (files.get(file) ?? 0) + 1);
  }

  const printCounts = (label, counts) => {
    console.log(`\n${label}`);
    for (const [name, count] of [...counts].sort((left, right) => right[1] - left[1])) {
      console.log(`${count}\t${name}`);
    }
  };

  console.log(
    `exit=${lintStatus} diagnostics=${diagnostics.length} files=${files.size} rules=${rules.size}`
  );
  printCounts("RULES", rules);
  printCounts("FILES", files);
' "$report_file" "$lint_status"

exit "$lint_status"
