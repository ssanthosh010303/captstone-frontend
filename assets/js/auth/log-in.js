/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 14/06/2024
 */
async function sendFormData(username, password) {
    try {
        const response = await fetch(
            "http://4.240.96.78:5064/api/jwt", {
            method: "GET",
            headers: generateHeaderBasicAuth(username, password)
        }
        );

        if (response.status == 200) {
            showNotification(
                "Log-in Successful!",
                "You have been successfully logged-in to the website. 🔑",
                "success"
            );

            return await response.json();
        }

        if (response.status == 401)
            showNotification(
                "Invalid Credentials",
                "Plesae ensure you enter the right credentials."
            );

        return null;
    } catch {
        showNotification(
            "Network Error",
            "A network error occured when trying to make a request. 🌐",
            "danger"
        );
    }
}

if (isAuthenticated()) redirectTo("/");

const searchParams = new URLSearchParams(
    new URL(window.location.href).search
);
const redirectToUrl = decodeURIComponent(searchParams.get("r"));

if (redirectToUrl != "null")
    showNotification(
        "Access Denied",
        "You must first log-in to access this page."
    );

const formElement = document.querySelector("form");

formElement.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(formElement);

    sendFormData(formData.get("username"), formData.get("password"))
        .then(tokens => {
            if (tokens != null) {
                setJwt(tokens["accessToken"], tokens["refreshToken"]);

                window.location.href = redirectToUrl == "null" ? '/' : redirectToUrl;
            }
        });
});
