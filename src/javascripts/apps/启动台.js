import { create } from "../window.js";

let apps = [
    "App Store", "Safari浏览器", "邮件", "通讯录", "日历", "提醒事项", "备忘录",
    "FaceTime通话", "信息", "地图", "查找", "Photo Booth", "照片", "音乐",
    "博客", "视频", "语音备忘录", "天气", "股市", "图书", "时钟",
    "计算器", "无边记", "家庭", "Siri", "iPhone镜像", "密码", "系统设置",
    "其他"
];
const launchpad = document.querySelector(".launchpad");
const bg = launchpad.querySelector(".bg");
const containers = launchpad.querySelector(".containers");
const imgs = containers.querySelectorAll(".container img");

function init() {
    apps.forEach(app => {
        let div = document.createElement("div");
        let img = document.createElement("img");
        let p = document.createElement("p");

        img.addEventListener("error", () => {
            img.src = `./assets/icons/noicon.svg`;
        });

        img.src = `./assets/icons/${app}.svg`;
        p.textContent = app;
        div.classList.add("container");
        div.appendChild(img);
        div.appendChild(p);
        containers.appendChild(div);

        img.addEventListener("click", () => {
            create("./assets/apps/" + app + ".html", app, null, app === "计算器");
            closeLaunchpad();
        });
    });

    window.appStatus["启动台"] = true;
    window.specialCloses["启动台"] = closeLaunchpad;
}

function closeLaunchpad() {
    bg.style.animation = "forwards";
    containers.style.animation = "forwards";
    setTimeout(() => {
        bg.style.animation = "fade 0.3s ease-out forwards reverse";
        containers.style.animation = "animation 0.3s ease-in-out forwards reverse";
        setTimeout(() => {
            document.querySelector("script[app=启动台]").remove();
            launchpad.remove();
            window.appStatus["启动台"] = false;
        }, 400);
    }, 20);
}
launchpad.addEventListener("click", (event) => {
    if (!Array.from(imgs).includes(event.target))
        closeLaunchpad();
});

init();  