// Shared page script for index.html (en, default) and ko.html (ko).
(function () {
  const lang = document.documentElement.lang === "ko" ? "ko" : "en";
  const L = {
    ko: { main: "주저자", papers: n => `${n}편`, jump: "연도로 이동" },
    en: { main: "First/Corr.", papers: n => `${n} paper${n === 1 ? "" : "s"}`, jump: "Jump to year" },
  }[lang];

  // Old single-page links (e.g. index.html#publications) -> the section's own page
  const MOVED = { research: "research", highlights: "research", vision: "research", pi: "pi", network: "pi",
                  publications: "publications", members: "members", join: "join", contact: "contact" };
  const h = location.hash.slice(1);
  if (MOVED[h] && document.getElementById(h) === null) {
    location.replace(MOVED[h] + (lang === "ko" ? "-ko" : "") + ".html");
    return;
  }

  // Language switch keeps the current section (#hash).
  document.querySelectorAll(".lang a").forEach(a => {
    a.addEventListener("click", e => {
      if (!location.hash) return;
      e.preventDefault();
      location.href = a.getAttribute("href") + location.hash;
    });
  });

  // Publication list (data: assets/data/cv.js, built from CV_최종/cv_data.yaml)
  const list = document.getElementById("pubList");
  if (!list || !window.CV) return;
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const boldMe = a => window.CV.citeNames.reduce((s, n) => s.split(esc(n)).join(`<b>${esc(n)}</b>`), esc(a));
  const PUBS = window.CV.pubs.map((p, i, all) => ({ ...p, no: all.length - i }));  // fixed numbers
  const years = [...new Set(PUBS.map(p => p.year))].sort((a, b) => b - a);

  document.querySelectorAll(".pub-count").forEach(el => { el.textContent = PUBS.length; });

  const tools = document.getElementById("pubTools");
  const jump = document.createElement("nav");
  jump.className = "year-jump";
  jump.setAttribute("aria-label", L.jump);
  tools.after(jump);

  function item(p) {
    const src = [p.volume, p.pages].filter(Boolean).join(", ");
    return `<li><span class="no">[${p.no}]</span><span>` +
      `<span class="t">${esc(p.title)}</span>` +
      `<span class="a">${boldMe(p.authors)}</span>` +
      `<span class="j">${esc(p.journal)}</span>${src ? `<span class="v">, ${esc(src)}</span>` : ""}` +
      (p.main ? `<span class="badge main">${L.main}</span>` : "") +
      (p.doi ? ` <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : "") +
      `</span></li>`;
  }

  function render(f) {
    const rows = PUBS.filter(p => f !== "main" || p.main);
    const html = [], links = [];
    years.forEach(y => {
      const ps = rows.filter(p => p.year === y);
      if (!ps.length) return;
      html.push(`<div class="py" id="y${y}"><div class="py-head"><span class="py-year">${y}</span>` +
                `<span class="py-n">${L.papers(ps.length)}</span></div><ol class="pubs">${ps.map(item).join("")}</ol></div>`);
      links.push(`<a href="#y${y}">${y}<span>${ps.length}</span></a>`);
    });
    list.innerHTML = html.join("");
    jump.innerHTML = links.join("");
  }

  // Count next to each filter button
  tools.querySelectorAll("button").forEach(b => {
    const n = PUBS.filter(p => b.dataset.f !== "main" || p.main).length;
    const c = document.createElement("span");
    c.className = "cnt";
    c.textContent = String(n);
    b.appendChild(c);
  });

  tools.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || !b.dataset.f) return;
    tools.querySelectorAll("button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    render(b.dataset.f);
  });
  render("all");
})();
