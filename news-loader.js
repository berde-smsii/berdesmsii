function escapeHtml(str = "") {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function formatDateToDDMMYYYY(dateStr) {
    if (!dateStr) return "";
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;

    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
}

function parseDateScore(t) {
    if (!t) return 0;
    const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!m) return 0;

    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yy = parseInt(m[3], 10);

    if (!yy || mm < 1 || mm > 12 || dd < 1 || dd > 31) return 0;
    return yy * 10000 + mm * 100 + dd;
}

function startCardImageSliders() {
    document.querySelectorAll(".news-img-box").forEach(box => {
        const imgs = box.querySelectorAll("img");
        if (imgs.length > 1) {
            let cur = 0;
            setInterval(() => {
                imgs[cur].classList.remove("active");
                cur = (cur + 1) % imgs.length;
                imgs[cur].classList.add("active");
            }, 3000);
        }
    });
}

function renderNews(newsData) {
    const track = document.getElementById("news-track");
    const allNewsList = document.getElementById("all-news-list");

    const sortedNews = [...newsData].sort((a, b) => {
        const da = parseDateScore(a.tarix);
        const db = parseDateScore(b.tarix);
        if (db !== da) return db - da;
        return (b.id || 0) - (a.id || 0);
    });

    const latestFive = sortedNews.slice(0, 5);
    const doubledData = [...latestFive, ...latestFive];

    track.innerHTML = doubledData.map((item) => {
        const imageArray = Array.isArray(item.esas_sekil) ? item.esas_sekil : [];
        const imgsHTML = imageArray.map((img, i) =>
            `<img src="${escapeHtml(img)}" class="${i === 0 ? "active" : ""}" alt="${escapeHtml(item.bashliq)}">`
        ).join("");

        const safeImagesJSON = JSON.stringify(imageArray);
        const safeTitle = JSON.stringify(item.bashliq || "");
        const safeText = JSON.stringify(item.metn || "");
        const safeDate = JSON.stringify(item.tarix || "");

        return `
            <div class="news-card">
                <div class="news-img-box">${imgsHTML}</div>
                <div class="news-content">
                    <h4>${escapeHtml(item.bashliq || "")}</h4>
                    <button class="read-more" onclick='openModal(${safeImagesJSON}, ${safeTitle}, ${safeText}, ${safeDate})'>Ətraflı</button>
                </div>
            </div>
        `;
    }).join("");

    allNewsList.innerHTML = sortedNews.map((item) => {
        const imageArray = Array.isArray(item.esas_sekil) ? item.esas_sekil : [];
        const firstImage = imageArray.length ? imageArray[0] : "";

        const safeImagesJSON = JSON.stringify(imageArray);
        const safeTitle = JSON.stringify(item.bashliq || "");
        const safeText = JSON.stringify(item.metn || "");
        const safeDate = JSON.stringify(item.tarix || "");

        return `
            <div class="all-news-item">
                <img src="${escapeHtml(firstImage)}" class="all-news-thumb" alt="${escapeHtml(item.bashliq || "")}">
                <div class="all-news-info">
                    <h4>${escapeHtml(item.bashliq || "")}</h4>
                    <span class="all-news-date"><i class="far fa-calendar-alt"></i> ${escapeHtml(item.tarix || "")}</span>
                    <div class="all-news-actions">
                        <button class="all-news-open-btn" onclick='openModal(${safeImagesJSON}, ${safeTitle}, ${safeText}, ${safeDate})'>Ətraflı bax</button>
                    </div>
                </div>
            </div>
        `;
    }).join("");

    startCardImageSliders();
}

async function getNewsFromSupabase() {
    const { data: newsRows, error: newsError } = await supabaseClient
        .from("news")
        .select("id, title, content, image, news_date, created_at")
        .order("news_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (newsError) throw newsError;

    const { data: imageRows, error: imageError } = await supabaseClient
        .from("news_images")
        .select("id, news_id, image_url")
        .order("id", { ascending: true });

    if (imageError) throw imageError;

    const imagesMap = {};
    imageRows.forEach(row => {
        if (!imagesMap[row.news_id]) imagesMap[row.news_id] = [];
        if (row.image_url) imagesMap[row.news_id].push(row.image_url);
    });

    return newsRows.map(row => {
        let images = imagesMap[row.id] || [];

        if ((!images || !images.length) && row.image) {
            images = [row.image];
        }

        return {
            id: row.id,
            bashliq: row.title || "",
            metn: row.content || "",
            tarix: formatDateToDDMMYYYY(row.news_date || row.created_at),
            esas_sekil: images
        };
    });
}

async function getNewsFromJson() {
    const response = await fetch("xeberler.json");
    if (!response.ok) throw new Error("xeberler.json yüklənmədi");
    return await response.json();
}

async function loadNews() {
    try {
        const supabaseNews = await getNewsFromSupabase();

        if (Array.isArray(supabaseNews) && supabaseNews.length > 0) {
            renderNews(supabaseNews);
            console.log("Xəbərlər Supabase-dən yükləndi.");
            return;
        }

        const jsonNews = await getNewsFromJson();
        renderNews(jsonNews);
        console.log("Supabase boşdur, xəbərlər xeberler.json-dan yükləndi.");
    } catch (err) {
        console.error("Supabase xətası, json fallback işləyir:", err);

        try {
            const jsonNews = await getNewsFromJson();
            renderNews(jsonNews);
            console.log("Xəbərlər xeberler.json-dan yükləndi.");
        } catch (jsonErr) {
            console.error("Xəbərlər heç yerdən yüklənmədi:", jsonErr);
        }
    }
}

document.addEventListener("DOMContentLoaded", loadNews);
