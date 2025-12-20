import { createAlert } from '../ui/alert.js';

let window_settings = document.querySelector(".window.settings");
let selectionIcons = document.querySelectorAll(".left .list .selection div.icon");
let selections = document.querySelectorAll(".left .list .selection");
let rightTitle = document.querySelector(".right .toolbar p");

let nowPage = document.getElementById("moonphase.last.quarter.inverse");
let nowSelection = document.querySelector(".left .list .selection.focus");

selectionIcons.forEach(icon => {
    let scale = "75%";
    if (icon.getAttribute("scale")) {
        scale = icon.getAttribute("scale");
    }
    icon.style.background = `url(${icon.getAttribute("icon")}) center center / ${scale} no-repeat,
        url(./assets/images/backgrounds/bg.${icon.classList[1]}.svg) center center / cover no-repeat`;
});

selections.forEach(selection => {
    selection.addEventListener("click", () => {
        nowSelection.classList.remove("focus");
        selection.classList.add("focus");
        nowSelection = selection;

        let pageId = selection.querySelector("div").getAttribute("icon").replace("./assets/images/", "").replace("./assets/icons/", "");
        if (pageId.includes(".svg")) {
            pageId = pageId.replace(".svg", "");
        } else if (pageId.includes(".jpeg")) {
            pageId = pageId.replace(".jpeg", "");
        } else if (pageId.includes(".png")) {
            pageId = pageId.replace(".png", "");
        } else {
            createAlert("./assets/icons/访达.svg", "系统设置遇到问题。", "Selection 图标拓展名不支持", "好", "close");
        }
        let nextPage = document.getElementById(pageId);

        nowPage.classList.remove("focus");
        nextPage.classList.add("focus");
        nowPage = nextPage;

        rightTitle.textContent = selection.querySelector("p:not(.title)").textContent;
    });
});

const dockAutoHideSwitch = document.getElementById("dock-autohide");
if (dockAutoHideSwitch) {
    dockAutoHideSwitch.state = localStorage.getItem("dock-autohide") || "off";

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === "attributes" && mutation.attributeName === "state") {
                const newState = dockAutoHideSwitch.getAttribute("state");
                localStorage.setItem("dock-autohide", newState);
                window.dispatchEvent(new CustomEvent("dock-autohide-change", { detail: newState }));
            }
        });
    });

    observer.observe(dockAutoHideSwitch, { attributes: true });
}