import {CornMenuManager} from "./lib/CornMenuManager.js";
import {elmGetter} from "./lib/elmGetter.js";
import "./style/main.css"

async function main() {
    createMenu()
}

main();

function createMenu() {
    CornMenuManager.addAndCreate([
        {
            default: true,
            callback(state, isInit){
                if (!isInit) {
                    // 刷新页面
                    location.reload();
                }

                if (!state) {
                    return;
                }

                async function processState() {
                    await elmGetter.each(".shortsLockupViewModelHostEndpoint", (el) => {
                        el.href = convertShortsToVideoLink(el.href);
                    })

                    // 这里无法 hook history 路由
                    // 因为 shadow DOM 也无法添加 eventListener
                    // 只能用此招化解, 狸猫换太子
                    await elmGetter.each("ytm-shorts-lockup-view-model-v2", (el) => {
                        let mask = document.createElement("a")

                        mask.className = "mask"

                        el.appendChild(mask);

                        const aEl = el.querySelector(`a`)

                        mask.href = aEl.href;
                    })
                }

                jmpToVideo();

                processState();
            },
            on : {
                name : "自动跳转状态: 开启✅ (点我关闭)",
            },
            off : {
                name : "自动跳转状态: 关闭❎ (点我开启)",
            }
        },
        {
            name: "跳转到 Video",
            callback() {
                jmpToVideo();
            }
        }
    ]);
}

function onShortElClick() {
    setTimeout(() => {
        console.log("路径发生了变化");

        jmpToVideo();
    }, 100);
}

/*
    input: https://www.youtube.com/shorts/6yjwN-KVIrk
    output: https://www.youtube.com/watch?v=6yjwN-KVIrk
 */
function convertShortsToVideoLink(shortsUrl) {
    if (shortsUrl.toLowerCase().includes("/shorts/")) {
        return shortsUrl.replace("/shorts/", "/watch?v=");
    } else {
        return shortsUrl;
    }
}

function jmpToVideo() {
    const href = window.location.href

    if (href.toLowerCase().includes("/shorts/")) {
        window.location.href = convertShortsToVideoLink(href);
    }
}


// TODO: 关闭 enable
function print(msg, {enable = true, tag = "油猴脚本: "} = {}) {
    if (enable) {
        console.log(tag + msg)
    }
}
