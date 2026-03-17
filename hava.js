/* =========================================================
   HAVA.JS

   NƏ EDİR:
   - Cari havanı göstərir
   - 15 günlük proqnozu göstərir
   - Telefonda sürüşür
   - 1 saniyədən bir auto-slide edir
   - Başlıq yoxdur
   - Kölgə yoxdur
   - Flat, sadə, rəsmi görünüş

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
const HAVA_AUTO_SLIDE_MS = 1000;

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
            margin-top: 6px;
        }

        .hava-forecast-section {
            width: 100%;
            max-width: 100%;
            background: transparent;
            border: none;
            border-radius: 0;
            padding: 0;
            margin: 0;
            box-shadow: none;
            filter: none;
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
            user-select: none;
            touch-action: pan-x;
            background: transparent;
            box-shadow: none;
            filter: none;
        }

        .hava-forecast-slider::-webkit-scrollbar {
            display: none;
        }

        .hava-forecast-track {
            display: flex;
            gap: 4px;
            width: 100%;
            min-width: 100%;
            background: transparent;
        }

        .hava-forecast-card {
            flex: 1 1 0;
            min-width: 0;
            height: 28px;
            background: #ffffff;
            border: 1px solid #d8e8f7;
            border-radius: 6px;
            padding: 2px 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-shadow: none;
            filter: none;
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
            .hava-forecast-track {
                width: max-content;
                min-width: 100%;
                gap: 6px;
            }

            .hava-forecast-slider {
                scroll-snap-type: x mandatory;
            }

            .hava-forecast-card {
                flex: 0 0 140px;
                min-width: 140px;
                max-width: 140px;
                height: 32px;
                padding: 3px 6px;
                scroll-snap-align: start;
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
                flex: 0 0 128px;
                min-width: 128px;
                max-width: 128px;
                height: 32px;
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

        @media (max-width: 360px) {
            .hava-forecast-card {
                flex: 0 0 120px;
                min-width: 120px;
                max-width: 120px;
                height: 31px;
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

    if (code >= 1 && code <= 3) return { icon: "⛅", text: "Buludlu" };
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

async function proqnozuGetir() {
    const konteyner = proqnozKonteyneriniHazirla();
    if (!konteyner) return;

    const { track } = konteyner;

    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${HAVA_LAT}&longitude=${HAVA_LON}&daily=weather_code,temperature_2m_max,temperature_2m_min&forecast_days=${HAVA_GUN_SAYI}&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();

        if (!data || !data.daily || !data.daily.time) {
            track.innerHTML = `<div style="padding:4px; font-size:12px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
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
        track.innerHTML = `<div style="padding:4px; font-size:12px; color:#35597a;">Hava proqnozu yüklənmədi.</div>`;
        console.error("15 günlük hava proqnozu xətası:", error);
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
        startX = e.pageX - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        autoSlideDayandir();
    });

    slider.addEventListener("mouseleave", () => {
        isDown = false;
        autoSlideBaslat();
    });

    slider.addEventListener("mouseup", () => {
        isDown = false;
        autoSlideBaslat();
    });

    slider.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const walk = (x - startX) * 1.05;
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
