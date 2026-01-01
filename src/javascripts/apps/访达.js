
import { createContextMenu } from '../ui/contextMenu.js';

const finderContent = document.getElementById("finder-content");
const desktop = document.getElementById("desktop");

function refreshFinderContent() {
    if (!finderContent) return;
    finderContent.innerHTML = "";
    const desktopItems = document.querySelectorAll("#desktop .item");

    desktopItems.forEach(item => {
        const p = item.querySelector("p");
        const img = item.querySelector("img");
        if (!p || !img) return;

        const name = p.innerText;
        const iconSrc = img.src;

        const fileItem = document.createElement("div");
        fileItem.classList.add("file-item");
        fileItem.draggable = true;

        const fileIcon = document.createElement("img");
        fileIcon.src = iconSrc;
        fileIcon.draggable = false;

        const fileName = document.createElement("span");
        fileName.innerText = name;

        fileItem.appendChild(fileIcon);
        fileItem.appendChild(fileName);

        fileItem.addEventListener("mousedown", (e) => {
            e.stopPropagation();
            document.querySelectorAll("#finder-content .file-item.selected").forEach(el => el.classList.remove("selected"));
            fileItem.classList.add("selected");
        });

        fileItem.addEventListener("dblclick", (e) => {
            e.stopPropagation();
        });

        fileItem.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            e.stopPropagation();

            document.querySelectorAll("#finder-content .file-item.selected").forEach(el => el.classList.remove("selected"));
            fileItem.classList.add("selected");

            createContextMenu(e.clientX, e.clientY, [
                { label: "打开", action: () => { } },
                { type: "separator" },
                {
                    label: "重命名", action: () => {
                        const newName = prompt("重命名为:", fileName.innerText);
                        if (newName && newName.trim() !== "") {
                            fileName.innerText = newName;
                            p.innerText = newName;
                        }
                    }
                },
                { type: "separator" },
                {
                    label: "移到废纸篓", action: () => {
                        fileItem.remove();
                        if (item.parentElement.querySelectorAll(".item").length === 1 && item.parentElement.classList.contains("container")) {
                            // Handle container logic? simplistic removal:
                            item.remove();
                        } else {
                            item.remove();
                        }
                    }
                }
            ]);
        });

        finderContent.appendChild(fileItem);
    });
}
if (desktop) {
    const observer = new MutationObserver(refreshFinderContent);
    observer.observe(desktop, { childList: true, subtree: true, attributes: true, attributeFilter: ["src", "innerText"] });
}

refreshFinderContent();

const finderWindow = document.querySelector(".finder.window");
if (finderWindow) {
    const sidebarList = finderWindow.querySelector(".sidebar-list");
    const mainContent = finderWindow.querySelector(".main-content");

    if (sidebarList) {
        sidebarList.addEventListener("mousedown", (e) => {
            e.stopPropagation();
        });
    }

    if (mainContent) {
        mainContent.addEventListener("mousedown", (e) => {
            if (e.target === mainContent) {
                e.stopPropagation();
                document.querySelectorAll("#finder-content .file-item.selected").forEach(el => el.classList.remove("selected"));
            }
        });

        mainContent.addEventListener("contextmenu", (e) => {
            if (e.target === mainContent) {
                e.preventDefault();
                e.stopPropagation();
                createContextMenu(e.clientX, e.clientY, [
                    { label: "新建文件夹", action: () => { } },
                    { type: "separator" },
                    { label: "显示简介", disabled: true },
                ]);
            }
        });
    }
}
