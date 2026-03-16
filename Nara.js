/* =========================================================
   NARA.JS — STABİL PRO VERSİYA
   index.html dəyişmədən işləməsi üçün hazırlanıb
   ========================================================= */

(function () {
  "use strict";

  // =========================
  // EMAILJS AYARLARI
  // =========================
  const NARA_EMAIL = {
    SERVICE_ID: "service_l4gqfcz",
    TEMPLATE_ID: "template_v1hu5h1",
    PUBLIC_KEY: "tatcA8fFwhzTeu39T",
    TO_EMAIL: "berde.smsii.09@gmail.com"
  };

  // =========================
  // LOCAL STORAGE AÇARLARI
  // =========================
  const NARA_KEYS = {
    FORM: "nara_form_v4",
    CHAT: "nara_chat_v4"
  };

  // =========================
  // OPERATORLAR
  // =========================
  const OPERATORS = [
    { ad: "Nara", sekil: "fotolar/nara_operator_foto.jpeg" },
    { ad: "Aynur", sekil: "fotolar/aynur_operator_foto.jpeg" },
    { ad: "Sevda", sekil: "fotolar/sevda_operator_foto.jpeg" },
    { ad: "Nigar", sekil: "fotolar/nigar_operator_foto.jpeg" }
  ];

  // =========================
  // MÖVZULAR
  // =========================
  const SUBJECTS = [
    { id: "su_tehcizati", title: "Su təchizatı", icon: "💧", desc: "Su gəlmir, zəif gəlir, təzyiq problemi" },
    { id: "subartezian", title: "Subartezian quyu", icon: "🛠️", desc: "Quyu və nasazlıq müraciətləri" },
    { id: "kanal_kollektor", title: "Kanal / kollektor", icon: "🌊", desc: "Tıxanma, daşma, təmizləmə" },
    { id: "nasos", title: "Nasos stansiyası", icon: "⚙️", desc: "Nasos stansiyası ilə bağlı müraciətlər" },
    { id: "odenis", title: "Ödəniş / qəbz", icon: "💳", desc: "Ödəniş və qəbz məsələləri" },
    { id: "teklif", title: "Təklif / təşəkkür", icon: "📝", desc: "Rəy, təşəkkür, təklif" },
    { id: "diger", title: "Digər", icon: "📌", desc: "Digər mövzular" }
  ];

  const PRIORITIES = [
    { value: "Aşağı", icon: "🟢" },
    { value: "Orta", icon: "🟡" },
    { value: "Yüksək", icon: "🟠" },
    { value: "Təcili", icon: "🔴" }
  ];

  // =========================
  // INTENTLƏR
  // =========================
  const INTENTS = {
    greeting: ["salam", "slm", "salamlar", "sabahınız xeyir", "sabahiniz xeyir", "gününüz xeyir", "hello", "hi", "hey", "sa", "s.a"],
    thanks: ["sağ ol", "sag ol", "çox sağ ol", "cox sag ol", "təşəkkür", "tesekkur", "var olun"],
    goodbye: ["hələlik", "helelik", "görüşərik", "goruserik", "xudahafiz", "salamat qal", "bye", "bay"],
    contact: ["əlaqə", "elaqe", "telefon", "nomre", "nömrə", "whatsapp", "email", "ünvan", "unvan", "iş saatı", "is saati"],
    startForm: ["müraciət", "muraciet", "elektron müraciət", "şikayət", "sikayet", "problem", "yeni müraciət", "müraciət yarat"]
  };

  // =========================
  // ADDIMLAR
  // =========================
  const STEP_ORDER = [
    "welcome",
    "full_name",
    "fin_code",
    "id_card",
    "phone",
    "email",
    "subject",
    "address",
    "priority",
    "message",
    "images",
    "consent",
    "review",
    "complete"
  ];

  let EMAILJS_READY = false;
  let AUTO_OPEN_DONE = false;

  // =========================
  // KÖMƏKÇİLƏR
  // =========================
  function norm(t) {
    return (t || "").toString().toLowerCase().trim();
  }

  function looseNormalize(s) {
    return norm(s)
      .replaceAll("ə", "e")
      .replaceAll("ı", "i")
      .replaceAll("ö", "o")
      .replaceAll("ü", "u")
      .replaceAll("ş", "s")
      .replaceAll("ç", "c")
      .replaceAll("ğ", "g")
      .replace(/[^\p{L}\p{N}\s-]/gu, " ");
  }

  function anyIncludes(q, arr) {
    const text = looseNormalize(q);
    return arr.some(k => text.includes(looseNormalize(k)));
  }

  function esc(str) {
    return (str || "")
      .toString()
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function readLS(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeLS(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeLS(key) {
    localStorage.removeItem(key);
  }

  function getMsgsBox() {
    return document.getElementById("nara-msgs");
  }

  function getInput() {
    return document.getElementById("nara-input");
  }

  function getChatBox() {
    return document.getElementById("nara-chat");
  }

  function nowTime() {
    return new Date().toLocaleTimeString("az-AZ", { hour: "2-digit", minute: "2-digit" });
  }

  function currentOperator() {
    const saat = new Date().getHours();
    const blok = Math.floor(saat / 2);
    const index = blok % OPERATORS.length;
    return OPERATORS[index];
  }

  function getSubjectTitle(id) {
    const found = SUBJECTS.find(x => x.id === id);
    return found ? found.title : id;
  }

  function previousStep(step) {
    const i = STEP_ORDER.indexOf(step);
    if (i <= 1) return "welcome";
    return STEP_ORDER[i - 1];
  }

  function getProgressPercent(step) {
    const map = {
      welcome: 5,
      full_name: 12,
      fin_code: 20,
      id_card: 28,
      phone: 36,
      email: 44,
      subject: 54,
      address: 64,
      priority: 74,
      message: 84,
      images: 92,
      consent: 96,
      review: 100,
      complete: 100
    };
    return map[step] || 5;
  }

  // =========================
  // FORM MƏLUMATLARI
  // =========================
  function defaultForm() {
    return {
      mode: "idle",
      step: "welcome",
      data: {
        full_name: "",
        fin_code: "",
        id_card: "",
        phone: "",
        email: "",
        app_type: "Elektron müraciət",
        subject: "",
        subject_id: "",
        address: "",
        priority: "",
        message: "",
        consent: "",
        image_1: "",
        image_2: "",
        image_note: "Şəkil əlavə edilməyib.",
        operator_name: "",
        submit_time: ""
      }
    };
  }

  function getForm() {
    return readLS(NARA_KEYS.FORM, defaultForm()) || defaultForm();
  }

  function setForm(v) {
    writeLS(NARA_KEYS.FORM, v);
  }

  function updateForm(partial) {
    const cur = getForm();
    const next = {
      ...cur,
      ...partial,
      data: {
        ...(cur.data || {}),
        ...((partial && partial.data) || {})
      }
    };
    setForm(next);
    updateProgress();
    return next;
  }

  function resetForm() {
    setForm(defaultForm());
    updateProgress();
  }

  // =========================
  // CHAT HISTORY
  // =========================
  function getChatHistory() {
    return readLS(NARA_KEYS.CHAT, []);
  }

  function saveChat(role, text, html) {
    const hist = getChatHistory();
    hist.push({
      role: role,
      text: text || "",
      html: html || null,
      at: new Date().toISOString()
    });
    writeLS(NARA_KEYS.CHAT, hist.slice(-120));
  }

  function clearChat() {
    removeLS(NARA_KEYS.CHAT);
  }

  // =========================
  // YOXLAMALAR
  // =========================
  function validFin(v) {
    if (!v) return true;
    return /^[A-Za-z0-9]{7}$/.test(v.trim());
  }

  function validIdCard(v) {
    if (!v) return true;
    return /^[A-Za-z0-9\-]{5,20}$/.test(v.trim());
  }

  function validPhone(v) {
    const t = v.replace(/\s+/g, "");
    return /^(\+994|0)?(10|20|50|51|55|60|70|77|99)[0-9]{7}$/.test(t);
  }

  function validEmail(v) {
    if (!v) return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // =========================
  // STİLLƏR
  // =========================
  function injectStyles() {
    if (document.getElementById("nara-fixed-styles")) return;

    const style = document.createElement("style");
    style.id = "nara-fixed-styles";
    style.textContent = `
      #nara-widget * { box-sizing: border-box; }

      #nara-chat {
        animation: naraOpen .25s ease;
        backdrop-filter: blur(8px);
        background: rgba(255,255,255,.98) !important;
      }

      @keyframes naraOpen {
        from { opacity: 0; transform: translateY(14px) scale(.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      #nara-msgs {
        background:
          radial-gradient(circle at top right, rgba(0,102,204,.05), transparent 30%),
          linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
        scroll-behavior: smooth;
      }

      .nara-row {
        display: flex;
        width: 100%;
        gap: 8px;
        margin-bottom: 2px;
        align-items: flex-end;
        animation: naraMsgIn .22s ease;
      }

      .nara-row.bot { justify-content: flex-start; }
      .nara-row.user { justify-content: flex-end; }

      @keyframes naraMsgIn {
        from { opacity: 0; transform: translateY(8px); }
        to { opacity: 1; transform: translateY(0); }
      }

      .nara-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        object-fit: cover;
        object-position: center;
        flex: 0 0 24px;
        border: 1px solid rgba(0,74,153,.12);
        background: #fff;
        box-shadow: 0 3px 8px rgba(0,0,0,.07);
        display: block;
      }

      .nara-bubble {
        max-width: 86%;
        border-radius: 18px;
        padding: 12px 14px;
        font-size: 14px;
        line-height: 1.55;
        box-shadow: 0 8px 20px rgba(0,0,0,.05);
        word-break: break-word;
      }

      .nara-row.bot .nara-bubble {
        background: #fff;
        color: #24384d;
        border: 1px solid rgba(0,74,153,.08);
        border-bottom-left-radius: 6px;
      }

      .nara-row.user .nara-bubble {
        background: linear-gradient(135deg, #004a99, #0066cc);
        color: white;
        border-bottom-right-radius: 6px;
      }

      .nara-meta {
        margin-top: 6px;
        font-size: 11px;
        opacity: .65;
      }

      .nara-typing {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        min-height: 18px;
      }

      .nara-typing span {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #95a7b9;
        animation: naraTyping 1s infinite ease-in-out;
      }

      .nara-typing span:nth-child(2) { animation-delay: .15s; }
      .nara-typing span:nth-child(3) { animation-delay: .3s; }

      @keyframes naraTyping {
        0%, 80%, 100% { transform: scale(.75); opacity: .45; }
        40% { transform: scale(1); opacity: 1; }
      }

      .nara-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }

      .nara-chip {
        border: 1px solid rgba(0,74,153,.14);
        background: white;
        color: #004a99;
        border-radius: 999px;
        padding: 9px 13px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: .2s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,.03);
      }

      .nara-chip:hover {
        background: #eef6ff;
        transform: translateY(-1px);
      }

      .nara-card-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
        margin-top: 10px;
      }

      .nara-card {
        border: 1px solid rgba(0,74,153,.10);
        border-radius: 16px;
        background: linear-gradient(180deg, #fff, #fbfdff);
        padding: 12px;
        cursor: pointer;
        transition: .25s ease;
        box-shadow: 0 8px 18px rgba(0,0,0,.04);
      }

      .nara-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 22px rgba(0,0,0,.08);
        border-color: rgba(0,74,153,.25);
      }

      .nara-card-title {
        font-weight: 800;
        font-size: 14px;
        color: #14385f;
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 4px;
      }

      .nara-card-desc {
        font-size: 12.5px;
        color: #627385;
        line-height: 1.45;
      }

      .nara-badge {
        display: inline-block;
        margin-bottom: 8px;
        background: #edf5ff;
        color: #004a99;
        border-radius: 999px;
        padding: 5px 9px;
        font-size: 11px;
        font-weight: 800;
      }

      .nara-review {
        background: #f8fbff;
        border: 1px dashed rgba(0,74,153,.22);
        border-radius: 14px;
        padding: 12px;
        margin-top: 8px;
        font-size: 13px;
        line-height: 1.6;
      }

      .nara-review b { color: #103962; }

      .nara-mini-btns {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }

      .nara-mini-btn {
        border: none;
        background: #eef4fb;
        color: #004a99;
        border-radius: 10px;
        padding: 9px 12px;
        font-size: 12.5px;
        font-weight: 800;
        cursor: pointer;
        transition: .2s ease;
      }

      .nara-mini-btn:hover {
        background: #e1ecfb;
        transform: translateY(-1px);
      }

      .nara-progress-wrap {
        margin-top: 6px;
        width: 100%;
      }

      .nara-progress-text {
        font-size: 11px;
        opacity: .82;
        margin-bottom: 6px;
      }

      .nara-progress {
        width: 100%;
        height: 7px;
        background: rgba(255,255,255,.22);
        border-radius: 999px;
        overflow: hidden;
      }

      .nara-progress > span {
        display: block;
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, #7fd6ff, #ffffff);
        border-radius: 999px;
        transition: width .25s ease;
      }

      .nara-upload-preview-wrap {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      .nara-upload-preview {
        width: 88px;
        height: 88px;
        border-radius: 12px;
        object-fit: cover;
        border: 1px solid #d9e5f5;
        box-shadow: 0 6px 14px rgba(0,0,0,.05);
        background: #fff;
      }

      .nara-soft-note {
        margin-top: 8px;
        font-size: 12px;
        color: #688099;
        line-height: 1.45;
      }

      @media (max-width: 640px) {
        #nara-widget {
          right: 10px !important;
          bottom: 10px !important;
        }

        #nara-chat {
          width: min(94vw, 380px) !important;
          height: min(76vh, 560px) !important;
          bottom: 82px !important;
        }

        .nara-bubble {
          max-width: 90%;
          font-size: 13.5px;
        }

        .nara-upload-preview {
          width: 76px;
          height: 76px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // =========================
  // OPERATOR ŞƏKİL / AD DƏYİŞMƏ
  // =========================
  function operatorSec() {
    const operator = currentOperator();

    const adEl = document.getElementById("operatorAd");
    const s1 = document.getElementById("operatorSekil");
    const s2 = document.getElementById("operatorSekilMain");

    if (adEl) adEl.innerText = operator.ad;
    if (s1) {
      s1.src = operator.sekil;
      s1.style.objectFit = "cover";
      s1.style.objectPosition = "center";
      s1.style.borderRadius = "50%";
      s1.style.width = "28px";
      s1.style.height = "28px";
      s1.style.display = "block";
    }
    if (s2) {
      s2.src = operator.sekil;
      s2.style.objectFit = "cover";
      s2.style.objectPosition = "center";
      s2.style.borderRadius = "50%";
      s2.style.display = "block";
    }
  }

  function operatorYazir() {
    const input = getInput();
    if (!input) return;
    input.placeholder = currentOperator().ad + " sizi dinləyir...";
    setTimeout(() => {
      if (input) input.placeholder = "Yazın...";
    }, 1500);
  }

  function toggleNara() {
    const chat = getChatBox();
    if (!chat) return;

    chat.style.display = chat.style.display === "none" ? "flex" : "none";

    if (chat.style.display === "flex") {
      const input = getInput();
      if (input) setTimeout(() => input.focus(), 120);
    }
  }

  window.operatorSec = operatorSec;
  window.operatorYazir = operatorYazir;
  window.toggleNara = toggleNara;

  // =========================
  // SƏS
  // =========================
  function playSound(type) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();

      o.type = "sine";
      o.frequency.value = type === "success" ? 880 : type === "send" ? 640 : 520;
      g.gain.value = 0.0001;

      o.connect(g);
      g.connect(ctx.destination);
      o.start();

      g.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

      o.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // =========================
  // EMAILJS YÜKLƏMƏ
  // =========================
  function loadEmailJS() {
    return new Promise((resolve, reject) => {
      if (window.emailjs) {
        try {
          window.emailjs.init({ publicKey: NARA_EMAIL.PUBLIC_KEY });
          EMAILJS_READY = true;
          resolve(true);
        } catch (e) {
          reject(e);
        }
        return;
      }

      const old = document.getElementById("nara-emailjs-sdk");
      if (old) {
        old.addEventListener("load", function () {
          try {
            window.emailjs.init({ publicKey: NARA_EMAIL.PUBLIC_KEY });
            EMAILJS_READY = true;
            resolve(true);
          } catch (e) {
            reject(e);
          }
        });
        old.addEventListener("error", reject);
        return;
      }

      const s = document.createElement("script");
      s.id = "nara-emailjs-sdk";
      s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      s.async = true;

      s.onload = function () {
        try {
          window.emailjs.init({ publicKey: NARA_EMAIL.PUBLIC_KEY });
          EMAILJS_READY = true;
          resolve(true);
        } catch (e) {
          reject(e);
        }
      };

      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // =========================
  // MESAJ GÖSTƏRMƏ
  // =========================
  function addMsg(role, text, html, save) {
    const area = getMsgsBox();
    if (!area) return;

    const row = document.createElement("div");
    row.className = "nara-row " + (role === "bot" ? "bot" : "user");

    if (role === "bot") {
      const avatar = document.createElement("img");
      avatar.className = "nara-avatar";
      avatar.src = currentOperator().sekil;
      avatar.alt = currentOperator().ad;
      row.appendChild(avatar);
    }

    const bubble = document.createElement("div");
    bubble.className = "nara-bubble";
    bubble.innerHTML = html ? html : esc(text).replace(/\n/g, "<br>");

    const meta = document.createElement("div");
    meta.className = "nara-meta";
    meta.textContent = (role === "bot" ? currentOperator().ad : "Siz") + " • " + nowTime();
    bubble.appendChild(meta);

    row.appendChild(bubble);
    area.appendChild(row);
    area.scrollTop = area.scrollHeight;

    if (save !== false) saveChat(role, text, html);
    playSound(role === "bot" ? "message" : "send");
  }

  function addTyping() {
    const area = getMsgsBox();
    if (!area) return;

    const row = document.createElement("div");
    row.className = "nara-row bot";
    row.id = "nara-typing-row";

    const avatar = document.createElement("img");
    avatar.className = "nara-avatar";
    avatar.src = currentOperator().sekil;
    avatar.alt = currentOperator().ad;

    const bubble = document.createElement("div");
    bubble.className = "nara-bubble";
    bubble.innerHTML = '<div class="nara-typing"><span></span><span></span><span></span></div>';

    row.appendChild(avatar);
    row.appendChild(bubble);
    area.appendChild(row);
    area.scrollTop = area.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById("nara-typing-row");
    if (el) el.remove();
  }

  async function botSay(text, html, ms, save) {
    addTyping();
    await delay(ms || 350);
    removeTyping();
    addMsg("bot", text || "", html || null, save);
  }

  function quickActions(actions) {
    const html = `
      <div class="nara-actions">
        ${actions.map(a => `<button class="nara-chip" onclick="window.naraQuick('${esc(a.value)}')">${a.label}</button>`).join("")}
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function subjectCards() {
    const html = `
      <div class="nara-badge">Mövzu seçimi</div>
      <div class="nara-card-grid">
        ${SUBJECTS.map(s => `
          <div class="nara-card" onclick="window.naraSelectSubject('${s.id}')">
            <div class="nara-card-title">${s.icon} ${s.title}</div>
            <div class="nara-card-desc">${s.desc}</div>
          </div>
        `).join("")}
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function priorityCards() {
    const html = `
      <div class="nara-badge">Prioritet seçimi</div>
      <div class="nara-card-grid">
        ${PRIORITIES.map(p => `
          <div class="nara-card" onclick="window.naraSelectPriority('${p.value}')">
            <div class="nara-card-title">${p.icon} ${p.value}</div>
            <div class="nara-card-desc">Müraciətin vaciblik səviyyəsini seçin</div>
          </div>
        `).join("")}
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function reviewBox() {
    const d = getForm().data;

    const imagesHtml = d.image_1 ? `
      <div class="nara-upload-preview-wrap">
        <img class="nara-upload-preview" src="${d.image_1}" alt="Şəkil 1">
      </div>
    ` : `<div class="nara-soft-note">Şəkil əlavə edilməyib.</div>`;

    const html = `
      <div class="nara-badge">Yekun yoxlama</div>
      <div class="nara-review">
        <b>Ad, soyad:</b> ${esc(d.full_name || "-")}<br>
        <b>FİN kod:</b> ${esc(d.fin_code || "-")}<br>
        <b>ŞV nömrəsi:</b> ${esc(d.id_card || "-")}<br>
        <b>Telefon:</b> ${esc(d.phone || "-")}<br>
        <b>E-poçt:</b> ${esc(d.email || "-")}<br>
        <b>Növ:</b> ${esc(d.app_type || "-")}<br>
        <b>Mövzu:</b> ${esc(d.subject || "-")}<br>
        <b>Ünvan:</b> ${esc(d.address || "-")}<br>
        <b>Prioritet:</b> ${esc(d.priority || "-")}<br>
        <b>Müraciətin məzmunu:</b> ${esc(d.message || "-")}<br>
        <b>Razılıq:</b> ${esc(d.consent || "-")}
        ${imagesHtml}
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function bottomControls() {
    const html = `
      <div class="nara-mini-btns">
        <button class="nara-mini-btn" onclick="window.naraGoBack()">⬅️ Geri</button>
        <button class="nara-mini-btn" onclick="window.naraResetForm()">🗑️ Formu sıfırla</button>
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function reviewControls() {
    const html = `
      <div class="nara-mini-btns">
        <button class="nara-mini-btn" onclick="window.naraSendApplication()">✅ Göndər</button>
        <button class="nara-mini-btn" onclick="window.naraGoBack()">⬅️ Geri</button>
        <button class="nara-mini-btn" onclick="window.naraResetForm()">🗑️ Sıfırla</button>
      </div>
    `;
    addMsg("bot", "", html, false);
  }

  function imageControls() {
    const html = `
      <div class="nara-mini-btns">
        <button class="nara-mini-btn" onclick="window.naraOpenImagePicker()">🖼️ Şəkil əlavə et</button>
        <button class="nara-mini-btn" onclick="window.naraSkipImages()">⏭️ Şəkilsiz davam et</button>
        <button class="nara-mini-btn" onclick="window.naraGoBack()">⬅️ Geri</button>
      </div>
      <div class="nara-soft-note">Maksimum 1 şəkil əlavə edə bilərsiniz.</div>
    `;
    addMsg("bot", "", html, false);
  }

  // =========================
  // PROGRESS
  // =========================
  function setProgressHeader() {
    const header = document.querySelector("#nara-chat > div");
    if (!header) return;
    if (document.getElementById("nara-progress-wrap")) return;

    const firstInner = header.querySelector("div");
    if (!firstInner) return;

    const wrap = document.createElement("div");
    wrap.id = "nara-progress-wrap";
    wrap.className = "nara-progress-wrap";
    wrap.innerHTML = `
      <div class="nara-progress-text">Elektron müraciət köməkçisi</div>
      <div class="nara-progress"><span id="nara-progress-bar"></span></div>
    `;
    firstInner.appendChild(wrap);
  }

  function updateProgress() {
    setProgressHeader();
    const bar = document.getElementById("nara-progress-bar");
    if (!bar) return;
    bar.style.width = getProgressPercent(getForm().step) + "%";
  }

  // =========================
  // ƏLAQƏ CAVABI
  // =========================
  function contactAnswer() {
    return `Əlaqə məlumatları:
• Telefon: +994 20 208 25 60
• WhatsApp: +994 70 972 02 09
• E-mail: berde.smsii.09@gmail.com
• Ünvan: Bərdə şəhəri, S. Zöhrabbəyov küçəsi 10
• İş rejimi: Bazar ertəsi – Cümə, 09:00 – 18:00`;
  }

  // =========================
  // ŞƏKİL YÜKLƏMƏ
  // =========================
  function ensureHiddenImageInput() {
    let input = document.getElementById("nara-hidden-image-input");
    if (input) return input;

    input = document.createElement("input");
    input.type = "file";
    input.id = "nara-hidden-image-input";
    input.accept = "image/*";
    input.multiple = true;
    input.style.display = "none";

    input.addEventListener("change", async function (e) {
      const files = Array.from(e.target.files || []).slice(0, 1);
      if (!files.length) return;

      const converted = [];
      for (const file of files) {
        const base64 = await compressImage(file, 700, 0.45);
        converted.push(base64);
      }

      updateForm({
        step: "consent",
        data: {
          image_1: converted[0] || "",
          image_2: "",
          image_note: converted.length ? "1 şəkil əlavə edilib." : "Şəkil əlavə edilməyib."
        }
      });

      addMsg("user", files.map(f => "Şəkil əlavə edildi: " + f.name).join(", "));

      const previewHtml = `
        <div class="nara-badge">Əlavə edilən şəkil</div>
        <div class="nara-upload-preview-wrap">
          ${converted[0] ? `<img class="nara-upload-preview" src="${converted[0]}" alt="Şəkil 1">` : ""}
        </div>
      `;
      await botSay("Şəkil qəbul edildi.", previewHtml, 300);

      await askStepQuestion("consent");
    });

    document.body.appendChild(input);
    return input;
  }

  function compressImage(file, maxSize, quality) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();

      fr.onload = function () {
        const img = new Image();

        img.onload = function () {
          let w = img.width;
          let h = img.height;

          const LIMIT = 700;
          const QUALITY = 0.45;

          if (w > h && w > LIMIT) {
            h = Math.round((h * LIMIT) / w);
            w = LIMIT;
          } else if (h >= w && h > LIMIT) {
            w = Math.round((w * LIMIT) / h);
            h = LIMIT;
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          let base64 = canvas.toDataURL("image/jpeg", QUALITY);

          if (base64.length > 350000) {
            base64 = canvas.toDataURL("image/jpeg", 0.30);
          }

          resolve(base64);
        };

        img.onerror = reject;
        img.src = fr.result;
      };

      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }

  // =========================
  // FORM AXINI
  // =========================
  async function greetFlow() {
    updateForm({ mode: "idle", step: "welcome" });

    await botSay(
      "Salam 👋 Mən " + currentOperator().ad + ".\nSizə elektron müraciətinizi burada addım-addım yaratmağa kömək edə bilərəm.",
      null,
      450
    );

    quickActions([
      { label: "Müraciət yarat", value: "müraciət yarat" },
      { label: "Əlaqə məlumatları", value: "əlaqə" }
    ]);
  }

  async function startFormFlow() {
    updateForm({ mode: "form", step: "full_name" });
    await botSay("Əla. Başlayaq. Məlumatları addım-addım qəbul edəcəyəm. 🌿", null, 300);
    await askStepQuestion("full_name");
  }

  async function askStepQuestion(step) {
    updateProgress();

    if (step === "full_name") {
      await botSay("Zəhmət olmasa ad və soyadınızı yazın.", null, 260);
      bottomControls();
      return;
    }

    if (step === "fin_code") {
      await botSay("FİN kodunuzu yazın. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 260);
      quickActions([{ label: "Keç", value: "keç" }]);
      bottomControls();
      return;
    }

    if (step === "id_card") {
      await botSay("Şəxsiyyət vəsiqəsinin seriya / nömrəsini yazın. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 260);
      quickActions([{ label: "Keç", value: "keç" }]);
      bottomControls();
      return;
    }

    if (step === "phone") {
      await botSay("Əlaqə nömrənizi yazın. Məsələn: 0501234567", null, 260);
      bottomControls();
      return;
    }

    if (step === "email") {
      await botSay("E-poçt ünvanınızı yazın. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 260);
      quickActions([{ label: "Keç", value: "keç" }]);
      bottomControls();
      return;
    }

    if (step === "subject") {
      await botSay("Müraciətin mövzusunu seçin:", null, 260);
      subjectCards();
      bottomControls();
      return;
    }

    if (step === "address") {
      await botSay("Zəhmət olmasa ünvanı yazın.", null, 260);
      bottomControls();
      return;
    }

    if (step === "priority") {
      await botSay("Prioriteti seçin.", null, 260);
      priorityCards();
      bottomControls();
      return;
    }

    if (step === "message") {
      await botSay("Müraciətin məzmununu yazın.", null, 260);
      bottomControls();
      return;
    }

    if (step === "images") {
      await botSay("İstəsəniz 1 şəkil əlavə edə bilərsiniz.", null, 260);
      imageControls();
      return;
    }

    if (step === "consent") {
      await botSay("Məlumatların müraciət məqsədilə emalına razısınız?", null, 260);
      quickActions([
        { label: "Bəli", value: "bəli" },
        { label: "Xeyr", value: "xeyr" }
      ]);
      bottomControls();
      return;
    }

    if (step === "review") {
      await botSay("Məlumatları yoxlayın:", null, 260);
      reviewBox();
      reviewControls();
      return;
    }

    if (step === "complete") {
      await botSay("Müraciət artıq göndərilib.", null, 260);
      quickActions([
        { label: "Yeni müraciət", value: "yeni müraciət" },
        { label: "Əlaqə məlumatları", value: "əlaqə" }
      ]);
    }
  }

  async function processFormInput(text) {
    const f = getForm();
    const step = f.step;
    const q = norm(text);

    if (q === "keç") {
      if (step === "fin_code") {
        updateForm({ step: "id_card", data: { fin_code: "" } });
        await askStepQuestion("id_card");
        return;
      }
      if (step === "id_card") {
        updateForm({ step: "phone", data: { id_card: "" } });
        await askStepQuestion("phone");
        return;
      }
      if (step === "email") {
        updateForm({ step: "subject", data: { email: "" } });
        await askStepQuestion("subject");
        return;
      }
    }

    if (step === "full_name") {
      if (text.trim().length < 5) {
        await botSay("Ad və soyadı daha tam yazın, zəhmət olmasa.", null, 240);
        return;
      }
      updateForm({ step: "fin_code", data: { full_name: text.trim() } });
      await askStepQuestion("fin_code");
      return;
    }

    if (step === "fin_code") {
      const val = text.trim().toUpperCase();
      if (val && !validFin(val)) {
        await botSay("FİN kod 7 simvollu olmalıdır. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 240);
        return;
      }
      updateForm({ step: "id_card", data: { fin_code: val } });
      await askStepQuestion("id_card");
      return;
    }

    if (step === "id_card") {
      const val = text.trim();
      if (val && !validIdCard(val)) {
        await botSay("ŞV nömrəsi düzgün görünmür. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 240);
        return;
      }
      updateForm({ step: "phone", data: { id_card: val } });
      await askStepQuestion("phone");
      return;
    }

    if (step === "phone") {
      const val = text.trim();
      if (!validPhone(val)) {
        await botSay("Telefon nömrəsi düzgün görünmür. Məsələn: 0501234567 və ya +994501234567", null, 240);
        return;
      }
      updateForm({ step: "email", data: { phone: val } });
      await askStepQuestion("email");
      return;
    }

    if (step === "email") {
      const val = text.trim();
      if (val && !validEmail(val)) {
        await botSay("E-poçt ünvanı düzgün görünmür. İstəmirsinizsə `keç` yaza bilərsiniz.", null, 240);
        return;
      }
      updateForm({ step: "subject", data: { email: val } });
      await askStepQuestion("subject");
      return;
    }

    if (step === "address") {
      const val = text.trim();
      if (val.length < 3) {
        await botSay("Ünvanı bir az daha dəqiq yazın.", null, 240);
        return;
      }
      updateForm({ step: "priority", data: { address: val } });
      await askStepQuestion("priority");
      return;
    }

    if (step === "message") {
      const val = text.trim();
      if (val.length < 10) {
        await botSay("Müraciətin məzmununu bir az daha ətraflı yazın.", null, 240);
        return;
      }
      updateForm({ step: "images", data: { message: val } });
      await askStepQuestion("images");
      return;
    }

    if (step === "consent") {
      if (q === "bəli" || q === "beli") {
        updateForm({ step: "review", data: { consent: "Bəli" } });
        await askStepQuestion("review");
        return;
      }
      if (q === "xeyr") {
        updateForm({ step: "review", data: { consent: "Xeyr" } });
        await botSay("Qeyd edildi. Amma razılıq olmadan göndərmək mümkün deyil.", null, 240);
        await askStepQuestion("review");
        return;
      }
      await botSay("Zəhmət olmasa `Bəli` və ya `Xeyr` seçin.", null, 240);
      quickActions([
        { label: "Bəli", value: "bəli" },
        { label: "Xeyr", value: "xeyr" }
      ]);
      return;
    }

    if (step === "subject") {
      await botSay("Mövzunu aşağıdakı kartlardan seçin.", null, 220);
      subjectCards();
      return;
    }

    if (step === "priority") {
      await botSay("Prioriteti aşağıdakı seçimlərdən seçin.", null, 220);
      priorityCards();
      return;
    }

    if (step === "images") {
      await botSay("Şəkil əlavə etmək üçün düymədən istifadə edin və ya `şəkilsiz davam et` yazın.", null, 220);
      imageControls();
      return;
    }

    if (step === "review") {
      await botSay("Aşağıdakı düymələrdən istifadə edin.", null, 220);
      reviewControls();
      return;
    }
  }

  // =========================
  // EMAIL GÖNDƏRMƏ
  // =========================
  function generateOrderId() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const rand = Math.floor(Math.random() * 9000 + 1000);
    return `BSMSII-${y}${m}${day}-${rand}`;
  }

  async function sendEmail() {
    try {
      if (!EMAILJS_READY) {
        await loadEmailJS();
      }
      if (!window.emailjs) {
        throw new Error("EmailJS tapılmadı");
      }

      const d = getForm().data;
      const orderId = generateOrderId();
      const submitTime = new Date().toLocaleString("az-AZ");
      const operatorName = currentOperator().ad;

      await window.emailjs.send(
        NARA_EMAIL.SERVICE_ID,
        NARA_EMAIL.TEMPLATE_ID,
        {
          order_id: orderId,
          full_name: d.full_name || "-",
          fin_code: d.fin_code || "-",
          id_card: d.id_card || "-",
          phone: d.phone || "-",
          email: d.email || "-",
          app_type: d.app_type || "Elektron müraciət",
          subject: d.subject || "-",
          address: d.address || "-",
          priority: d.priority || "-",
          consent: d.consent || "-",
          operator_name: operatorName,
          submit_time: submitTime,
          message: d.message || "-",
          image_1: d.image_1 || "https://dummyimage.com/1x1/ffffff/ffffff.png",
          image_2: "https://dummyimage.com/1x1/ffffff/ffffff.png",
          image_note: d.image_note || "Şəkil əlavə edilməyib."
        }
      );

      updateForm({
        step: "complete",
        data: {
          operator_name: operatorName,
          submit_time: submitTime
        }
      });

      return { ok: true, orderId: orderId };
    } catch (e) {
      console.error("Email göndərmə xətası:", e);
      return { ok: false, error: e };
    }
  }

  // =========================
  // MESAJ MƏNTİQİ
  // =========================
  async function processMessage(text) {
    const q = norm(text);
    const f = getForm();

    if (anyIncludes(q, INTENTS.goodbye)) {
      await botSay("Sizə kömək etmək xoş oldu. Hələlik və xoş günlər! 🌷", null, 220);
      return;
    }

    if (anyIncludes(q, INTENTS.thanks)) {
      await botSay("Siz sağ olun. Mən buradayam 😊", null, 220);
      return;
    }

    if (anyIncludes(q, INTENTS.contact)) {
      await botSay(contactAnswer(), null, 220);
      return;
    }

    if (q === "şəkilsiz davam et") {
      await window.naraSkipImages();
      return;
    }

    if (anyIncludes(q, INTENTS.greeting)) {
      if (f.mode === "form" && f.step !== "welcome" && f.step !== "complete") {
        await botSay("Salam 😊 Qaldığınız yeri yadda saxlamışam. Davam edə bilərik.", null, 220);
        quickActions([
          { label: "Davam et", value: "davam et" },
          { label: "Yeni müraciət", value: "yeni müraciət" }
        ]);
        return;
      }
      await greetFlow();
      return;
    }

    if (q === "davam et") {
      if (f.mode === "form" && f.step !== "welcome" && f.step !== "complete") {
        await askStepQuestion(f.step);
      } else {
        await startFormFlow();
      }
      return;
    }

    if (q === "yeni müraciət" || anyIncludes(q, INTENTS.startForm)) {
      resetForm();
      await startFormFlow();
      return;
    }

    if (f.mode === "form" && f.step !== "welcome" && f.step !== "complete") {
      await processFormInput(text);
      return;
    }

    await botSay("Elektron müraciət yaratmaq üçün `müraciət yarat` yaza bilərsiniz.", null, 220);
    quickActions([
      { label: "Müraciət yarat", value: "müraciət yarat" },
      { label: "Əlaqə məlumatları", value: "əlaqə" }
    ]);
  }

  // =========================
  // GÖNDƏR
  // =========================
  async function sendToNara() {
    const input = getInput();
    if (!input) return;

    const val = input.value.trim();
    if (!val) return;

    addMsg("user", val, null, true);
    input.value = "";

    await processMessage(val);
  }

  window.sendToNara = sendToNara;

  window.naraQuick = async function (value) {
    addMsg("user", value, null, true);
    await processMessage(value);
  };

  window.naraSelectSubject = async function (id) {
    const title = getSubjectTitle(id);
    addMsg("user", title, null, true);

    updateForm({
      step: "address",
      data: {
        subject: title,
        subject_id: id
      }
    });

    await botSay("Seçildi: " + title, null, 220);
    await askStepQuestion("address");
  };

  window.naraSelectPriority = async function (value) {
    addMsg("user", value, null, true);

    updateForm({
      step: "message",
      data: {
        priority: value
      }
    });

    await botSay("Prioritet qeyd edildi: " + value, null, 220);
    await askStepQuestion("message");
  };

  window.naraGoBack = async function () {
    const f = getForm();
    if (f.step === "welcome" || f.step === "complete") {
      await botSay("Hazırda geri qayıdılacaq addım yoxdur.", null, 200);
      return;
    }

    const prev = previousStep(f.step);
    updateForm({ step: prev });
    addMsg("user", "Geri", null, true);
    await botSay("Oldu, bir əvvəlki addıma qayıtdıq.", null, 200);

    if (prev === "welcome") {
      await greetFlow();
    } else {
      await askStepQuestion(prev);
    }
  };

  window.naraResetForm = async function () {
    resetForm();
    clearChat();
    const area = getMsgsBox();
    if (area) area.innerHTML = "";
    await greetFlow();
  };

  window.naraOpenImagePicker = function () {
    const input = ensureHiddenImageInput();
    input.value = "";
    input.click();
  };

  window.naraSkipImages = async function () {
    addMsg("user", "Şəkilsiz davam et", null, true);
    updateForm({
      step: "consent",
      data: {
        image_1: "",
        image_2: "",
        image_note: "Şəkil əlavə edilməyib."
      }
    });
    await askStepQuestion("consent");
  };

  window.naraSendApplication = async function () {
    const f = getForm();

    if (f.step !== "review") {
      await botSay("Əvvəlcə bütün addımları tamamlayın.", null, 220);
      return;
    }

    if (f.data.consent !== "Bəli") {
      await botSay("Razılıq olmadan müraciəti göndərmək mümkün deyil.", null, 220);
      return;
    }

    addMsg("user", "Göndər", null, true);
    await botSay("Müraciət hazırlanır və göndərilir...", null, 350);

    const res = await sendEmail();

    if (res.ok) {
      playSound("success");
      await botSay(
        "✅ Müraciətiniz uğurla göndərildi.\nMüraciət ID: " + res.orderId + "\n\nMüraciət aidiyyəti üzrə yönləndirildi.",
        null,
        450
      );

      quickActions([
        { label: "Yeni müraciət", value: "yeni müraciət" },
        { label: "Əlaqə məlumatları", value: "əlaqə" },
        { label: "Sağ ol", value: "sağ ol" }
      ]);
    } else {
      await botSay("Göndərmə zamanı problem yarandı. Zəhmət olmasa bir daha cəhd edin.", null, 300);
      reviewControls();
    }
  };

  // =========================
  // CHAT BƏRPA
  // =========================
  function restoreChat() {
    const area = getMsgsBox();
    if (!area) return;

    const history = getChatHistory();
    if (!history.length) return;

    area.innerHTML = "";
    history.forEach(item => addMsg(item.role, item.text, item.html, false));
  }

  // =========================
  // BAŞLAT
  // =========================
  async function initNara() {
    try {
      injectStyles();
      operatorSec();
      ensureHiddenImageInput();
      updateProgress();

      const input = getInput();
      if (input) {
        input.addEventListener("focus", operatorYazir);
        input.addEventListener("keypress", async function (e) {
          if (e.key === "Enter") {
            e.preventDefault();
            await sendToNara();
          }
        });
      }

      try {
        await loadEmailJS();
      } catch (e) {
        console.warn("EmailJS yüklənmədi:", e);
      }

      restoreChat();

      const chat = getChatBox();
      if (chat && !AUTO_OPEN_DONE && getChatHistory().length === 0) {
        chat.style.display = "flex";
        AUTO_OPEN_DONE = true;
      }

      if (getChatHistory().length === 0) {
        await greetFlow();
      }
    } catch (e) {
      console.error("Nara init xətası:", e);
    }
  }

  window.initNara = initNara;

  function bootWhenReady() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initNara);
    } else {
      initNara();
    }
  }

  bootWhenReady();
})();
