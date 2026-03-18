/* =========================================================
   HAVA.JS

   BAŞQA RAYONA SATANDA DƏYİŞƏCƏYİN HİSSƏLƏR:
   1) Rayon adı:
      const HAVA_RAYON_ADI = "Bərdə";

   2) Koordinatlar:
      const HAVA_LAT = 40.3758;
      const HAVA_LON = 47.1261;
========================================================= */

const HAVA_RAYON_ADI = "Bərdə";
const HAVA_LAT = 40.3758;
const HAVA_LON = 47.1261;

const HAVA_GUN_SAYI = 15;
const TELEFON_AUTO_MS = 1000;
const MASAUSTU_PIXEL_STEP = 0.5;

let desktopAnimationId = null;
let mobileAutoTimer = null;

(function havaStilləriniElaveEt() {
    if (document.getElementById("hava-js-stil")) return;

    const style = document.createElement("style");
    style.id = "hava-js-stil";
    style.textContent = `
        #temp,
        #forecastMount,
        #forecastMount * {
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
            padding: 0;
        }

        #forecastMount {
            display: block;
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        .hava-current-line {
            width: 100%;
            max-width: 100%;
            padding: 0;
            margin: 0;
            font-size: 14px;
            line-height: 1.35;
            color: #163c63;
            font-weight: 600;
            overflow-wrap: anywhere;
        }

        .hava-forecast-section {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            background: transparent !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: hidden;
        }

        .hava-forecast-slider {
            width: 100%;
            max-width: 100%;
            overflow: hidden;
            margin: 0;
            padding: 0;
            background: transparent !important;
        }

        .hava-forecast-track {
            display: flex;
            align-items: center;
            gap: 8px;
            width: max-content;
            min-width: 100%;
            margin: 0;
            padding: 0;
            will-change: transform;
        }

        .hava-forecast-card {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 132px;
            height: 34px;
            padding: 5px 9px;
            border: 1px solid #d7e6f3;
            border-radius: 8px;
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

        .hava-forecast-text {
            font-size: 11px;
            font-weight: 600;
            color: #35597a;
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

        @media (min-width: 769px) {
            .hava-current-line {
                font-size: 15px;
            }

            .hava-forecast-card {
                min-width: 150px;
                height: 36px;
                padding: 6px 11px;
            }

            .hava-forecast-date,
            .hava-forecast-text,
            .hava-forecast-temp {
                font-size: 12px;
            }

            .hava-forecast-icon {
                font-size: 14px;
            }
        }

        @media (max-width: 768px) {
            .hava-current-line {
                font-size: 13px;
            }

            .hava-forecast-slider {
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: none;
                scroll-behavior: smooth;
                touch-action: pan-x;
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-slider::-webkit-scrollbar {
                display: none;
            }

            .hava-forecast-track {
                gap: 6px;
                min-width: max-content;
                width: max-content;
                transform: none !important;
                will-change: auto;
            }

            .hava-forecast-card {
                width: 126px;
                min-width: 126px;
                max-width: 126px;
                height: 34px;
                padding: 4px 7px;
                scroll-snap-align: start;
            }

            .hava-forecast-date,
            .hava-forecast-text,
            .hava-forecast-temp {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 13px;
            }
        }

        @media (max-width: 480px) {
            .hava-current-line {
                font-size: 12px;
            }

            .hava-forecast-card {
                width: 118px;
                min-width: 118px;
                max-width: 118px;
                height: 33px;
                padding: 4px 6px;
            }

            .hava-forecast-row {
                gap: 5px;
            }

            .hava-forecast-date,
            .hava-forecast-text,
            .hava-forecast-temp {
                font-size: 10px;
            }

            .hava-forecast-icon {
                font-size: 12px;
            }
        }

        @media (max-width: 360px) {
            .hava-forecast-card {
                width: 112px;
                min-width: 112px;
                max-width: 112px;
                height: 32px;
                padding: 3px 5px;
            }

            .hava-forecast-row {
                gap: 4px;
            }
        }
    `;
    document.head.appendChild(style);
})();

function havaQisaTarix(dateStr) {
    const date = new Date(dateStr);
    const aylar = ["Yan", "Fev", "Mar", "Apr", "May", "İyn", "İyl", "Avq", "Sen", "Okt", "Noy", "Dek"];
    return `${date.getDate()} ${aylar[date.getMonth()]}`;
}

function havaMelumatiniTap(code, isDay = 1) {
    if (code === 0) {
        return { icon: isDay ? "☀️" : "🌙", text: isDay ? "Günəşli" : "Gecə" };
    }
    if (code >= 1 && code <= 3) return { icon: "⛅", text: "Buludlu" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Dumanlı" };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: "🌧️", text: "Yağışlı" };
    if (code >= 71 && code <= 77) return { icon: "❄️", text: "Qarlı" };
    if (code >= 95) return { icon: "⛈️", text: "Fırtınalı" };
    return { icon: "🌤️", text: "Dəyişkən" };
}

function cariHavaYaziniQur(hava, temp) {
    return `${HAVA_RAYON_ADI} rayonu üzrə, ${hava.text} ${hava.icon}, ${temp}°C`;
}

async function cariHavaniGetir() {
    const tempElement = document.getElementById("temp");
    if (!tempElement) return;

    tempElement.className = "hava-current-line";

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&current=temperature_2m,is_day,weather_code&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.current) {
            tempElement.textContent = `${HAVA_RAYON_ADI} rayonu üzrə, məlumat yoxdur`;
            return;
        }

        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weather_code;
        const isDay = data.current.is_day;

        const hava = havaMelumatiniTap(code, isDay);
        tempElement.textContent = cariHavaYaziniQur(hava, temp);
    } catch (error) {
        tempElement.textContent = `${HAVA_RAYON_ADI} rayonu üzrə, məlumat yoxdur`;
        console.error("Cari hava xətası:", error);
    }
}

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

