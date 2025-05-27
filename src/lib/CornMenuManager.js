// ==UserScript==
// @name         GM_createMenu
// @namespace    http://bbs.91wc.net/gm-create-menu.htm
// @version      0.1.10
// @description  油猴菜单库，支持开关菜单，支持批量添加，为您解决批量添加和开关菜单的烦恼
// @author       hzx
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// ==/UserScript==

export const CornMenuManager = (() => {
    const LOG_TAG = "CornMenuManager: ";

    let isLog = true;

    // 用于记录日志的调用栈, 直接 printStack 信息太多, 不方便调试
    const callStack = [];

    /*
    output:

	callback:
		fn1
		fn2
		fn3
     */
    function getCallStackString() {
        const sep = "\n\t"
        return `callback:${sep}` + callStack.join(sep)
    }

    function log(msg, logMethod = console.log) {
        if (isLog) {
            logMethod(LOG_TAG + msg + "\n" + getCallStackString());
        }
    }

    function logError(msg) {
        log(msg, console.error);
    }

    function logWarn(msg) {
        log(msg, console.warn);
    }

    function logWrapper(fnName, fn) {
        return () => {
            callStack.push(fnName);

            const result = fn(fnName);

            callStack.pop();

            return result;
        }
    }

    function logWrapperAndCall(fnName, fn) {
        return logWrapper(fnName, fn)();
    }

    function isSwitchEntry(item){
        return item && item.on && item.off;
    }

    const list = []; //菜单列表, 存储 entry

    const idArr = []; //菜单 id 对象, 用于注销菜单

    const STORE_TAG = "MENU_MANAGER_STORE_TAG.";

    //存储
    function setValue(key, value){
        localStorage.setItem(STORE_TAG + key, value);
    }

    //获取
    function getValue(key){
        return localStorage.getItem(STORE_TAG + key);
    }

    function saveSwitchBooleanState(entry, state) {
        setValue(getEntryName(entry), state);
    }

    function getSwitchBooleanState(entry) {
        const storeValue = getValue(getEntryName(entry));

        if (storeValue === null) {
            return null;
        }

        // getValue 返回的是字符串, 要正确处理为 boolean
        return storeValue === "true";
    }

    function getEntryName(entry) {
        return entry["name"] || (entry["on"]["name"] + entry["off"]["name"]);
    }

    // 添加单条油猴菜单条目
    function addEntry(entry) {
        logWrapper("addEntry(entry)", (fnName) => {
            if (!(typeof entry === 'object')) {
                logError(`${fnName}: 请传入正确的 Menu Entry`)
                return;
            }

            if (!entry.callback) {
                logError(`${fnName}: callback 不能为空, 请传入正确的 Menu Entry`)
                return;
            }

            const nameEmptyHandler = () => {
                logError(`${fnName}: entry name 不能为空`);
            }

            if (isSwitchEntry(entry)) {
                // 添加开关菜单
                if(!entry.on.name || !entry.off.name){
                    // 检查菜单的名字是否为空
                    nameEmptyHandler()

                    return;
                }

                if (entry.default === undefined) {
                    entry.default = true;
                }

                let currState = getSwitchBooleanState(entry);

                if (currState === null) {
                    saveSwitchBooleanState(entry, entry.default);

                    currState = entry.default;
                }

                entry.callback(currState, true);

                if (currState) {
                    entry.currEntry = entry.on;
                } else {
                    entry.currEntry = entry.off;
                }

                entry.on.next = entry.off
                entry.off.next = entry.on
            } else {
                // 正添加常菜单
                if(!entry.name){
                    nameEmptyHandler()

                    return;
                }
            }

            list.push(entry);
        })();
    }

    // 添加多条油猴菜单条目
    function add(entries) {
        logWrapper("add(entries)", () => {

            //兼容数组配置
            if (!Array.isArray(entries)) {
                logError("add: 请传递数组, 添加单个请使用 addItem ")
            }

            for(const entry of entries){
                addEntry(entry);
            }

        })();
    }


    return {
        // 创建菜单
        create(isInit = true) {
            logWrapper("create", (fnName) => {
                if(list.length === 0) {
                    logWarn(`${fnName}: 未添加任何 要创建的菜单条目`)
                    return;
                }

                // 删除旧菜单
                for(const id of idArr){
                    GM_unregisterMenuCommand(id);
                }

                // 清空数组
                idArr.length = 0;

                // 开始创建
                list.forEach((entry, index) => {
                    // 要用于创建的 item
                    let targetName = entry.name;
                    if (isSwitchEntry(entry)) {
                        targetName = entry.currEntry.name;
                    }

                    const id = GM_registerMenuCommand(targetName, () => {
                        //调用用户回调函数
                        if (isSwitchEntry(entry)) {
                            //反转开关
                            entry.currEntry = entry.currEntry.next;

                            // getValue 获取的是字符串
                            let currValue = getSwitchBooleanState(entry)

                            currValue = !currValue;

                            saveSwitchBooleanState(entry, currValue);

                            entry.callback(currValue, false);

                            this.create(false);
                        } else {
                            entry.callback();
                        }


                    }, entry.accessKey || null);

                    idArr.push(id);
                });

            })();

            return this;
        },
        // 添加要创建的菜单项
        add(entryOrEntries) {
            logWrapperAndCall("add(entryOrEntries)", () => {
                if (Array.isArray(entryOrEntries)) {
                    add(entryOrEntries);
                } else {
                    addEntry(entryOrEntries);
                }
            });

            return this;
        },
        addAndCreate(entryOrEntries) {
            logWrapperAndCall("addAndCreate(entryOrEntries)", () => {
                this.add(entryOrEntries);

                this.create();
            });

            return this;
        },
        disableLog() {
            isLog = false;

            return this;
        },
    };
})();

//////////////////////////////// 使用示例 //////////////////////////////
/*
GM_createMenu.add({
    default : true,
    on : {
        name : "Open",
    },
    off : {
        name : "Close",
    },
    accessKey: 'E',
    callback(state, isInit){
        if (state) {

        } else {

        }
    }
});

GM_createMenu.create();

GM_createMenu.add(
    {
        name : "test2222",
        callback : function(){
            alert("test2222");
        }
    }
);

GM_createMenu.create();

*/
