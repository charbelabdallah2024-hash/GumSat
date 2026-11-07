// Cloudflare Pages Function: /api/download?file=NAME&code=ACCESS_CODE
//
// The paid files live in a folder with a long random name inside /public.
// Buyers are never shown that folder name. This function checks the access
// code first and only then streams the file from there.
//
// Set the access code in Cloudflare: Settings > Variables and Secrets,
// name DOWNLOAD_CODE. Use one code, or several separated by commas.

// Must match the real folder name inside /public. Keep it secret.
const FILES_DIR = "files-40c967e9b02eb095e246b03e";

const FILES = [
  "00_Start_Here_and_Study_Order.pdf",
  "01_Desmos_Essentials.pdf",
  "02_Linear_Equations_One_Variable.pdf",
  "03_Lines_and_Two_Variable_Equations.pdf",
  "04_Linear_Functions.pdf",
  "05_Systems_of_Linear_Equations.pdf",
  "06_Linear_Inequalities.pdf",
  "07_Exponents_and_Radicals.pdf",
  "08_Polynomials_and_Equivalent_Expressions.pdf",
  "09_Quadratic_Equations_and_Parabolas.pdf",
  "10_Other_Nonlinear_Equations_and_Systems.pdf",
  "11_Exponential_and_Other_Nonlinear_Functions.pdf",
  "12_Ratios_Rates_Proportions_and_Units.pdf",
  "13_Percentages.pdf",
  "14_One_Variable_Data_and_Statistics.pdf",
  "15_Scatterplots_Models_and_Regression.pdf",
  "16_Probability_and_Conditional_Probability.pdf",
  "17_Inference_and_Margin_of_Error.pdf",
  "18_Study_Design_and_Statistical_Claims.pdf",
  "19_Area_Surface_Area_and_Volume.pdf",
  "20_Lines_Angles_and_Similar_Triangles.pdf",
  "21_Right_Triangles_and_Trigonometry.pdf",
  "22_Circles.pdf",
  "GumSat_Part1_Start-Desmos-Algebra-AdvancedMath.zip",
  "GumSat_Part2_ProblemSolving-Data-Geometry.zip"
];

const TYPES = { pdf: "application/pdf", zip: "application/zip" };

const enc = new TextEncoder();

async function sha256(text) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(text)));
}

// Compare two hashes without stopping at the first difference.
function sameBytes(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length && i < b.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function validCode(input, configured) {
  const codes = String(configured || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  const inputHash = await sha256(input);
  let ok = false;
  for (const c of codes) {
    if (sameBytes(inputHash, await sha256(c))) ok = true; // check all, no early exit
  }
  return ok;
}

function text(status, body) {
  return new Response(body, {
    status,
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.DOWNLOAD_CODE) return text(500, "Server is not configured.");

  const url = new URL(request.url);
  const file = url.searchParams.get("file") || "";
  const code = url.searchParams.get("code") || "";

  if (!code || !(await validCode(code, env.DOWNLOAD_CODE))) {
    return text(403, "Access denied.");
  }

  if (!FILES.includes(file)) return text(404, "File not found.");

  const ext = file.split(".").pop().toLowerCase();
  const assetUrl = new URL("/" + FILES_DIR + "/" + encodeURIComponent(file), url.origin);
  const asset = await env.ASSETS.fetch(assetUrl.toString());
  if (!asset.ok) return text(404, "File not found.");

  const downloadName = file.startsWith("GumSat") ? file : "GumSat_" + file;
  return new Response(asset.body, {
    status: 200,
    headers: {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Content-Disposition": 'attachment; filename="' + downloadName + '"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex, nofollow"
    }
  });
}
