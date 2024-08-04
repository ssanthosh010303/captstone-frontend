/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 14/06/2024
 */
TOAST = `<div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
  <div class="toast-header">
    <div class="rounded p-2 me-2 bg-%TYPE%"></div>
    <strong class="me-auto">%TITLE%</strong>
    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
  </div>
  <div class="toast-body">
    %MESSAGE%
  </div>
</div>
`

function setTheme() {
    const isDarkThemePreferred = window.matchMedia(
        "(prefers-color-scheme: dark)"
    ).matches;

    document.documentElement.setAttribute(
        "data-bs-theme", isDarkThemePreferred ? "dark" : "light"
    );
    document.body.className = "bg-" + (isDarkThemePreferred ? "black" : "light");
}

function showNotification(title, message, type = "info") {
    const toastContainerElement = document.getElementById("toast-container");

    toastContainerElement.innerHTML += TOAST
        .replace("%TITLE%", title)
        .replace("%MESSAGE%", message)
        .replace("%TYPE%", type);
}

function getShortDate(date) {
    return date.split('T')[0].replaceAll('-', '/');
}

function getShortDateTime(dateTime) {
    let data = dateTime.split('T')

    data[0] = data[0].replaceAll('-', '/')
    data[1] = data[1].slice(0, data[1].indexOf('.'))

    return data[0] + " at " + data[1];
}

function showNotificationNetworkError() {
    showNotification(
        "Network Error",
        "A network error occured while trying to make a request. Sorry for the inconvinience. 🌐",
        "danger"
    )
}

function showNotificationServerUnresponsive() {
    showNotification(
        "Server Error",
        "We're sorry, but something went wrong on our side. Please try again later.",
        "danger"
    )
}

setTheme();
window.matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change", setTheme
);
