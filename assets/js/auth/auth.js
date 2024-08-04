/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 24/06/2024
 */
function setJwt(accessToken, refreshToken = null) {
    localStorage.setItem("accessToken", accessToken);

    if (refreshToken != null)
        localStorage.setItem("refreshToken", refreshToken);
}

function getJwt(requireAccessToken = true, requireRefreshToken = false) {
    const accessToken = localStorage.getItem("accessToken");

    if (accessToken == null)
        console.error("Access token is not found.");

    if (requireAccessToken && !requireRefreshToken)
        return accessToken;

    const refreshToken = localStorage.getItem("refreshToken");

    if (refreshToken == null)
        console.error("Refresh token is not found.");

    if (requireRefreshToken && !requireAccessToken)
        return refreshToken;

    return {
        "accessToken": accessToken,
        "refreshToken": refreshToken
    };
}

function clearJwt() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
}

function parseJwt() {
    try {
        const parts = getJwt().split('.');
        const decodedPayload = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));

        return JSON.parse(decodedPayload);
    } catch {
        return "";
    }
}

function isAuthenticated() {
    const accessToken = getJwt();

    return accessToken != null && accessToken != "";
}

function isAuthorized(role = "User") {
    return parseJwt()["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] === role;
}

function getId() {
    return parseJwt()["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
}

function isJwtExpired(token, thresholdSeconds = 60) {
    const { exp } = JSON.parse(atob(token.split('.')[1]));
    return (exp * 1000) - Date.now() <= thresholdSeconds * 1000;
}

function setNavbar(isLoggedIn) {
    const logInElement = document.getElementById("log-in-handler");
    const logOutElement = document.getElementById("log-out-handler");

    const profileElement = document.getElementById("profile-handler");
    const adminElement = document.getElementById("admin-handler");

    const leftNavbar = document.getElementById("left-navbar");

    if (isLoggedIn) {
        logInElement.style.display = "none";
        logOutElement.style.display = "block";
        profileElement.style.display = "block";

        if (isAuthorized("Admin"))
            adminElement.style.display = "block";

        leftNavbar.style.display = "flex";

    } else {
        logInElement.style.display = "block";
        logOutElement.style.display = "none";

        profileElement.style.display = "none";
        adminElement.style.display = "none";

        leftNavbar.style.display = "none";

    }
}

function redirectTo(page) {
    window.location.href = page;
}

function generateHeaderJwt(tokenType = "accessToken") {
    return {
        "Authorization": `Bearer ${tokenType === "accessToken" ? getJwt() : getJwt(false, true)}`,
        "Content-Type": "application/json"
    };
}

function generateHeaderBasicAuth(username, password) {
    const token = btoa(unescape(encodeURIComponent(`${username}:${password}`)));

    return {
        "Authorization": `Basic ${token}`,
        "Content-Type": "application/json"
    };
}

async function refreshAccessToken() {
    const response = await fetch(
        "http://192.168.0.106:5064/api/jwt/refresh", {
        method: "GET",
        headers: generateHeaderJwt("refreshToken"),
    }
    );

    if (response.status == 401) throw new Error("unauthorized");

    if (response.status >= 500)
        throw new Error("The server failed to respond.");

    return await response.json()["accessToken"];
}

function logOut() {
    if (isAuthenticated()) {
        clearJwt();
        redirectTo('/');
    }
}

function handleUnauthorizedRequest() {
    refreshAccessToken()
        .then(refreshedAccessToken => {
            setJwt(accessToken = refreshedAccessToken)
        })
        .catch(error => {
            if (error.message === "unauthorized") {
                showNotification(
                    "Session Expired",
                    "Your session has expired, please log-in to continue."
                );
                logOut();
            } else {
                showNotificationNetworkError();
            }
        });
}
