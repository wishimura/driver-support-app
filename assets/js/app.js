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
    { key: "fleet",       href: "vehicles.html",     icon: "🚚", label: "車両・ドライバー" },
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
                  <span class="ico">${icon(NAV_ICON[n.key] || "circle", 19)}</span><span>${n.label}</span>${badge}
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
          <div class="hamburger topbar__icon" onclick="document.getElementById('sidebar').classList.toggle('open')">${icon("menu",20)}</div>
          <div class="topbar__title">${opts.title || ""}${opts.sub ? `<small>${opts.sub}</small>` : ""}</div>
          <div class="topbar__spacer"></div>
          <div class="topbar__search">${icon("search",16)}<input placeholder="候補者・ドライバーを検索"></div>
          <button class="btn btn--sm" onclick="App.reset()" title="サンプルデータを初期状態に戻します">${icon("refresh",15)} データ初期化</button>
          <a class="topbar__icon" href="import.html" title="CSVインポート">${icon("download",19)}</a>
          <div class="topbar__icon" title="通知" onclick="Toast.show('新着の応募が3件あります')">${icon("bell",19)}<span class="dot"></span></div>
          <div class="topbar__icon" title="設定">${icon("settings",19)}</div>`;
      }
    }
  };

  // ---------- icons (simple line style) ----------
  const ICONS = {
    dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    userplus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.1 9.9a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    handshake: '<path d="M11 17l2 2a1 1 0 0 0 3-3"/><path d="M14 14l2.5 2.5a1 1 0 0 0 3-3l-3.9-3.9a2 2 0 0 1 0-2.8l.6-.6"/><path d="M7 8l-3 3a1 1 0 0 0 0 3 1 1 0 0 0 3 0"/><path d="M4 11l4.5-4.5a2 2 0 0 1 2.8 0L13 8"/>',
    truck: '<rect x="1" y="4" width="14" height="12" rx="1.5"/><path d="M15 8h4l3 3v5h-7"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="18.5" r="2"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    building: '<path d="M3 21h18"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    calcheck: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M9 16l2 2 4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18v3h3l6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.7-2.7 2.3-2.9z"/>',
    check: '<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4L12 14l-3-3"/>',
    parking: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
    star: '<path d="M12 3l2.5 6.3L21 10l-5 4 1.6 6.4L12 17l-5.6 3.4L8 14l-5-4 6.5-.7z"/>',
    alert: '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
    menu: '<path d="M3 12h18M3 6h18M3 18h18"/>',
    refresh: '<path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10M1 14l4.6 4.4A9 9 0 0 0 20.5 15"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    money: '<rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/>',
  };
  function icon(name, size = 18) {
    const inner = ICONS[name] || ICONS.circle;
    return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block">${inner}</svg>`;
  }
  const NAV_ICON = { dashboard:"dashboard", candidates:"users", import:"download", calls:"phone", interviews:"handshake", fleet:"truck", negotiations:"message", companies:"building", schedule:"calendar" };

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

  // 求人アカウント（＝媒体）のタグ
  function accountTag(name) {
    const color = (DB.accountColor && DB.accountColor[name]) || colorFor(name || "");
    return `<span class="ctag"><span class="swatch" style="background:${color}"></span>${name || "—"}</span>`;
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

  const App = {
    reset() {
      Modal.open(`
        <div class="modal__head"><h3>データを初期化しますか？</h3><span class="close" data-close>×</span></div>
        <div class="modal__body"><p class="muted" style="margin:0">追加・編集したサンプルデータをすべて破棄し、初期状態に戻します。この操作は取り消せません。</p></div>
        <div class="modal__foot"><button class="btn" data-close>キャンセル</button><button class="btn btn--danger" id="doReset">初期化する</button></div>`);
      document.getElementById("doReset").onclick = () => { DB.reset(); location.reload(); };
    }
  };

  // ---------- searchable combobox ----------
  // Combo.create(mountEl, { items:[{value,label,swatch?}], value, placeholder, onChange, addLabel?, onAdd? })
  let comboSeq = 0;
  const Combo = {
    create(mount, opts) {
      const id = "combo" + (++comboSeq);
      const state = { open:false, value: opts.value ?? "", items: opts.items || [], q:"" };
      mount.classList.add("combo");
      mount.innerHTML = `
        <button type="button" class="combo__field" id="${id}_f">
          <span class="combo__val" id="${id}_v"></span><span class="combo__caret">▾</span>
        </button>
        <div class="combo__pop" id="${id}_p" hidden>
          <div class="combo__search"><span>🔎</span><input id="${id}_q" placeholder="検索..." autocomplete="off"></div>
          <div class="combo__list" id="${id}_l"></div>
          ${opts.onAdd ? `<button type="button" class="combo__add" id="${id}_a">＋ ${opts.addLabel || "新規登録"}</button>` : ``}
        </div>`;
      const field = mount.querySelector(`#${id}_f`), pop = mount.querySelector(`#${id}_p`);
      const valEl = mount.querySelector(`#${id}_v`), qEl = mount.querySelector(`#${id}_q`), listEl = mount.querySelector(`#${id}_l`);

      function labelFor(val){ const it = state.items.find(x=>x.value===val); return it ? it : { label: opts.placeholder || "選択", swatch:null }; }
      function paintVal(){ const it = labelFor(state.value); valEl.innerHTML = (it.swatch?`<span class="swatch" style="background:${it.swatch}"></span>`:"") + (it.label || opts.placeholder || "選択"); }
      function renderList(){
        const q = state.q.trim();
        const rows = state.items.filter(x => !q || (x.label||"").toLowerCase().includes(q.toLowerCase()));
        listEl.innerHTML = rows.length ? rows.map(x =>
          `<div class="combo__opt ${x.value===state.value?'is-sel':''}" data-v="${x.value}">
             ${x.swatch?`<span class="swatch" style="background:${x.swatch}"></span>`:""}<span>${x.label}</span>
             ${x.value===state.value?'<span class="combo__chk">✓</span>':''}</div>`).join("")
          : `<div class="combo__empty">該当なし</div>`;
        listEl.querySelectorAll(".combo__opt").forEach(el => el.onclick = () => { select(el.dataset.v); });
      }
      function open(){ state.open=true; pop.hidden=false; state.q=""; qEl.value=""; renderList(); setTimeout(()=>qEl.focus(),0); }
      function close(){ state.open=false; pop.hidden=true; }
      function select(v){ state.value=v; paintVal(); close(); opts.onChange && opts.onChange(v); }

      field.onclick = () => state.open ? close() : open();
      qEl.oninput = () => { state.q = qEl.value; renderList(); };
      if (opts.onAdd) mount.querySelector(`#${id}_a`).onclick = () => { close(); opts.onAdd(); };
      document.addEventListener("click", (e) => { if (!mount.contains(e.target)) close(); });

      paintVal(); renderList();
      return {
        setItems(items){ state.items = items; renderList(); paintVal(); },
        setValue(v){ select(v); },
        getValue(){ return state.value; },
      };
    }
  };

  window.Shell = Shell;
  window.App = App;
  window.Combo = Combo;
  window.UI = { avatar, badge, statusBadge, driverBadge, vehicleBadge, companyTag, accountTag, callStages, colorFor, money, qs, qp, initials, icon };
  window.Toast = Toast;
  window.Modal = Modal;
})();
