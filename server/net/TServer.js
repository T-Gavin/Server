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
const AjaxServer_1 = require("./AjaxServer");
const GameDB_1 = require("../db/GameDB");
const LogDB_1 = require("../db/LogDB");
const WebSocket = require("ws");
/**
 * 文 件 名：TServer
 * 内    容：
 * 功    能：
 * 作    者：Aiden
 * 小    组：h5项目组-技术部
 * 版 本 号：v1.0.0
 * 修改日志：
 * 版权说明：Copyright (c) 2017,WangYan All rights reserved.
 */
class TServer extends AjaxServer_1.default {
    /**
     * 开始服务
     * @returns {Promise<>}
     */
    onStart() {
        const _super = Object.create(null, {
            onStart: { get: () => super.onStart }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onStart.call(this);
            //todo 实例化数据库 并保持链接
            this.gameDB = new GameDB_1.default();
            this.logDB = new LogDB_1.default();
            this.server.timeout = 5000;
            this.wss = new WebSocket.Server({
                server: this.server,
                clientTracking: true,
                maxPayload: 10 * 1024,
                perMessageDeflate: true,
                verifyClient: false
            });
            this.wss.on("connection", (ws, req) => {
                ws["agent"] = req.headers["user-agent"];
                req.socket.setNoDelay(true);
                // 链接成功
                !ws.listenerCount("message") && ws.on("message", (data) => {
                    this.onMessage(ws, data);
                });
                // 链接断开
                ws.listenerCount("close") <= 2 && ws.on("close", (code, reason) => {
                    this.onDisConnect(ws["user"], code, reason, ws);
                    ws.terminate();
                });
                // 链接错误
                ws.listenerCount("error") <= 2 && ws.on("error", (err) => {
                    this.onDisConnect(ws["user"], -1, err.message, ws);
                    ws.terminate();
                });
            });
        });
    }
    /**
     * 更新调度 用于处理定时需要拉去或者push的数据流
     * @param data
     * @returns {Promise<void>}
     */
    onUpdate(data) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 收到呼叫 进程之间的通信接口
     * @param msg
     */
    onCall(msg) {
        const _super = Object.create(null, {
            onCall: { get: () => super.onCall }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onCall.call(this, msg);
        });
    }
    /**
     * ws信息
     * @param {WebSocket} ws
     * @param {Uint8Array} data
     * @returns {Promise<void>}
     */
    onMessage(ws, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo ws路由分析 数据流到相应的函数
            console.log("收到客户端请求!", data);
            data = JSON.parse(data);
            yield ((ws && ws.readyState == WebSocket.OPEN) && ws.send(JSON.stringify({
                type: "test",
                method: data["method"]
            })));
        });
    }
    /**
     * 链接
     * @param {User} user
     * @param {ByteArray} pkg
     * @param ws
     * @returns {Promise<boolean>}
     */
    onConnect(user, pkg, ws) {
        return __awaiter(this, void 0, void 0, function* () {
            // todo ws链接 实例化用户数据（有或者没有） 用ws做相应的映射
        });
    }
    /**
     * 断开链接
     * @param {User} user
     * @param {number} code
     * @param {string} message
     * @param {WebSocket} ws
     * @returns {Promise<void>}
     */
    onDisConnect(user, code, message, ws) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    /**
     * 通过连接池中拿取用户
     * @param {number} userId
     * @returns {User}
     */
    getUserFromClientById(userId) {
        // 所有链接
        let clients = (this.wss && this.wss.clients) ? this.wss.clients : [];
        for (let client of clients) {
            if (client && client["user"] && client["user"].entry && userId == client["user"].entry.userId) {
                return client["user"];
            }
        }
    }
    /**
     * 获取链接数量
     * @param {number} userId
     * @returns {number}
     */
    getUserNumFromClientById(userId) {
        let result = 0;
        // 所有链接
        let clients = (this.wss && this.wss.clients) ? this.wss.clients : [];
        for (let client of clients) {
            if (client && client["user"] && client["user"].entry && userId == client["user"].entry.userId) {
                result++;
            }
        }
        return result;
    }
    /**
     * 获取用户通过id
     * @param {number} userId
     * @returns {Array<User>}
     */
    getUsersFromClientById(userId) {
        let result = [];
        // 所有链接
        let clients = (this.wss && this.wss.clients) ? this.wss.clients : [];
        for (let client of clients) {
            if (client && client["user"] && client["user"].entry && userId == client["user"].entry.userId) {
                result.push(client["user"]);
            }
        }
        return result;
    }
    /**
     * 广播
     * @param {string} method
     * @param {ByteArray} data
     */
    broadcas(method, data) {
        // 所有链接
        let clients = (this.wss && this.wss.clients) ? this.wss.clients : [];
        for (let client of clients) {
            //todo 发送消息
        }
    }
    /**
     *服务器关闭
     */
    onClose() {
        const _super = Object.create(null, {
            onClose: { get: () => super.onClose }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onClose.call(this);
        });
    }
}
exports.default = TServer;
