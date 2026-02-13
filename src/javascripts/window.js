import { createAlert } from "./ui/alert.js";
import { updateMenu } from "./finderbar.js";

let fd = document.querySelector(".finderbar");
export let zIndex = 5;
window.specialCloses = {};

export function create(file, name, light = null, centered = false) {
  const cleanFile = file.split("/").pop().split(".")[0];
  if (!name) name = cleanFile;
  const existing = document.getElementById(name);
  if (existing) {
    bringToFront(existing, name);
    return;
  }

  fetch(file)
    .then((response) => {
      if (response.status !== 200) {
        createAlert(
          "./assets/icons/访达.svg",
          "加载 App 时遇到错误",
          `此 App 仍在开发中<br/>服务器返回状态码: ${response.status}`,
          "好",
          "close",
        );
        return;
      }
      response.text().then((content) => {
        document.body.insertAdjacentHTML("beforeend", content);
        const wins = document.querySelectorAll(".window");
        if (wins.length) {
          const newWin = wins[wins.length - 1];
          if (newWin && !newWin.id) newWin.id = name;

          if (centered) {
            newWin.style.left = `${(window.innerWidth - newWin.offsetWidth) / 2}px`;
            newWin.style.top = `${(window.innerHeight - newWin.offsetHeight) / 2}px`;
            setTimeout(() => {
              newWin.style.left = `${(window.innerWidth - newWin.offsetWidth) / 2}px`;
              newWin.style.top = `${(window.innerHeight - newWin.offsetHeight) / 2}px`;
            }, 50);
          }

          const resizer = document.createElement("div");
          resizer.className = "resizer";
          newWin.appendChild(resizer);
          addResizeListener(newWin, resizer);
        }
        let script = document.createElement("script");
        script.src = `./src/javascripts/apps/${cleanFile}.js?v=${Date.now()}`;
        script.type = "module";
        script.setAttribute("app", cleanFile);
        document.body.appendChild(script);
        let link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `./assets/stylesheets/apps/${cleanFile}/index.css`;
        document.querySelector("head").appendChild(link);
      });
    })
    .catch((error) => {
      console.error("Error opening app:", error);
    });
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 150);
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 300);
  setTimeout(() => {
    resetWindowListeners(name, light);
  }, 450);
}

export function resetWindowListeners(name, light = null) {
  let windows = document.querySelectorAll(".window");
  windows.forEach((win) => {
    let closeBtn = win.querySelector(".wintools .red");
    let miniBtn =
      win.querySelector(".wintools .yellow") ||
      win.querySelectorAll(".wintools .gray")[0];
    let zoomBtn =
      win.querySelector(".wintools .green") ||
      win.querySelectorAll(".wintools .gray")[1];

    if (!win.zoomed) win.zoomed = false;

    // 关闭窗口
    const closeWindow = () => {
      win.remove();
      const s = document.querySelector(`script[app="${name}"]`);
      if (s) s.remove();
      if (light) light.classList.remove("on");
      if (window.appStatus) window.appStatus[name] = false;
    };

    // 切换窗口大小
    const toggleZoom = () => {
      win.style.transition =
        "left 0.3s ease, top 0.3s ease, width 0.3s ease, height 0.3s ease";
      if (!win.zoomed) {
        const finderbar = document.getElementById("finderbar");
        const dock = document.getElementById("dock");
        const finderbarHeight = finderbar ? finderbar.offsetHeight : 0;
        const dockHeight = dock ? dock.offsetHeight : 0;
        win._preZoomState = {
          left: win.style.left,
          top: win.style.top,
          width: win.style.width,
          height: win.style.height,
        };
        win.style.left = "0";
        win.style.top = finderbarHeight + "px";
        win.style.width = "100vw";
        win.style.height = `calc(100vh - ${finderbarHeight}px - ${dockHeight}px)`;
        win.zoomed = true;
      } else {
        if (win._preZoomState) {
          win.style.left = win._preZoomState.left;
          win.style.top = win._preZoomState.top;
          win.style.width = win._preZoomState.width;
          win.style.height = win._preZoomState.height;
        }
        win.zoomed = false;
      }
      // 动画结束后清除 transition，避免影响其他操作
      setTimeout(() => {
        win.style.transition = "";
      }, 300);
    };

    win._closeWindow = closeWindow;

    addWindowDrag(win, name);

    if (closeBtn) closeBtn.addEventListener("click", () => closeWindow());

    const wintools = win.querySelector(".wintools");
    if (wintools) {
      wintools.addEventListener("dblclick", (e) => {
        if (
          !e.target.closest(".red") &&
          !e.target.closest(".yellow") &&
          !e.target.closest(".green") &&
          !e.target.closest(".gray")
        ) {
          toggleZoom();
        }
      });
    }

    win.addEventListener("mousedown", function (e) {
      if (!e.target.closest(".wintools div")) {
        bringToFront(win, name);
      }
    });
  });
}

function addWindowDrag(windowElement, name) {
  let isDragging = false;
  let offsetX, offsetY;

  windowElement.addEventListener("mousedown", function (e) {
    if (e.target.closest(".wintools div") || e.target.closest(".resizer")) {
      return;
    }

    isDragging = true;
    offsetX = e.clientX - windowElement.getBoundingClientRect().left;
    offsetY = e.clientY - windowElement.getBoundingClientRect().top;

    bringToFront(windowElement, name);
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    let newX = e.clientX - offsetX;
    let newY = e.clientY - offsetY;

    const minY = fd ? fd.offsetHeight : 0;
    newY = Math.max(minY, newY);

    windowElement.style.left = newX + "px";
    windowElement.style.top = newY + "px";
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });

  updateMenu(name);
}

function addResizeListener(windowElement, resizer) {
  let isResizing = false;

  resizer.addEventListener("mousedown", function (e) {
    isResizing = true;
    e.preventDefault();
  });

  document.addEventListener("mousemove", function (e) {
    if (!isResizing) return;

    const rect = windowElement.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    const newHeight = e.clientY - rect.top;

    if (newWidth > 200) windowElement.style.width = newWidth + "px";
    if (newHeight > 150) windowElement.style.height = newHeight + "px";
  });

  document.addEventListener("mouseup", function () {
    isResizing = false;
  });
}

export function bringToFront(windowElement, name) {
  zIndex += 1;
  windowElement.style.zIndex = zIndex;
  updateMenu(name);
}
