(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  let vw = innerWidth, vh = innerHeight;

  /* ---------- nav + menu ---------- */
  const nav = $("#nav"), burger = $("#burger"), menu = $("#menu"), bar = $(".progress");
  const setMenu = (open) => {
    burger.setAttribute("aria-expanded", open);
    menu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- split headings into masked words ---------- */
  $$("[data-split]").forEach((el) => {
    const text = el.textContent.trim().replace(/\s+/g, " ");
    el.setAttribute("aria-label", text);
    el.innerHTML = text.split(" ").map((w, i) => `<span class="m" aria-hidden="true"><i style="--i:${i}">${w}</i></span>`).join(" ");
  });
  $$("[data-fill]").forEach((el) => {
    el.setAttribute("aria-label", el.textContent.trim());
    el.innerHTML = el.textContent.trim().split(/\s+/).map((w) => `<span class="w" aria-hidden="true">${w}</span>`).join(" ");
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  const watch = (el) => (RM ? el.classList.add("in") : io.observe(el));
  $$("[data-r],[data-split]").forEach((el) => { if (!el.closest(".hero")) watch(el); });

  /* hero entrance: one orchestrated moment on load */
  const go = () => {
    root.classList.add("go");
    $$(".hero [data-split],.hero [data-r]").forEach((el) => el.classList.add("in"));
  };
  document.fonts && document.fonts.ready ? document.fonts.ready.then(() => requestAnimationFrame(go)) : go();

  /* ---------- counters ---------- */
  const co = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    co.unobserve(e.target);
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (RM) { el.textContent = end + suf; return; }
    const t0 = performance.now();
    const tick = (t) => {
      const p = clamp((t - t0) / 1600);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => co.observe(el));

  /* ---------- parallax + scroll-linked effects ---------- */
  const par = $$("[data-speed],[data-abs]").map((el) => ({ el, s: +(el.dataset.speed || 0), a: +(el.dataset.abs || 0), base: 0, h: 0 }));
  const hx = $$("[data-hx]");
  const fills = $$("[data-fill]").map((el) => ({ el, w: $$(".w", el) }));
  const expand = $$("[data-expand]");
  const show = $("[data-hscroll]");
  const measure = () => {
    vw = innerWidth; vh = innerHeight;
    par.forEach((p) => {
      const prev = p.el.style.transform; p.el.style.transform = "none";
      const r = p.el.getBoundingClientRect(); p.base = r.top + scrollY; p.h = r.height;
      p.el.style.transform = prev;
    });
    if (show) {
      const track = $(".show__track", show), stat = vw < 900 || RM;
      show.classList.toggle("is-static", stat);
      if (!stat) { show._dist = track.scrollWidth - vw; show.style.height = show._dist + vh + "px"; }
      else show.style.height = "";
    }
  };
  let ticking = false;
  const frame = () => {
    ticking = false;
    const y = scrollY, max = root.scrollHeight - vh;
    if (bar) bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    if (nav && !menu.classList.contains("is-open")) {
      nav.classList.toggle("is-hidden", y > 220 && y > frame.last + 2 ? true : y < frame.last - 2 ? false : nav.classList.contains("is-hidden"));
    }
    frame.last = y;
    if (RM) return;
    par.forEach((p) => {
      if (p.a) { if (y < vh * 1.4) p.el.style.transform = `translate3d(0,${(y * p.a).toFixed(1)}px,0)`; return; }
      const d = p.base + p.h / 2 - (y + vh / 2);
      if (Math.abs(d) < vh * 1.3) p.el.style.transform = `translate3d(0,${(d * p.s).toFixed(1)}px,0)`;
    });
    hx.forEach((row) => {
      const r = row.parentElement.getBoundingClientRect();
      const p = clamp((vh - r.top) / (vh + r.height));
      row.style.transform = `translate3d(${(-p * Math.max(0, row.scrollWidth - vw)).toFixed(1)}px,0,0)`;
    });
    fills.forEach(({ el, w }) => {
      const r = el.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (r.height + vh * 0.45));
      const n = Math.round(p * w.length);
      w.forEach((s, i) => s.classList.toggle("on", i < n));
    });
    expand.forEach((el) => {
      const p = clamp((vh - el.getBoundingClientRect().top) / (vh * 0.85));
      el.style.setProperty("--sc", (0.78 + 0.22 * p).toFixed(3));
      el.style.setProperty("--r", (32 * (1 - p)).toFixed(1) + "px");
    });
    if (show && !show.classList.contains("is-static")) {
      const r = show.getBoundingClientRect();
      const p = clamp(-r.top / (r.height - vh));
      $(".show__track", show).style.transform = `translate3d(${(-p * show._dist).toFixed(1)}px,0,0)`;
      $(".show__bar span", show).style.transform = `scaleX(${p})`;
      $$(".card__img img", show).forEach((img) => {
        const b = img.getBoundingClientRect();
        img.style.setProperty("--s", ((b.left + b.width / 2 - vw / 2) * -0.07).toFixed(1) + "px");
      });
    }
  };
  frame.last = 0;
  const req = () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } };
  addEventListener("scroll", req, { passive: true });
  const remeasure = () => { measure(); req(); };
  addEventListener("resize", remeasure);
  addEventListener("load", remeasure);
  measure(); req();

  /* ---------- portfolio: filter + lightbox ---------- */
  const grid = $("#grid");
  if (grid) {
    const tiles = $$(".tile", grid), count = $("#count"), lb = $("#lb");
    const cols = () => getComputedStyle(grid).gridTemplateColumns.split(" ").length;
    const speeds = [0.05, -0.04, 0.08, -0.06];
    const assign = () => {
      const n = cols(), vis = tiles.filter((t) => !t.hidden);
      par.length = 0;
      vis.forEach((t, i) => par.push({ el: t, s: speeds[(i % n) % 4], a: 0, base: 0, h: 0 }));
      tiles.filter((t) => t.hidden).forEach((t) => (t.style.transform = ""));
      remeasure();
    };
    par.length = 0; assign();
    $$("[data-filter]").forEach((b) => b.addEventListener("click", () => {
      $$("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      const f = b.dataset.filter; let n = 0;
      tiles.forEach((t) => {
        const on = f === "all" || t.dataset.cat === f;
        t.hidden = !on; t.classList.remove("in");
        if (on) { t.style.setProperty("--d", n++ % 8); requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add("in"))); }
      });
      count.textContent = n + (n === 1 ? " project" : " projects");
      assign();
    }));
    let cur = 0, list = [];
    const img = $("img", lb), title = $("#lb-t"), what = $("#lb-w");
    const view = (i) => {
      cur = (i + list.length) % list.length;
      const t = list[cur];
      img.src = t.dataset.thumb; img.alt = t.dataset.title + ": " + t.dataset.what;
      title.textContent = t.dataset.title; what.textContent = t.dataset.what;
      const big = new Image(); big.onload = () => { if (list[cur] === t) img.src = big.src; }; big.src = t.dataset.full;
    };
    tiles.forEach((t) => t.addEventListener("click", () => { list = tiles.filter((x) => !x.hidden); view(list.indexOf(t)); lb.showModal(); }));
    $("#lb-x").addEventListener("click", () => lb.close());
    $("#lb-p").addEventListener("click", () => view(cur - 1));
    $("#lb-n").addEventListener("click", () => view(cur + 1));
    lb.addEventListener("click", (e) => e.target === lb && lb.close());
    lb.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") view(cur - 1); if (e.key === "ArrowRight") view(cur + 1); });
  }

  /* ---------- forms ---------- */
  $$("form[data-endpoint]").forEach((form) => form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("button[type=submit]", form), out = $(".msg", form), label = btn.textContent;
    const show = (ok, text) => { out.hidden = false; out.className = "msg " + (ok ? "ok" : "err"); out.textContent = text; };
    btn.disabled = true; btn.textContent = "Sending…"; out.hidden = true;
    try {
      const res = await fetch(form.dataset.endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) { show(true, data.message || "Sent."); form.reset(); }
      else show(false, data.message || "Something went wrong. Please try again.");
    } catch { show(false, "Could not reach the server. Check your connection and try again."); }
    btn.disabled = false; btn.textContent = label;
  }));
})();
