
// NARA JSON ÜÇÜN SCRİPT KODLARI
        
        let NARA_DB = null;

// ====== INTENT WORD LIST (geniş) ======
const INTENTS = {
  greeting: [
    "salam","slm","salamlar","salam olsun","salam hər kəsə","hamıya salam","hamıya salamlar","hamınıza salam","hamiya salam","haminiza salam",
    "sabahınız xeyir","sabahiniz xeyir","sabahın xeyir","sabahiniz xeyr","sabahın xeyr","xeyirli sabahlar","xeyirli sabah",
    "günortanız xeyir","gunortaniz xeyir","günortan xeyir","gunortan xeyir",
    "axşamınız xeyir","axsaminiz xeyir","axşamın xeyir","axsamin xeyir","xeyirli axşamlar","xeyirli axşam",
    "hər vaxtınız xeyir","hər vaxtiniz xeyir","her vaxtiniz xeyir","hər vaxtın xeyir","her vaxtin xeyir","hər vaxtınız xeyir olsun",
    "xeyirli günlər","xeyirli gün","gününüz xeyir","gununuz xeyir","gününüz aydın","gununuz aydin",
    "gününüz uğurlu olsun","gununuz ugurlu olsun","gününüz mübarək","gununuz mubarek",
    "xoş gördük","xos gorduk","xoş gördüm","xos gordum","xoş gəldiniz","xos geldiniz","xoş gəldin","xos geldin",
    "salammm","səəəlam","salammmmm","salam necesiz","salam necəsiz","salam necesen","salam necəsən",
    "necəsiz","necesiz","necəsən","necesen","salam necesiniz","salam necəsiniz",
    "əssəlamu aleykum","essalamu aleykum","assalamu aleykum","aleykum salam","salamun aleykum","allahın salamı olsun",
    "günaydın","gunaydin","s.a","s.a.","sa","s a",
    "hello","hi","hey","good morning","good afternoon","good evening"
  ],
  wellbeing: [
    "necəsən","necesen","necəsiniz","necesiniz","nətərsən","netersen","nətərsiniz","netersiniz",
    "necəsen","necesiz","necə gedir","nece gedir","işlər necədir","isler necedir",
    "hər şey necədir","her sey necedir","hər şey qaydasındadır","her sey qaydasindadir",
    "necəsən indi","necesen indi","indi necəsən","indi necesen",
    "necəsiz","necesiz","necəsiniz indi","necesiniz indi",
    "nə var","ne var","nə xəbər","ne xeber","nə var nə yox","ne var ne yox",
    "nə yenilik var","ne yenilik var","xəbər var","xeber var",
    "vəziyyət necədir","veziyyet necedir","vəziyyət necədi","veziyyet necedi",
    "əhvalın necədir","ehvalin necedir","əhval necədir","ehval necedir",
    "əhvalın necədi","ehvalin necedi","əhval necədi","ehval necedi",
    "hər şey yaxşıdır","her sey yaxsidir","yaxşısan","yaxsisan",
    "yaxşısınız","yaxsisinz","yaxsisin","yaxsisanmi","yaxşısanmı",
    "işlər necə gedir","isler nece gedir","həyat necə gedir","heyat nece gedir",
    "necəsən orda","necesen orda","salamsan","yaxsisanmi",
    "problem yoxdur ki","her sey yaxsidi","her sey yaxsidir"
  ],
  thanks: [
    "təşəkkür","tesekkur","təşəkkür edirəm","tesekkur edirem","çox təşəkkür","cox tesekkur",
    "çox sağ ol","cox sag ol","sağ ol","sag ol","sağ olun","sag olun",
    "sagol","sagolun","sağol","sağolun","sagolun","sag oll","sagolll",
    "minnətdaram","minnetdaram","minnətdar","minnetdar",
    "allah razı olsun","allah razi olsun","var olun","varolun",
    "əhsən","ehsen","super","əla","ela",
    "çox sağ olun","cox sag olun","çox sagol","cox sagol",
    "təşəkkürlər","tesekkurlar","təşəkkürlər edirəm","tesekkurlar edirem",
    "böyük təşəkkür","boyuk tesekkur","dərin təşəkkür","derin tesekkur",
    "çox çox sağ ol","cox cox sag ol","çox çox təşəkkür","cox cox tesekkur",
    "ürəkdən təşəkkür","urekden tesekkur","çox minnətdaram","cox minnetdaram",
    "sağolasınız","sagolasiniz","çox sağolasınız","cox sagolasiniz"
  ],
  goodbye: [
    "hələlik","helelik","hələliklə","helelikle",
    "görüşərik","goruserik","görüşənədək","gorusenedek","görüşənə qədər","gorusene qeder",
    "salamat qal","salamat qalın","salamat qalın","salamat qal","salamat ol",
    "xudahafiz","xuda hafiz","xudahafız","xuda hafız",
    "sağlıqla qal","saglıqla qal","sagliqla qal","sağlıqla",
    "özünə yaxşı bax","ozune yaxsi bax","özünüzə yaxşı baxın","ozunuze yaxsi baxin",
    "görüşənə kimi","gorusene kimi","görüşərik inşallah","goruserik insallah",
    "bye","bay","byee","bye bye","bay bay",
    "çıxıram","cixirəm","getdim","mən getdim","men getdim",
    "yazışarıq","yazisariq","sonra danışarıq","sonra danisariq",
    "ələ sağlıq","ele sagliq","hələlik sağ olun","helelik sag olun",
    "salamatlıqla","sagamatliqla","hələliklik","heleliklik"
  ],
  contact: [
    "əlaqə","elaqe","əlaqə məlumatı","elaqe melumati","əlaqə vasitələri","elaqe vasiteleri",
    "telefon","telefon nömrəsi","telefon nomresi","nömrə","nomre","nömrəniz","nomreniz",
    "mobil nömrə","mobil nomre","əlaqə nömrəsi","elaqe nomresi",
    "whatsapp","vatsap","wp","watsap","whatsap",
    "email","e-mail","mail","gmail","poçt","poct","elektron poçt","elektron poct",
    "ünvan","unvan","adres","address","yeriniz","yeriniz haradadır","harada yerləşir",
    "iş rejimi","is rejimi","iş saatı","is saati","iş saatlarınız","is saatlariniz",
    "qəbul saatı","qebul saati","neçəyə kimi işləyirsiniz","neceye kimi isleyirsiniz",
    "saat neçədə açılırsınız","saat necede acilirsiniz",
    "haradasınız","hardasiniz","haradadır","hardadir","harada yerləşirsiniz",
    "burdasınız","buradasınız","orda haradadır","yeriniz hardadır",
    "əlaqə saxlamaq","elaqe saxlamaq","sizinlə necə əlaqə saxlaya bilərəm",
    "sizinle nece elaqe saxlaya bilerem","əlaqə üçün","elaqe ucun",
    "zəng etmək","zeng etmek","zəng vura bilərəm","zeng vura bilerem",
    "nömrəni verin","nomreni verin","telefonu yazın","telefonu yazin",
    "email ünvanı","email unvani","mail adresi","poçt ünvanı","poct unvani"
  ],
  complaint: [
    "şikayət","sikayet","şikayətim var","sikayetim var","şikayət etmək istəyirəm","sikayet etmek isteyirem",
    "problem","problem var","ciddi problem","texniki problem",
    "qeza","qəza baş verib","qeza bas verib",
    "su gəlmir","su gelmir","su kəsilib","su kesilib","su yoxdur","su yoxdu","su yox","sular kəsilib","sular kesilib",
    "işləmir","islemir","işləmirəm","islemirem","işləmir sistemi","sistem işləmir","sistem islemir",
    "sızma","sizma","su sızır","su sizir","axıntı var","axinti var",
    "nasazlıq","nasazliq","nasazdır","nasazdi","avadanlıq xarabdır","avadanliq xarabdi",
    "təcili","tecili","təcili baxın","tecili baxin","təcili kömək","tecili komek",
    "cavab ala bilmirəm","cavab ala bilmirem","müraciət etmişəm cavab yoxdur","muraciet etmisem cavab yoxdur",
    "gecikir","gecikme var","gecikmə var","vaxtında olunmadı","vaxtinda olunmadi",
    "xidmət zəifdir","xidmet zeifdir","narazıyam","naraziyam",
    "düzəldin","duzeldin","baxın buna","baxin buna","problem həll olunmur","problem hell olunmur",
    "təzyiq yoxdur","tezyiq yoxdur","su zəif gəlir","su zeif gelir",
    "kanalizasiya dolub","kanalizasiya tıxanıb","kanalizasiya tixanib",
    "sayt işləmir","sayt islemir","ödəniş alınmadı","odenis alinmadi"
  ],
  when_fix: [
    "nə vaxt düzələcək","ne vaxt duzelecek","nə vaxt düzəldərsiniz","ne vaxt duzeldersiniz",
    "nə vaxt düzəlir","ne vaxt duzelir","nə vaxt düzələcəkdir","ne vaxt duzelecekdir",
    "nə vaxt gələcəksiniz","ne vaxt geleceksiniz","nə vaxt gəlirsiz","ne vaxt gelirsiz",
    "nə vaxt təmir ediləcək","ne vaxt temir edilecek","nə vaxt təmir","ne vaxt temir",
    "nə vaxt həll olunacaq","ne vaxt hell olunacaq","nə vaxt həll","ne vaxt hell",
    "problem nə vaxt həll olunacaq","problem ne vaxt hell olunacaq",
    "su nə vaxt gələcək","su ne vaxt gelecek","su nə vaxt veriləcək","su ne vaxt verilecek",
    "nə vaxt bərpa olunacaq","ne vaxt berpa olunacaq",
    "iş nə vaxt bitəcək","is ne vaxt bitecek","nə vaxt tamamlanacaq","ne vaxt tamamlanacaq",
    "təxmini nə vaxt","texmini ne vaxt","təxminən nə vaxt","texminen ne vaxt",
    "vaxtını deyin","vaxtini deyin","dəqiq vaxt nədir","deqiq vaxt nedir",
    "bu gün düzələcək","bu gun duzelecek","sabaha həll olunacaq","sabaha hell olunacaq",
    "nece vaxt qalib","ne qədər vaxt qalıb","ne qeder vaxt qalib"
  ]
};

