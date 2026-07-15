/* ================================================================
   ドラサポ  共通UIロジック（シェル描画・ヘルパー・トースト・モーダル）
================================================================ */
(function () {
  const NAV = [
    { section: "採用管理" },
    { key: "dashboard",   href: "index.html",        icon: "🏠", label: "ダッシュボード" },
    { key: "candidates",  href: "candidates.html",   icon: "🧑‍💼", label: "候補者", badge: "16" },
    { key: "import",      href: "import.html",       icon: "📥", label: "CSVインポート" },
    { key: "calls",       href: "calls.html",        icon: "📞", label: "架電管理" },
    { key: "interviews",  href: "interviews.html",   icon: "🤝", label: "面接管理" },
    { section: "稼働・車両" },
    { key: "drivers",     href: "drivers.html",      icon: "🚚", label: "ドライバー" },
    { key: "vehicles",    href: "vehicles.html",     icon: "🚐", label: "車両管理" },
    { section: "取引先" },
    { key: "negotiations",href: "negotiations.html", icon: "💬", label: "商談ログ" },
    { key: "companies",   href: "companies.html",    icon: "🏢", label: "荷主・会社" },
    { key: "schedule",    href: "schedule.html",     icon: "📅", label: "スケジュール" },
  ];

  const Shell = {
    init(activeKey, opts = {}) {
      const db = DB.get();
      const openCount = (db.candidates || []).filter(c => c.status === "new").length;

      // Sidebar
      const nav = NAV.map(n => {
        if (n.section) return `<div class="nav__section">${n.section}</div>`;
        const active = n.key === activeKey ? " is-active" : "";
        let badge = "";
        if (n.key === "candidates") badge = `<span class="nav__badge">${(db.candidates||[]).length}</span>`;
        return `<a class="nav__item${active}" href="${n.href}">
                  <span class="ico">${n.iconTxt || n.icon}</span><span>${n.label}</span>${badge}
                </a>`;
      }).join("");

      const sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.className = "sidebar";
        sidebar.innerHTML = `
          <div class="sidebar__brand">
            <div class="sidebar__logo">ド</div>
            <div class="sidebar__title">ドラサポ<small>DRIVER SUPPORT</small></div>
          </div>
          <nav class="nav">${nav}</nav>
          <div class="sidebar__user">
            <div class="avatar">佐</div>
            <div class="meta"><b>佐々木 拓也</b><span>営業 / 採用担当</span></div>
          </div>`;
      }

      // Topbar
      const topbar = document.getElementById("topbar");
      if (topbar) {
        topbar.className = "topbar";
        topbar.innerHTML = `
          <div class="hamburger topbar__icon" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</div>
          <div class="topbar__title">${opts.title || ""}${opts.sub ? `<small>${opts.sub}</small>` : ""}</div>
          <div class="topbar__spacer"></div>
          <div class="topbar__search"><span>🔎</span><input placeholder="候補者・ドライバーを検索"></div>
          <a class="topbar__icon" href="import.html" title="CSVインポート">📥</a>
          <div class="topbar__icon" title="通知" onclick="Toast.show('新着の応募が3件あります')">🔔<span class="dot"></span></div>
          <div class="topbar__icon" title="設定">⚙️</div>`;
      }
    }
  };

  // ---------- helpers ----------
  const initials = (name) => (name || "?").trim().charAt(0);
  const palette = ["#1f6feb","#17915c","#c47f04","#7b52d6","#d1443b","#0f9b9b","#e0692b"];
  function colorFor(str) {
    let h = 0; for (let i = 0; i < (str||"").length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
    return palette[Math.abs(h) % palette.length];
  }
  function avatar(name, color) {
    return `<span class="uavatar" style="background:${color || colorFor(name)}">${initials(name)}</span>`;
  }
  function badge(cls, label) { return `<span class="badge badge--${cls}"><span class="dot"></span>${label}</span>`; }
  function statusBadge(key) { const s = DB.statusMap[key] || {label:key, cls:"gray"}; return badge(s.cls, s.label); }
  function driverBadge(key) { const s = DB.driverStatus[key] || {label:key, cls:"gray"}; return badge(s.cls, s.label); }
  function vehicleBadge(key) { const s = DB.vehicleStatus[key] || {label:key, cls:"gray"}; return badge(s.cls, s.label); }

  function companyTag(db, id) {
    const co = DB.company(db, id);
    return `<span class="ctag"><span class="swatch" style="background:${co.color}"></span>${co.name}</span>`;
  }

  function callStages(calls) {
    const map = {}; (calls || []).forEach(c => map[c.n] = c.r);
    let html = '<span class="callstages">';
    for (let n = 1; n <= 3; n++) {
      const r = map[n];
      let cls = "";
      if (r === "ok") cls = "done-ok";
      else if (r === "none") cls = "done-none";
      else if (r === "ng") cls = "done-ng";
      html += `<span class="callpill ${cls}" title="${n}回目">${n}</span>`;
    }
    return html + "</span>";
  }

  function money(n) { return n == null ? "—" : "¥" + Number(n).toLocaleString("ja-JP"); }
  function qs(sel, root=document) { return root.querySelector(sel); }
  function qp(name) { return new URLSearchParams(location.search).get(name); }

  // ---------- toast ----------
  const Toast = {
    show(msg, type = "ok") {
      let wrap = document.querySelector(".toast-wrap");
      if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
      const t = document.createElement("div");
      t.className = "toast " + type;
      t.innerHTML = `<span>✓</span> ${msg}`;
      wrap.appendChild(t);
      setTimeout(() => { t.style.opacity = "0"; t.style.transition = ".3s"; setTimeout(() => t.remove(), 300); }, 2600);
    }
  };

  // ---------- modal ----------
  const Modal = {
    open(html, opts = {}) {
      let bd = document.querySelector(".modal-backdrop");
      if (!bd) { bd = document.createElement("div"); bd.className = "modal-backdrop"; document.body.appendChild(bd); }
      bd.innerHTML = `<div class="modal ${opts.wide ? "modal--wide" : ""}">${html}</div>`;
      bd.classList.add("open");
      bd.onclick = (e) => { if (e.target === bd) Modal.close(); };
      bd.querySelectorAll("[data-close]").forEach(el => el.onclick = () => Modal.close());
    },
    close() { const bd = document.querySelector(".modal-backdrop"); if (bd) bd.classList.remove("open"); }
  };

  window.Shell = Shell;
  window.UI = { avatar, badge, statusBadge, driverBadge, vehicleBadge, companyTag, callStages, colorFor, money, qs, qp, initials };
  window.Toast = Toast;
  window.Modal = Modal;
})();
