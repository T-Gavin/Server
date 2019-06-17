"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
///<reference path="../typings/index.d.ts"/>
const fs = require("fs");
const cps = require("child_process");
const Config_1 = require("./config/Config");
const path = require("path");
exports.default = new class Main {
    /**
     * 构造器
     */
    constructor() {
        /**
         * 配置数据
         * @type {Array}
         */
        this.manifest = [];
        process.nextTick(() => __awaiter(this, void 0, void 0, function* () { return yield this.runTiny(); }));
    }
    /**
     * 运行主服务器
     * @private
     */
    runTiny() {
        return __awaiter(this, void 0, void 0, function* () {
            this.controllers = {};
            let params = process.argv[2];
            if (params) {
                this.debug = true;
                if (params.indexOf(",") != -1) {
                    this.onlyList = params.split(",");
                }
                else if (params.toLowerCase() != "all") {
                    this.onlyList = [params];
                }
            }
            yield this.startAll();
            process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () { return yield this.stopAll(); }));
        });
    }
    /**
     * 全部启动
     * @returns {number}
     */
    startAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let num = 0;
            let manifest = yield this.getManifest();
            for (let i = 0; i < manifest.length; i++) {
                num += (yield this.start(manifest[i].name, true)) ? 1 : 0;
            }
            return num;
        });
    }
    /**
     * 关闭全部
     * @returns {number}
     */
    stopAll() {
        return __awaiter(this, void 0, void 0, function* () {
            let num = 0;
            let manifest = yield this.getManifest();
            for (let i = 0; i < manifest.length; i++) {
                num += (yield this.stop(manifest[i].name, true)) ? 1 : 0;
            }
            return num;
        });
    }
    /**
     * 开始服务
     * @param name 服务名
     * @param override 是否覆盖原有实例
     * @returns {boolean}
     */
    start(name, override = true) {
        return __awaiter(this, void 0, void 0, function* () {
            // 配置列表
            let manifest = yield this.getManifest();
            // 所在下标
            let index = -1;
            for (let i = 0; i < manifest.length; i++) {
                if (manifest[i].name == name) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                // 是否正在运行
                let isRun = !!this.controllers[name];
                if (isRun) {
                    if (override || !this.controllers[name].instance) {
                        // 先停止
                        yield this.stop(name, true);
                        // 改状态
                        yield this.setStatus(name, 0);
                        let obj = manifest[index];
                        // 重新设置状态
                        obj.status = 0;
                        // 再运行
                        yield this.runInstance(obj, (this.controllers[name].restart += 1));
                    }
                }
                else {
                    // 运行
                    yield this.runInstance(manifest[index]);
                }
                return true;
            }
            return false;
        });
    }
    /**
     * 停止服务
     * @param name 服务名
     * @param isRestart 是否为重启
     * @returns {boolean}
     */
    stop(name, isRestart = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.controllers[name]) {
                this.controllers[name].instance && this.controllers[name].instance.kill("SIGINT");
                this.controllers[name].instance = null;
                this.controllers[name].cpu = "0%";
                this.controllers[name].memory = "0%";
                this.controllers[name].version = "0";
                if (!isRestart) {
                    this.setStatus(name, 1);
                }
                return true;
            }
            else {
                return false;
            }
        });
    }
    /**
     * 更新cpu
     * @param name
     * @param cpu
     */
    setCpu(name, cpu) {
        let instanceObj = this.controllers[name];
        if (instanceObj)
            instanceObj.cpu = cpu;
    }
    /**
     * 获取cpu
     * @param name
     * @returns {number}
     */
    getCpu(name) {
        let instanceObj = this.controllers[name];
        return instanceObj ? instanceObj.cpu : null;
    }
    /**
     * 更新memory
     * @param name
     * @param memory
     */
    setMemory(name, memory) {
        let instanceObj = this.controllers[name];
        if (instanceObj) {
            instanceObj.memory = memory;
        }
    }
    /**
     * 获取常更新
     * @returns {}
     */
    getMatter() {
        let data = [];
        for (let i in this.controllers) {
            data.push({
                name: this.controllers[i].name,
                status: this.controllers[i].status,
                restart: this.controllers[i].restart,
                memory: this.controllers[i].memory,
                cpu: this.controllers[i].cpu,
                version: this.controllers[i].version
            });
        }
        return data;
    }
    /**
     * 更新status
     * @param name
     * @param status 0:正常 1:关闭 2:错误
     * @returns {Promise<boolean>}
     */
    setStatus(name, status) {
        return __awaiter(this, void 0, void 0, function* () {
            let instanceObj = this.controllers[name];
            if (instanceObj) {
                let manifest = yield this.getManifest(false);
                // 所在下标
                let index = -1;
                for (let i = 0; i < manifest.length; i++) {
                    if (manifest[i].name == name) {
                        index = i;
                        break;
                    }
                }
                if (index != -1) {
                    if (!this.onlyList) {
                        manifest[index].status = this.controllers[manifest[index].name].status = status;
                        fs.writeFileSync(path.resolve(__dirname, Config_1.default.manifestFileName), JSON.stringify(manifest));
                    }
                    return true;
                }
            }
            return false;
        });
    }
    /**
     * 运行实例
     * @param item
     * @param restart
     */
    runInstance(item, restart = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let instanceObj = {
                name: item.name,
                desc: item.desc,
                path: item.path,
                port: item.port,
                status: item.status,
                cpu: "0%",
                memory: "0%",
                restart: restart,
                instance: null,
                version: "0"
            };
            // 放入数组容器中
            this.controllers[item.name] = instanceObj;
            if (!instanceObj["timer"]) {
                instanceObj["timer"] = setTimeout(() => {
                    if (instanceObj.status == 0) {
                        instanceObj.restart = 0;
                        instanceObj["timer"] = null;
                        delete instanceObj["timer"];
                    }
                }, 500);
            }
            if (item.status != 1) {
                // 设置正常状态
                if (instanceObj.status != 0)
                    yield this.setStatus(instanceObj.name, 0);
                let arg = {
                    port: item.port,
                    serverName: item.name,
                    debug: this.debug
                };
                // 日志路径
                let logPath = "";
                let pathArr = item.path.split("/");
                for (let i = 0; i < pathArr.length - 1; i++)
                    logPath += pathArr[i] + "/";
                instanceObj["logPath"] = logPath + "Logs.txt";
                // fork模式运行
                instanceObj.instance = cps.fork(path.resolve(__dirname, "./controller/" + item.path), [encodeURIComponent(JSON.stringify(arg))], { silent: true });
                // 监听输出事件
                instanceObj.instance.stdout.on("data", (data) => __awaiter(this, void 0, void 0, function* () {
                    yield this.appendLogs(path.resolve(__dirname, "./controller/" + instanceObj["logPath"]), data.toString("utf-8"));
                }));
                // 错误事件
                instanceObj.instance.stderr.on("data", (data) => __awaiter(this, void 0, void 0, function* () {
                    // 改变状态
                    yield this.setStatus(instanceObj.name, 2);
                    yield this.appendLogs(path.resolve(__dirname, "./controller/" + instanceObj["logPath"]), data.toString("utf-8"));
                    // 判断是否在可重启范围内
                    if (instanceObj.restart < Config_1.default.maxErrorRestart) {
                        setTimeout((obj) => __awaiter(this, void 0, void 0, function* () {
                            // 累加重启次数
                            obj.restart++;
                            // 立马重启
                            obj.status = 0;
                            yield this.start(obj.name, true);
                        }), 1000, instanceObj);
                    }
                }));
                // 接收消息
                instanceObj.instance.on("message", (msg) => __awaiter(this, void 0, void 0, function* () {
                    if (msg && msg.method && this[msg.method]) {
                        instanceObj && instanceObj.instance && instanceObj.instance.send({
                            method: msg.method,
                            data: yield this[msg.method](...msg.arg)
                        });
                    }
                }));
            }
        });
    }
    /**
     * 追加日志
     * @param fileName
     * @param log
     * @returns {Promise<void>}
     */
    appendLogs(fileName, log) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.debug) {
                console.log(log);
            }
            else {
                // todo 写入日志文件
            }
        });
    }
    /**
     * 呼叫服务器进程
     * @param {string} name
     * @param msg
     * @returns {Promise<void>}
     */
    callController(name, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (name == "All") {
                for (let i in this.controllers) {
                    let instanceObj = this.controllers[i];
                    if (instanceObj && instanceObj.instance) {
                        yield instanceObj.instance.send({ serverName: i, msg });
                    }
                }
            }
            else {
                let instanceObj = this.controllers[name];
                if (instanceObj && instanceObj.instance) {
                    yield instanceObj.instance.send({ serverName: name, msg });
                }
            }
        });
    }
    /**
     * 清空日志
     * @param name
     * @returns {Promise<boolean>}
     */
    clearLog(name) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 显示日志
     * @param name
     * @returns {Promise<string>}
     */
    showLog(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    /**
     * 设置版本号
     * @returns {Promise<void>}
     * @constructor
     */
    getVersion(name, version) {
        return __awaiter(this, void 0, void 0, function* () {
            let instanceObj = this.controllers[name];
            if (instanceObj) {
                instanceObj.version = version;
            }
        });
    }
    /**
     * 获取当前列表
     * @returns {Array}
     */
    getList() {
        let data = [];
        for (let i in this.controllers) {
            data.push({
                name: this.controllers[i].name,
                port: this.controllers[i].port,
                status: this.controllers[i].status,
                path: this.controllers[i].path,
                restart: this.controllers[i].restart,
                memory: this.controllers[i].memory,
                cpu: this.controllers[i].cpu,
                desc: this.controllers[i].desc,
                version: this.controllers[i].version
            });
        }
        return data;
    }
    /**
     * 获取配置文件
     * @returns {Promise<Array>}
     */
    getManifest(overlap = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (overlap || !this.manifest.length) {
                let manifest = [];
                let fileName = yield path.resolve(__dirname, Config_1.default.manifestFileName);
                let exists = yield fs.existsSync(fileName);
                if (exists) {
                    let manifestStr = yield fs.readFileSync(fileName);
                    if (manifestStr) {
                        try {
                            let data = yield JSON.parse(manifestStr.toString("utf-8"));
                            if (this.onlyList) {
                                for (let i in this.onlyList) {
                                    let name = this.onlyList[i];
                                    for (let j in data) {
                                        if (data[j + ""].name == name) {
                                            manifest.push(data[j + ""]);
                                            break;
                                        }
                                    }
                                }
                            }
                            else {
                                manifest = data;
                            }
                        }
                        catch (e) {
                            console.error(Config_1.default.manifestFileName + "错误！", e.message);
                        }
                    }
                }
                else {
                    console.error(Config_1.default.manifestFileName + "不存在！");
                    // 不存在直接退出进程
                    process.exit(0);
                }
                this.manifest = manifest;
            }
            return this.manifest;
        });
    }
};
