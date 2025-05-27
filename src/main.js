import {CornMenuManager} from "./lib/CornMenuManager.js";

async function main() {
    createMenu()
}

main();

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

function createMenu() {
    CornMenuManager.addAndCreate([
        {
            default: true,
            callback(state, isInit){
                if (state) {
                    jmpToVideo();
                }
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

// TODO: 关闭 enable
function print(msg, {enable = true, tag = "油猴脚本: "} = {}) {
    if (enable) {
        console.log(tag + msg)
    }
}
