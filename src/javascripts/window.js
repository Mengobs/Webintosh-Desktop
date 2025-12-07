import { createAlert } from "./ui/alert.js";

let fd = document.querySelector(".finderbar")
let zIndex = 5;

export function create(file, light = null) {
    fetch(file)
        .then(response => {
            if (response.status !== 200) {
                createAlert("./assets/icons/访达.svg", "加载 App 时遇到错误", `此 App 仍在开发中<br/>服务器返回状态码: ${response.status}`, "好", "close");
                return;
            }
            response.text()
                .then((content) => {
                    let cleanFile = file.split("/").pop().split(".")[0];
                    document.body.insertAdjacentHTML("beforeend", content);
                    let script = document.createElement("script");
                    script.src = `./src/javascripts/apps/${cleanFile}.js`;
                    script.type = "module";
                    document.body.appendChild(script);
                    let link = document.createElement("link");
                    link.rel = "stylesheet";
                    link.href = `./assets/stylesheets/apps/${cleanFile}/index.css`;
                    document.querySelector("head").appendChild(link);
                });
        })
        .catch(error => {
            console.error('Error opening app:', error);
        });
    setTimeout(() => {
        resetWindowListeners(light);
    }, 150);
}

export function resetWindowListeners(light = null) {
    let windows = document.querySelectorAll(".window");
    windows.forEach(win => {
        let closeBtn = win.querySelector(".wintools .red");
        let miniBtn = win.querySelector(".wintools .yellow") || win.querySelectorAll(".wintools .gray")[0];
        let zoomBtn = win.querySelector(".wintools .green") || win.querySelectorAll(".wintools .gray")[1];

        const closeWindow = () => {
            win.remove();
            if (light) light.classList.remove("on");
        };

        win._closeWindow = closeWindow;

        addWindowDrag(win);

        closeBtn.addEventListener("click", () => {
            closeWindow();
        });
        miniBtn.addEventListener("click", () => {
            console.log("Clicked minimize");
        });
        zoomBtn.addEventListener("click", () => {
            console.log("Clicked maximize");
        });

        win.addEventListener('mousedown', function(e) {
            if (!e.target.closest('.wintools')) {
                bringToFront(win);
            }
        });
    });
}

function addWindowDrag(windowElement) {
    let isDragging = false;
    let offsetX, offsetY;

    const titleBar = windowElement;

    titleBar.addEventListener('mousedown', function (e) {
        if (e.target.closest('.wintools')) {
            return;
        }

        isDragging = true;

        offsetX = e.clientX - windowElement.getBoundingClientRect().left;
        offsetY = e.clientY - windowElement.getBoundingClientRect().top;

        bringToFront(windowElement);
        e.preventDefault();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        const minY = fd ? fd.offsetHeight : 0;
        newY = Math.max(minY, newY);

        windowElement.style.left = newX + 'px';
        windowElement.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });
}

function bringToFront(windowElement) {
    zIndex += 1;
    windowElement.style.zIndex = zIndex;
}