function gunKartiniQur(dateText, weatherText, icon, maxTemp, minTemp) {
    return `
        <div class="hava-forecast-card">
            <div class="hava-forecast-row">
                <span class="hava-forecast-date">${dateText}</span>
                <span class="hava-forecast-text">${weatherText}</span>
                <span class="hava-forecast-icon">${icon}</span>
                <span class="hava-forecast-temp">${maxTemp}/${minTemp}</span>
            </div>
        </div>
    `;
}

async function proqnozuGetir() {
    const konteyner = proqnozKonteyneriniHazirla();
    if (!konteyner) return;

    const { track } = konteyner;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${HAVA_GUN_SAYI}&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.daily || !data.daily.time) {
            track.innerHTML = `<div class="hava-forecast-card"><div class="hava-forecast-row"><span class="hava-forecast-text">Hava proqnozu yüklənmədi</span></div></div>`;
            return;
        }

        const dates = data.daily.time;
        const codes = data.daily.weather_code;
        const maxTemps = data.daily.temperature_2m_max;
        const minTemps = data.daily.temperature_2m_min;

        const cardsHtml = dates.map((date, i) => {
            const hava = havaMelumatiniTap(codes[i], 1);
            return gunKartiniQur(
                havaQisaTarix(date),
                hava.text,
                hava.icon,
                `${Math.round(maxTemps[i])}°`,
                `${Math.round(minTemps[i])}°`
            );
        }).join("");

        if (window.innerWidth > 768) {
            track.innerHTML = cardsHtml + cardsHtml;
        } else {
            track.innerHTML = cardsHtml;
        }

        proqnozAnimasiyasiniQur();
    } catch (error) {
        track.innerHTML = `<div class="hava-forecast-card"><div class="hava-forecast-row"><span class="hava-forecast-text">Hava proqnozu yüklənmədi</span></div></div>`;
        console.error("15 günlük hava proqnozu xətası:", error);
    }
}

function desktopAnimasiyaniDayandir() {
    if (desktopAnimationId) {
        cancelAnimationFrame(desktopAnimationId);
        desktopAnimationId = null;
    }
}

function mobileAutoDayandir() {
    if (mobileAutoTimer) {
        clearInterval(mobileAutoTimer);
        mobileAutoTimer = null;
    }
}

function proqnozAnimasiyasiniQur() {
    desktopAnimasiyaniDayandir();
    mobileAutoDayandir();

    const slider = document.getElementById("forecastSlider");
    const track = document.getElementById("forecastTrack");
    if (!slider || !track) return;

    if (window.innerWidth > 768) {
        let translateX = 0;

        function frame() {
            const halfWidth = track.scrollWidth / 2;
            translateX -= MASAUSTU_PIXEL_STEP;

            if (Math.abs(translateX) >= halfWidth) {
                translateX = 0;
            }

            track.style.transform = `translateX(${translateX}px)`;
            desktopAnimationId = requestAnimationFrame(frame);
        }

        frame();

        slider.addEventListener("mouseenter", desktopAnimasiyaniDayandir);
        slider.addEventListener("mouseleave", () => {
            if (!desktopAnimationId) {
                frame();
            }
        });
    } else {
        const cards = track.querySelectorAll(".hava-forecast-card");
        if (!cards.length) return;

        let currentIndex = 0;

        function kartAddimi() {
            const firstCard = cards[0];
            const gap = parseInt(window.getComputedStyle(track).gap) || 0;
            return firstCard.offsetWidth + gap;
        }

        function scrollToIndex(index) {
            const maxIndex = cards.length - 1;
            if (index > maxIndex) index = 0;
            if (index < 0) index = maxIndex;
            currentIndex = index;

            slider.scrollTo({
                left: kartAddimi() * currentIndex,
                behavior: "smooth"
            });
        }

        mobileAutoTimer = setInterval(() => {
            scrollToIndex(currentIndex + 1);
        }, TELEFON_AUTO_MS);

        slider.addEventListener("touchstart", mobileAutoDayandir, { passive: true });

        slider.addEventListener("touchend", () => {
            const step = kartAddimi();
            currentIndex = Math.round(slider.scrollLeft / step);

            mobileAutoDayandir();
            mobileAutoTimer = setInterval(() => {
                scrollToIndex(currentIndex + 1);
            }, TELEFON_AUTO_MS);
        }, { passive: true });

        slider.addEventListener("scroll", () => {
            const step = kartAddimi();
            currentIndex = Math.round(slider.scrollLeft / step);
        }, { passive: true });
    }
}

window.addEventListener("resize", () => {
    proqnozuGetir();
});

document.addEventListener("DOMContentLoaded", function () {
    cariHavaniGetir();
    proqnozuGetir();
});
