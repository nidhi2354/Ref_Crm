const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Ye formats rows (leads) ki tarah import honge
const LEAD_FILE_EXTENSIONS = [
  ".xlsx",
  ".xlsm",
  ".xlsb",
  ".xls",
  ".ods",
  ".csv",
  ".tsv",
  ".txt",
  ".json",
];

const isLeadFile = (fileName) =>
  LEAD_FILE_EXTENSIONS.includes(path.extname(fileName).toLowerCase());

const hasValue = (row) =>
  Object.values(row).some((value) => String(value ?? "").trim() !== "");

// Column names saaf karo. MongoDB keys mein "$" ya "." allowed nahi hote
const normalizeRow = (row) => {
  const clean = {};

  Object.entries(row).forEach(([rawKey, value]) => {
    // XLSX blank header ko "__EMPTY" bana deta hai, use skip karo
    if (rawKey.startsWith("__EMPTY")) return;

    const key = rawKey.trim().replace(/^\$+/, "").replace(/\./g, " ").trim();

    if (!key) return;

    clean[key] = typeof value === "string" ? value.trim() : value;
  });

  return clean;
};

// Text file (.txt / .tsv): pehli line dekh kar delimiter guess karo
const readDelimitedText = (filePath, extension) => {
  const text = fs.readFileSync(filePath, "utf8");

  if (extension === ".tsv") {
    return XLSX.read(text, { type: "string", FS: "\t" });
  }

  const firstLine = text.split(/\r?\n/)[0] || "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  return XLSX.read(text, { type: "string", FS: delimiter });
};

// Har supported file ko rows ki list mein badalta hai.
// Throw karta hai agar file padhi hi na ja sake.
const parseLeadFile = (filePath, originalName) => {
  const extension = path.extname(originalName).toLowerCase();

  let sheets = [];

  if (extension === ".json") {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.data)
        ? parsed.data
        : null;

    if (!list) {
      throw new Error(
        "JSON file mein records ki list (array) honi chahiye, jaise [{...}, {...}]"
      );
    }

    sheets = [
      {
        name: "",
        rows: list.filter(
          (item) => item && typeof item === "object" && !Array.isArray(item)
        ),
      },
    ];
  } else {
    const workbook =
      extension === ".tsv" || extension === ".txt"
        ? readDelimitedText(filePath, extension)
        : XLSX.readFile(filePath);

    sheets = workbook.SheetNames.map((name) => ({
      name,
      rows: XLSX.utils.sheet_to_json(workbook.Sheets[name], {
        defval: "",
        raw: false,
      }),
    }));
  }

  // Khaali sheets / khaali rows hata do
  const usableSheets = sheets
    .map((sheet) => ({
      name: sheet.name,
      rows: sheet.rows.filter(hasValue).map(normalizeRow).filter(hasValue),
    }))
    .filter((sheet) => sheet.rows.length > 0);

  // Ek se zyada sheet ho to har row ke saath sheet ka naam rakhte hain
  const isMultiSheet = usableSheets.length > 1;

  const rows = usableSheets.flatMap((sheet) =>
    isMultiSheet
      ? sheet.rows.map((row) => ({ ...row, _sheet: sheet.name }))
      : sheet.rows
  );

  return {
    rows,
    sheetCount: usableSheets.length,
  };
};

module.exports = {
  LEAD_FILE_EXTENSIONS,
  isLeadFile,
  parseLeadFile,
};
