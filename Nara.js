/**
 * NARA SMART CHATBOT - ENTERPRISE EDITION
 * EmailJS Şablon Dəyişənləri: full_name, fin_code, id_card, phone, email, app_type, subject, address, message, order_id
 */

let NARA_DB = null;
let currentStep = localStorage.getItem("nara_step") || "idle"; 
let formData = JSON.parse(localStorage.getItem("nara_form")) || {};

// ====== EMAILJS KONFİQURASİYA ======
const EMAILJS_CONFIG = {
    serviceID: "service_l4gqfcz",
    templateID: "template_3i1yl1e",
    publicKey: "tatcA8fFwhzTeu39T"
};

// ====== İNSANİ İFADƏLƏR ======
const INTENTS = {
    greeting: ["salam", "slm", "sabahınız xeyir", "axşamınız xeyir", "hər vaxtınız xeyir", "merhaba"],
    thanks: ["təşəkkür", "çox sağ ol", "sağ olun", "minnətdaram"],
    goodbye: ["hələlik", "sağ olun", "bye", "görüşənədək"]
};

// ====== MƏLUMAT TOPLAMA ADDIMLARI ======
const FORM_STEPS = {
    full_name: "Zəhmət olmasa tam **Ad, Soyad və Ata adınızı** daxil edin:",
    fin_code: "Şəxsiyyət vəsiqənizin **FİN kodunu** daxil edin (7 rəqəmli):",
    id_card: "Şəxsiyyət vəsiqənizin **Seriya və Nömrəsini** daxil edin (məs: AZE12345678):",
    phone: "Sizinlə əlaqə üçün **Telefon nömrənizi** yazın:",
    email: "Müraciət statusu üçün **E-poçt ünvanınızı** daxil edin:",
    app_type: "Müraciətin növünü seçin (Ərizə, Şikayət və ya Təklif):",
    address: "Yaşadığınız **Ünvanı və ya Kəndi** qeyd edin:",
    subject: "Müraciətinizin **Mövzusunu** (subartezian, su sızması və s.) yazın:",
    message: "Son olaraq, **Müraciətinizin tam mətnini** daxil edin:",
    confirm: "Bütün məlumatlar doğrudurmu? (Bəli / Xeyr)"
};

// ====== MESAJ SƏSİ VƏ UI ======
const msgSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');

function addNaraMsg(sender, text) {
    const area = document.getElementById('nara-msgs');
    if(sender === "bot") showTyping();

    setTimeout(() => {
        removeTyping();
        const m = document.createElement('div');
        m.style.cssText = `padding: 12px 16px; border-radius: 18px; font-size: 14px; max-width: 85%; line-height: 1.5; margin-bottom: 8px; align-self: ${sender === 'bot' ? 'flex-start' : 'flex-end'}; background: ${sender === 'bot' ? '#f1f3f5' : '#004a99'}; color: ${sender === 'bot' ? '#333' : 'white'}; border-bottom-${sender === 'bot' ? 'left' : 'right'}-radius: 2px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); animation: naraSlide 0.3s ease;`;
        
        m.innerHTML = text.replace(/\n/g, "<br>");
        area.appendChild(m);
        area.scrollTop = area.scrollHeight;
        if(sender === "bot") msgSound.play().catch(() => {});
    }, sender === "bot" ? 600 : 0);
}

function showTyping() {
    const area = document.getElementById('nara-msgs');
    const t = document.createElement('div');
    t.id = "nara-typing";
    t.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    t.style.cssText = "display: flex; gap: 4px; padding: 12px; background: #f1f3f5; width: 50px; border-radius: 15px; margin-bottom: 10px;";
    area.appendChild(t);
    area.scrollTop = area.scrollHeight;
}

function removeTyping() {
    const t = document.getElementById('nara-typing');
    if(t) t.remove();
}

