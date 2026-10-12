// Shared page script for index.html (ko) and en.html (en).
(function () {
  const lang = document.documentElement.lang === "en" ? "en" : "ko";
  const L = {
    ko: { main: "주저자", dom: "국내" },
    en: { main: "First/Corr.", dom: "Domestic" },
  }[lang];

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
  const PUBS = window.CV.pubs;

  function render(f) {
    list.innerHTML = "";
    const rows = PUBS.filter(p => match(p, f));
    rows.forEach((p, i) => {
      const src = [p.volume, p.pages].filter(Boolean).join(", ");
      const li = document.createElement("li");
      li.innerHTML =
        `<span class="no">[${rows.length - i}]</span>` +
        `<span><span class="t">${esc(p.title)}</span>` +
        `<span class="a">${boldMe(p.authors)}</span>` +
        `<span class="j">${esc(p.journal)}</span>${src ? `<span class="v">, ${esc(src)}</span>` : ""}` +
        (p.main ? `<span class="badge main">${L.main}</span>` : "") +
        (p.kind === "dom" ? `<span class="badge rev">${L.dom}</span>` : "") +
        (p.doi ? ` <a href="https://doi.org/${esc(p.doi)}" target="_blank" rel="noopener">DOI</a>` : "") +
        `</span><span class="yr">${p.year}</span>`;
      list.appendChild(li);
    });
  }

  // Count next to each filter button (main also shows the international/domestic split)
  const match = (p, f) => f === "all" || (f === "main" && p.main) || f === p.kind ||
                          (f === "old" && p.year <= 2022) || String(p.year) === f;
  const split = lang === "en" ? ["Intl", "Dom"] : ["국제", "국내"];
  document.querySelectorAll("#pubTools button").forEach(b => {
    const f = b.dataset.f;
    const rows = PUBS.filter(p => match(p, f));
    let txt = String(rows.length);
    if (f === "main") {
      const intl = rows.filter(p => p.kind === "intl").length;
      txt += ` (${split[0]} ${intl}, ${split[1]} ${rows.length - intl})`;
    }
    const c = document.createElement("span");
    c.className = "cnt";
    c.textContent = txt;
    b.appendChild(c);
  });

  document.getElementById("pubTools").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b || !b.dataset.f) return;
    document.querySelectorAll("#pubTools button").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    render(b.dataset.f);
  });
  render("all");
})();
