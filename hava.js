/* =========================================================
   HAVA.JS
   Dəyişən hissələr:
   1) Rayon adı:
      const HAVA_RAYON_ADI = "Bərdə";

   2) Koordinatlar:
      const HAVA_LAT = 40.3758;
      const HAVA_LON = 47.1261;
========================================================= */

const HAVA_RAYON_ADI = "Bərdə";
const HAVA_LAT = 40.3758;
const HAVA_LON = 47.1261;
const HAVA_GUN_SAYI = 10;
const HAVA_AUTO_SLIDE_MS = 3500;

(function havaStilləriniElaveEt() {
    if (document.getElementById("hava-js-stil")) return;

    const style = document.createElement("style");
    style.id = "hava-js-stil";
    style.textContent = `
        .hava-forecast-section {
            margin-top: 6px;
            width: 100%;
            background: #ffffff;
            border: 1px solid #d9e8f5;
            border-radius: 10px;
            padding: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            box-sizing: border-box;
        }

        .hava-forecast-title {
            margin: 0 0 6px 0;
            font-size: 13px;
            font-weight: 700;
            color: #114a7a;
            text-align: center;
            line-height: 1.2;
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
            gap: 6px;
            width: max-content;
            min-width: 100%;
            box-sizing: border-box;
        }

        .hava-forecast-card {
            background: #f7fbff;
            border: 1px solid #d8e8f7;
            border-radius: 8px;
            padding: 5px 4px;
            text-align: center;
            box-sizing: border-box;
            flex: 0 0 calc((100% - 54px) / 10);
            min-width: 72px;
            min-height: 38px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .hava-forecast-date {
            font-size: 11px;
            font-weight: 700;
            color: #1a4d7c;
            margin-bottom: 2px;
            line-height: 1.1;
        }

        .hava-forecast-icon {
            font-size: 15px;
            line-height: 1;
            margin-bottom: 2px;
        }

        .hava-forecast-desc {
            font-size: 10px;
            color: #4a6882;
            margin-bottom: 2px;
            line-height: 1.1;
        }

        .hava-forecast-temp {
            font-size: 11px;
            font-weight: 700;
            color: #163c63;
            line-height: 1.1;
        }

        @media (max-width: 768px) {
            .hava-forecast-section {
                padding: 6px;
                border-radius: 10px;
            }

            .hava-forecast-title {
                font-size: 12px;
                margin-bottom: 6px;
            }

            .hava-forecast-track {
                gap: 8px;
            }

            .hava-forecast-card {
                flex: 0 0 42%;
                min-width: 42%;
                scroll-snap-align: start;
                padding: 7px 6px;
                min-height: 52px;
            }

            .hava-forecast-slider {
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-date {
                font-size: 11px;
            }

            .hava-forecast-icon {
                font-size: 17px;
            }

            .hava-forecast-desc {
                font-size: 10px;
            }

            .hava-forecast-temp {
                font-size: 11px;
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
        return {
            icon: isDay ? "☀️" : "🌙",
            text: isDay ? "Günəşli" : "Gecə"
        };
    }
    if (code >= 1 && code <= 3) return { icon: "⛅", text: "Bulud" };
    if (code >= 45 && code <= 48) return { icon: "🌫️", text: "Duman" };
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { icon: "🌧️", text: "Yağış" };
    if (code >= 71 && code <= 77) return { icon: "❄️", text: "Qar" };
    if (code >= 95) return { icon: "⛈️", text: "Fırtına" };
    return { icon: "🌤️", text: "Hava" };
}

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
        tempElement.innerText = "🌡️ Məlumat yoxdur";
        console.error("Cari hava xətası:", error);
    }
}

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
                <div class="hava-forecast-temp">${Math.round(maxTemps[i])}°/${Math.round(minTemps[i])}°</div>
            `;
            track.appendChild(card);
        }

        proqnozSlideriniAktivEt();
    } catch (error) {
        track.innerHTML = `<div style="padding:8px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
        console.error("10 günlük hava proqnozu xətası:", error);
    }
}

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
        const walk = (x - startX) * 1.2;
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

document.addEventListener("DOMContentLoaded", function () {
    cariHavaniGetir();
    proqnozuGetir();
});
