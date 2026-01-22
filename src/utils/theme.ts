export const getStorageItem = (key: string) => {
  if (typeof window === "undefined") return null
  return localStorage.getItem(key)
}

export const setStorageItem = (key: string, value: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, value)
  } catch (_e) {
    return
  }
}

export const THEME = "theme"

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

export function getCurrentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light"
  const theme = document.documentElement.getAttribute("class")
  return theme === "dark" ? "dark" : "light"
}

export function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("class", theme)
  setStorageItem(THEME, theme)
}
