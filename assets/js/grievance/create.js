/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 24/06/2024
 */
async function loadGrievancePriority() {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance-priority");

        return await response.json();
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function loadGrievanceCategory() {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance-category");

        return await response.json();
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function loadGrievanceSubcategory(id) {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance-subcategory?categoryid=" + id);

        return await response.json();
    } catch (erorr) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function sendFormData(formData) {
    console.log(formData);

    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance", {
            method: "POST",
            headers: generateHeaderJwt(),
            body: JSON.stringify({
                deadline: formData["deadline"],
                grievanceSubcategoryId: parseInt(formData["grievancesubcategoryid"], 10),
                grievancePriorityId: parseInt(formData["grievancepriorityid"], 10),
                title: formData["title"],
                isAnonymous: true
            })
        });

        if (response.status == 204) {
            showNotification(
                "Success",
                "Your grievance has been submitted successfully!",
                "success"
            );

            setTimeout(() => { window.location.href = "/pages/grievance/" }, 2000);
        } else if (response.status == 400) {
            let data = await response.json();

            if (data["title"] == "DeadlineTooClose")
                showNotification(
                    "Invalid Deadline",
                    "The deadline you set is too short, please set a minimum of three days.",
                    "warning"
                );

            if (data["title"] == "TooManyOpenGrievances")
                showNotification(
                    "Cannot Submit the Grievance",
                    "You have more than 5 grievances pending resolution, resolve them to create more.",
                    "warning"
                );

        }
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

function addGrievancePriorities(data) {
    const prioritySelectorElement = document.getElementById("priority-select");

    for (let index = 0; index < data.length; index++) {
        let optionElement = document.createElement("option");

        optionElement.value = data[index].id;
        optionElement.textContent = data[index].name;

        prioritySelectorElement.appendChild(optionElement);
    }
}

function addGrievanceCategories(data) {
    const categorySelectorElement = document.getElementById("category-select");

    for (let index = 0; index < data.length; index++) {
        let optionElement = document.createElement("option");

        optionElement.value = data[index].id;
        optionElement.title = data[index].description;
        optionElement.textContent = data[index].name;

        categorySelectorElement.appendChild(optionElement);
    }
}

function addGrievanceSubcategories(data) {
    const subcategorySelectorElement = document.getElementById("subcategory-select");

    subcategorySelectorElement.innerHTML = "";

    for (let index = 0; index < data.length; index++) {
        let optionElement = document.createElement("option");

        optionElement.value = data[index].id;
        optionElement.textContent = data[index].name;

        subcategorySelectorElement.appendChild(optionElement);
    }
}

if (!isAuthenticated())
    redirectTo("/pages/auth/log-in.html?r=/pages/grievance/");

loadGrievancePriority()
    .then((data) => {
        addGrievancePriorities(data);
    });

loadGrievanceCategory()
    .then((data) => {
        addGrievanceCategories(data);
    });

document.getElementById("category-select").addEventListener("change", function () {
    loadGrievanceSubcategory(this.value)
        .then((data) => {
            addGrievanceSubcategories(data);
        });
});

const formElement = document.querySelector("form");

formElement.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(formElement);
    var formDataObject = {};

    formData.forEach(function (value, key) {
        formDataObject[key] = value;
    });

    sendFormData(formDataObject);
});
