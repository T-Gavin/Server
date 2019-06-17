///<reference path="../typings/index.d.ts"/>
import fs = require("fs");
import cps = require("child_process");
import config from "./config/Config";
import path = require("path");

export default new class Main {

    /**
     * 是否为调试模式
     * @type {boolean}
     */
    private debug: boolean;

    /**
     * 调试模式运行的游戏
     * @type {boolean}
     */
    private onlyList: Array<string>;

    /**
     * 配置数据
     * @type {Array}
     */
    private manifest: Array<any> = [];

    /**
     * 控制器
     * @type {{}}
     */
    private controllers: { [name: string]: { name: string, desc: string, path: string, port: number, status: number, restart: number, cpu: string, memory: string, version: string, instance: cps.ChildProcess } };

    /**
     * 构造器
     */
    public constructor() {
        process.nextTick(async () => await this.runTiny());
    }

    /**
     * 运行主服务器
     * @private
     */
    private async runTiny() {
        this.controllers = {};
        let params = process.argv[2];
        if (params) {
            this.debug = true;
            if (params.indexOf(",") != -1) {
                this.onlyList = params.split(",");
            } else if (params.toLowerCase() != "all") {
                this.onlyList = [params];
            }
        }
        await this.startAll();
        process.on("SIGINT", async () => await this.stopAll());
    }

    /**
     * 全部启动
     * @returns {number}
     */
    public async startAll(): Promise<number> {
        let num = 0;
        let manifest = await this.getManifest();
        for (let i = 0; i < manifest.length; i++) {
            num += (await this.start(manifest[i].name, true)) ? 1 : 0;
        }
        return num;
    }

    /**
     * 关闭全部
     * @returns {number}
     */
    public async stopAll(): Promise<number> {
        let num = 0;
        let manifest = await this.getManifest();
        for (let i = 0; i < manifest.length; i++) {
            num += (await this.stop(manifest[i].name, true)) ? 1 : 0;
        }
        return num;
    }

    /**
     * 开始服务
     * @param name 服务名
     * @param override 是否覆盖原有实例
     * @returns {boolean}
     */
    public async start(name: string, override = true): Promise<boolean> {
        // 配置列表
        let manifest = await this.getManifest();
        // 所在下标
        let index: number = -1;
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
                    await this.stop(name, true);
                    // 改状态
                    await this.setStatus(name, 0);
                    let obj = manifest[index];
                    // 重新设置状态
                    obj.status = 0;
                    // 再运行
                    await this.runInstance(obj, (this.controllers[name].restart += 1));
                }
            } else {
                // 运行
                await this.runInstance(manifest[index]);
            }
            return true;
        }
        return false;
    }

    /**
     * 停止服务
     * @param name 服务名
     * @param isRestart 是否为重启
     * @returns {boolean}
     */
    public async stop(name: string, isRestart = false): Promise<boolean> {
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
        } else {
            return false;
        }
    }

    /**
     * 更新cpu
     * @param name
     * @param cpu
     */
    public setCpu(name: string, cpu: string) {
        let instanceObj = this.controllers[name];
        if (instanceObj) instanceObj.cpu = cpu;
    }

    /**
     * 获取cpu
     * @param name
     * @returns {number}
     */
    public getCpu(name: string): string {
        let instanceObj = this.controllers[name];
        return instanceObj ? instanceObj.cpu : null;
    }

    /**
     * 更新memory
     * @param name
     * @param memory
     */
    public setMemory(name: string, memory: string) {
        let instanceObj = this.controllers[name];
        if (instanceObj) {
            instanceObj.memory = memory;
        }
    }

    /**
     * 获取常更新
     * @returns {}
     */
    public getMatter() {
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
    public async setStatus(name: string, status: number): Promise<boolean> {
        let instanceObj = this.controllers[name];
        if (instanceObj) {
            let manifest = await this.getManifest(false);
            // 所在下标
            let index: number = -1;
            for (let i = 0; i < manifest.length; i++) {
                if (manifest[i].name == name) {
                    index = i;
                    break;
                }
            }
            if (index != -1) {
                if (!this.onlyList) {
                    manifest[index].status = this.controllers[manifest[index].name].status = status;
                    fs.writeFileSync(path.resolve(__dirname, config.manifestFileName), JSON.stringify(manifest));
                }
                return true;
            }
        }
        return false;
    }

    /**
     * 运行实例
     * @param item
     * @param restart
     */
    private async runInstance(item: any, restart = 0) {
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
            if (instanceObj.status != 0) await this.setStatus(instanceObj.name, 0);
            let arg = {
                port: item.port,
                serverName: item.name,
                debug: this.debug
            };
            // 日志路径
            let logPath = "";
            let pathArr = item.path.split("/");
            for (let i = 0; i < pathArr.length - 1; i++) logPath += pathArr[i] + "/";
            instanceObj["logPath"] = logPath + "Logs.txt";
            // fork模式运行
            instanceObj.instance = cps.fork(path.resolve(__dirname, "./controller/" + item.path), [encodeURIComponent(JSON.stringify(arg))], {silent: true});
            // 监听输出事件
            instanceObj.instance.stdout.on("data", async (data: Buffer) => {
                await this.appendLogs(path.resolve(__dirname, "./controller/" + instanceObj["logPath"]), data.toString("utf-8"));
            });
            // 错误事件
            instanceObj.instance.stderr.on("data", async (data: Buffer) => {
                // 改变状态
                await this.setStatus(instanceObj.name, 2);
                await this.appendLogs(path.resolve(__dirname, "./controller/" + instanceObj["logPath"]), data.toString("utf-8"));
                // 判断是否在可重启范围内
                if (instanceObj.restart < config.maxErrorRestart) {
                    setTimeout(async (obj) => {
                        // 累加重启次数
                        obj.restart++;
                        // 立马重启
                        obj.status = 0;
                        await this.start(obj.name, true);
                    }, 1000, instanceObj);
                }
            });
            // 接收消息
            instanceObj.instance.on("message", async (msg: any) => {
                if (msg && msg.method && this[msg.method]) {
                    instanceObj && instanceObj.instance && instanceObj.instance.send({
                        method: msg.method,
                        data: await this[msg.method](...msg.arg)
                    })
                }
            });
        }
    }

    /**
     * 追加日志
     * @param fileName
     * @param log
     * @returns {Promise<void>}
     */
    private async appendLogs(fileName: string, log: string) {
        if (this.debug) {
            console.log(log);
        } else {
            // todo 写入日志文件
        }
    }

    /**
     * 呼叫服务器进程
     * @param {string} name
     * @param msg
     * @returns {Promise<void>}
     */
    public async callController(name: string, msg: any) {
        if (name == "All") {
            for (let i in this.controllers) {
                let instanceObj = this.controllers[i];
                if (instanceObj && instanceObj.instance) {
                    await instanceObj.instance.send({serverName: i, msg});
                }
            }
        } else {
            let instanceObj = this.controllers[name];
            if (instanceObj && instanceObj.instance) {
                await instanceObj.instance.send({serverName: name, msg});
            }
        }
    }

    /**
     * 清空日志
     * @param name
     * @returns {Promise<boolean>}
     */
    public async clearLog(name: string) {
    }

    /**
     * 显示日志
     * @param name
     * @returns {Promise<string>}
     */
    public async showLog(name: string): Promise<string> {
        return "";
    }

    /**
     * 设置版本号
     * @returns {Promise<void>}
     * @constructor
     */
    public async getVersion(name: string, version: string) {
        let instanceObj = this.controllers[name];
        if (instanceObj) {
            instanceObj.version = version;
        }
    }

    /**
     * 获取当前列表
     * @returns {Array}
     */
    public getList() {
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
    private async getManifest(overlap: boolean = true): Promise<Array<any>> {
        if (overlap || !this.manifest.length) {
            let manifest = [];
            let fileName = await path.resolve(__dirname, config.manifestFileName);
            let exists = await fs.existsSync(fileName);
            if (exists) {
                let manifestStr = await fs.readFileSync(fileName);
                if (manifestStr) {
                    try {
                        let data = await JSON.parse(manifestStr.toString("utf-8"));
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
                        } else {
                            manifest = data;
                        }
                    } catch (e) {
                        console.error(config.manifestFileName + "错误！", e.message);
                    }
                }
            } else {
                console.error(config.manifestFileName + "不存在！");
                // 不存在直接退出进程
                process.exit(0);
            }
            this.manifest = manifest;
        }
        return this.manifest;
    }
}
 