// ====== tiny helpers ======
function norm(t="") {
  return (t||"").toString().toLowerCase().trim();
}
function anyIncludes(q, arr) {
  q = norm(q);
  return arr.some(k => q.includes(k));
}
function tokenize(q) {
  return norm(q)
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}
function extractNumbers(q){
  const m = (q.match(/\d{2,}/g) || []);
  return m;
}

// ====== NEW: loose normalize for better typo tolerance ======
function looseNormalize(s="") {
  return norm(s)
    .replaceAll("ə", "e")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("’", "'")
    .replaceAll("`", "'")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

// ====== NEW: Levenshtein distance ======
function levenshtein(a, b) {
  a = a || ""; b = b || "";
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;

  const dp = Array.from({ length: n + 1 }, (_, i) => Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = (b[i - 1] === a[j - 1])
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j - 1] + 1, dp[i][j - 1] + 1, dp[i - 1][j] + 1);
    }
  }
  return dp[n][m];
}

// ====== NEW: token fuzzy scoring ======
function tokenFuzzyScore(qTok, tTok) {
  if (!qTok || !tTok) return 0;

  // tam uyğunluq
  if (tTok.includes(qTok)) return 8;

  // çox qısa tokenləri fuzzy etmə
  if (qTok.length < 4) return 0;

  const dist = levenshtein(qTok, tTok);
  if (qTok.length <= 6 && dist <= 1) return 5;  // 1 hərf səhv
  if (qTok.length > 6 && dist <= 2) return 4;   // 2 hərf səhv

  // “hərf düşməsi” kimi hallara tolerant subsequence check
  let i = 0, j = 0;
  while (i < qTok.length && j < tTok.length) {
    if (qTok[i] === tTok[j]) i++;
    j++;
  }
  if (i >= qTok.length - 1) return 3;

  return 0;
}