// ====== FORMUN İDARƏ EDİLMƏSİ ======
function processForm(input) {
    const steps = Object.keys(FORM_STEPS);
    const lowInput = input.toLowerCase();

    if (currentStep === "idle") {
        currentStep = "full_name";
        addNaraMsg("bot", "Elektron müraciət sisteminə xoş gəldiniz. Başlayaq!\n\n" + FORM_STEPS.full_name);
        saveState();
        return;
    }

    // Cari addımdakı məlumatı yadda saxla
    formData[currentStep] = input;

    // Növbəti addıma keçid
    let currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
        currentStep = steps[currentIndex + 1];
        addNaraMsg("bot", FORM_STEPS[currentStep]);
    } 
    
    // Təsdiq mərhələsi
    if (currentStep === "confirm") {
        if (lowInput.includes("bəli") || lowInput.includes("he") || lowInput.includes("beli")) {
            sendEmail();
        } else if (lowInput.includes("xeyr") || lowInput.includes("yox")) {
            addNaraMsg("bot", "Müraciət ləğv olundu. Yeni müraciət üçün 'Salam' yaza bilərsiniz.");
            resetForm();
        }
    }
    saveState();
}

function saveState() {
    localStorage.setItem("nara_step", currentStep);
    localStorage.setItem("nara_form", JSON.stringify(formData));
}

function resetForm() {
    currentStep = "idle";
    formData = {};
    localStorage.removeItem("nara_step");
    localStorage.removeItem("nara_form");
}

// ====== EMAILJS GÖNDƏRİŞİ (Şablon dəyişənləri ilə) ======
function sendEmail() {
    addNaraMsg("bot", "Müraciətiniz sistem tərəfindən emal olunur... ⏳");
    
    // Unikal Müraciət ID yaratmaq (məs: B-2026-X)
    const order_id = "B-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 9000 + 1000);

    const emailParams = {
        full_name: formData.full_name,
        fin_code: formData.fin_code,
        id_card: formData.id_card,
        phone: formData.phone,
        email: formData.email,
        app_type: formData.app_type,
        subject: formData.subject,
        address: formData.address,
        message: formData.message,
        order_id: order_id
    };

    emailjs.send(EMAILJS_CONFIG.serviceID, EMAILJS_CONFIG.templateID, emailParams, EMAILJS_CONFIG.publicKey)
    .then(() => {
        addNaraMsg("bot", `✅ Təşəkkür edirik! Müraciətiniz uğurla göndərildi.\n🆔 Müraciət ID: **${order_id}**\n📍 Məlumatlar berde.smsii.09@gmail.com ünvanına yönləndirildi.`);
        resetForm();
    })
    .catch((err) => {
        addNaraMsg("bot", "❌ Texniki xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
        console.error("EmailJS Error:", err);
    });
}

// ====== BAZA VƏ ANA FUNKSİYA ======
async function initNara() {
    try {
        const res = await fetch('Nara_Bot_Database.json', { cache: "no-store" });
        NARA_DB = await res.json();
        if (currentStep !== "idle") {
            addNaraMsg("bot", "Müraciət qeydiyyatı davam edir...");
            addNaraMsg("bot", FORM_STEPS[currentStep]);
        }
    } catch(e) { console.error("Database error:", e); }
}

function findAnswer(query) {
    if (!NARA_DB || !NARA_DB.data) return null;
    let q = query.toLowerCase();
    for (let sheet of NARA_DB.sheets || []) {
        let match = NARA_DB.data[sheet]?.items.find(i => q.includes(i.search_text.toLowerCase()) || i.search_text.toLowerCase().includes(q));
        if (match) return match.sentence;
    }
    return null;
}

window.sendToNara = function() {
    const inp = document.getElementById('nara-input');
    const val = inp.value.trim();
    if(!val) return;

    addNaraMsg("user", val);
    inp.value = "";

    const lowVal = val.toLowerCase();

    // Sağollaşma
    if (INTENTS.goodbye.some(k => lowVal.includes(k))) {
        resetForm();
        return addNaraMsg("bot", "Hələlik! Sağlam qalın. 😊");
    }

    // Form prosesi
    if (currentStep !== "idle" || INTENTS.greeting.some(k => lowVal.includes(k))) {
        return processForm(val);
    }

    // Bazada sual-cavab
    const ans = findAnswer(val);
    if (ans) return addNaraMsg("bot", ans);

    addNaraMsg("bot", "Sizi anlamaqda çətinlik çəkirəm. Müraciət etmək üçün 'Salam' yazın.");
}

// Stil əlavələri
const style = document.createElement('style');
style.innerHTML = `
    @keyframes naraSlide { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    .typing-dot { width: 6px; height: 6px; background: #999; border-radius: 50%; animation: typing 1s infinite; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing { 0%, 100% { transform:translateY(0); } 50% { transform:translateY(-5px); } }
`;
document.head.appendChild(style);

window.onload = initNara;
