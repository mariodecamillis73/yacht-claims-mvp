import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import { execFileSync } from "node:child_process";
function load(path) {
  const source = fs.readFileSync(path, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const exports = {};
  new Function("require", "exports", output)((name) => {
    if (name === "./i18n") return load("lib/i18n.ts");
    throw new Error(name);
  }, exports);
  return exports;
}
const { uiText, translateText } = load("lib/ui-text.ts");
const { translations } = load("lib/i18n.ts");
for (const [source, values] of Object.entries(uiText))
  for (const lang of ["en", "it", "es", "de"]) {
    assert.ok(values[lang]?.trim(), `${lang}: ${source}`);
    assert.deepEqual(
      [...values[lang].matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort(),
      [...source.matchAll(/\{(\w+)\}/g)].map((x) => x[1]).sort(),
    );
  }
for (const lang of ["it", "es", "de"]) {
  assert.notEqual(translateText("Previous", lang), "Previous");
  assert.notEqual(translateText("Next", lang), "Next");
  assert.equal(
    translateText("Customer-entered claim title: XYZ", lang),
    "Customer-entered claim title: XYZ",
  );
  assert.ok(
    translateText("Yacht {name} ({hull}) created.", lang, {
      name: "TEST",
      hull: "A",
    }).includes("TEST"),
  );
}
const files = execFileSync("rg", ["--files", "app", "components"], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter((f) => f.endsWith(".tsx"));
const allowed = new Set([
  "YY ASM",
  "Yacht Claims MVP",
  "(UTC)",
  "(max 5 MB)",
  "KB)",
]);
const missing = [];
for (const file of files) {
  if (file.endsWith("language-provider.tsx")) continue;
  const source = fs.readFileSync(file, "utf8");
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function walk(n) {
    if (ts.isJsxText(n)) {
      const text = n.getText(tree).replace(/\s+/g, " ").trim();
      if (/[A-Za-z]{2}/.test(text) && !allowed.has(text))
        missing.push(`${file}: ${text}`);
    }
    if (
      ts.isCallExpression(n) &&
      n.expression.getText(tree) === "tr" &&
      n.arguments[0] &&
      ts.isStringLiteral(n.arguments[0])
    ) {
      const text = n.arguments[0].text;
      for (const lang of ["it", "es", "de"]) {
        if (
          /[A-Za-z]{2}/.test(text) &&
          translateText(text, lang) === text &&
          !allowed.has(text) &&
          ![
            "Email",
            "Password",
            "Serial Nr",
            "Dealer",
            "Goodwill",
            "Yacht",
            "Claims",
          ].includes(text)
        )
          missing.push(`${file}: untranslated ${text} (${lang})`);
      }
    }
    ts.forEachChild(n, walk);
  }
  walk(tree);
}
assert.deepEqual(missing, []);
console.log(
  `PASS: ${Object.keys(uiText).length} UI labels in EN/IT/ES/DE, interpolation, Prev/Next, literal-label coverage and user-content preservation.`,
);
