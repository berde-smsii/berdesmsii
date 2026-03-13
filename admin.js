const loginCard = document.getElementById("loginCard");
const adminPanel = document.getElementById("adminPanel");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const loginStatus = document.getElementById("loginStatus");
const formStatus = document.getElementById("formStatus");

const formTitle = document.getElementById("formTitle");
const newsTitle = document.getElementById("newsTitle");
const newsDate = document.getElementById("newsDate");
const newsContent = document.getElementById("newsContent");
const newsImages = document.getElementById("newsImages");
const imagePreview = document.getElementById("imagePreview");
const saveNewsBtn = document.getElementById("saveNewsBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");
const newsList = document.getElementById("newsList");

let selectedFiles = [];
let existingImageUrls = [];
let editingNewsId = null;

function showStatus(el, message, type = "success") {
    el.className = `status ${type}`;
    el.textContent = message;
}

function clearStatus(el) {
    el.className = "status";
    el.textContent = "";
}

function truncateText(text = "", max = 170) {
    if (text.length <= max) return text;
    return text.slice(0, max) + "...";
}

function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}.${month}.${year}`;
}

function sanitizeFileName(name) {
    return name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.\-_]/g, "");
}

function getStoragePathFromPublicUrl(publicUrl) {
    try {
        const marker = "/storage/v1/object/public/news-images/";
        const idx = publicUrl.indexOf(marker);
        if (idx === -1) return null;

        return decodeURIComponent(publicUrl.substring(idx + marker.length));
    } catch (e) {
        return null;
    }
}

function resetForm() {
    editingNewsId = null;
    selectedFiles = [];
    existingImageUrls = [];
    newsTitle.value = "";
    newsDate.value = "";
    newsContent.value = "";
    newsImages.value = "";
    imagePreview.innerHTML = "";
    formTitle.textContent = "Yeni xəbər əlavə et";
    cancelEditBtn.classList.add("hidden");
    clearStatus(formStatus);
}

function renderPreview() {
    imagePreview.innerHTML = "";

    existingImageUrls.forEach((url, index) => {
        const item = document.createElement("div");
        item.className = "preview-item";
        item.innerHTML = `
            <img src="${url}" alt="Şəkil">
            <button type="button" class="preview-remove" data-type="existing" data-index="${index}">×</button>
        `;
        imagePreview.appendChild(item);
    });

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const item = document.createElement("div");
            item.className = "preview-item";
            item.innerHTML = `
                <img src="${e.target.result}" alt="Yeni şəkil">
                <button type="button" class="preview-remove" data-type="new" data-index="${index}">×</button>
            `;
            imagePreview.appendChild(item);
        };
        reader.readAsDataURL(file);
    });
}

imagePreview.addEventListener("click", function (e) {
    const btn = e.target.closest(".preview-remove");
    if (!btn) return;

    const type = btn.dataset.type;
    const index = Number(btn.dataset.index);

    if (type === "existing") {
        existingImageUrls.splice(index, 1);
    } else {
        selectedFiles.splice(index, 1);
    }

    renderPreview();
});

newsImages.addEventListener("change", function (e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    selectedFiles = [...selectedFiles, ...files];
    renderPreview();
    newsImages.value = "";
});

async function login() {
    clearStatus(loginStatus);

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showStatus(loginStatus, "E-poçt və şifrəni daxil edin.", "error");
        return;
    }

    loginBtn.disabled = true;

    const { error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    loginBtn.disabled = false;

    if (error) {
        showStatus(loginStatus, "Giriş alınmadı. E-poçt və ya şifrə yanlışdır.", "error");
        return;
    }

    clearStatus(loginStatus);
    await checkSessionAndLoad();
}

async function logout() {
    await supabaseClient.auth.signOut();
    adminPanel.classList.add("hidden");
    loginCard.classList.remove("hidden");
}

async function checkSessionAndLoad() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error || !data.session) {
        adminPanel.classList.add("hidden");
        loginCard.classList.remove("hidden");
        return;
    }

    loginCard.classList.add("hidden");
    adminPanel.classList.remove("hidden");
    await loadAdminNews();
}

async function uploadNewImages(files) {
    const uploadedUrls = [];

    for (const file of files) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const safeName = sanitizeFileName(file.name);
        const filePath = `news/${Date.now()}-${Math.random().toString(36).slice(2)}-${safeName || `image.${fileExt}`}`;

        const { error: uploadError } = await supabaseClient
            .storage
            .from("news-images")
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data } = supabaseClient
            .storage
            .from("news-images")
            .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
}

async function removeImagesFromStorage(imageUrls = []) {
    const storagePaths = imageUrls
        .map(getStoragePathFromPublicUrl)
        .filter(Boolean);

    if (!storagePaths.length) return;

    const { error } = await supabaseClient
        .storage
        .from("news-images")
        .remove(storagePaths);

    if (error) throw error;
}

async function insertNewsImages(newsId, imageUrls) {
    if (!imageUrls.length) return;

    const rows = imageUrls.map(url => ({
        news_id: newsId,
        image_url: url
    }));

    const { error } = await supabaseClient
        .from("news_images")
        .insert(rows);

    if (error) throw error;
}

async function deleteNewsImagesRows(newsId) {
    const { error } = await supabaseClient
        .from("news_images")
        .delete()
        .eq("news_id", newsId);

    if (error) throw error;
}

async function saveNews() {
    clearStatus(formStatus);

    const title = newsTitle.value.trim();
    const content = newsContent.value.trim();
    const date = newsDate.value;

    if (!title || !content || !date) {
        showStatus(formStatus, "Başlıq, tarix və xəbər mətni boş qala bilməz.", "error");
        return;
    }

    const totalImages = existingImageUrls.length + selectedFiles.length;
    if (totalImages < 1) {
        showStatus(formStatus, "Ən azı 1 şəkil seçilməlidir.", "error");
        return;
    }

    saveNewsBtn.disabled = true;
    saveNewsBtn.textContent = "Yüklənir...";

    try {
        const newUploadedUrls = selectedFiles.length
            ? await uploadNewImages(selectedFiles)
            : [];

        const finalImageUrls = [...existingImageUrls, ...newUploadedUrls];
        const mainImage = finalImageUrls[0] || null;

        if (!editingNewsId) {
            const { data, error } = await supabaseClient
                .from("news")
                .insert([{
                    title,
                    content,
                    image: mainImage,
                    news_date: date
                }])
                .select()
                .single();

            if (error) throw error;

            await insertNewsImages(data.id, finalImageUrls);
            showStatus(formStatus, "Xəbər uğurla əlavə olundu.");
        } else {
            const oldImageUrls = window.__imageMap?.[editingNewsId]
                ? [...window.__imageMap[editingNewsId]]
                : [];

            const removedOldImages = oldImageUrls.filter(url => !existingImageUrls.includes(url));

            const { error: updateError } = await supabaseClient
                .from("news")
                .update({
                    title,
                    content,
                    image: mainImage,
                    news_date: date
                })
                .eq("id", editingNewsId);

            if (updateError) throw updateError;

            await deleteNewsImagesRows(editingNewsId);
            await insertNewsImages(editingNewsId, finalImageUrls);

            if (removedOldImages.length) {
                await removeImagesFromStorage(removedOldImages);
            }

            showStatus(formStatus, "Xəbər uğurla yeniləndi.");
        }

        resetForm();
        await loadAdminNews();
    } catch (error) {
        console.error(error);
        showStatus(formStatus, "Xəbər yadda saxlanılarkən xəta baş verdi.", "error");
    } finally {
        saveNewsBtn.disabled = false;
        saveNewsBtn.textContent = "Yadda saxla";
    }
}

async function loadAdminNews() {
    newsList.innerHTML = `<div class="empty-box">Yüklənir...</div>`;

    try {
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

        const imageMap = {};
        imageRows.forEach(row => {
            if (!imageMap[row.news_id]) imageMap[row.news_id] = [];
            imageMap[row.news_id].push(row.image_url);
        });

        if (!newsRows.length) {
            newsList.innerHTML = `<div class="empty-box">Hələ xəbər əlavə edilməyib.</div>`;
            window.__newsRows = [];
            window.__imageMap = {};
            return;
        }

        newsList.innerHTML = newsRows.map(item => {
            const firstImage = item.image || (imageMap[item.id] && imageMap[item.id][0]) || "";
            return `
                <div class="news-item">
                    <img src="${firstImage}" alt="${item.title}">
                    <div class="news-item-body">
                        <h3>${item.title}</h3>
                        <div class="news-meta">Tarix: ${formatDisplayDate(item.news_date || item.created_at)}</div>
                        <div class="news-desc">${truncateText(item.content || "")}</div>
                        <div class="btn-row">
                            <button class="btn btn-secondary" onclick="editNews(${item.id})">Redaktə et</button>
                            <button class="btn btn-danger" onclick="deleteNews(${item.id})">Sil</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");

        window.__newsRows = newsRows;
        window.__imageMap = imageMap;
    } catch (error) {
        console.error(error);
        newsList.innerHTML = `<div class="empty-box">Xəbərlər yüklənə bilmədi.</div>`;
    }
}

