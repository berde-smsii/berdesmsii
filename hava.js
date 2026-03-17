/* =========================================================
   HAVA.JS

   NƏ EDİR:
   - Cari havanı göstərir
   - Altında 15 günlük hava proqnozu göstərir
   - PC-də soldan sağa avtomatik hərəkət edir
   - Telefonda ölçülər daşmır
   - Telefonda swipe + auto-slide işləyir
   - Blur, shadow, artıq kölgə söndürülür

   BAŞQA RAYONA SATANDA DƏYİŞƏCƏYİN HİSSƏLƏR:
   1) Rayon adı:
      const HAVA_RAYON_ADI = "Bərdə";

   2) Koordinatlar:
      const HAVA_LAT = 40.3758;
      const HAVA_LON = 47.1261;
========================================================= */


/* =========================
   ƏSAS AYARLAR
========================= */
const HAVA_RAYON_ADI = "Bərdə";
const HAVA_LAT = 40.3758;
const HAVA_LON = 47.1261;
const HAVA_GUN_SAYI = 15;
const TELEFON_AUTO_MS = 1000;
const PC_PIXEL_STEP = 1;
const PC_INTERVAL_MS = 20;


/* =========================
   ƏGƏR LAZIMDIRSA MENYU FUNKSİYASI
   Əgər bunlar səndə başqa JS-də artıq varsa,
   burada saxlamağa ehtiyac yoxdur.
========================= */
function openNav() {
    const el = document.getElementById("sideNav");
    if (el) el.style.width = "280px";
}

function closeNav() {
    const el = document.getElementById("sideNav");
    if (el) el.style.width = "0";
}


