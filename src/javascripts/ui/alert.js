let newAlert;
let newAlertTitle;
let newAlertText;
let newAlertButton;

export function createAlert(icon, title, text, btn, command, mobile = false) {
    newAlert = document.createElement("swift-messagebox");
    newAlert.iconpath = icon;
    newAlert.style.zIndex = 2048;
    newAlertTitle = document.createElement("p");
    newAlertTitle.setAttribute("slot", "title");
    newAlertTitle.innerHTML = title;
    newAlertText = document.createElement("p");
    newAlertText.setAttribute("slot", "text");
    newAlertText.innerHTML = text;
    newAlertButton = document.createElement("swift-button");
    newAlertButton.setAttribute("slot", "button");
    newAlertButton.setAttribute("primary", "");
    newAlertButton.innerHTML = btn;
    if (command == "close") {
        newAlertButton.onclick = () => {
            newAlert.style.display = "none";
        }
    } else if (command == "closepage") {
        newAlertButton.onclick = () => {
            window.location.href = "about:blank";
            window.close();
        }
    }
    newAlert.appendChild(newAlertTitle);
    newAlert.appendChild(newAlertText);
    newAlert.appendChild(newAlertButton);
    document.body.appendChild(newAlert);
    setTimeout(() => {
        newAlert.style.left = `${(document.body.clientWidth - (newAlert.clientWidth)) / 2}px`;
        newAlert.style.top = `${(document.body.clientHeight - (newAlert.clientHeight)) / 2}px`;
    }, 50);
}