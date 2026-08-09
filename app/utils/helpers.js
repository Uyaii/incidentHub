export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "") // remove apostrophes
    .replace(/[^a-z0-9]+/g, "-") // non-alnum -> dash
    .replace(/^-+|-+$/g, ""); // trim dashes
}
