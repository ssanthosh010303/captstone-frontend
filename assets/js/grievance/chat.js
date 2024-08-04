/*
 * Author: Apache X692 Attack Helicopter
 * Created on: 24/06/2024
 */
const CHAT_ITEM = `<div id="chat-item-container-%ID" class="d-flex flex-column align-items-%ALIGNMENT%">
  <div class="fst-italic text-muted text-small">
    <span>%CREATED_ON%</span>
  </div>
  <p class="mb-2">%DESCRIPTION%</p>
</div>
<hr>`

const FA_ITEM = `<li class="list-group-item">
  <a class="fa-item" id="%ID%">%TITLE%</a>
</li>`

let creatorId = -1;

async function changeGrievanceStatusRequest(grievanceId, statusId) {
    const response = await fetch(`http://4.240.96.78:5064/api/grievance/${grievanceId}/status?statusid=${statusId}`, {
        method: "GET",
        headers: generateHeaderJwt()
    });

    if (response.status == 204)
        showNotification(
            "Success",
            "Your grievance has been updated successfully!",
            "success"
        );
}

async function getDownloadUrl(blobName) {
    const response = await fetch(`http://4.240.96.78:5064/api/file-attachment/download-url?blobname=${blobName}`, {
        method: "POST",
        headers: generateHeaderJwt(),
        body: ""
    });

    if (!response.ok)
        throw new Error("Failed to get download URL, please try later.");

    return await response.text();
}

