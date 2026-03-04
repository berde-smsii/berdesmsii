
// NARA JSON ÜÇÜN SCRİPT KODLARI
        
// NARA.js - Yenilənmiş Versiya
let NARA_DB = null;

// ====== INTENT WORD LIST (Dəyişməyib) ======
const INTENTS = {
  greeting: ["salam","slm","salamlar","sabahınız xeyir","günortanız xeyir","axşamınız xeyir","xoş gördük","hello","hi","s.a","sa"],
  wellbeing: ["necəsən","necesen","necəsiniz","necesiniz","nətərsən","işlər necədir","hər şey necədir"],
  thanks: ["təşəkkür","çox sağ ol","sağ ol","minnətdaram","var olun","super","əla"],
  goodbye: ["hələlik","görüşərik","salamat qal","xudahafiz","bye","çıxıram","getdim"],
  contact: ["əlaqə","telefon","nömrə","whatsapp","vatsap","email","ünvan","iş rejimi","haradasınız","zəng etmək"],
  complaint: ["şikayət","problem","qeza","su gəlmir","işləmir","sızma","nasazlıq","təcili","gecikir","narazıyam","təzyiq yoxdur"],
  when_fix: ["nə vaxt düzələcək","nə vaxt gələcəksiniz","nə vaxt təmir ediləcək","su nə vaxt gələcək","ne qədər vaxt qalıb"]
};

// ====== Tiny helpers ======
function norm(t="") { return (t||"").toString().toLowerCase().trim(); }
function anyIncludes(q, arr) { return arr.some(k => norm(q).includes(k)); }
function tokenize(q) { return norm(q).replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter(Boolean); }
function extractNumbers(q){ return (q.match(/\d{2,}/g) || []); }

function looseNormalize(s="") {
  return norm(s)
    .replaceAll("ə", "e").replaceAll("ı", "i").replaceAll("ö", "o").replaceAll("ü", "u")
    .replaceAll("ş", "s").replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("’", "'")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  const dp = Array.from({ length: n + 1 }, (_, i) => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = (b[i - 1] === a[j - 1]) ? dp[i - 1][j - 1] : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
    }
  }
  return dp[n][m];
}

function tokenFuzzyScore(qTok, tTok) {
  if (!qTok || !tTok) return 0;
  if (tTok.includes(qTok)) return 8;
  if (qTok.length < 4) return 0;
  const dist = levenshtein(qTok, tTok);
  if (qTok.length <= 6 && dist <= 1) return 5;
  if (qTok.length > 6 && dist <= 2) return 4;
  let i = 0, j = 0;
  while (i < qTok.length && j < tTok.length) { if (qTok[i] === tTok[j]) i++; j++; }
  if (i >= qTok.length - 1) return 3;
  return 0;
}

// ====== UI helpers ======
function addNaraMsg(sender, text) {
  const area = document.getElementById('nara-msgs');
  const m = document.createElement('div');
  m.style.cssText = "padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; margin-bottom: 5px; word-wrap: break-word;";
  if(sender === "bot") {
    m.style.background = "#f1f3f5"; m.style.alignSelf = "flex-start"; m.style.color = "#333"; m.style.borderBottomLeftRadius = "2px";
  } else {
    m.style.background = "#004a99"; m.style.color = "white"; m.style.alignSelf = "flex-end"; m.style.borderBottomRightRadius = "2px";
  }
  m.innerHTML = (text || "").toString().replace(/\n/g, "<br>");
  area.appendChild(m);
  area.scrollTop = area.scrollHeight;
}

function toggleNara() {
  const chat = document.getElementById('nara-chat');
  if(chat) chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
}

// ====== Load JSON database ======
async function initNara() {
  try {
    const res = await fetch('Nara_Bot_Database.json', { cache: "no-store" });
    NARA_DB = await res.json();
    setTimeout(() => {
      const chatBox = document.getElementById('nara-chat');
      if(chatBox) chatBox.style.display = 'flex';
      const hour = new Date().getHours();
      let welcome = NARA_DB?.bot_info?.welcome_messages?.default || "Salam! 😊 Mən Nara.";
      if (hour < 12) welcome = NARA_DB?.bot_info?.welcome_messages?.morning || welcome;
      else if (hour < 18) welcome = NARA_DB?.bot_info?.welcome_messages?.afternoon || welcome;
      else welcome = NARA_DB?.bot_info?.welcome_messages?.evening || welcome;
      addNaraMsg("bot", welcome);
      
      // Enter dəstəyini burada aktivləşdiririk ki, data yüklənəndən sonra işləsin
      const inputField = document.getElementById('nara-input');
      if(inputField) {
        inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendToNara(); });
      }
    }, 700);
  } catch(e) {
    console.error(e);
    addNaraMsg("bot", "Bağlantı xətası. Zəhmət olmasa səhifəni yeniləyin.");
  }
}

