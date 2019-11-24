export const cssifyArray = (array: string[]): string =>
  array.map(i => `"${i}"`).join(", ");

// Fonts
export const bodyFont = cssifyArray([
  "system-ui",
  "--apple-system",
  "BlinkMacSystemFont",
  "Segoe UI",
  "Helvetica",
  "Arial",
  "sans-serif",
  "Apple Color Emoji",
  "Segoe UI Emoji",
  "Segoe UI Symbol",
]);
