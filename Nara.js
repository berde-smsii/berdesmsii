// ==========================================
// NARA JSON ÜÇÜN SCRİPT KODLARI (Təkmilləşdirilmiş Versiya)
// ==========================================

let NARA_DB = null;

// ====== INTENT WORD LIST (Sənin siyahın tam qorundu) ======
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

// ====== HELPERS ======
function norm(t="") {
    return (t||"").toString().toLowerCase().trim();
}

/**
 * anyIncludes: Tam söz yoxlaması edir. 
 * Məsələn: "əlaqə" içində "əla" axtaranda artıq səhv cavab verməyəcək.
 */
function anyIncludes(q, arr) {
    q = norm(q);
    const tokens = q.split(/[^\p{L}\p{N}]+/gu).filter(Boolean);
    return arr.some(k => {
        const key = norm(k);
        if (key.includes(" ")) return q.includes(key); // Söz birləşməsidirsə (sabahın xeyir)
        return tokens.includes(key); // Tək sözdürsə tam uyğunluq
    });
}

function tokenize(q) {
    return norm(q).replace(/[^\p{L}\p{N}\s-]/gu, " ").split(/\s+/).filter(Boolean);
}

function extractNumbers(q){
    return (q.match(/\d{2,}/g) || []);
}

function looseNormalize(s="") {
    return norm(s)
        .replaceAll("ə", "e").replaceAll("ı", "i")
        .replaceAll("ö", "o").replaceAll("ü", "u")
        .replaceAll("ş", "s").replaceAll("ç", "c")
        .replaceAll("ğ", "g")
        .replaceAll("’", "'").replaceAll("`", "'")
        .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

function levenshtein(a, b) {
    a = a || ""; b = b || "";
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
    return 0;
}

// ====== UI FUNCTIONS ======
function addNaraMsg(sender, text) {
    const area = document.getElementById('nara-msgs');
    if(!area) return;
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
    return m;
}

// ====== LOGIC & DATABASE ======
async function initNara() {
    try {
        const res = await fetch('Nara_Bot_Database.json', { cache: "no-store" });
        NARA_DB = await res.json();
        setTimeout(() => {
            const chatBox = document.getElementById('nara-chat');
            if(chatBox) chatBox.style.display = 'flex';
            addNaraMsg("bot", "Salam! 😊 Mən Nara. Sizə necə kömək edə bilərəm?");
        }, 700);
    } catch(e) { console.error(e); }
}

function findBestAnswer(query) {
    if (!NARA_DB?.data) return null;
    const qLoose = looseNormalize(query);
    const qTokens = tokenize(qLoose);
    const qNums = extractNumbers(query);
    let best = null;

    for (const sheetName of NARA_DB.sheets || []) {
        const items = NARA_DB.data[sheetName]?.items || [];
        for (const it of items) {
            const text = looseNormalize(it.search_text || "");
            const textTokens = tokenize(text);
            let score = 0;

            if (qLoose.length >= 4 && text.includes(qLoose)) score += 40;
            for (const n of qNums) { if (it.search_text.includes(n)) score += 30; }
            for (const tk of qTokens) {
                if (tk.length < 3) continue;
                if (text.includes(tk)) score += 6;
                for (const tt of textTokens) {
                    const s = tokenFuzzyScore(tk, tt);
                    if (s > 0) score += s;
                }
            }
            if (!best || score > best.score) best = { score, item: it };
        }
    }
    return (best && best.score >= 12) ? best : null;
}

function contactAnswer() {
    const c = NARA_DB?.bot_info?.contacts || {};
    return `Əlaqə məlumatları:\n• Telefon: ${c.phone || "+994202082560"}\n• WhatsApp: ${c.whatsapp || "+994709720209"}\n• E-mail: ${c.email || "Bardasmsii@rsmx.gov.az"}`;
}

// ====== MAIN FLOW ======
function sendToNara() {
    const inp = document.getElementById('nara-input');
    const val = inp.value.trim();
    if(!val) return;

    addNaraMsg("user", val);
    inp.value = "";
    const q = norm(val);

    // 1. Öncə bazada axtarış (Kənd adları və s. üçün)
    const best = findBestAnswer(val);
    if (best) return setTimeout(() => addNaraMsg("bot", best.item.sentence), 400);

    // 2. İnsan intentləri
    if (anyIncludes(q, INTENTS.contact)) return setTimeout(() => addNaraMsg("bot", contactAnswer()), 350);
    if (anyIncludes(q, INTENTS.greeting)) return setTimeout(() => addNaraMsg("bot", "Salam 😊 Buyurun, nə ilə kömək edim?"), 300);
    if (anyIncludes(q, INTENTS.wellbeing)) return setTimeout(() => addNaraMsg("bot", "Yaxşıyam, çox sağ olun! Sizə necə kömək edə bilərəm?"), 300);
    if (anyIncludes(q, INTENTS.thanks)) return setTimeout(() => addNaraMsg("bot", "Siz sağ olun! 😊"), 300);
    if (anyIncludes(q, INTENTS.goodbye)) return setTimeout(() => addNaraMsg("bot", "Hələlik! 😊"), 300);

    // 3. Heç nə tapılmadıqda
    return setTimeout(() => addNaraMsg("bot", "Zəhmət olmasa kənd adını və ya mövzunu dəqiqləşdirin."), 450);
}

window.addEventListener('load', () => {
    initNara();
    const inputField = document.getElementById('nara-input');
    if(inputField) {
        inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendToNara(); });
    }
});