// ====== Case Management ======
function getCase() { try { return JSON.parse(localStorage.getItem("nara_case") || "null"); } catch { return null; } }
function setCase(obj) { localStorage.setItem("nara_case", JSON.stringify(obj)); }
function clearCase() { localStorage.removeItem("nara_case"); }
function tryExtractLocation(text){ const t = norm(text); const m = t.match(/(.+?)\s(kəndində|kendinde|kəndi|kendi|küçəsində|kucəsində|qəsəbəsində|qesebesinde)/i); return m ? m[1].trim() : null; }
function tryExtractIssue(text){ const t = norm(text); if (t.includes("sızma")||t.includes("sizma")) return "sızma"; if (t.includes("su gəlmir")||t.includes("su gelmir")) return "su gəlmir"; if (t.includes("qəza")||t.includes("qeza")) return "qəza"; if (t.includes("nasaz")||t.includes("işləmir")) return "nasazlıq"; return null; }

function contactAnswer() {
  const c = NARA_DB?.bot_info?.contacts || {};
  return `Əlaqə məlumatları:\n• Telefon: ${c.phone || "+994202082560"}\n• WhatsApp: ${c.whatsapp || "+994709720209"}\n• E-mail: ${c.email || "Bardasmsii@rsmx.gov.az"}\n• Ünvan: ${c.address || "Bərdə şəhər, S.Zöhrabbəyov küç. 10"}\n• İş rejimi: ${c.work_hours || "Bazar ertəsi – Cümə (09:00 – 18:00)"}`;
}

// ====== Database Search ======
function findBestAnswer(query) {
  if (!NARA_DB?.data || !NARA_DB?.sheets) return null;
  const qRaw = query || "";
  const qLoose = looseNormalize(qRaw);
  const qTokens = tokenize(qLoose);
  const qNums = extractNumbers(qRaw);
  let best = null;
  for (const sheetName of NARA_DB.sheets) {
    const items = NARA_DB.data[sheetName]?.items || [];
    for (const it of items) {
      const rawText = it.search_text || "";
      const text = looseNormalize(rawText);
      const textTokens = tokenize(text);
      let score = 0;
      if (qLoose.length >= 4 && text.includes(qLoose)) score += 40;
      for (const n of qNums) { if (n && rawText.includes(n)) score += 30; }
      for (const tk of qTokens) { if (tk.length >= 3 && text.includes(tk)) score += 6; }
      for (const tk of qTokens) {
        if (tk.length < 3) continue;
        let bestTok = 0;
        for (const tt of textTokens) { const s = tokenFuzzyScore(tk, tt); if (s > bestTok) bestTok = s; if (bestTok >= 8) break; }
        score += bestTok;
      }
      if (!best || score > best.score) best = { score, item: it, sheet: sheetName };
    }
  }
  return (!best || best.score < 12) ? null : best;
}

// ====== Main Send Logic ======
function sendToNara() {
  if (!NARA_DB) { addNaraMsg("bot", "Sistem yüklənir, bir az gözləyin..."); return; }
  const inp = document.getElementById('nara-input');
  const val = inp.value.trim();
  if(!val) return;
  addNaraMsg("user", val);
  inp.value = "";
  const q = norm(val);

  if (anyIncludes(q, INTENTS.greeting)) return setTimeout(() => addNaraMsg("bot", "Salam 😊 Buyurun, nə ilə kömək edim?"), 300);
  if (anyIncludes(q, INTENTS.wellbeing)) return setTimeout(() => addNaraMsg("bot", "Çox sağ olun, yaxşıyam 😊 Siz necəsiniz?"), 300);
  if (anyIncludes(q, INTENTS.thanks)) return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.thanks || "Siz sağ olun! 😊"), 300);
  if (anyIncludes(q, INTENTS.goodbye)) return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.goodbye || "Hələlik! 😊"), 300);
  if (anyIncludes(q, INTENTS.contact)) return setTimeout(() => addNaraMsg("bot", contactAnswer()), 350);

  const existing = getCase();
  const loc = tryExtractLocation(val);
  const issue = tryExtractIssue(val);

  if (anyIncludes(q, INTENTS.complaint)) {
    const c = NARA_DB?.bot_info?.auto_responses?.complaint || "Şikayətinizi WhatsApp-a göndərin.";
    const newCase = { location: loc || existing?.location, issue: issue || existing?.issue, started_at: existing?.started_at || new Date().toISOString() };
    setCase(newCase);
    return setTimeout(() => addNaraMsg("bot", !newCase.location || !newCase.issue ? `Başa düşdüm ⚠️\n${c}\n\nProblem haradadır və nədir?` : `Qeyd etdim: ${newCase.location} — ${newCase.issue} ⚠️\n${c}`), 450);
  }

  const best = findBestAnswer(val);
  if (best) { clearCase(); return setTimeout(() => addNaraMsg("bot", best.item.sentence), 450); }

  return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.out_of_scope || "Dəqiqləşdirə bilərik?"), 450);
}

window.addEventListener('load', initNara);
