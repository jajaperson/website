const cssifyArray = (array: string[]): string =>
  array.map((i) => `"${i}"`).join(", ");

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

export const darkBackgroundColor = "#010326";
export const darkBackgroundColorTinted = "#02063a";
export const darkBackgroundRadial = `radial-gradient(${darkBackgroundColorTinted}, ${darkBackgroundColor})`;
export const textColor = "#fdfffc";
export const primaryColor = "#db2d2d";
export const secondaryColor = "#12eaa6";