// ====== UI helpers ======
function addNaraMsg(sender, text) {
  const area = document.getElementById('nara-msgs');
  const m = document.createElement('div');
  m.style.cssText = "padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; margin-bottom: 5px; word-wrap: break-word;";
  if(sender === "bot") {
    m.style.background = "#f1f3f5";
    m.style.alignSelf = "flex-start";
    m.style.color = "#333";
    m.style.borderBottomLeftRadius = "2px";
  } else {
    m.style.background = "#004a99";
    m.style.color = "white";
    m.style.alignSelf = "flex-end";
    m.style.borderBottomRightRadius = "2px";
  }
  m.innerHTML = (text || "").toString().replace(/\n/g, "<br>");
  area.appendChild(m);
  area.scrollTop = area.scrollHeight;
  return m;
}

function toggleNara() {
  const chat = document.getElementById('nara-chat');
  chat.style.display = chat.style.display === 'none' ? 'flex' : 'none';
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
      let welcome = NARA_DB?.bot_info?.welcome_messages?.default
        || "Salam! 😊 Mən Nara. Sizə necə kömək edə bilərəm?";
      if (hour < 12) welcome = NARA_DB?.bot_info?.welcome_messages?.morning || welcome;
      else if (hour < 18) welcome = NARA_DB?.bot_info?.welcome_messages?.afternoon || welcome;
      else welcome = NARA_DB?.bot_info?.welcome_messages?.evening || welcome;

      addNaraMsg("bot", welcome);
    }, 700);

  } catch(e) {
    console.error(e);
    addNaraMsg("bot", "Zəhmət olmasa səhifəni yeniləyin.");
  }
}

