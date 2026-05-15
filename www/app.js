const API_BASE = "https://api.freepik.com/v1/ai",
    AUTH_URL = "https://script.google.com/macros/s/AKfycbyMiTKl6bdRfrpf5UOBAsqyNke18JabWkXWZh_8cA56jZIDxImbI86dfjvpXGOwoATkxg/exec",
    STORAGE_URL = "";

function _isCapacitorNative() {
    return "undefined" != typeof Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()
}

function openExternal(e) {
    _isCapacitorNative() && Capacitor.Plugins && Capacitor.Plugins.Browser ? Capacitor.Plugins.Browser.open({
        url: e
    }) : window.open(e, "_blank")
}

async function freepikRequest(e, t, a, o) {
    if (console.log("[Moonray] freepikRequest:", t, e, "| Native:", _isCapacitorNative()), !(_isCapacitorNative() && Capacitor.Plugins && Capacitor.Plugins.CapacitorHttp)) {
        const n = {
            method: t || "GET",
            headers: {
                "Content-Type": "application/json",
                "x-freepik-api-key": a
            }
        };
        o && "GET" !== t && (n.body = JSON.stringify(o));
        const i = await fetch(e, n);
        let r;
        const s = await i.text();
        try {
            r = JSON.parse(s)
        } catch (e) {
            console.error("[Moonray] Non-JSON fetch response:", s);
            const t = (s || "").toLowerCase();
            if (t.includes("timeout") || t.includes("upstream")) throw new Error("Server sedang sibuk (Timeout). Silakan coba lagi.");
            if (t.includes("error")) throw new Error("Terjadi kesalahan pada server AI.");
            throw new Error("Respon server tidak valid.")
        }
        if (!i.ok) throw new Error(r.message || "Gagal menghubungi server AI.");
        return r
    }
    const n = {
        method: t || "GET",
        headers: {
            "Content-Type": "application/json",
            "x-freepik-api-key": a
        },
        url: e
    };
    o && "GET" !== t && (n.data = o);
    const i = await Capacitor.Plugins.CapacitorHttp.request(n);
    if (i.status >= 200 && i.status < 300) return i.data;
    throw new Error(i.data && i.data.message || "Gagal menghubungi server AI (Native).")
}

// --- MODIFIKASI BYPASS LOGIN & FORCE RENDER ---

function showApp() {
    console.log("Moonray: Memulai Bypass...");
    
    // Gunakan interval untuk memastikan DOM sudah siap
    const forceShow = setInterval(() => {
        const loginScreen = document.getElementById("loginScreen");
        const appElement = document.getElementById("mainApp") || document.querySelector(".app");

        if (loginScreen) {
            loginScreen.style.setProperty("display", "none", "important");
            loginScreen.classList.add("hidden");
        }

        if (appElement) {
            appElement.style.setProperty("display", "block", "important");
            appElement.classList.remove("hidden");
            
            // Jalankan inisialisasi aplikasi jika tersedia
            if (typeof init === "function") {
                console.log("Moonray: Menjalankan init()...");
                init();
                clearInterval(forceShow); // Berhenti jika sudah berhasil
            }
        }
    }, 200);

    // Stop mencoba setelah 5 detik agar tidak loop terus menerus
    setTimeout(() => clearInterval(forceShow), 5000);

    localStorage.setItem("fpk_disclaimer_accepted", "true");
}

async function checkSession() {
    // Langsung jalankan bypass
    showApp();
}

function doLogin() {
    showApp();
}

function doLogout() {
    localStorage.clear();
    location.reload();
}

// Jalankan otomatis saat script dimuat
if (document.readyState === "complete" || document.readyState === "interactive") {
    checkSession();
} else {
    document.addEventListener("DOMContentLoaded", checkSession);
}
