(function () {
  var GRID = document.getElementById("proyectos");
  if (!GRID) return;

  var EXCLUDED = ["BJZR", "sst", "latrode", "opencode"];

  var LANG_COLORS = {
    "HTML": "#e34c26", "CSS": "#563d7c", "JavaScript": "#f1e05a",
    "Python": "#3572A5", "Go": "#00ADD8", "Java": "#b07219", "C": "#555555"
  };

  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleDateString("es-CO", { year: "numeric", month: "short" });
    } catch (e) {
      return "";
    }
  }

  function preview(repo) {
    if (repo.social_preview_image_url) {
      return '<img src="' + escapeHTML(repo.social_preview_image_url) + '" alt="' + escapeHTML(repo.name) + '" />';
    }
    return '<div class="preview" aria-hidden="true">' + escapeHTML((repo.name || "?").charAt(0).toUpperCase()) + "</div>";
  }

  function card(repo) {
    var lang = repo.language || "Otro";
    var star = repo.stargazers_count || 0;
    var chips = '<span class="chips"><mark>' + escapeHTML(lang) + "</mark>";
    if (star) chips += "<mark>⭐ " + star + "</mark>";
    chips += "</span>";
    var updated = fmtDate(repo.pushed_at);
    return (
      '<card>' + preview(repo) +
      '<h3>' + escapeHTML(repo.name) + "</h3>" +
      "<p>" + (repo.description ? escapeHTML(repo.description) : "Sin descripción") + "</p>" +
      "<p>" + chips + "</p>" +
      '<p class="text-sm muted" data-updated>' + (updated ? "actualizado: " + updated : "") + "</p>" +
      '<a href="' + escapeHTML(repo.html_url) + '" target="_blank" rel="noopener"><button>código</button></a>' +
      "</card>"
    );
  }

  GRID.innerHTML = '<p class="muted">Cargando proyectos...</p>';

  fetch("https://api.github.com/users/BJZR/repos?per_page=100&type=public")
    .then(function (res) {
      if (!res.ok) throw new Error("GitHub API " + res.status);
      return res.json();
    })
    .then(function (repos) {
      var list = repos
        .filter(function (r) { return !EXCLUDED.includes(r.name) && !r.fork; })
        .sort(function (a, b) { return new Date(b.pushed_at) - new Date(a.pushed_at); });
      if (!list.length) throw new Error("sin repositorios");
      GRID.innerHTML = list.map(card).join("");
    })
    .catch(function (err) {
      GRID.innerHTML = '<p class="muted">No pudimos cargar los proyectos (' + err.message +
        "). Intenta recargar la página.</p>";
    });
})();