async function openFile(blobName) {
    try {
        const downloadUrl = await getDownloadUrl(blobName);

        window.open(downloadUrl, "_blank");
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function getUploadUrls(grievanceId, fileExtensions) {
    const response = await fetch("http://4.240.96.78:5064/api/file-attachment/upload-urls", {
        method: "POST",
        headers: generateHeaderJwt(),
        body: JSON.stringify({
            submittedWithGrievanceId: grievanceId,
            fileExtensions: fileExtensions
        })
    });

    return await response.json()
}

async function uploadFilesToAzureBlobStorage(files, uploadUrls) {
    let successList = [];
    let uploadUrlsValues = Object.values(uploadUrls);

    for (let index = 0; index < uploadUrlsValues.length; index++) {
        const uploadResponse = await fetch(uploadUrlsValues[index], {
            method: "PUT",
            headers: {
                "x-ms-blob-type": "BlockBlob" // Required Header for Azure Blob Storage
            },
            body: files[index]
        })

        successList.push(uploadResponse.ok);
    }

    return successList;
}

async function acknowledgeUploadedFiles(files, uploadUrls, successList) {
    let body = {
        submittedWithGrievanceId: grievanceId,
        fileAttachments: []
    };
    let uploadUrlsKeys = Object.keys(uploadUrls);

    for (let index = 0; index < successList.length; index++) {
        if (successList[index]) {
            body.fileAttachments.push({
                blobName: uploadUrlsKeys[index],
                title: files[index]["name"]
            })
        }
    }

    const response = await fetch("http://4.240.96.78:5064/api/file-attachment", {
        method: "POST",
        headers: generateHeaderJwt(),
        body: JSON.stringify(body)
    });

    if (response.status == 204) {
        showNotification(
            "Success",
            "All attachments have been uploaded successfully!",
            "success"
        );
    } else {
        showNotificationNetworkError();
    }
}

async function uploadFiles(grievanceId, files) {
    let fileExtensions = [];
    let uploadUrls = null;

    for (let file of files)
        fileExtensions.push(file.name.split('.')[1]);

    getUploadUrls(grievanceId, fileExtensions)
        .then((data) => {
            uploadUrls = data;
            return uploadFilesToAzureBlobStorage(files, data);
        })
        .then((successList) => {
            acknowledgeUploadedFiles(files, uploadUrls, successList);
        })
        .catch((error) => {
            console.error(error);
        });
}

async function loadGrievanceDetails(id) {
    try {
        const response = await fetch("http://4.240.96.78:5064/api/grievance/" + id, {
            method: "GET",
            headers: generateHeaderJwt()
        });

        let data = await response.json();

        creatorId = data.createdBy.id;

        if (data.grievanceStatus.id == 7 || data.grievanceStatus.id == 5 || data.grievanceStatus.id == 3) {
            let chatBoxContainer = document.getElementById("chat-box");

            chatBoxContainer.classList.remove("d-flex");
            chatBoxContainer.classList.add("d-none");

            document.getElementById("actions-container").style.display = "none";
            document.getElementById("file-attachment-add-btn").style.display = "none";
        }

        return data;
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function loadGrievanceResponses(id, skip = 0, take = 10) {
    try {
        const response = await fetch(
            "http://4.240.96.78:5064/api/grievance-response/?grievanceid="
            + id + "&skip=" + skip + "&take=" + take, {
            method: "GET",
            headers: generateHeaderJwt()
        });

        return await response.json();
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

async function sendFormData(id, description) {
    try {
        const response = await fetch(
            "http://4.240.96.78:5064/api/grievance-response", {
            method: "POST",
            headers: generateHeaderJwt(),
            body: JSON.stringify({
                grievanceId: id,
                description: description
            })
        });

        if (response.status == 200) {
            showGrievanceResponses([await response.json()]);
        }

    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
}

function showGrievanceResponses(data) {
    document.getElementById("chat-loading-placeholder").style.display = "none";

    const employeeId = getId();

    for (var item of data) {
        document.getElementById("chat-container").innerHTML += CHAT_ITEM
            .replace("%ALIGNMENT%", employeeId == item["createdById"] ? "end" : "start")
            .replace("%ID", item["id"])
            .replace("%CREATED_ON%", getShortDateTime(item["createdOn"]))
            .replace("%DESCRIPTION%", item["description"]);
    }

    const element = document.getElementById("chat-container");

    element.scrollTo({
        top: element.scrollHeight,
        behavior: "smooth"
    });
}

function showGrievanceDetails(data) {
    document.getElementById("grievance-title").textContent = data["title"];

    document.getElementById("grievance-created-on").textContent
        = getShortDate(data["createdOn"]);
    document.getElementById("grievance-deadline").textContent
        = getShortDate(data["deadline"]);

    document.getElementById("grievance-status").textContent
        = getShortDate(data["grievanceStatus"]["name"]);
    document.getElementById("grievance-priority").textContent
        = getShortDate(data["grievancePriority"]["name"]);
    document.getElementById("grievance-category").textContent
        = getShortDate(data["grievanceSubcategory"]["name"]);

    if (data["fileAttachments"].length) {
        let fileAttachmentContainer = document.getElementById("file-attachment-container");

        document.getElementById("file-attachment-placeholder").style.display = "none";

        for (let file of data["fileAttachments"]) {
            fileAttachmentContainer.innerHTML += FA_ITEM
                .replace("%ID%", file["blobName"])
                .replace("%TITLE%", file["title"]);
        }
    }
}

function showError() {
    document.getElementById("alert").style.display = "block";
}

const isLoggedIn = isAuthenticated();

if (!isLoggedIn)
    redirectTo("/pages/auth/log-in.html?r=" + window.location.herf);

setNavbar(isLoggedIn);

const searchParams = new URLSearchParams(
    new URL(window.location.href).search
);

const grievanceId = searchParams.get("id");

if (isAuthorized("Manager")) {
    document.getElementById("hide-for-manager").style.display = "none";
} else {
    document.getElementById("close-btn-m").style.display = "none"
}

if (grievanceId == null || grievanceId == '') {
    showError();
} else {
    document.getElementById("main-container").style.display = "block";

    loadGrievanceDetails(grievanceId)
        .then((data) => {
            showGrievanceDetails(data);
            return loadGrievanceResponses(grievanceId);
        })
        .then((responses) => {
            showGrievanceResponses(responses);
        });
}

const formElement = document.querySelector("form");

formElement.addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(formElement);

    sendFormData(grievanceId, formData.get("chat-description"));
});

document.getElementById("file-attachment-add-btn").addEventListener("click", function () {
    document.getElementById("file-input").click();
});

document.getElementById("file-input").addEventListener("change", function (event) {
    if (event.target.files.length)
        uploadFiles(grievanceId, event.target.files);
});

document.getElementById("file-attachment-container").addEventListener("click", function (event) {
    if (event.target.classList.contains("fa-item")) {
        const blobName = event.target.id;

        openFile(blobName);
    }
});

document.getElementById("withdraw-btn").addEventListener("click", function () {
    try {
        changeGrievanceStatusRequest(grievanceId, 7)
            .then(() => {
                sendFormData(
                    grievanceId,
                    "<b class='text-warning'>Grievance Withdrawn with Reason: </b>"
                    + document.getElementById("withdraw-reason-textarea").value
                ).then((data) => {
                    showGrievanceResponses(data);
                });
                setTimeout(() => { location.reload(); }, 2000);
            });
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
});

document.getElementById("escalate-btn").addEventListener("click", function () {
    try {
        changeGrievanceStatusRequest(grievanceId, 6)
            .then(() => {
                sendFormData(
                    grievanceId,
                    "<b class='text-info'>Requested Escalation with Reason: </b>"
                    + document.getElementById("escalate-reason-textarea").value
                ).then((data) => {
                    showGrievanceResponses(data);
                });
                setTimeout(() => { location.reload(); }, 2000);
            });
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
});

document.getElementById("resolve-btn").addEventListener("click", function () {
    try {
        changeGrievanceStatusRequest(grievanceId, 5)
            .then(() => {
                sendFormData(
                    grievanceId,
                    "<b class='text-info'>Grievance Resolved! ✅</b>"
                ).then((data) => {
                    showGrievanceResponses(data);
                });
                setTimeout(() => { location.reload(); }, 2000);
            });
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
});

document.getElementById("close-btn").addEventListener("click", function () {
    try {
        changeGrievanceStatusRequest(grievanceId, 3)
            .then(() => {
                sendFormData(
                    grievanceId,
                    "<b class='text-danger'>Grievance Rejected with Reason: </b>"
                    + document.getElementById("close-reason-textarea").value
                ).then((data) => {
                    showGrievanceResponses(data);
                });
                setTimeout(() => { location.reload(); }, 2000);
            });
    } catch (error) {
        console.error(error);
        showNotificationNetworkError();
    }
});

