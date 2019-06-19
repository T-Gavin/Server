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
const http = require("http");

class AjaxServer {
    /**
     * 构造器
     */
    constructor() {
        /**
         * 版本
         * @type {string}
         */
        this.version = "0.01";
        // 0 node 解析器 1.js路径 2.应用程序参数
        let data = JSON.parse(decodeURIComponent(process.argv[2]));
        this.port = data.port;
        this.serverName = data.serverName;
        this.debug = data.debug;
        this.debug && console.log(process.argv[2]);
        // 设置最大连接数
        http.globalAgent.maxSockets = Infinity;
        this.server = http.createServer((request, response) => __awaiter(this, void 0, void 0, function* () {
            request.socket.setNoDelay(true);
            yield this.onRequest(request, response);
        }));
        this.server.listen(this.port, () => __awaiter(this, void 0, void 0, function* () {
            yield this.onStart(this.server);
        }));
        !this.server.listenerCount("error") && this.server.on("error", (err) => {
            this.onError(err);
        });
        process.on("SIGINT", () => __awaiter(this, void 0, void 0, function* () {
            yield this.onClose();
        }));
        process.on("message", (data) => {
            if (data && data.serverName == this.serverName) {
                this.onCall(data.msg);
            }
        });
    }
    /**
     * 接收到呼叫 各个process进程之间的通信！！！
     * @param msg
     */
    onCall(msg) {
    }
    /**
     * 服务开启后调度
     * @param server
     */
    onStart(server) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(this.serverName + "->服务已开启！", "端口:" + this.port, "版本:" + this.version);
        });
    }
    /**
     * 接收到请求后调度
     * @param request
     * @param response
     */
    onRequest(request, response) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo 开启跨域 文件缓存 路由分析（文件路由 数据路由）
            console.log("收到http请求，开启路由分析...");
        });
    }
    /**
     * 服务出错后调度
     * @param err
     */
    onError(err) {
        return __awaiter(this, void 0, void 0, function* () {
            console.error(err);
        });
    }
    /**
     * 服务器被关闭
     */
    onClose() {
        return __awaiter(this, void 0, void 0, function* () {
            process.exit();
        });
    }
}
exports.default = AjaxServer;
