// ==========================================
// NARA JSON ÜÇÜN SCRİPT KODLARI (Stabil Versiya)
// ==========================================

let NARA_DB = null;

// ====== İNTENT SİYAHISI (Söz qrupları) ======
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
        "salammm","səəəlam","salammmmm","əssəlamu aleykum","essalamu aleykum","assalamu aleykum","aleykum salam",
        "salamun aleykum","allahın salamı olsun","günaydın","gunaydin","s.a","s.a.","sa","s a",
        "hello","hi","hey","good morning","good afternoon","good evening"
    ],
    wellbeing: [
        "necəsən","necesen","necəsiniz","necesiniz","nətərsən","netersen","nətərsiniz","netersiniz",
        "necəsen","necesiz","necə gedir","nece gedir","işlər necədir","isler necedir",
        "hər şey necədir","her sey necedir","hər şey qaydasındadır","her sey qaydasindadir",
        "necəsən indi","necesen indi","indi necəsən","indi necesen",
        "nə var","ne var","nə xəbər","ne xeber","nə var nə yox","ne var ne yox",
        "nə yenilik var","ne yenilik var","xəbər var","xeber var",
        "vəziyyət necədir","veziyyet necedir","əhvalın necədir","ehvalin necedir",
        "hər şey yaxşıdır","her sey yaxsidir","yaxşısan","yaxsisan","yaxşısınız","yaxsisanmi",
        "işlər necə gedir","heyat nece gedir","salam necesiz","salam necəsiz","salam necəsən","salam necesen"
    ],
    thanks: [
        "əla", "ela", "təşəkkür","tesekkur","təşəkkür edirəm","tesekkur edirem","çox təşəkkür","cox tesekkur",
        "çox sağ ol","cox sag ol","sağ ol","sag ol","sağ olun","sag olun",
        "sagol","sagolun","sağol","sağolun","minnətdaram","minnetdaram","var olun","varolun",
        "əhsən","super","çox yaxşı","təşəkkürlər","tesekkurlar"
    ],
    goodbye: [
        "hələlik","helelik","görüşərik","goruserik","görüşənədək","gorusenedek",
        "salamat qal","salamat qalın","xudahafiz","xuda hafiz","sağlıqla qal","bye","bay"
    ],
    contact: [
        "əlaqə","elaqe","əlaqə məlumatı","elaqe melumati","telefon","nömrə","nomre","whatsapp","vatsap","wp",
        "email","e-mail","mail","ünvan","unvan","adres","yeriniz","harada yerləşir","iş rejimi","is rejimi"
    ],
    complaint: [
        "şikayət","sikayet","şikayətim var","problem","qeza","qəza","su gəlmir","su gelmir","su kəsilib",
        "su kesilib","sızma","sizma","nasazlıq","nasazliq","təcili","tecili"
    ],
    when_fix: [
        "nə vaxt düzələcək","ne vaxt duzelecek","nə vaxt gələcəksiniz","ne vaxt geleceksiniz",
        "nə vaxt təmir","su nə vaxt gələcək","ne vaxt hell olunacaq"
    ]
};

// ====== KÖMƏKÇİ FUNKSİYALAR (Helpers) ======
function norm(t = "") {
    return (t || "").toString().toLowerCase().trim();
}

/**
 * Bu funksiya artıq daha dəqiq işləyir. 
 * Sözün hər hansı bir hissəsini yox, tam sözün özünü tapır.
 */
function anyIncludes(q, arr) {
    q = norm(q);
    // Cümləni sözlərə bölürük
    const tokens = q.split(/[^\p{L}\p{N}]+/gu).filter(Boolean);
    
    return arr.some(intentPhrase => {
        const phrase = norm(intentPhrase);
        // Əgər intent bir neçə sözdən ibarətdirsə (məs: "sabahınız xeyir")
        if (phrase.includes(" ")) {
            return q.includes(phrase);
        }
        // Əgər tək sözdürsə (məs: "əla"), tam söz uyğunluğunu yoxla
        return tokens.includes(phrase);
    });
}

function tokenize(q) {
    return norm(q).replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter(Boolean);
}

function extractNumbers(q) {
    return (q.match(/\d{2,}/g) || []);
}

