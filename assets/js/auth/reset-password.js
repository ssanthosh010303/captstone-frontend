/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 26/06/2024
 */
function showResetPasswordDialog() {
    document.getElementById("main-container").style.display = "block";
}

async function sendFormData(token, password, confirmPassword) {
    if (password != confirmPassword) {
        showNotification(
            "Invalid Input",
            "Both fields must have the same value, please retry.",
            "warning"
        );
        return;
    }

    try {
        const response = await fetch(
            "https://capstone-backend.azurewebsites.net/api/employee/reset-password/" + token, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                "password": password
            })
        });

        if (response.status == 204) {
            showNotification(
                "Success!",
                "Your password has been reset successfully!",
                "success"
            );

            setTimeout(() => {
                window.location.href = "/pages/auth/log-in.html"
            }, 2000);
        }

        if (response.status == 400) {
            showNotification(
                "Invalid Link",
                "The link you've provided is either invalid or expired.",
                "danger"
            );
        }

    } catch (error) {
        showNotificationNetworkError();
        console.error(error);
    }
}

const searchParams = new URLSearchParams(
    new URL(window.location.href).search
);

const token = searchParams.get("token");

if (token == null || token == "") {
    showNotification(
        "Invalid Link",
        "The link you've provided is either invalid or has expired.",
        "danger"
    );
} else {
    showResetPasswordDialog();

    const formElement = document.querySelector("form");

    formElement.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(formElement);

        sendFormData(token, formData.get("password"), formData.get("confirm-password"));
    });
}