/* =========================
   STILLƏR
   Burada həm blur, həm shadow söndürülür
========================= */
(function havaStilləriniElaveEt() {
    if (document.getElementById("hava-js-stil")) return;

    const style = document.createElement("style");
    style.id = "hava-js-stil";
    style.textContent = `
        #temp,
        #forecastMount,
        #forecastMount *,
        .hava-forecast-section,
        .hava-forecast-slider,
        .hava-forecast-track,
        .hava-forecast-card {
            box-sizing: border-box;
            box-shadow: none !important;
            filter: none !important;
            backdrop-filter: none !important;
            text-shadow: none !important;
        }

        #temp {
            display: block;
            width: 100%;
            max-width: 100%;
            margin: 0 0 8px 0;
        }

        #forecastMount {
            display: block;
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            margin: 0;
            padding: 0;
        }

        .hava-forecast-section {
            width: 100%;
            max-width: 100%;
            background: #ffffff !important;
            border: 1px solid #d9e8f5;
            border-radius: 8px;
            padding: 4px;
            margin: 0;
            overflow: hidden;
        }

        .hava-forecast-slider {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            scroll-behavior: smooth;
            user-select: none;
            touch-action: pan-x;
            background: transparent !important;
        }

        .hava-forecast-slider::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
        }

        .hava-forecast-track {
            display: flex;
            align-items: center;
            gap: 6px;
            width: max-content;
            min-width: 100%;
            padding: 0;
            margin: 0;
            background: transparent !important;
        }

        .hava-forecast-card {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 32px;
            min-width: 92px;
            padding: 4px 8px;
            border: 1px solid #d7e6f3;
            border-radius: 7px;
            background: #ffffff !important;
            overflow: hidden;
            flex: 0 0 auto;
        }

        .hava-forecast-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            white-space: nowrap;
            line-height: 1;
        }

        .hava-forecast-date {
            font-size: 11px;
            font-weight: 700;
            color: #1b4f7a;
        }

        .hava-forecast-icon {
            font-size: 13px;
            line-height: 1;
        }

        .hava-forecast-temp {
            font-size: 11px;
            font-weight: 700;
            color: #163c63;
        }

        /* PC üçün pro görünüş */
        @media (min-width: 769px) {
            .hava-forecast-section {
                padding: 5px;
            }

            .hava-forecast-track {
                gap: 7px;
            }

            .hava-forecast-card {
                min-width: 98px;
                height: 34px;
                padding: 4px 10px;
            }

            .hava-forecast-date,
            .hava-forecast-temp {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 14px;
            }
        }

        /* Tablet və telefon */
        @media (max-width: 768px) {
            #forecastMount {
                overflow: hidden;
            }

            .hava-forecast-section {
                padding: 4px;
                border-radius: 8px;
            }

            .hava-forecast-slider {
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-track {
                gap: 6px;
                min-width: max-content;
                width: max-content;
            }

            .hava-forecast-card {
                width: 132px;
                min-width: 132px;
                max-width: 132px;
                height: 34px;
                padding: 4px 8px;
                scroll-snap-align: start;
            }

            .hava-forecast-row {
                gap: 6px;
            }

            .hava-forecast-date,
            .hava-forecast-temp {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 13px;
            }
        }

        /* Kiçik telefonlar */
        @media (max-width: 480px) {
            .hava-forecast-card {
                width: 122px;
                min-width: 122px;
                max-width: 122px;
                height: 33px;
                padding: 4px 7px;
            }

            .hava-forecast-row {
                gap: 5px;
            }

            .hava-forecast-date,
            .hava-forecast-temp {
                font-size: 10px;
            }

            .hava-forecast-icon {
                font-size: 12px;
            }
        }

        /* Çox balaca ekranlar */
        @media (max-width: 360px) {
            .hava-forecast-card {
                width: 114px;
                min-width: 114px;
                max-width: 114px;
                height: 32px;
                padding: 3px 6px;
            }

            .hava-forecast-date,
            .hava-forecast-temp {
                font-size: 10px;
            }

            .hava-forecast-icon {
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);
})();


/* =========================
   TARİX
========================= */
function havaQisaTarix(dateStr) {
    const date = new Date(dateStr);
    const aylar = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
    return `${date.getDate()} ${aylar[date.getMonth()]}`;
}


/* =========================
   HAVA KODU -> İKON
========================= */
function havaMelumatiniTap(code, isDay = 1) {
    if (code === 0) {
        return { icon: isDay ? "☀️" : "🌙", text: isDay ? "Günəşli" : "Gecə" };
    }
    if (code >= 1 && code <= 3) return { icon: "⛅", text: "Buludlu" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Duman" };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: "🌧️", text: "Yağış" };
    if (code >= 71 && code <= 77) return { icon: "❄️", text: "Qar" };
    if (code >= 95) return { icon: "⛈️", text: "Fırtına" };
    return { icon: "🌤️", text: "Hava" };
}


/* =========================
   CARİ HAVA
========================= */
async function cariHavaniGetir() {
    const tempElement = document.getElementById("temp");
    if (!tempElement) return;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.current_weather) {
            tempElement.innerText = "🌡️ Məlumat yoxdur";
            return;
        }

        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        const isDay = data.current_weather.is_day;
        const hava = havaMelumatiniTap(code, isDay);

        tempElement.innerText = `${hava.text} ${hava.icon} ${temp}°C`;
    } catch (error) {
        tempElement.innerText = "🌡️ Məlumat yoxdur";
        console.error("Cari hava xətası:", error);
    }
}


/* =========================
   KONTEYNER QUR
========================= */
function proqnozKonteyneriniHazirla() {
    const mount = document.getElementById("forecastMount");
    if (!mount) return null;

    mount.innerHTML = `
        <div class="hava-forecast-section">
            <div class="hava-forecast-slider" id="forecastSlider">
                <div class="hava-forecast-track" id="forecastTrack"></div>
            </div>
        </div>
    `;

    return {
        slider: document.getElementById("forecastSlider"),
        track: document.getElementById("forecastTrack")
    };
}


/* =========================
   15 GÜNLÜK PROQNOZ
========================= */
async function proqnozuGetir() {
    const konteyner = proqnozKonteyneriniHazirla();
    if (!konteyner) return;

    const { track } = konteyner;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${HAVA_GUN_SAYI}&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.daily || !data.daily.time) {
            track.innerHTML = `<div style="padding:6px;font-size:12px;color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
            return;
        }

        const dates = data.daily.time;
        const codes = data.daily.weather_code;
        const maxTemps = data.daily.temperature_2m_max;
        const minTemps = data.daily.temperature_2m_min;

        track.innerHTML = "";

        for (let i = 0; i < dates.length; i++) {
            const hava = havaMelumatiniTap(codes[i], 1);

            const card = document.createElement("div");
            card.className = "hava-forecast-card";
            card.innerHTML = `
                <div class="hava-forecast-row">
                    <span class="hava-forecast-date">${havaQisaTarix(dates[i])}</span>
                    <span class="hava-forecast-icon">${hava.icon}</span>
                    <span class="hava-forecast-temp">${Math.round(maxTemps[i])}°/${Math.round(minTemps[i])}°</span>
                </div>
            `;
            track.appendChild(card);
        }

        proqnozSlideriniAktivEt();
    } catch (error) {
        track.innerHTML = `<div style="padding:6px;font-size:12px;color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
        console.error("15 günlük hava proqnozu xətası:", error);
    }
}


/* =========================
   SLIDER
   PC: soldan sağa avtomatik hərəkət
   Telefon: swipe + auto-slide
========================= */
function proqnozSlideriniAktivEt() {
    const slider = document.getElementById("forecastSlider");
    const track = document.getElementById("forecastTrack");
    if (!slider || !track) return;

    const cards = track.querySelectorAll(".hava-forecast-card");
    if (!cards.length) return;

    let mouseDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let phoneAuto = null;
    let pcAuto = null;
    let currentIndex = 0;

    function kartAddimi() {
        const firstCard = cards[0];
        const gap = parseInt(window.getComputedStyle(track).gap) || 0;
        return firstCard.offsetWidth + gap;
    }

    function scrollToIndex(index) {
        const step = kartAddimi();
        const maxIndex = cards.length - 1;

        if (index > maxIndex) index = 0;
        if (index < 0) index = maxIndex;

        currentIndex = index;
        slider.scrollTo({
            left: step * currentIndex,
            behavior: "smooth"
        });
    }

    function phoneAutoBaslat() {
        phoneAutoDayandir();
        if (window.innerWidth <= 768) {
            phoneAuto = setInterval(() => {
                scrollToIndex(currentIndex + 1);
            }, TELEFON_AUTO_MS);
        }
    }

    function phoneAutoDayandir() {
        if (phoneAuto) {
            clearInterval(phoneAuto);
            phoneAuto = null;
        }
    }

    function pcAutoBaslat() {
        pcAutoDayandir();
        if (window.innerWidth > 768) {
            pcAuto = setInterval(() => {
                slider.scrollLeft += PC_PIXEL_STEP;

                const maxScroll = slider.scrollWidth - slider.clientWidth;
                if (slider.scrollLeft >= maxScroll) {
                    slider.scrollLeft = 0;
                }
            }, PC_INTERVAL_MS);
        }
    }

    function pcAutoDayandir() {
        if (pcAuto) {
            clearInterval(pcAuto);
            pcAuto = null;
        }
    }

    function herSeYiBaslat() {
        phoneAutoBaslat();
        pcAutoBaslat();
    }

    function herSeYiDayandir() {
        phoneAutoDayandir();
        pcAutoDayandir();
    }

    slider.addEventListener("scroll", () => {
        const step = kartAddimi();
        if (step > 0) currentIndex = Math.round(slider.scrollLeft / step);
    }, { passive: true });

    slider.addEventListener("mousedown", (e) => {
        mouseDown = true;
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        herSeYiDayandir();
    });

    slider.addEventListener("mouseleave", () => {
        mouseDown = false;
        herSeYiBaslat();
    });

    slider.addEventListener("mouseup", () => {
        mouseDown = false;
        herSeYiBaslat();
    });

    slider.addEventListener("mousemove", (e) => {
        if (!mouseDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.1;
        slider.scrollLeft = scrollLeft - walk;
    });

    slider.addEventListener("touchstart", () => {
        herSeYiDayandir();
    }, { passive: true });

    slider.addEventListener("touchend", () => {
        const step = kartAddimi();
        if (step > 0) currentIndex = Math.round(slider.scrollLeft / step);
        herSeYiBaslat();
    }, { passive: true });

    window.addEventListener("resize", () => {
        herSeYiBaslat();
    });

    herSeYiBaslat();
}


/* =========================
   BAŞLAT
========================= */
document.addEventListener("DOMContentLoaded", function () {
    cariHavaniGetir();
    proqnozuGetir();
});
