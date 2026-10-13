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
    "B_lang": "Lenguaje de programación compilable (beta) a ensamblador x86_64 para Linux.",
    "Taller-Elvis": "Landing page para taller mecánico con servicios de reparación y mantenimiento.",
    "ryf": "Shell minimalista en Go.",
    "parrot.vscode": "Extensión de VS Code para el lenguaje Parrot.",
    "appimg": "Gestor de paquetes y herramientas AppImage.",
    "parrot.nvim": "Resaltador de sintaxis del lenguaje Parrot para Neovim.",
    "Compuesto-X": "Juego interactivo sobre química.",
    "MinDE": "Entorno gráfico de escritorio minimalista.",
    "Programacion_orientada_a_objetos": "Ejercicios y prácticas de programación orientada a objetos en Java.",
    "publicidad_gamer": "Página web de publicidad orientada a videojuegos.",
    "Biblioteca": "Sistema de gestión de biblioteca en Java.",
    "scripts-linux": "Colección de scripts útiles para Linux.",
    "idw": "Herramienta de diseño web interactivo.",
    "dwv": "Herramienta visual de diseño web.",
    "MLang": "Compilador minimalista para Linux x86_64.",
    "docs": "Generador de documentación desde comentarios en código.",
    "pack": "Compresor de archivos especializado en código fuente .c y .h.",
    "watch": "Utilidad CLI de monitoreo continuo.",
    "snap": "Git minimalista local para rapidez y sencillez.",
    "blaze": "Make minimalista para proyectos pequeños.",
    "void.nvim": "Tema para Neovim basado en los colores de Void Linux.",
    "imagen_ascii": "Convertidor de imágenes a arte ASCII en HTML.",
    "ToolsWebX": "Colección de herramientas web.",
    "void-bspwm": "Script de instalación y configuración de bspwm para Void Linux.",
    "pyorganizador": "Script en Python para organizar archivos automáticamente.",
    "cc-modificado": "Modificación del compilador C original de lolzdev.",
    "MD": "Editor simple de Markdown en HTML.",
    "transpilador-c": "Transpilador escrito en C que convierte sintaxis personalizada a C estándar.",
    "treegen": "Generador de estructuras de carpetas a partir de esquemas de texto.",
    "Config_bspwm": "Configuración de bspwm con lemonbar, rofi, dunst y picom.",
    "superc": "Librería en C para facilitar la sintaxis del lenguaje.",
    "carroselwm": "Gestor de ventanas minimalista con navegación tipo carrusel.",
    "pwa-c": "CLI para crear y administrar aplicaciones web progresivas.",
    "wmp": "Gestor de ventanas ligero basado en dwm y bspwm."
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
    return "Proyecto alojado en GitHub.";
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
          '<a href="' + escapeHTML(repo.html_url) + '" target="_blank" rel="noopener noreferrer"><button>código</button></a>' +
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
      GRID.innerHTML = '<p class="muted empty-msg">No se encontraron proyectos.</p>';
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