function looseNormalize(s = "") {
    return norm(s)
        .replaceAll("ə", "e").replaceAll("ı", "i")
        .replaceAll("ö", "o").replaceAll("ü", "u")
        .replaceAll("ş", "s").replaceAll("ç", "c")
        .replaceAll("ğ", "g").replaceAll("’", "'")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

function levenshtein(a, b) {
    const m = a.length, n = b.length;
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
    if (tTok === qTok) return 10;
    if (tTok.includes(qTok)) return 7;
    const dist = levenshtein(qTok, tTok);
    if (qTok.length > 4 && dist <= 1) return 5;
    return 0;
}

// ====== UI FUNKSİYALARI ======
function addNaraMsg(sender, text) {
    const area = document.getElementById('nara-msgs');
    if (!area) return;
    const m = document.createElement('div');
    m.style.cssText = "padding: 12px 16px; border-radius: 15px; font-size: 14px; max-width: 85%; line-height: 1.5; margin-bottom: 5px; word-wrap: break-word; align-self: " + (sender === "bot" ? "flex-start" : "flex-end") + "; background: " + (sender === "bot" ? "#f1f3f5" : "#004a99") + "; color: " + (sender === "bot" ? "#333" : "white") + "; border-bottom-" + (sender === "bot" ? "left" : "right") + "-radius: 2px;";
    m.innerHTML = (text || "").toString().replace(/\n/g, "<br>");
    area.appendChild(m);
    area.scrollTop = area.scrollHeight;
}

// ====== BAZA VƏ LOGİKA ======
async function initNara() {
    try {
        const res = await fetch('Nara_Bot_Database.json', { cache: "no-store" });
        NARA_DB = await res.json();
        const hour = new Date().getHours();
        let welcome = NARA_DB?.bot_info?.welcome_messages?.default || "Salam! 😊 Mən Nara. Sizə necə kömək edə bilərəm?";
        addNaraMsg("bot", welcome);
    } catch (e) { console.error("Nara Init Error:", e); }
}

function contactAnswer() {
    const c = NARA_DB?.bot_info?.contacts || {};
    return `Əlaqə məlumatları:\n• Telefon: ${c.phone || "+994202082560"}\n• WhatsApp: ${c.whatsapp || "+994709720209"}\n• E-mail: ${c.email || "Bardasmsii@rsmx.gov.az"}\n• Ünvan: ${c.address || "Bərdə şəhər, S.Zöhrabbəyov küç. 10"}\n• İş rejimi: Bazar ertəsi – Cümə (09:00 – 18:00)`;
}

// Memory functions
function getCase() { try { return JSON.parse(localStorage.getItem("nara_case")); } catch { return null; } }
function setCase(obj) { localStorage.setItem("nara_case", JSON.stringify(obj)); }
function clearCase() { localStorage.removeItem("nara_case"); }

// Search Engine
function findBestAnswer(query) {
    if (!NARA_DB?.data || !NARA_DB?.sheets) return null;
    const qLoose = looseNormalize(query);
    const qTokens = tokenize(qLoose);
    let best = null;

    for (const sheetName of NARA_DB.sheets) {
        const items = NARA_DB.data[sheetName]?.items || [];
        for (const it of items) {
            const text = looseNormalize(it.search_text || "");
            let score = 0;
            if (text === qLoose) score += 50;
            else if (text.includes(qLoose)) score += 20;

            for (const tk of qTokens) {
                if (tk.length < 3) continue;
                if (text.includes(tk)) score += 5;
            }
            if (!best || score > best.score) best = { score, item: it };
        }
    }
    return (best && best.score >= 15) ? best : null;
}

// ====== ƏSAS ÇAT FUNKSİYASI ======
function sendToNara() {
    const inp = document.getElementById('nara-input');
    const val = inp.value.trim();
    if (!val) return;

    addNaraMsg("user", val);
    inp.value = ""; 

    const q = norm(val);
    const existing = getCase();

    // 1. ƏLAQƏ
    if (anyIncludes(q, INTENTS.contact)) {
        return setTimeout(() => addNaraMsg("bot", contactAnswer()), 350);
    }

    // 2. NECƏSƏN (Salamdan əvvəl yoxlayırıq ki, salam cavabı verməsin)
    if (anyIncludes(q, INTENTS.wellbeing)) {
        return setTimeout(() => addNaraMsg("bot", "Çox sağ olun, yaxşıyam 😊 Siz necəsiniz? Buyurun, nə lazımdırsa yazın."), 350);
    }

    // 3. SALAMLAŞMA
    if (anyIncludes(q, INTENTS.greeting)) {
        return setTimeout(() => addNaraMsg("bot", "Salam 😊 Buyurun, nə ilə kömək edim?"), 350);
    }

    // 4. TƏŞƏKKÜR (Burada "Əla" sözü tam söz kimi yoxlanılır)
    if (anyIncludes(q, INTENTS.thanks)) {
        return setTimeout(() => addNaraMsg("bot", NARA_DB?.bot_info?.auto_responses?.thanks || "Siz sağ olun! 😊"), 350);
    }

    // 5. PROBLEM / ŞİKAYƏT
    if (anyIncludes(q, INTENTS.complaint)) {
        return setTimeout(() => addNaraMsg("bot", "Şikayətinizi qeyd edin. Zəhmət olmasa kənd/ünvan bildirin."), 450);
    }

    // 6. SAĞOLALŞMA
    if (anyIncludes(q, INTENTS.goodbye)) {
        return setTimeout(() => addNaraMsg("bot", "Hələlik! 😊"), 350);
    }

    // 7. BAZADA AXTARIŞ (Əgər yuxarıdakıların heç biri deyilsə)
    const best = findBestAnswer(val);
    if (best) {
        return setTimeout(() => addNaraMsg("bot", best.item.sentence), 450);
    }

    // 8. TAPILMADI
    return setTimeout(() => addNaraMsg("bot", "Başa düşmədim. Zəhmət olmasa kənd adı və ya mövzunu (su, kanal, əlaqə) yazın."), 450);
}

document.addEventListener('DOMContentLoaded', () => {
    initNara();
    document.getElementById('nara-input').addEventListener('keypress', (e) => { if (e.key === 'Enter') sendToNara(); });
});
