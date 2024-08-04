/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 25/06/2024
 */
async function verifyEmail() {
    const verificationStatusElement = document.getElementById("verification-status");

    const searchParams = new URLSearchParams(
        new URL(window.location.href).search
    );
    const token = searchParams.get("token");

    if (token == null || token == "") {
        verificationStatusElement.textContent = "Verification Failed!";
        verificationStatusElement.className = "text-danger";

        return;
    }

    const response = await fetch(
        "http://4.240.96.78:5064/api/employee/update-email/" + token
    );
    if (response.status == 204) {
        verificationStatusElement.textContent = "Verified!";
        verificationStatusElement.className = "text-success";
    } else {
        verificationStatusElement.textContent = "Verification Failed!";
        verificationStatusElement.className = "text-danger";
    }
}

verifyEmail();
