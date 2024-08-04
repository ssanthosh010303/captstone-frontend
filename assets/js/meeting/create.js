async function loadGrievances() {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance?isassignee=1", {
            metod: "POST",
            headers: generateHeaderJwt()
        });

        var data = await response.json();

        if (data.length == 0)
            showNotification(
                "Error",
                "You don't have any grievances assigned right now.",
                "danger"
            );

        return data;
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function loadAttendees() {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/employee");

        return await response.json();
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

function addAttendees(data) {
    const categorySelectorElement = document.getElementById("attendees-select");

    for (let index = 0; index < data.length; index++) {
        let optionElement = document.createElement("option");

        optionElement.value = data[index].id;
        optionElement.textContent = data[index].fullName;

        categorySelectorElement.appendChild(optionElement);
    }
}

function addGrievances(data) {
    console.log(data);

    const categorySelectorElement = document.getElementById("grievances-select");

    for (let index = 0; index < data.length; index++) {
        let optionElement = document.createElement("option");

        optionElement.value = data[index].id;
        optionElement.textContent = data[index].title;

        categorySelectorElement.appendChild(optionElement);
    }
}

async function sendFormData(formData) {
    let body = {
        date: formData["date"],
        grievanceId: parseInt(formData["grievanceid"], 10),
        attendeeId: parseInt(formData["attendeeid"], 10),
        title: formData["title"],
        description: formData["description"],
        duration: "15:00:00"
    };

    console.log(body);

    try {
        const response = await fetch("http://4.240.96.78:5064/api/meeting", {
            method: "POST",
            headers: generateHeaderJwt(),
            body: JSON.stringify(body)
        });

        if (response.status == 200) {
            showNotification(
                "Success",
                "Your grievance has been submitted successfully!",
                "success"
            );

            setTimeout(() => { window.location.href = "/pages/meeting/" }, 2000);
        } else if (response.status == 400) {
            showNotificationNetworkError();
        }
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

loadAttendees()
    .then((data) => {
        addAttendees(data);
    });

loadGrievances()
    .then((data) => {
        addGrievances(data);
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
