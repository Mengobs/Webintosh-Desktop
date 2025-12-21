let newNotification;
let newNotificationTitle;
let newNotificationText;
let newNotificationTime;
let audio = new Audio("./assets/sounds/alert.ogg");

export function createNotification(icon, title, text, command, time = "刚刚") {
    audio.play();

    newNotification = document.createElement("c-notification");
    newNotification.iconpath = icon;
    newNotification.style.zIndex = 2048;
    newNotification.style.top = "34px";
    newNotification.shadowRoot.querySelector("img").src = icon;
    newNotificationTitle = document.createElement("p");
    newNotificationTitle.setAttribute("slot", "title");
    newNotificationTitle.innerHTML = title;
    newNotificationText = document.createElement("p");
    newNotificationText.setAttribute("slot", "text");
    newNotificationText.innerHTML = text;
    newNotificationTime = document.createElement("p");
    newNotificationTime.setAttribute("slot", "time");
    newNotificationTime.innerHTML = time;
    newNotification.onclick = command;
    newNotification.appendChild(newNotificationTitle);
    newNotification.appendChild(newNotificationText);
    newNotification.appendChild(newNotificationTime);
    document.body.appendChild(newNotification);
    setTimeout(() => {
        newNotification.classList.add("close");
        setTimeout(() => {
            newNotification.remove();
        }, 400);
    }, 5500);
}