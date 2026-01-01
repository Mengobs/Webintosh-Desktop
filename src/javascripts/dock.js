import { updateMenu } from "./finderbar.js";
import { create, bringToFront } from "./window.js";
const tip = document.querySelector("body > div.tip");
const defaultApps = [
    "访达", "启动台", "Safari浏览器", "信息", "邮件", "地图", "照片", "FaceTime通话",
    "日历", "通讯录", "提醒事项", "备忘录", "音乐", "视频", "播客", "News", "系统设置",
    "hr", "下载_Folder", "废纸篓"
];
let noAnimation = ["启动台", "访达"];
let noMenuChanging = ["启动台"];
let doClose = ["启动台"];
let appStatus = { "访达": false };
window.appStatus = appStatus;
export const dock = document.getElementById("dock");
const dockcontainer = document.querySelector(".dockcontainer");
let imgs = dock.querySelectorAll(".container img");
let autoHide = localStorage.getItem("dock-autohide") === "on" || false;
let dockZoom = localStorage.getItem("dock-zoom") === "off" ? false : true;
let hideTimer = null;
const DOCK_TRANSITION = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
let dock_zoom = false;
let currentImg = null;

function bindClickEvent(img, light, app) {
    img.addEventListener("mouseup", () => {
        if (appStatus[img.alt] == true) {
            if (!doClose.includes(img.alt)) {
                bringToFront(document.getElementById(img.alt), img.alt);
            } else {
                window.specialCloses[img.alt]();
                light.classList.remove("on");
            }
        } else {
            if (!noAnimation.includes(img.alt)) {
                img.classList.add("opening");
                setTimeout(() => {
                    img.classList.remove("opening");
                    light.classList.add("on");
                    create("./assets/apps/" + app + ".html", img.alt, light, app === "计算器");
                    appStatus[img.alt] = true;
                    if (!noMenuChanging.includes(img.alt))
                        updateMenu(app);
                }, 2980);
            } else {
                create("./assets/apps/" + app + ".html", img.alt, light, app === "计算器");
                appStatus[img.alt] = true;
                if (!noMenuChanging.includes(img.alt))
                    updateMenu(app);
            }
        }
    });
}

function updateTipPosition() {
    if (currentImg && tip && !dock.classList.contains("hidden")) {
        const rect = currentImg.getBoundingClientRect();
        const tipWidth = tip.offsetWidth;
        tip.style.left = rect.left + rect.width / 2 - tipWidth / 2 + 'px';
        tip.style.top = rect.top - 40 + 'px';
        requestAnimationFrame(updateTipPosition);
    }
};

function bindTipEvent(img) {
    img.addEventListener("mouseover", () => {
        if (tip && !dock.classList.contains("hidden")) {
            currentImg = img;
            tip.textContent = img.alt;
            tip.style.display = "block";
            tip.style.visibility = "hidden";
            requestAnimationFrame(() => {
                tip.style.visibility = "visible";
                updateTipPosition();
            });

            const rect = img.getBoundingClientRect();

            if (!dock_zoom) {
                tip.style.left = rect.left + rect.width / 2 - tip.offsetWidth / 2 + 'px';
                tip.style.top = "616px";
            } else {
                tip.style.left = rect.left + rect.width / 2 - tip.offsetWidth / 2 + 'px';
                tip.style.top = "580px";
            }
        }
    });

    img.addEventListener("mouseout", () => {
        currentImg = null;
        if (tip) {
            tip.style.display = "none";
            tip.style.visibility = "visible";
        }
    });
}

export function addToDock(app) {
    if (document.querySelector(`#dock img[alt="${app}"]`)) return;

    let container = document.createElement("div");
    container.classList.add("container");

    let img = document.createElement("img");
    img.src = `./assets/icons/${app}.svg`;
    img.alt = app;
    container.appendChild(img);

    let light = document.createElement("div");
    light.classList.add("light");
    container.appendChild(light);

    bindClickEvent(img, light, app);
    bindTipEvent(img);

    const hr = dock.querySelector(".container hr");
    if (hr) {
        // hr is usually inside a container div, so we insert after that container
        // omg, i didn't know that before
        const hrContainer = hr.parentElement;
        let hrNextContainer = document.createElement("div");
        hrNextContainer.classList.add("container");
        hrNextContainer.appendChild(document.createElement("hr"));
        dock.insertBefore(container, hrContainer.nextSibling);
        dock.insertBefore(hrNextContainer, container.nextSibling)
    } else {
        dock.appendChild(container);
    }

    // Update imgs list for animation
    imgs = dock.querySelectorAll(".container img");
}

