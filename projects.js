(function () {
  var GRID = document.getElementById("proyectos");
  var SEARCH_INPUT = document.getElementById("search-input");
  var FILTER_CONTAINER = document.getElementById("language-filters");
  if (!GRID) return;

  var EXCLUDED = ["BJZR", "sst", "latrode", "opencode"];
  var FEATURED = ["B_lang", "Taller-Elvis"];

  var allRepos = [];
  var currentSearch = "";
  var currentLang = "Todos";

  var DESCRIPTIONS_MAP = {
    "B_lang": "Lenguaje de programación compilable (beta) a ensamblador x86_64 para sistemas Linux.",
    "Taller-Elvis": "Sitio web profesional para taller mecánico con catálogo de servicios de reparación y mantenimiento.",
    "ryf": "Shell minimalista y eficiente desarrollado en Go para entornos Unix.",
    "parrot.vscode": "Extensión para Visual Studio Code con soporte de resaltado de sintaxis para el lenguaje Parrot.",
    "appimg": "Herramienta CLI para gestión y empaquetado simplificado de aplicaciones AppImage.",
    "parrot.nvim": "Plugin de Neovim para resaltado de sintaxis e integración del lenguaje Parrot.",
    "Compuesto-X": "Juego interactivo y educativo enfocado en conceptos de química general.",
    "MinDE": "Entorno de escritorio (Desktop Environment) minimalista y ligero para Linux.",
    "Programacion_orientada_a_objetos": "Colección de ejercicios y proyectos prácticos sobre Programación Orientada a Objetos en Java.",
    "publicidad_gamer": "Landing page interactiva orientada al sector publicitario y cultura gamer.",
    "Biblioteca": "Sistema de gestión e inventario para bibliotecas desarrollado en Java.",
    "scripts-linux": "Colección de scripts en Bash para automatización de tareas y optimización en sistemas Linux.",
    "idw": "Entorno de diseño web interactivo para prototipado rápido en el navegador.",
    "dwv": "Herramienta visual de maquetación e inspección para desarrollo web.",
    "MLang": "Compilador minimalista para un lenguaje de programación orientado a arquitectura Linux x86_64.",
    "docs": "Generador automático de documentación a partir de comentarios estructurados en código C.",
    "pack": "Herramienta de compresión de archivos optimizada para código fuente (.c, .h).",
    "watch": "Utilidad de monitoreo continuo en terminal sin dependencias externas.",
    "snap": "Sistema de control de versiones local y ultra-rápido para flujos de trabajo simplificados.",
    "blaze": "Sistema de automatización de compilación (Build Tool) minimalista alternativo a Make.",
    "void.nvim": "Tema de colores para Neovim inspirado en la estética visual de Void Linux.",
    "imagen_ascii": "Aplicación web para conversión de imágenes a arte ASCII con opciones de exportación.",
    "ToolsWebX": "Suite de utilidades web integradas para acelerar el flujo de desarrollo frontend.",
    "void-bspwm": "Script de instalación y configuración completa para entorno BSPWM en Void Linux.",
    "pyorganizador": "Utilidad en Python para clasificar y organizar archivos automáticamente según su tipo.",
    "cc-modificado": "Modificación y extensión del compilador de C original desarrollado por lolzdev.",
    "MD": "Editor y previsualizador minimalista de documentos Markdown en el navegador.",
    "transpilador-c": "Transpilador escrito en C que procesa sintaxis personalizada hacia código C estándar.",
    "treegen": "Herramienta CLI en C que genera estructuras de proyectos a partir de esquemas de texto.",
    "Config_bspwm": "Configuración modular de BSPWM con Lemonbar, Rofi, Dunst y Picom.",
    "superc": "Biblioteca en C que ofrece macros y utilidades para una sintaxis sintética y expresiva.",
    "carroselwm": "Gestor de ventanas para X11 enfocado en una distribución tipo carrusel horizontal.",
    "pwa-c": "Herramienta CLI para creación y administración de Progressive Web Applications (PWA).",
    "wmp": "Gestor de ventanas ultraligero e híbrido basado en la arquitectura de DWM y BSPWM."
  };

  function escapeHTML(str) {
    return String(str || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    try {
      if (!iso) return "";
      return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function preview(repo) {
    if (repo.social_preview_image_url) {
      return '<div class="preview"><img src="' + escapeHTML(repo.social_preview_image_url) + '" alt="' + escapeHTML(repo.name) + '" loading="lazy" /></div>';
    }
    return '<div class="preview" aria-hidden="true">' + escapeHTML((repo.name || "?").charAt(0).toUpperCase()) + '</div>';
  }

  function getRepoDescription(repo) {
    if (DESCRIPTIONS_MAP[repo.name]) {
      return DESCRIPTIONS_MAP[repo.name];
    }
    if (repo.description && repo.description.trim() && !repo.description.startsWith("- ")) {
      return repo.description;
    }
    return "Proyecto de desarrollo alojado en GitHub.";
  }

  function card(repo) {
    var lang = repo.language || "Otro";
    var star = repo.stargazers_count || 0;
    var featured = FEATURED.indexOf(repo.name) !== -1;
    var chips = '<span class="chips"><mark>' + escapeHTML(lang) + '</mark>';
    if (star) chips += ' <mark>⭐ ' + star + '</mark>';
    chips += '</span>';
    var updated = fmtDate(repo.pushed_at);
    var description = getRepoDescription(repo);

    return (
      '<card class="' + (featured ? "destacado" : "") + '">' +
        preview(repo) +
        '<div class="card-header">' +
          '<h3>' + escapeHTML(repo.name) + (featured ? ' <span class="badge">destacado</span>' : "") + '</h3>' +
        '</div>' +
        '<p class="card-desc">' + escapeHTML(description) + '</p>' +
        '<div class="card-meta">' +
          chips +
          (updated ? '<p class="text-sm muted">Actualizado: ' + escapeHTML(updated) + '</p>' : '') +
        '</div>' +
        '<div class="card-actions">' +
          '<a href="' + escapeHTML(repo.html_url) + '" target="_blank" rel="noopener noreferrer"><button>Ver código</button></a>' +
        '</div>' +
      '</card>'
    );
  }

  function renderFiltered() {
    var filtered = allRepos.filter(function (r) {
      var matchesSearch = true;
      if (currentSearch) {
        var query = currentSearch.toLowerCase();
        var nameMatch = (r.name || "").toLowerCase().indexOf(query) !== -1;
        var descMatch = (getRepoDescription(r) || "").toLowerCase().indexOf(query) !== -1;
        var langMatch = (r.language || "").toLowerCase().indexOf(query) !== -1;
        matchesSearch = nameMatch || descMatch || langMatch;
      }

      var matchesLang = true;
      if (currentLang !== "Todos") {
        matchesLang = (r.language || "Otro") === currentLang;
      }

      return matchesSearch && matchesLang;
    });

    if (!filtered.length) {
      GRID.innerHTML = '<p class="muted empty-msg">No se encontraron proyectos que coincidan con la búsqueda.</p>';
      return;
    }

    GRID.innerHTML = filtered.map(card).join("");
  }

  function setupFilters(repos) {
    if (!FILTER_CONTAINER) return;

    var languagesMap = {};
    repos.forEach(function (r) {
      var l = r.language || "Otro";
      languagesMap[l] = (languagesMap[l] || 0) + 1;
    });

    var languages = Object.keys(languagesMap).sort();
    var html = '<button class="filter-btn active" data-lang="Todos">Todos (' + repos.length + ')</button>';

    languages.forEach(function (lang) {
      html += '<button class="filter-btn" data-lang="' + escapeHTML(lang) + '">' +
                escapeHTML(lang) + ' (' + languagesMap[lang] + ')' +
              '</button>';
    });

    FILTER_CONTAINER.innerHTML = html;

    FILTER_CONTAINER.addEventListener("click", function (e) {
      var target = e.target;
      if (!target.classList.contains("filter-btn")) return;

      var buttons = FILTER_CONTAINER.querySelectorAll(".filter-btn");
      buttons.forEach(function (b) { b.classList.remove("active"); });

      target.classList.add("active");
      currentLang = target.getAttribute("data-lang");
      renderFiltered();
    });
  }

  function setupSearch() {
    if (!SEARCH_INPUT) return;
    SEARCH_INPUT.addEventListener("input", function (e) {
      currentSearch = e.target.value.trim();
      renderFiltered();
    });
  }

  function processRepos(repos) {
    allRepos = repos
      .filter(function (r) { return !EXCLUDED.includes(r.name) && !r.fork; })
      .sort(function (a, b) {
        var ai = FEATURED.indexOf(a.name);
        var bi = FEATURED.indexOf(b.name);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return new Date(b.pushed_at) - new Date(a.pushed_at);
      });

    if (!allRepos.length) throw new Error("sin repositorios");

    setupFilters(allRepos);
    setupSearch();
    renderFiltered();
  }

  GRID.innerHTML = '<p class="muted">Cargando proyectos...</p>';

  function load(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    });
  }

  load("https://api.github.com/users/BJZR/repos?per_page=100&type=public")
    .catch(function () { return load("repos.json"); })
    .then(processRepos)
    .catch(function (err) {
      GRID.innerHTML = '<p class="muted">No pudimos cargar los proyectos (' + escapeHTML(err.message) +
        '). Intenta recargar la página.</p>';
    });
})();