// ====== Build contact answer from JSON (no uydurma) ======
function contactAnswer() {
  const c = NARA_DB?.bot_info?.contacts || {};
  return `Əlaqə məlumatları:
• Telefon: ${c.phone || "+994202082560"}
• WhatsApp: ${c.whatsapp || "+994709720209"}
• E-mail: ${c.email || "Bardasmsii@rsmx.gov.az"}
• Ünvan: ${c.address || "Bərdə şəhər, S.Zöhrabbəyov küç. 10"}
• İş rejimi: ${c.work_hours || "Bazar ertəsi – Cümə (09:00 – 18:00"}`;
}

// ====== Complaint flow memory (browser-side) ======
function getCase() {
  try { return JSON.parse(localStorage.getItem("nara_case") || "null"); } catch { return null; }
}
function setCase(obj) {
  localStorage.setItem("nara_case", JSON.stringify(obj));
}
function clearCase() {
  localStorage.removeItem("nara_case");
}
function tryExtractLocation(text){
  const t = norm(text);
  const m = t.match(/(.+?)\s(kəndində|kendinde|kəndi|kendi|küçəsində|kucəsində|qəsəbəsində|qesebesinde)/i);
  if (!m) return null;
  return m[1].trim();
}
function tryExtractIssue(text){
  const t = norm(text);
  if (t.includes("sızma") || t.includes("sizma")) return "sızma";
  if (t.includes("su gəlmir") || t.includes("su gelmir") || t.includes("su yoxdu") || t.includes("su yoxdur")) return "su gəlmir";
  if (t.includes("qəza") || t.includes("qeza")) return "qəza";
  if (t.includes("nasaz") || t.includes("işləmir") || t.includes("islemir")) return "nasazlıq";
  return null;
}

// ====== Search best matching sentence across all sheets (strong fuzzy + numbers priority) ======
function findBestAnswer(query) {
  if (!NARA_DB?.data) return null;

  const qRaw = query || "";
  const qLoose = looseNormalize(qRaw);
  const qTokens = tokenize(qLoose);
  const qNums = extractNumbers(qRaw);

  let best = null;

  for (const sheetName of NARA_DB.sheets || []) {
    const items = NARA_DB?.data?.[sheetName]?.items || [];

    for (const it of items) {
      const rawText = it.search_text || "";
      const text = looseNormalize(rawText);
      const textTokens = tokenize(text);

      let score = 0;

      // 1) Full phrase match (strong)
      if (qLoose.length >= 4 && text.includes(qLoose)) score += 40;

      // 2) Number / year / reper match (very strong)
      for (const n of qNums) {
        if (!n) continue;
        if (rawText.includes(n)) score += 30;
      }

      // 3) Token exact match
      for (const tk of qTokens) {
        if (tk.length < 3) continue;
        if (text.includes(tk)) score += 6;
      }

      // 4) Token fuzzy match (typo tolerance)
      for (const tk of qTokens) {
        if (tk.length < 3) continue;

        let bestTok = 0;
        for (const tt of textTokens) {
          const s = tokenFuzzyScore(tk, tt);
          if (s > bestTok) bestTok = s;
          if (bestTok >= 8) break;
        }
        score += bestTok;
      }

      // 5) Village/Address boost
      if (qLoose.includes("kend") || qLoose.includes("kənd") || qLoose.includes("kuc") || qLoose.includes("küç")) score += 2;

      if (!best || score > best.score) best = { score, item: it, sheet: sheetName };
    }
  }

  if (!best || best.score < 12) return null;
  return best;
}

function outOfScopeOrClarify(query) {
  return NARA_DB?.bot_info?.auto_responses?.out_of_scope
    || "Zəhmət olmasa kənd/ünvan və mövzunu (subartezian, kanal/kollektor, şikayət və s.) bir az dəqiqləşdirin.";
}

