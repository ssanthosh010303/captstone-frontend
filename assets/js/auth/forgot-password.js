/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 14/06/2024
 */
async function sendFormData(email) {
    try {
        const response = await fetch(
            "http://4.240.96.78:5064/api/employee/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ "email": email })
            }
        );

        showNotification(
            "Request Placed Successfully",
            "An email has been sent to your inbox to reset your password. 📨",
            "success"
        );
    } catch {
        showNotificationNetworkError();
    }
}

function isAuthenticated() {
    return localStorage.getItem("accessToken") != null;
}

if (isAuthenticated()) {
    window.location.href = "/";
}

const formElement = document.querySelector("form");

formElement.addEventListener("submit", function(event) {
    event.preventDefault();

    const formData = new FormData(formElement);

    sendFormData(formData.get("email"));
});
