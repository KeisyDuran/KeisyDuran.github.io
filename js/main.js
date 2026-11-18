/* Keisy Duran · portafolio */
(function () {
  "use strict";
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Tema ---------- */
  $(".theme-toggle").addEventListener("click", function () {
    var dark = root.dataset.theme === "dark" ||
      (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
    root.dataset.theme = dark ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
  });

  /* ---------- Menú móvil ---------- */
  var toggle = $(".nav__toggle"), links = $(".nav__links");
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach(function (a) {
    a.addEventListener("click", function () { links.classList.remove("is-open"); toggle.setAttribute("aria-expanded", "false"); });
  });

  /* ---------- Barra de progreso, nav y línea de tiempo ---------- */
  var bar = $(".progress span"), nav = $(".nav"), tl = $(".timeline");
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
    nav.classList.toggle("is-scrolled", scrollY > 10);
    if (tl) {
      var r = tl.getBoundingClientRect();
      var p = (innerHeight * 0.65 - r.top) / r.height;
      tl.style.setProperty("--fill", Math.max(0, Math.min(1, p)).toFixed(3));
    }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Sección activa en el menú */
  if ("IntersectionObserver" in window) {
    var navLinks = $$(".nav__links a[href^='#']");
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("is-active", a.getAttribute("href") === "#" + e.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Aparición al hacer scroll ---------- */
  var revealables = $$(".reveal, .project, .edu");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Texto que se escribe solo ---------- */
  var rot = $(".rotator");
  if (rot && !reduce) {
    var words = JSON.parse(rot.dataset.words), wi = 0, ci = words[0].length, deleting = true;
    setTimeout(function tick() {
      var w = words[wi];
      if (deleting) {
        ci--; rot.textContent = w.slice(0, ci);
        if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
        setTimeout(tick, 35);
      } else {
        w = words[wi]; ci++; rot.textContent = w.slice(0, ci);
        if (ci === w.length) { deleting = true; setTimeout(tick, 2200); } else setTimeout(tick, 70);
      }
    }, 2400);
  }

  /* ---------- Contadores ---------- */
  var counters = $$(".count");
  function runCount(el) {
    var to = +el.dataset.to, suf = el.dataset.suffix || "", t0 = null, dur = 1600;
    if (reduce) { el.textContent = to + suf; return; }
    requestAnimationFrame(function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(to * e) + (k === 1 ? suf : "");
      if (k < 1) requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { co.observe(c); });
  } else counters.forEach(runCount);

  /* ---------- Pestañas de roles ---------- */
  var tabs = $$(".roles__tabs [role=tab]");
  function selectRole(role, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.role === role;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
      if (on && focus) t.focus();
    });
    $$(".layer").forEach(function (l) { l.classList.toggle("is-hot", l.dataset.role === role); });
    var active = tabs.filter(function (t) { return t.dataset.role === role; })[0];
    if (active && active.scrollIntoView && active.parentElement.scrollWidth > active.parentElement.clientWidth) {
      active.parentElement.scrollTo({ left: active.offsetLeft - 16, behavior: reduce ? "auto" : "smooth" });
    }
  }

  /* Lleva la tarjeta del rol a la vista si quedó arriba o muy abajo */
  var panels = $(".roles__panels"), tabList = $(".roles__tabs");
  function absTop(el) { var y = 0; while (el) { y += el.offsetTop; el = el.offsetParent; } return y; }
  function showPanel() {
    var navH = nav.offsetHeight;
    // En celular las pestañas van encima de la tarjeta y se quedan pegadas: hay que dejarles espacio
    var stacked = getComputedStyle($(".roles")).gridTemplateColumns.trim().split(/\s+/).length < 2;
    var margin = stacked ? navH + tabList.offsetHeight + 8 : navH + 28;
    var top = absTop(panels) - scrollY;
    if (top < margin - 4 || top > innerHeight * 0.45) {
      scrollTo({ top: absTop(panels) - margin, behavior: reduce ? "auto" : "smooth" });
    }
  }

  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectRole(t.dataset.role); showPanel(); });
    t.addEventListener("keydown", function (e) {
      var d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
      if (!d) return;
      e.preventDefault();
      selectRole(tabs[(i + d + tabs.length) % tabs.length].dataset.role, true);
    });
  });

  /* Las capas del hero llevan al rol correspondiente */
  $$(".layer, .stack__qa").forEach(function (l) {
    l.addEventListener("click", function () {
      selectRole(l.dataset.role);
      $("#roles").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  });
  $(".stack__qa").setAttribute("role", "button");
  $(".stack__qa").tabIndex = 0;
  $(".stack__qa").addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); this.click(); } });

  /* La línea y la bolita van exactamente del primer punto al último */
  var stackEl = $(".stack"), stackLayers = $$(".layer");
  function fitStack() {
    if (!stackEl || !stackLayers.length) return;
    var a = stackLayers[0], b = stackLayers[stackLayers.length - 1];
    var y0 = a.offsetTop + a.offsetHeight / 2, y1 = b.offsetTop + b.offsetHeight / 2;
    stackEl.style.setProperty("--p0", (y0 - 6) + "px");
    stackEl.style.setProperty("--p1", (y1 - 6) + "px");
    stackEl.style.setProperty("--l0", y0 + "px");
    stackEl.style.setProperty("--l1", (stackEl.clientHeight - y1) + "px");
  }
  fitStack();
  addEventListener("resize", fitStack);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitStack);
  if (window.ResizeObserver && stackEl) new ResizeObserver(fitStack).observe(stackEl);

  /* ---------- Filtro de proyectos ---------- */
  var projects = $$(".project"), filters = $$(".filter"), empty = $(".empty");
  filters.forEach(function (f) {
    f.addEventListener("click", function () {
      var v = f.dataset.filter, shown = 0;
      filters.forEach(function (x) { var on = x === f; x.classList.toggle("is-active", on); x.setAttribute("aria-pressed", on); });
      projects.forEach(function (p) {
        var ok = v === "all" || p.dataset.roles.split(" ").indexOf(v) > -1;
        p.classList.toggle("is-hidden", !ok);
        if (ok) { shown++; p.classList.add("is-visible"); }
      });
      empty.hidden = shown > 0;
    });
  });

  /* Brillo que sigue al cursor */
  projects.forEach(function (p) {
    p.addEventListener("pointermove", function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty("--mx", (e.clientX - r.left) + "px");
      p.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Casos completos ---------- */
  var CASES = {
    tourmanager: {
      kicker: "Proyecto propio · en producción",
      title: "Tour Manager",
      lead: "Una plataforma SaaS multiempresa para agencias de turismo de República Dominicana. Empezó como un proyecto de la universidad en ASP.NET Core MVC y lo rediseñé como producto real: hoy una agencia lo usa a diario para su gestión.",
      link: "https://www.tourmanager.com.do",
      images: [
        ["img/tm-hero.webp", "Página principal de Tour Manager"],
        ["img/tm-modulos.webp", "Módulos de la plataforma"],
        ["img/tm-facturacion.webp", "Facturación con comprobantes fiscales de la DGII"]
      ],
      stats: [["120", "endpoints REST"], ["35", "entidades"], ["600+", "pruebas"], ["5", "idiomas"], ["4", "roles"], ["324", "commits"]],
      blocks: [
        ["r-backend", "Backend", ["120 endpoints en 30 módulos con Next.js y TypeScript sobre PostgreSQL y Prisma", "Aislamiento de datos por agencia, JWT, bcrypt, 4 roles y bitácora de auditoría", "AZUL (CardNet) para tarjeta y PayPal para suscripciones según el plan", "Comprobantes fiscales de la DGII: secuencias NCF y reportes 606 y 607"]],
        ["r-frontend", "Frontend", ["Página comercial y catálogo público con la marca de cada agencia", "Panel de 21 pantallas: tours, hoteles, reservas, cotizaciones, nómina, inventario…", "Interfaz en 5 idiomas, adaptable al celular", "Inscripción y pago en línea, QR para compartir y exportación a Excel"]],
        ["r-qa", "QA", ["Más de 600 pruebas automatizadas con Vitest sobre precios, cobros y cupos", "Verificación de tipos, lint, pruebas y build antes de cada despliegue", "Errores de dinero detectados y corregidos antes de llegar al cliente"]],
        ["r-infra", "Infraestructura", ["Vercel con dominio propio y HTTPS", "Base de datos en Supabase con migraciones controladas", "Content Security Policy y límite de peticiones con Redis"]]
      ],
      chips: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS 4", "PostgreSQL", "Prisma 7", "Vitest", "Redis", "Vercel"]
    },
    inventario: {
      kicker: "Registro Inmobiliario · en producción",
      title: "Sistema de Inventario de Servidores",
      lead: "El sistema con el que la institución sabe qué servidores tiene, dónde están, en qué rack y virtualizador corren, qué licencias usan y quién cambió qué. Lo diseñé, lo desarrollé y lo puse en producción.",
      stats: [["386", "servidores"], ["9", "usuarios activos"], ["7", "módulos"]],
      blocks: [
        ["r-backend", "Backend", ["ASP.NET Core MVC con C# y .NET 9", "SQL Server con Entity Framework Core y migraciones", "Servicios para Active Directory, auditoría, exportación, racks, virtualizadores y reemplazos", "Inicio de sesión con LDAP sin guardar contraseñas, con roles"]],
        ["r-frontend", "Frontend", ["Vistas Razor para servidores, racks, almacenamiento, licencias y áreas", "Alertas de licencias por vencer", "Importación y exportación masiva en Excel"]],
        ["r-qa", "Calidad", ["Detección de duplicados al importar", "Auditoría con trazabilidad completa de cada acción"]],
        ["r-infra", "Infraestructura", ["Publicado en IIS sobre Windows Server", "Conexión cifrada a la base de datos"]]
      ],
      chips: ["C#", "ASP.NET Core MVC", ".NET 9", "EF Core", "SQL Server", "Razor", "LDAP", "EPPlus", "IIS"],
      note: "El código y las pantallas son privados de la institución, por eso aquí no hay capturas."
    },
    lexiscampus: {
      kicker: "Pasantía · Ingeniería de Software",
      title: "LexisCampus DMS",
      lead: "Un sistema de gestión documental para una universidad. Cada documento tiene versiones, una huella digital y un estado. Un empleador puede entrar al portal público y comprobar si un título es auténtico y sigue vigente.",
      images: [
        ["img/dms-dashboard.webp", "Panel principal"],
        ["img/dms-documentos.webp", "Listado de documentos"],
        ["img/dms-auditoria.webp", "Detalle con auditoría"],
        ["img/dms-verificacion.webp", "Portal público de verificación"],
        ["img/dms-movil.webp", "Versión móvil"]
      ],
      blocks: [
        ["r-backend", "Backend", ["Arquitectura Onion (Clean Architecture) en capas", "ASP.NET Core Web API con .NET 8 y EF Core 8", "Validaciones con FluentValidation y huella SHA-256", "Archivos en MinIO (S3) y API documentada con Swagger"]],
        ["r-frontend", "Frontend", ["React con Vite", "Panel, carga de documentos, expediente del estudiante y roles", "Portal público de verificación", "Diseño adaptable al celular"]],
        ["r-infra", "Infraestructura", ["Docker Compose con SQL Server 2022 y MinIO"]]
      ],
      chips: [".NET 8", "ASP.NET Core Web API", "EF Core 8", "SQL Server", "React", "Vite", "MinIO", "Docker"]
    },
    prospera: {
      kicker: "Proyecto propio · en desarrollo",
      title: "Próspera · finanzas personales",
      lead: "La app de finanzas que yo quería usar. La regla es una sola: son números y dinero, así que todo tiene que cuadrar mejor que en una calculadora, y verse bien.",
      blocks: [
        ["r-frontend", "Frontend", ["Identidad visual propia, con tema claro por defecto", "Gráficos con Recharts y navegación pensada para el celular", "Panel con cuentas, presupuesto, deudas, ahorro e inversiones"]],
        ["r-backend", "Backend", ["Next.js con Prisma y autenticación con Auth.js", "Saldo real por cuenta y transferencias con origen y destino", "Simulador de amortización de préstamos y lógica de tarjetas de crédito", "Varias monedas sin mezclar nunca RD$ con US$"]]
      ],
      chips: ["Next.js 16", "React 19", "TypeScript", "Prisma", "Auth.js", "Recharts", "Tailwind CSS 4"],
      note: "Todavía en desarrollo. Lo estoy construyendo por fases a partir de las pruebas de uso."
    },
    sga: {
      kicker: "Registro Inmobiliario",
      title: "Módulo de Solicitudes del SGA",
      lead: "Dentro del Sistema de Gestión Administrativa de la institución, construí el módulo por el que pasan las solicitudes internas, desde que se crean hasta que se aprueban y se imprimen.",
      blocks: [
        ["r-backend", "Backend", ["APIs en ASP.NET", "Integración con procedimientos almacenados de SQL Server", "Validación de accesos según el rol del usuario"]],
        ["r-frontend", "Frontend", ["Interfaz en React que consume las APIs", "Generación de documentos imprimibles"]]
      ],
      chips: ["ASP.NET", "SQL Server", "T-SQL", "React"],
      note: "Sistema interno de la institución: el código y las pantallas son privados."
    },
    pos: {
      kicker: "Académico · UNICARIBE",
      title: "Punto de Venta móvil y de escritorio",
      lead: "Un sistema de ventas para Android y Windows que no se detiene si se va el internet: vende sin conexión y sincroniza con la API cuando vuelve.",
      blocks: [
        ["r-backend", "Backend", ["ASP.NET Core Web API", "Controladores de productos, categorías, ventas y usuarios"]],
        ["r-frontend", "Frontend", [".NET MAUI con patrón MVVM", "Catálogo, carrito, cobro, ticket e historial de ventas", "Usuarios por rol y SQLite local para trabajar sin conexión"]]
      ],
      chips: [".NET 9", "C#", ".NET MAUI", "MVVM", "ASP.NET Core Web API", "SQLite"]
    }
  };

  var dialog = $(".case"), content = $(".case__content"), lastFocus = null;
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function openCase(id) {
    var c = CASES[id]; if (!c) return;
    var h = '<p class="kicker">' + esc(c.kicker) + "</p>" +
      '<h2 id="case-title">' + esc(c.title) + "</h2>" +
      '<p class="case__lead">' + esc(c.lead) + "</p>";
    if (c.stats) h += '<div class="case__stats">' + c.stats.map(function (s) { return "<div><b>" + esc(s[0]) + "</b><span>" + esc(s[1]) + "</span></div>"; }).join("") + "</div>";
    if (c.images) {
      h += '<div class="case__gallery"><div class="case__main"><img src="' + c.images[0][0] + '" alt="' + esc(c.images[0][1]) + '"></div>';
      if (c.images.length > 1) h += '<div class="case__thumbs">' + c.images.map(function (im, i) {
        return '<button data-i="' + i + '" aria-label="Ver ' + esc(im[1]) + '"' + (i === 0 ? ' aria-current="true"' : "") + '><img src="' + im[0] + '" alt="" loading="lazy"></button>';
      }).join("") + "</div>";
      h += "</div>";
    }
    h += '<div class="case__cols">' + c.blocks.map(function (b) {
      return '<div class="case__block"><h3><span class="roles-mini"><span class="' + b[0] + '" style="padding:3px 10px;border-radius:6px">' + esc(b[1]) + "</span></span></h3><ul>" +
        b[2].map(function (li) { return "<li>" + esc(li) + "</li>"; }).join("") + "</ul></div>";
    }).join("") + "</div>";
    if (c.chips) h += '<ul class="chips">' + c.chips.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    if (c.note) h += '<p class="case__note">' + esc(c.note) + "</p>";
    if (c.link) h += '<p style="margin-top:22px"><a class="btn btn--primary" href="' + c.link + '" target="_blank" rel="noopener">Ver el sitio en vivo ↗</a></p>';
    content.innerHTML = h;

    $$(".case__thumbs button", content).forEach(function (b) {
      b.addEventListener("click", function () {
        var im = c.images[+b.dataset.i], main = $(".case__main img", content);
        main.src = im[0]; main.alt = im[1];
        $$(".case__thumbs button", content).forEach(function (x) { x.removeAttribute("aria-current"); });
        b.setAttribute("aria-current", "true");
      });
    });

    lastFocus = document.activeElement;
    if (typeof dialog.showModal === "function") dialog.showModal(); else dialog.setAttribute("open", "");
    dialog.scrollTop = 0;
    document.body.style.overflow = "hidden";
    $(".case__close").focus();
  }
  function closeCase() {
    if (dialog.close) dialog.close(); else dialog.removeAttribute("open");
  }
  dialog.addEventListener("close", function () {
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  });
  $(".case__close").addEventListener("click", closeCase);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) closeCase(); });

  projects.forEach(function (p) {
    p.addEventListener("click", function (e) {
      if (e.target.closest("a")) return;
      openCase(p.dataset.project);
    });
    p.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target === p) { e.preventDefault(); openCase(p.dataset.project); }
    });
  });

  /* ---------- Copiar correo ---------- */
  var toast = $(".toast"), toastTimer;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
  }
  $(".email").addEventListener("click", function () {
    var mail = this.dataset.email;
    var done = function () { showToast("Correo copiado ✓"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(mail).then(done, function () { location.href = "mailto:" + mail; });
    } else { location.href = "mailto:" + mail; }
  });
})();
