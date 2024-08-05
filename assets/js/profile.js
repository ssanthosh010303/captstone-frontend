/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 26/06/2024
 */
var userId = null;

async function getUserDetails() {
    try {
        const response = await fetch("https://capstone-backend.azurewebsites.net/api/employee/profile", {
            method: "GET",
            headers: generateHeaderJwt()
        });

        if (response.status == 200) {
            const data = await response.json();
            userId = data["id"];

            return data;
        }
    } catch {
        showNotification(
            "Network Error",
            "An network error occured when attempting to fetch resources.",
            "danger"
        );
    }
}

async function sendGeneralFormData(formData) {
    try {
        const response = await fetch("https://capstone-backend.azurewebsites.net/api/employee/" + userId, {
            method: "PUT",
            headers: generateHeaderJwt(),
            body: JSON.stringify(formData)
        });

        if (response.status == 200)
            showNotification(
                "Update Successful",
                "Your data has been updated successfully!",
                "success"
            );

        console.log(await response.json());
    } catch (error) {
        console.error(error);
        throw new Error();
    }
}

async function sendEmailFormData(email) {
    try {
        const response = await fetch("https://capstone-backend.azurewebsites.net/api/employee/update-email", {
            method: "POST",
            headers: generateHeaderJwt(),
            body: JSON.stringify({ "email": email })
        }
        );

        if (response.status == 200)
            showNotification(
                "Update in Progress",
                "Please check your email inbox for an email change request. ✉️",
                "success"
            );
    } catch {
        showNotificationNetworkError();
    }
}

async function sendPasswordFormData(oldPassword, newPassword) {
    try {
        const response = await fetch("https://capstone-backend.azurewebsites.net/api/employee/set-password", {
            method: "POST",
            headers: generateHeaderJwt(),
            body: JSON.stringify({
                "oldPassword": oldPassword,
                "newPassword": newPassword
            })
        });

        if (response.status == 204)
            showNotification(
                "Success",
                "Your password has been changed successfully!",
                "success"
            );

        if (response.status == 400) {
            const data = await response.json();

            if (data.title == "InvalidOldPassword") {
                showNotification(
                    "Update Failed",
                    "Invalid old password provided. If you forgot your password, log-out and reset it.",
                    "warning"
                );
            } else {
                showNotification(
                    "Update Failed",
                    "Please make sure you enter a password at with minimum of 8 characters.",
                    "warning"
                );
            }
        }
    } catch {
        showNotificationNetworkError();
    }
}

function displayData(data) {
    document.getElementById("name-input").value = data["fullName"];
    document.getElementById("department-input").value = data["department"]["name"];
    document.getElementById("designation-input").value = data["designation"]["name"];

    document.getElementById("username-input").value = data["username"];
    document.getElementById("phone-input").value = data["phone"];
}

if (!isAuthenticated())
    redirectTo("/pages/log-in.html?r=" + encodeURIComponent(window.location.href));

getUserDetails()
    .then(data => {
        displayData(data);

        if (data["isActive"] == false)
            showNotification(
                "Account Not Activated",
                "Your account is not activated. You need to activate it by following the link sent to your email. ✉️",
                "warning"
            );
    });

const generalFormElement = document.getElementById("general-form");

generalFormElement.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(generalFormElement);
    const formDataObject = {};

    for (let [key, value] of formData.entries())
        formDataObject[key] = value;

    showNotification(
        "Information",
        "You're data is being updated... 👨"
    );

    sendGeneralFormData(formDataObject);
});

/*
    const emailFormElement = document.getElementById("email-form");

    emailFormElement.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(emailFormElement);

        showNotification(
            "Information",
            "You're email is being changed... 👨"
        );

        sendEmailFormData(formData.get("email"));
    });
*/

const passwordFormElement = document.getElementById("password-form");

passwordFormElement.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(passwordFormElement);
    const formDataObject = {};

    for (let [key, value] of formData.entries())
        formDataObject[key] = value;

    if (formDataObject["npassword"] != formDataObject["cpassword"]) {
        showNotification(
            "Invalid Input",
            "Please ensure the \"Password\" and \"Confirm Password\" fields are equal.",
            "warning"
        );

        return;
    }

    showNotification(
        "Information",
        "You're email is being updated... 👨"
    );

    sendPasswordFormData(formDataObject["opassword"], formDataObject["npassword"]);
});