function init() {
    defaultApps.forEach((app, index) => {
        let container = document.createElement("div");
        container.classList.add("container");
        if (app != "hr") {
            let img = document.createElement("img");
            img.src = `./assets/icons/${app}.svg`;
            img.alt = app;
            if (app.endsWith("Folder")) {
                img.src = "./assets/icons/folder.svg";
                img.alt = app.split("_")[0];
            }
            container.appendChild(img);
            let light = document.createElement("div");
            light.classList.add("light");
            if (index == 0) {
                light.classList.add("on");
            }
            container.appendChild(light);
            bindClickEvent(img, light, app);
        } else {
            let hr = document.createElement("hr");
            container.appendChild(hr);
        }
        dock.appendChild(container);
    });
    imgs = dock.querySelectorAll(".container img");
    dock.addEventListener("animationend", () => {
        dock.style.animation = "none";
        dock.style.transition = DOCK_TRANSITION;
        if (autoHide) {
            dock.classList.add("autohide");
        }
    }, { once: true });
    window.addEventListener("dock-autohide-change", (e) => {
        console.log("Dock received autohide change:", e.detail);
        autoHide = e.detail === "on";
        if (!autoHide) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
        updateDockVisibility();
    });
    dock.addEventListener("animationend", () => {
        if (dockZoom) {
            dock.classList.add("zoom");
        }
    }, { once: true });
    window.addEventListener("dock-zoom-change", (e) => {
        console.log("Dock received zoom change:", e.detail);
        dockZoom = e.detail === "on";
    });
    if (!autoHide) {
        setTimeout(() => {
            dock.style.transition = DOCK_TRANSITION;
        }, 1000);
    }

}
function DockAutoHide() {
    document.addEventListener("mousemove", (e) => {
        if (!autoHide) return;
        const isAtBottom = window.innerHeight - e.clientY < 30;
        if (isAtBottom) {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
            if (dock.classList.contains("hidden")) {
                dock.classList.remove("hidden");
                dock.classList.add("show");
                dock.style.transform = "translateY(0)";
            } else if (!dock.classList.contains("show")) {
                dock.classList.add("show");
            }
        } else {
            if (dock.classList.contains("show") && !dock.classList.contains("hidden") && !hideTimer) {
                hideTimer = setTimeout(() => {
                    dock.classList.remove("show");
                    dock.classList.add("hidden");
                    dock.style.transform = "translateY(150%)";
                    hideTimer = null;
                }, 600);
            }
        }
    });
}

function updateDockVisibility() {
    dock.style.transition = DOCK_TRANSITION;
    dock.style.animation = "none";
    if (autoHide) {
        dock.classList.add("autohide");
        dock.classList.add("hidden");
        dock.classList.remove("show");
        dock.style.transform = "translateY(150%)";
    } else {
        dock.classList.remove("autohide");
        dock.classList.remove("hidden");
        dock.classList.remove("show");
        dock.style.transform = "translateY(0)";
    }
}

function tipSetup() {
    imgs.forEach(img => {
        bindTipEvent(img);
    });
}

function DockAnimation() {
    // dock_zoom = true; // Remove unused variable
    const baseWidth = 50;
    const mouseRange = 200;
    const maxScale = 1.8;
    const lerpSpeed = 0.3;
    let images = [];
    dockcontainer.addEventListener("mousemove", (e) => {
        images = dock.querySelectorAll(".container img");
        const mouseX = e.clientX;
        images.forEach((img) => {
            if (typeof img.currentWidth === 'undefined') img.currentWidth = baseWidth;
            if (typeof img.targetWidth === 'undefined') img.targetWidth = baseWidth;
            const rect = img.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX - centerX);
            if (dockZoom && distance < mouseRange) {
                const distanceRatio = distance / mouseRange;
                const scale = 1 + (maxScale - 1) * Math.sin((1 - distanceRatio) * Math.PI / 2);
                img.targetWidth = baseWidth * scale;
            } else {
                img.targetWidth = baseWidth;
            }
        });
    });
    dock.addEventListener("mouseleave", () => {
        images = dock.querySelectorAll(".container img");
        images.forEach((img) => {
            img.targetWidth = baseWidth;
        });
    });
    function animation() {
        if (images.length === 0) images = dock.querySelectorAll(".container img");
        images.forEach(img => {
            if (typeof img.currentWidth === 'undefined') img.currentWidth = baseWidth;
            if (typeof img.targetWidth === 'undefined') img.targetWidth = baseWidth;

            // Ensure we return to baseWidth if zoom is turned off
            if (!dockZoom) img.targetWidth = baseWidth;

            const diff = img.targetWidth - img.currentWidth;
            if (Math.abs(diff) > 0.1) {
                img.currentWidth += diff * lerpSpeed;
                img.style.width = `${img.currentWidth}px`;
                img.style.height = `${img.currentWidth}px`;
            }
        });
        requestAnimationFrame(animation);
    }
    animation();
}

init();
DockAutoHide();
DockAnimation();
window.dispatchEvent(new CustomEvent("dock-autohide-change", { detail: "off" }));
window.dispatchEvent(new CustomEvent("dock-zoom-change", { detail: "on" }));
setTimeout(tipSetup, 500);