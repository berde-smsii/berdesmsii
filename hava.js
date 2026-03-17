/* =========================================================
   HAVA.JS

   BU FAYL NƏ EDİR?
   - Bərdə üçün cari havanı göstərir
   - Altında 10 günlük hava proqnozu göstərir
   - PC-də soldan sağa tam oturur
   - Telefonda sürüşür və barmaqla idarə olunur
   - Telefonda 1 saniyədən bir avtomatik sürüşür
   - Başlıq yoxdur
   - Kölgə yoxdur
   - Minimal və rəsmi görünüşdədir

   GƏLƏCƏKDƏ BAŞQA RAYONA SATANDA DƏYİŞƏCƏK HİSSƏLƏR:
   1) Rayon adı:
      const HAVA_RAYON_ADI = "Bərdə";

   2) Rayon koordinatları:
      const HAVA_LAT = 40.3758;
      const HAVA_LON = 47.1261;

   3) Gün sayı:
      const HAVA_GUN_SAYI = 10;

   QALAN HİSSƏLƏR ÇOX VAXT DƏYİŞMİR
========================================================= */


/* =========================
   AYARLAR
========================= */
const HAVA_RAYON_ADI = "Bərdə";
const HAVA_LAT = 40.3758;
const HAVA_LON = 47.1261;
const HAVA_GUN_SAYI = 10;
const HAVA_AUTO_SLIDE_MS = 1000;


/* =========================
   STILLƏR
   Ayrı CSS yazmadan JS içindən əlavə olunur
========================= */
(function havaStilləriniElaveEt() {
    if (document.getElementById("hava-js-stil")) return;

    const style = document.createElement("style");
    style.id = "hava-js-stil";
    style.textContent = `
        #forecastMount,
        #forecastMount * {
            box-sizing: border-box;
        }

        #forecastMount {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
        }

        .hava-forecast-section {
            margin-top: 6px;
            width: 100%;
            max-width: 100%;
            background: #ffffff;
            border: 1px solid #d9e8f5;
            border-radius: 10px;
            padding: 4px;
            box-sizing: border-box;
            overflow: hidden;
        }

        .hava-forecast-slider {
            width: 100%;
            max-width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            cursor: grab;
            user-select: none;
            touch-action: pan-x;
        }

        .hava-forecast-slider::-webkit-scrollbar {
            display: none;
        }

        .hava-forecast-slider.dragging {
            cursor: grabbing;
            scroll-behavior: auto;
        }

        .hava-forecast-track {
            display: flex;
            gap: 4px;
            width: 100%;
            min-width: 100%;
            box-sizing: border-box;
        }

        .hava-forecast-card {
            flex: 1 1 0;
            min-width: 0;
            height: 30px;
            background: #f7fbff;
            border: 1px solid #d8e8f7;
            border-radius: 7px;
            padding: 3px 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }

        .hava-forecast-row {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            width: 100%;
            min-width: 0;
            white-space: nowrap;
            line-height: 1;
        }

        .hava-forecast-date {
            font-size: 10px;
            font-weight: 700;
            color: #1a4d7c;
            flex: 0 0 auto;
        }

        .hava-forecast-icon {
            font-size: 12px;
            line-height: 1;
            flex: 0 0 auto;
        }

        .hava-forecast-temp {
            font-size: 10px;
            font-weight: 700;
            color: #163c63;
            flex: 0 0 auto;
        }

        @media (max-width: 768px) {
            .hava-forecast-section {
                padding: 4px;
                border-radius: 9px;
            }

            .hava-forecast-slider {
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-track {
                width: max-content;
                min-width: 100%;
                gap: 6px;
            }

            .hava-forecast-card {
                flex: 0 0 calc(50vw - 18px);
                min-width: calc(50vw - 18px);
                max-width: calc(50vw - 18px);
                height: 34px;
                padding: 4px 6px;
                scroll-snap-align: start;
            }

            .hava-forecast-row {
                gap: 5px;
            }

            .hava-forecast-date {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 13px;
            }

            .hava-forecast-temp {
                font-size: 11px;
            }
        }

        @media (max-width: 480px) {
            .hava-forecast-card {
                flex: 0 0 calc(72vw - 12px);
                min-width: calc(72vw - 12px);
                max-width: calc(72vw - 12px);
                height: 36px;
            }

            .hava-forecast-date {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 13px;
            }

            .hava-forecast-temp {
                font-size: 11px;
            }
        }
    `;
    document.head.appendChild(style);
})();


/* =========================
   TARİX FORMATI
========================= */
function havaQisaTarix(dateStr) {
    const date = new Date(dateStr);
    const aylar = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
    return `${date.getDate()} ${aylar[date.getMonth()]}`;
}


/* =========================
   HAVA KODUNU MƏTN + İKONA ÇEVİRİR
========================= */
function havaMelumatiniTap(code, isDay = 1) {
    if (code === 0) {
        return {
            icon: isDay ? "☀️" : "🌙",
            text: isDay ? "Günəşli" : "Gecə"
        };
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
   HTML-də id="temp" olmalıdır
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
   PROQNOZ KONTEYNERİNİ QURUR
   HTML-də id="forecastMount" olmalıdır
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
   10 GÜNLÜK PROQNOZ
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
            track.innerHTML = `<div style="padding:6px; font-size:12px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
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
        track.innerHTML = `<div style="padding:6px; font-size:12px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
        console.error("10 günlük hava proqnozu xətası:", error);
    }
}


/* =========================
   SLIDER
   - Telefonda auto slide
   - Telefonda swipe
   - PC-də mouse drag
========================= */
function proqnozSlideriniAktivEt() {
    const slider = document.getElementById("forecastSlider");
    const track = document.getElementById("forecastTrack");
    if (!slider || !track) return;

    const cards = track.querySelectorAll(".hava-forecast-card");
    if (!cards.length) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let autoSlide = null;
    let currentIndex = 0;

    function kartAddimi() {
        const firstCard = cards[0];
        const trackStyles = window.getComputedStyle(track);
        const gap = parseInt(trackStyles.gap) || 0;
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

    function autoSlideBaslat() {
        autoSlideDayandir();

        if (window.innerWidth <= 768) {
            autoSlide = setInterval(() => {
                scrollToIndex(currentIndex + 1);
            }, HAVA_AUTO_SLIDE_MS);
        }
    }

    function autoSlideDayandir() {
        if (autoSlide) {
            clearInterval(autoSlide);
            autoSlide = null;
        }
    }

    slider.addEventListener("scroll", () => {
        const step = kartAddimi();
        currentIndex = Math.round(slider.scrollLeft / step);
    }, { passive: true });

    slider.addEventListener("mousedown", (e) => {
        isDown = true;
        slider.classList.add("dragging");
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        autoSlideDayandir();
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("dragging");
        autoSlideBaslat();
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("dragging");
        autoSlideBaslat();
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.1;
        slider.scrollLeft = scrollLeft - walk;
    });

    slider.addEventListener("touchstart", () => {
        autoSlideDayandir();
    }, { passive: true });

    slider.addEventListener("touchend", () => {
        const step = kartAddimi();
        currentIndex = Math.round(slider.scrollLeft / step);
        autoSlideBaslat();
    }, { passive: true });

    window.addEventListener("resize", () => {
        autoSlideBaslat();
    });

    autoSlideBaslat();
}


/* =========================
   BAŞLAT
========================= */
document.addEventListener("DOMContentLoaded", function () {
    cariHavaniGetir();
    proqnozuGetir();
});
