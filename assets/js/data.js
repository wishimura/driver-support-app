/* ================================================================
   ドラサポ  モックデータ層
   localStorage を使い、画面をまたいでデータが保持されます。
   DB接続は不要。初回ロード時にシードデータを投入します。
================================================================ */
(function () {
  const KEY = "dorasapo_mock_v1";

  // ---- 荷主（Sagawa / Yamato など） ----
  const shippers = [
    { id: "sh1", name: "佐川急便", color: "#1f6feb" },
    { id: "sh2", name: "ヤマト運輸", color: "#17915c" },
    { id: "sh3", name: "Amazon",   color: "#c47f04" },
  ];

  // ---- 会社（荷主の下請け＝自社が仕事をもらう会社／求人アカウント別） ----
  const companies = [
    { id: "co1", name: "関東ロジ第一営業所", shipper: "sh1", color: "#1f6feb", account: "Indeed / エアワーク", drivers: 42, open: 8 },
    { id: "co2", name: "城南デリバリー",     shipper: "sh1", color: "#7b52d6", account: "Indeed",           drivers: 28, open: 5 },
    { id: "co3", name: "湾岸トランスポート", shipper: "sh2", color: "#17915c", account: "エアワーク",       drivers: 33, open: 6 },
    { id: "co4", name: "北関東配送センター", shipper: "sh2", color: "#c47f04", account: "Indeed / SNS",      drivers: 19, open: 3 },
    { id: "co5", name: "TOKYOラストワンマイル", shipper: "sh3", color: "#d1443b", account: "Indeed",        drivers: 24, open: 7 },
    { id: "co6", name: "多摩エリア運送",     shipper: "sh1", color: "#0f9b9b", account: "エアワーク / SNS",  drivers: 15, open: 2 },
    { id: "co7", name: "埼玉第二センター",   shipper: "sh2", color: "#e0692b", account: "Indeed",           drivers: 11, open: 4 },
  ];

  // ---- 採用ステータス ----
  // new(未対応) / calling(架電中) / interview(面接調整) / interviewed(面接済) / contract(契約) / ng(見送り)
  const statusMap = {
    new:         { label: "未対応",   cls: "gray"   },
    calling:     { label: "架電中",   cls: "info"   },
    interview:   { label: "面接調整", cls: "purple" },
    interviewed: { label: "面接済",   cls: "warn"   },
    contract:    { label: "契約",     cls: "ok"     },
    ng:          { label: "見送り",   cls: "danger" },
  };

  // call result: ok(応答あり) / none(応答なし) / ng(見送り) / null(未架電)
  const c = (name, kana, age, area, exp, company, status, calls, source) => ({
    id: "cand_" + Math.random().toString(36).slice(2, 8),
    name, kana, age, area, exp, company, status, calls, source,
    tel: "090-" + (1000 + Math.floor(Math.random() * 8999)) + "-" + (1000 + Math.floor(Math.random() * 8999)),
    appliedAt: "2026-07-" + String(2 + Math.floor(Math.random() * 12)).padStart(2, "0"),
    note: "",
    interview: null,
  });

  const candidates = [
    c("田中 健一", "タナカ ケンイチ", 34, "東京都足立区", true,  "co1", "interview",   [{n:1,r:"ok"},{n:2,r:"ok"}], "Indeed"),
    c("佐藤 大輔", "サトウ ダイスケ", 41, "埼玉県川口市", false, "co1", "calling",     [{n:1,r:"none"}], "Indeed"),
    c("鈴木 翔",   "スズキ ショウ",   28, "東京都江戸川区", true,"co2", "interviewed", [{n:1,r:"ok"}], "Indeed"),
    c("高橋 誠",   "タカハシ マコト", 37, "神奈川県横浜市", true,"co3", "contract",    [{n:1,r:"ok"}], "エアワーク"),
    c("伊藤 慎二", "イトウ シンジ",   45, "千葉県松戸市", false, "co1", "new",         [], "Indeed"),
    c("渡辺 亮",   "ワタナベ リョウ", 31, "東京都葛飾区", true,  "co5", "calling",     [{n:1,r:"none"},{n:2,r:"none"}], "Indeed"),
    c("山本 隆",   "ヤマモト タカシ", 39, "埼玉県越谷市", true,  "co4", "interview",   [{n:1,r:"ok"}], "SNS"),
    c("中村 修",   "ナカムラ オサム", 52, "東京都板橋区", false, "co2", "ng",          [{n:1,r:"ok"},{n:2,r:"ng"}], "Indeed"),
    c("小林 大和", "コバヤシ ヤマト", 26, "東京都北区",   false, "co6", "new",         [], "エアワーク"),
    c("加藤 竜也", "カトウ タツヤ",   33, "神奈川県川崎市", true,"co3", "interviewed", [{n:1,r:"ok"}], "エアワーク"),
    c("吉田 直樹", "ヨシダ ナオキ",   48, "埼玉県さいたま市", true,"co7", "calling",   [{n:1,r:"none"}], "Indeed"),
    c("山田 浩二", "ヤマダ コウジ",   35, "東京都練馬区", false, "co1", "new",         [], "Indeed"),
    c("松本 悠",   "マツモト ユウ",   29, "千葉県船橋市", true,  "co5", "interview",   [{n:1,r:"ok"},{n:2,r:"ok"}], "SNS"),
    c("井上 和也", "イノウエ カズヤ", 44, "東京都大田区", true,  "co2", "contract",    [{n:1,r:"ok"}], "Indeed"),
    c("木村 太一", "キムラ タイチ",   38, "神奈川県相模原市", false,"co3","new",       [], "エアワーク"),
    c("林 拓海",   "ハヤシ タクミ",   27, "東京都杉並区", false, "co6", "calling",     [{n:1,r:"none"}], "SNS"),
  ];

  // ---- ドライバー（契約済 → 納車 → 研修 → 稼働） ----
  // 納車ステータス: waiting(納車待ち) / delivered(納車済) / training(研修中) / active(稼働中) / paused(解除申請) / left(解約済)
  const drivers = [
    { id:"drv1", name:"高橋 誠", kana:"タカハシ マコト", age:37, company:"co3", exp:true,  status:"active",
      contractedAt:"2026-03-10", deliveryDate:"2026-03-20", delivered:true, trainingDate:"2026-03-22", trainingDone:true, startDate:"2026-03-25",
      vehicle:"veh3", tel:"090-2233-1100", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv2", name:"井上 和也", kana:"イノウエ カズヤ", age:44, company:"co2", exp:true, status:"delivered",
      contractedAt:"2026-07-05", deliveryDate:"2026-07-18", delivered:true, trainingDate:"2026-07-20", trainingDone:false, startDate:"2026-07-24",
      vehicle:"veh7", tel:"090-5544-2211", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv3", name:"清水 一郎", kana:"シミズ イチロウ", age:50, company:"co1", exp:true, status:"active",
      contractedAt:"2025-11-01", deliveryDate:"2025-11-12", delivered:true, trainingDate:null, trainingDone:true, startDate:"2025-11-13",
      vehicle:"veh1", tel:"090-1122-3344", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv4", name:"森田 拓也", kana:"モリタ タクヤ", age:32, company:"co5", exp:false, status:"training",
      contractedAt:"2026-06-28", deliveryDate:"2026-07-08", delivered:true, trainingDate:"2026-07-14", trainingDone:false, startDate:"2026-07-22",
      vehicle:"veh5", tel:"090-6677-8899", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv5", name:"岡田 秀樹", kana:"オカダ ヒデキ", age:46, company:"co1", exp:true, status:"waiting",
      contractedAt:"2026-07-12", deliveryDate:"2026-07-25", delivered:false, trainingDate:null, trainingDone:false, startDate:null,
      vehicle:null, tel:"090-9988-7766", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv6", name:"藤井 悠斗", kana:"フジイ ユウト", age:29, company:"co4", exp:false, status:"active",
      contractedAt:"2026-01-15", deliveryDate:"2026-01-28", delivered:true, trainingDate:"2026-02-01", trainingDone:true, startDate:"2026-02-05",
      vehicle:"veh4", tel:"090-3344-5566", cancelAt:null, cancelEffectiveAt:null },
    { id:"drv7", name:"石川 竜", kana:"イシカワ リュウ", age:41, company:"co2", exp:true, status:"paused",
      contractedAt:"2024-09-01", deliveryDate:"2024-09-14", delivered:true, trainingDate:null, trainingDone:true, startDate:"2024-09-15",
      vehicle:"veh2", tel:"090-4455-6677", cancelAt:"2026-07-10", cancelEffectiveAt:"2026-09-10" },
    { id:"drv8", name:"前田 亮太", kana:"マエダ リョウタ", age:36, company:"co3", exp:true, status:"active",
      contractedAt:"2025-06-20", deliveryDate:"2025-07-02", delivered:true, trainingDate:null, trainingDone:true, startDate:"2025-07-03",
      vehicle:"veh6", tel:"090-7788-9900", cancelAt:null, cancelEffectiveAt:null },
  ];

  // ---- 車両（リース → 稼働 → 返却 → 修理） ----
  // status: active(稼働中) / idle(空き) / returned(返却済) / repair(修理中)
  const vehicles = [
    { id:"veh1", plate:"品川 800 あ 12-34", model:"日野 デュトロ", lessor:"オリックス自動車", leaseStart:"2025-10-01", leaseEnd:"2028-09-30",
      status:"active", driver:"drv3", monthly:68000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh2", plate:"足立 800 か 56-78", model:"いすゞ エルフ", lessor:"三井住友トラスト", leaseStart:"2024-08-15", leaseEnd:"2027-08-14",
      status:"active", driver:"drv7", monthly:72000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh3", plate:"横浜 800 さ 90-12", model:"トヨタ ハイエース", lessor:"住友三井オートサービス", leaseStart:"2026-03-01", leaseEnd:"2029-02-28",
      status:"active", driver:"drv1", monthly:58000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh4", plate:"大宮 800 た 34-56", model:"日産 NV350", lessor:"オリックス自動車", leaseStart:"2026-01-10", leaseEnd:"2029-01-09",
      status:"active", driver:"drv6", monthly:55000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh5", plate:"江戸川 800 な 78-90", model:"トヨタ ハイエース", lessor:"住友三井オートサービス", leaseStart:"2026-06-20", leaseEnd:"2029-06-19",
      status:"active", driver:"drv4", monthly:58000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh6", plate:"横浜 800 は 11-22", model:"いすゞ エルフ", lessor:"三井住友トラスト", leaseStart:"2025-06-01", leaseEnd:"2028-05-31",
      status:"active", driver:"drv8", monthly:72000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh7", plate:"練馬 800 ま 33-44", model:"日産 NV350", lessor:"オリックス自動車", leaseStart:"2026-07-01", leaseEnd:"2029-06-30",
      status:"idle", driver:null, monthly:55000, repairFrom:null, repairTo:null, repairCost:null },
    { id:"veh8", plate:"足立 800 や 55-66", model:"日野 デュトロ", lessor:"三井住友トラスト", leaseStart:"2023-12-01", leaseEnd:"2026-11-30",
      status:"repair", driver:null, monthly:68000, repairFrom:"2026-07-08", repairTo:"2026-07-18", repairCost:82000 },
    { id:"veh9", plate:"川口 800 ゆ 77-88", model:"トヨタ ハイエース", lessor:"オリックス自動車", leaseStart:"2024-05-01", leaseEnd:"2026-07-31",
      status:"returned", driver:null, monthly:58000, repairFrom:"2026-07-01", repairTo:"2026-07-06", repairCost:34000 },
  ];

  // ---- 商談ログ（会社ごと） ----
  const negotiations = [
    { id:"neg1", company:"co5", shipper:"sh3", date:"2026-07-11", who:"Amazon DSP 統括 / 山口様", topic:"8月からの増車20台の稼働可否について協議。ドライバー確保状況を報告。", next:"2026-07-25", owner:"営業 佐々木" },
    { id:"neg2", company:"co1", shipper:"sh1", date:"2026-07-09", who:"佐川急便 関東支店 / 井上様", topic:"繁忙期（お中元）の追加人員10名の要請。単価改定の相談あり。", next:"2026-07-16", owner:"営業 田村" },
    { id:"neg3", company:"co3", shipper:"sh2", date:"2026-07-04", who:"ヤマト運輸 湾岸ベース / 加藤様", topic:"夜間便の新規委託について打診。車両手配のリードタイムを確認。", next:null, owner:"営業 佐々木" },
    { id:"neg4", company:"co5", shipper:"sh3", date:"2026-06-20", who:"Amazon DSP 統括 / 山口様", topic:"6月の稼働実績レビュー。KPI達成、遅延率改善を評価いただく。", next:null, owner:"営業 佐々木" },
    { id:"neg5", company:"co2", shipper:"sh1", date:"2026-06-15", who:"佐川急便 城南支店 / 松田様", topic:"エリア拡大に伴う委託範囲の見直し。来月から2ルート追加で合意。", next:"2026-07-15", owner:"営業 田村" },
  ];

  // ---- スケジュール（Googleカレンダー連携イメージ） ----
  const schedule = [
    { id:"ev1", date:"2026-07-15", time:"10:00", type:"interview", title:"面接：田中 健一", who:"関東ロジ第一営業所", mode:"来社" },
    { id:"ev2", date:"2026-07-15", time:"14:00", type:"call",      title:"架電：吉田 直樹（2回目）", who:"埼玉第二センター", mode:"" },
    { id:"ev3", date:"2026-07-16", time:"11:00", type:"interview", title:"面接：山本 隆", who:"北関東配送センター", mode:"リモート" },
    { id:"ev4", date:"2026-07-16", time:"16:00", type:"negotiation",title:"商談：佐川急便 井上様", who:"関東ロジ第一営業所", mode:"来社" },
    { id:"ev5", date:"2026-07-18", time:"09:30", type:"delivery",  title:"納車：井上 和也", who:"城南デリバリー", mode:"" },
    { id:"ev6", date:"2026-07-20", time:"13:00", type:"training",  title:"研修：井上 和也", who:"城南デリバリー", mode:"" },
    { id:"ev7", date:"2026-07-22", time:"09:00", type:"training",  title:"研修：森田 拓也", who:"TOKYOラストワンマイル", mode:"" },
    { id:"ev8", date:"2026-07-15", time:"17:30", type:"interview", title:"面接：松本 悠", who:"TOKYOラストワンマイル", mode:"リモート" },
  ];

  const seed = { shippers, companies, statusMap, candidates, drivers, vehicles, negotiations, schedule };

  // ---------- store ----------
  function load() {
    let raw = localStorage.getItem(KEY);
    if (!raw) { localStorage.setItem(KEY, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); }
    try { return JSON.parse(raw); } catch (e) { localStorage.setItem(KEY, JSON.stringify(seed)); return JSON.parse(JSON.stringify(seed)); }
  }
  function save(db) { localStorage.setItem(KEY, JSON.stringify(db)); }

  window.DB = {
    KEY,
    get: load,
    save,
    reset() { localStorage.removeItem(KEY); },
    // static maps that don't change
    statusMap,
    driverStatus: {
      waiting:  { label:"納車待ち", cls:"warn"   },
      delivered:{ label:"納車済",   cls:"info"   },
      training: { label:"研修中",   cls:"purple" },
      active:   { label:"稼働中",   cls:"ok"     },
      paused:   { label:"解除申請中",cls:"danger" },
      left:     { label:"解約済",   cls:"gray"   },
    },
    vehicleStatus: {
      active:   { label:"稼働中", cls:"ok"     },
      idle:     { label:"空き",   cls:"info"   },
      repair:   { label:"修理中", cls:"warn"   },
      returned: { label:"返却済", cls:"gray"   },
    },
    company: (db, id) => (db.companies || companies).find(x => x.id === id) || { name:"—", color:"#889", shipper:"" },
    shipper: (db, id) => (db.shippers || shippers).find(x => x.id === id) || { name:"—", color:"#889" },
    driver:  (db, id) => (db.drivers || []).find(x => x.id === id),
    vehicle: (db, id) => (db.vehicles || []).find(x => x.id === id),
  };
})();
