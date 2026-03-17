/* =========================================================
   HAVA.JS
   Məqsəd:
   - Bərdə üçün cari hava
   - 10 günlük hava proqnozu
   - PC-də eninə tam görünüş
   - Telefonda sürüşən görünüş
   - Avtomatik sürüşmə + barmaqla sürüşdürmə

   GƏLƏCƏKDƏ SAYTI SATANDA NƏLƏR DƏYİŞƏCƏK?
   1) Rayon adı dəyişəcək:
      const HAVA_RAYON_ADI = "Bərdə";

   2) Koordinatlar dəyişəcək:
      const HAVA_LAT = 40.3758;
      const HAVA_LON = 47.1261;

   3) Başlıq mətni istəsən dəyişəcək:
      məsələn "Daşkəsən üzrə 10 günlük hava proqnozu"

   Qalan hissələrə çox vaxt dəyməyə ehtiyac olmur.
========================================================= */


/* =========================
   AYARLAR
========================= */
const HAVA_RAYON_ADI = "Bərdə";
const HAVA_LAT = 40.3758;
const HAVA_LON = 47.1261;
const HAVA_GUN_SAYI = 10;
const HAVA_AUTO_SLIDE_MS = 3500;


/* =========================
   CSS-i JS içindən əlavə edirik
   Beləliklə ayrıca CSS faylı lazım olmur
========================= */
(function havaStilləriniElaveEt() {
    if (document.getElementById("hava-js-stil")) return;

    const style = document.createElement("style");
    style.id = "hava-js-stil";
    style.textContent = `
        .hava-forecast-section {
            margin-top: 16px;
            width: 100%;
            background: #ffffff;
            border: 1px solid #d9e8f5;
            border-radius: 16px;
            padding: 14px;
            box-shadow: 0 4px 14px rgba(0,0,0,0.06);
            box-sizing: border-box;
        }

        .hava-forecast-title {
            margin: 0 0 14px 0;
            font-size: 18px;
            font-weight: 700;
            color: #114a7a;
            text-align: center;
            line-height: 1.4;
        }

        .hava-forecast-slider {
            width: 100%;
            overflow-x: auto;
            overflow-y: hidden;
            scroll-behavior: smooth;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            cursor: grab;
            user-select: none;
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
            gap: 10px;
            width: max-content;
            min-width: 100%;
            box-sizing: border-box;
        }

        .hava-forecast-card {
            background: linear-gradient(180deg, #f8fbff 0%, #eef6fd 100%);
            border: 1px solid #d8e8f7;
            border-radius: 14px;
            padding: 14px 10px;
            text-align: center;
            box-sizing: border-box;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            flex: 0 0 calc((100% - 90px) / 10);
            min-width: 108px;
        }

        .hava-forecast-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .hava-forecast-date {
            font-size: 14px;
            font-weight: 700;
            color: #1a4d7c;
            margin-bottom: 8px;
        }

        .hava-forecast-icon {
            font-size: 30px;
            line-height: 1;
            margin-bottom: 8px;
        }

        .hava-forecast-desc {
            font-size: 13px;
            color: #4a6882;
            margin-bottom: 8px;
            min-height: 18px;
        }

        .hava-forecast-temp {
            font-size: 14px;
            font-weight: 700;
            color: #163c63;
        }

        @media (max-width: 768px) {
            .hava-forecast-section {
                padding: 12px;
                border-radius: 14px;
            }

            .hava-forecast-title {
                font-size: 16px;
                margin-bottom: 12px;
            }

            .hava-forecast-track {
                gap: 10px;
            }

            .hava-forecast-card {
                flex: 0 0 78%;
                min-width: 78%;
                scroll-snap-align: start;
                padding: 16px 12px;
            }

            .hava-forecast-slider {
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-icon {
                font-size: 34px;
            }
        }
    `;
    document.head.appendChild(style);
})();


/* =========================
   Yardımçı funksiyalar
========================= */
function havaQisaTarix(dateStr) {
    const date = new Date(dateStr);
    const aylar = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
    return `${date.getDate()} ${aylar[date.getMonth()]}`;
}

function havaMelumatiniTap(code, isDay = 1) {
    if (code === 0) {
        return {
            icon: isDay ? "☀️" : "🌙",
            text: isDay ? "Günəşli" : "Aydın gecə"
        };
    }

    if (code >= 1 && code <= 3) {
        return { icon: "⛅", text: "Buludlu" };
    }

    if (code >= 45 && code <= 48) {
        return { icon: "🌫️", text: "Duman" };
    }

    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
        return { icon: "🌧️", text: "Yağış" };
    }

    if (code >= 71 && code <= 77) {
        return { icon: "❄️", text: "Qar" };
    }

    if (code >= 95) {
        return { icon: "⛈️", text: "Fırtına" };
    }

    return { icon: "🌤️", text: "Dəyişkən" };
}


/* =========================
   Cari hava
   HTML-də id="temp" olmalıdır
========================= */
async function cariHavaniGetir() {
    const tempElement = document.getElementById("temp");
    if (!tempElement) return;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&current_weather=true&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        const temp = Math.round(data.current_weather.temperature);
        const code = data.current_weather.weathercode;
        const isDay = data.current_weather.is_day;

        const hava = havaMelumatiniTap(code, isDay);
        tempElement.innerText = `${hava.text} ${hava.icon} ${temp}°C`;
    } catch (error) {
        tempElement.innerText = "🌡️ Məlumat yüklənmədi";
        console.error("Cari hava xətası:", error);
    }
}


/* =========================
   Proqnoz üçün HTML qururuq
   HTML-də id="forecastMount" olan boş yer olmalıdır
========================= */
function proqnozKonteyneriniHazirla() {
    const mount = document.getElementById("forecastMount");
    if (!mount) return null;

    mount.innerHTML = `
        <div class="hava-forecast-section">
            <h3 class="hava-forecast-title">${HAVA_RAYON_ADI} üzrə ${HAVA_GUN_SAYI} günlük hava proqnozu</h3>
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
   10 günlük proqnoz
========================= */
async function proqnozuGetir() {
    const konteyner = proqnozKonteyneriniHazirla();
    if (!konteyner) return;

    const { track } = konteyner;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${HAVA_GUN_SAYI}&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

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
                <div class="hava-forecast-date">${havaQisaTarix(dates[i])}</div>
                <div class="hava-forecast-icon">${hava.icon}</div>
                <div class="hava-forecast-desc">${hava.text}</div>
                <div class="hava-forecast-temp">${Math.round(maxTemps[i])}° / ${Math.round(minTemps[i])}°</div>
            `;
            track.appendChild(card);
        }

        proqnozSlideriniAktivEt();
    } catch (error) {
        track.innerHTML = `<div style="padding:12px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
        console.error("10 günlük hava proqnozu xətası:", error);
    }
}


/* =========================
   Slider:
   - telefonda auto slide
   - telefonda swipe
   - PC-də mouse ilə sürüşdürmə
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
        const walk = (x - startX) * 1.3;
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
   Hamısını başladırırıq
========================= */
document.addEventListener("DOMContentLoaded", function () {
    cariHavaniGetir();
    proqnozuGetir();
});