// ====== Main send ======
function sendToNara() {
  const inp = document.getElementById('nara-input');
  const val = inp.value.trim();
  if(!val) return;

  addNaraMsg("user", val);
  inp.value = "";

  const q = norm(val);

  // 1) pure human intents (NO uydurma, hazır cavablar)
  if (anyIncludes(q, INTENTS.greeting)) {
    return setTimeout(() => addNaraMsg("bot", "Salam 😊 Buyurun, nə ilə kömək edim?"), 300);
  }
  if (anyIncludes(q, INTENTS.wellbeing)) {
    return setTimeout(() => addNaraMsg("bot", "Çox sağ olun, yaxşıyam 😊 Siz necəsiniz? Buyurun, nə lazımdırsa yazın."), 300);
  }
  if (anyIncludes(q, INTENTS.thanks)) {
    return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.thanks || "Siz sağ olun! 😊"), 300);
  }
  if (anyIncludes(q, INTENTS.goodbye)) {
    return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.goodbye || "Hələlik! 😊"), 300);
  }

  // 2) contact intent
  if (anyIncludes(q, INTENTS.contact)) {
    return setTimeout(() => addNaraMsg("bot", contactAnswer()), 350);
  }

  // 3) complaint intent + complaint memory
  const existing = getCase();
  const loc = tryExtractLocation(val);
  const issue = tryExtractIssue(val);

  if (anyIncludes(q, INTENTS.complaint)) {
    const c = NARA_DB?.bot_info?.auto_responses?.complaint
      || "Şikayət və ya probleminizi WhatsApp nömrəmizə şəkil/video ilə göndərə bilərsiniz.";

    const newCase = {
      location: loc || existing?.location || null,
      issue: issue || existing?.issue || null,
      started_at: existing?.started_at || new Date().toISOString()
    };
    setCase(newCase);

    if (!newCase.location || !newCase.issue) {
      return setTimeout(() => addNaraMsg("bot",
        `Başa düşdüm ⚠️\n${c}\n\nBir dəqiqləşdirim: problem haradadır (kənd/ünvan) və nə problemidir? (məs: sızma, su gəlmir, nasazlıq)`), 450);
    }
    return setTimeout(() => addNaraMsg("bot",
      `Qeyd etdim: ${newCase.location} — ${newCase.issue} ⚠️\n${c}\n\nİmkan varsa 1 şəkil/video göndərin — daha tez yönləndirilir.`), 450);
  }

  // “Sızma var” kimi complaint davamı (şikayət sözünü yazmasa da)
  if (issue && !anyIncludes(q, INTENTS.contact)) {
    const c = NARA_DB?.bot_info?.auto_responses?.complaint || "";
    const newCase = { location: loc || existing?.location || null, issue, started_at: existing?.started_at || new Date().toISOString() };
    setCase(newCase);

    if (!newCase.location) {
      return setTimeout(() => addNaraMsg("bot", `Başa düşdüm ⚠️ Sızma ilə bağlıdır. Zəhmət olmasa dəqiq ünvan/kənd yazın.\n\n${c}`), 450);
    }
    return setTimeout(() => addNaraMsg("bot", `Qeyd etdim: ${newCase.location} — ${newCase.issue} ⚠️\n\n${c}`), 450);
  }

  // “Nə vaxt düzələcək?” — əgər case varsa, yönləndir
  if (anyIncludes(q, INTENTS.when_fix) && existing?.location) {
    const ct = contactAnswer();
    return setTimeout(() => addNaraMsg("bot",
      `Başa düşdüm. Dəqiq vaxtı buradan söz vermək çətindir — briqadanın çıxışı yerində baxışdan asılı olur.\n\nAmma prosesi sürətləndirmək üçün WhatsApp-a 1 şəkil/video + qısa ünvan göndərin.\n\n${ct}`), 450);
  }

  // 4) DATABASE SEARCH (uydurma YOX: yalnız bazadakı cümlələr)
const best = findBestAnswer(val);
if (best) {
  clearCase(); // ✅ əvvəlki şikayət (xanərəb) yaddaşını sil
  return setTimeout(() => addNaraMsg("bot", best.item.sentence), 450);
}

  // 5) Not found → clarify (soft)
  return setTimeout(() => addNaraMsg("bot", outOfScopeOrClarify(val)), 450);
}

// Enter dəstəyi
window.addEventListener('load', () => {
  initNara();
  const inputField = document.getElementById('nara-input');
  if(inputField) {
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendToNara();
    });
  }
});
