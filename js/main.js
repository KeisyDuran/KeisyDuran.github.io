// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Menú móvil
const toggle = document.querySelector(".nav__toggle");
const links = document.querySelector(".nav__links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", open);
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => links.classList.remove("is-open"))
);

// Tema claro / oscuro
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) {}

document.querySelector(".theme-toggle").addEventListener("click", () => {
  const isDark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
});