window.editNews = async function (newsId) {
    clearStatus(formStatus);

    const newsItem = (window.__newsRows || []).find(item => item.id === newsId);
    if (!newsItem) return;

    editingNewsId = newsId;
    formTitle.textContent = "Xəbəri redaktə et";
    cancelEditBtn.classList.remove("hidden");

    newsTitle.value = newsItem.title || "";
    newsContent.value = newsItem.content || "";
    newsDate.value = newsItem.news_date || "";
    selectedFiles = [];
    existingImageUrls = window.__imageMap?.[newsId]
        ? [...window.__imageMap[newsId]]
        : (newsItem.image ? [newsItem.image] : []);

    renderPreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
};

window.deleteNews = async function (newsId) {
    const ok = confirm("Bu xəbəri silmək istədiyinizə əminsiniz?");
    if (!ok) return;

    try {
        const newsItem = (window.__newsRows || []).find(item => item.id === newsId);
        const imageUrls = window.__imageMap?.[newsId]
            ? [...window.__imageMap[newsId]]
            : (newsItem?.image ? [newsItem.image] : []);

        if (imageUrls.length) {
            await removeImagesFromStorage(imageUrls);
        }

        const { error } = await supabaseClient
            .from("news")
            .delete()
            .eq("id", newsId);

        if (error) throw error;

        if (editingNewsId === newsId) {
            resetForm();
        }

        await loadAdminNews();
        showStatus(formStatus, "Xəbər və şəkilləri silindi.");
    } catch (error) {
        console.error(error);
        showStatus(formStatus, "Xəbər silinərkən xəta baş verdi.", "error");
    }
};

cancelEditBtn.addEventListener("click", resetForm);
saveNewsBtn.addEventListener("click", saveNews);
loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);

document.addEventListener("DOMContentLoaded", checkSessionAndLoad);
