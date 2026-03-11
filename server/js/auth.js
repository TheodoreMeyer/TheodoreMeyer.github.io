const API = "https://script.google.com/macros/s/AKfycbwplqPfAiIXNnOneKC7oXhKk-h6N-rlU479altLiECu/exec";
const CLIENT_TOKEN = "f3ae101d-d2ea-4cf2-b8b6-e7330854cf7a";

let CURRENT_USER = null;

// ---------- GET TOKEN ----------
function getToken() {
    let token =
        new URLSearchParams(window.location.search).get("user") ||
        localStorage.getItem("user_token");

    if (!token) {
        token = prompt("Enter your voting token:");
    }

    if (!token) {
        window.location.href = "/404.html";
        return null;
    }

    localStorage.setItem("user_token", token);
    return token;
}

// ---------- VALIDATE USER ----------
function requireAuth(callback) {

    const token = getToken();
    if (!token) return;

    const script = document.createElement("script");
    script.src =
        `${API}?action=validateUser&user=${token}&client=${CLIENT_TOKEN}&callback=_authCallback`;

    window._authCallback = function (data) {

        if (!data || data.error || !data.valid) {
            localStorage.removeItem("user_token");
            alert("Invalid token.");
            window.location.href = "/404.html";
            return;
        }

        CURRENT_USER = data;

        if (callback) callback(data);
    };

    document.body.appendChild(script);
}

// ---------- REQUIRE ADMIN ----------
function requireAdmin(callback) {

    requireAuth(function(user){

        if(user.role !== "Admin"){
            alert("Admin access required.");
            window.location.href = "/server/";
            return;
        }

        if(callback) callback(user);
    });

}

// ---------- LOGOUT ----------
function logout(){
    localStorage.removeItem("user_token");
    location.reload();
}