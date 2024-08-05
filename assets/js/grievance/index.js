/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 24/06/2024
 */
const GRIEVANCE_ITEM = `<div class="grievance-container bg-body border rounded p-3 mb-3">
  <a href="/pages/grievance/chat.html?id=%ID%" style="text-decoration: none;">
    <h5>%TITLE%</h5>
  </a>
  <div>
    <span id="deadline">%DEADLINE%</span>
    <b>•</b>
    <span id="status">%STATUS%</span>
  </div>
</div>
`

let grievances;

async function getGrievances() {
    try {
        const response = await fetch("https://capstone-backend.azurewebsites.net/api/grievance?isassignee=" + (isAuthorized("Manager") ? 1 : 0), {
            method: "GET",
            headers: generateHeaderJwt(),
        });

        if (response.status == 500) {
            showNotificationServerUnresponsive();
            return null;
        }

        grievances = await response.json();

        return grievances;
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

function showGrievances(data) {
    let listContainer = document.getElementById("list-container");

    document.getElementById("loading-placeholder").style.display = "none";

    if (data.length == 0) {
        listContainer.innerHTML = "<i>No grievances found, create one right now!</i>";
        return;
    }

    for (let index = 0; index < data.length; index++) {
        listContainer.innerHTML += GRIEVANCE_ITEM
            .replace("%ID%", data[index]["id"])
            .replace("%TITLE%", data[index]["title"])
            .replace("%DEADLINE%", data[index]["deadline"].split('T')[0].replaceAll('-', '/'))
            .replace("%STATUS%", data[index]["status"]);
    }
}

const isLoggedIn = isAuthenticated();

if (!isLoggedIn)
    redirectTo("/pages/auth/log-in.html?r=/pages/grievance/");

setNavbar(isLoggedIn);

getGrievances()
    .then(data => {
        if (data == null) return;

        showGrievances(data);
    });
