import AjaxServer from "./AjaxServer";
import GameDB from "../db/GameDB";
import LogDB from "../db/LogDB";
import WebSocket = require("ws");
import ByteArray from "../utils/ByteArray";
import http = require("http");
import User from "../db/User";

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
export default class TServer extends AjaxServer {

    /**
     * 游戏数据库实例
     * @type {GameDB}
     */
    public gameDB: GameDB;

    /**
     * 日志数据库实例
     * @type {LogDB}
     */
    public logDB: LogDB;

    /**
     * ws服务器实例
     * @type {ws}
     */
    public wss: WebSocket.Server;


    /**
     * 开始服务
     * @returns {Promise<>}
     */
    public async onStart() {
        await super.onStart();
        //todo 实例化数据库 并保持链接
        this.gameDB = new GameDB();
        this.logDB = new LogDB();

        this.server.timeout = 5000;
        this.wss = new WebSocket.Server({
            server: this.server,
            clientTracking: true,// 创建一个set数据结构
            maxPayload: 10 * 1024,// 每个数据流最大的载荷
            perMessageDeflate: true,// 压缩tcp报文
            verifyClient: false
        });
        this.wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
            ws["agent"] = req.headers["user-agent"];
            req.socket.setNoDelay(true);
            // 链接成功
            !ws.listenerCount("message") && ws.on("message", (data: WebSocket.Data) => {
                this.onMessage(ws, data);
            });
            // 链接断开
            ws.listenerCount("close") <= 2 && ws.on("close", (code: number, reason: string) => {
                this.onDisConnect(ws["user"], code, reason, ws);
                ws.terminate();
            });
            // 链接错误
            ws.listenerCount("error") <= 2 && ws.on("error", (err: Error) => {
                this.onDisConnect(ws["user"], -1, err.message, ws);
                ws.terminate();
            });
        });
    }

    /**
     * 更新调度 用于处理定时需要拉去或者push的数据流
     * @param data
     * @returns {Promise<void>}
     */
    public async onUpdate(data?: any) {

    }

    /**
     * 收到呼叫 进程之间的通信接口
     * @param msg
     */
    public async onCall(msg: any) {
        await super.onCall(msg);
    }


    /**
     * ws信息
     * @param {WebSocket} ws
     * @param {Uint8Array} data
     * @returns {Promise<void>}
     */
    private async onMessage(ws: WebSocket, data: any) {
        // todo ws路由分析 数据流到相应的函数
        console.log("收到客户端请求!", data);
        data = JSON.parse(data);
        await ((ws && ws.readyState == WebSocket.OPEN) && ws.send(JSON.stringify({
            type: "test",
            method: data["method"]
        })));
    }

    /**
     * 链接
     * @param {User} user
     * @param {ByteArray} pkg
     * @param ws
     * @returns {Promise<boolean>}
     */
    public async onConnect(user: User, pkg?: ByteArray, ws?: WebSocket) {
        // todo ws链接 实例化用户数据（有或者没有） 用ws做相应的映射
    }

    /**
     * 断开链接
     * @param {User} user
     * @param {number} code
     * @param {string} message
     * @param {WebSocket} ws
     * @returns {Promise<void>}
     */
    public async onDisConnect(user: User, code?: number, message?: string, ws?: WebSocket) {

    }


    /**
     * 通过连接池中拿取用户
     * @param {number} userId
     * @returns {User}
     */
    public getUserFromClientById(userId: number): User {
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
    public getUserNumFromClientById(userId: number): number {
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
    public getUsersFromClientById(userId: number): Array<User> {
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
    public broadcas(method: string, data: ByteArray) {
        // 所有链接
        let clients = (this.wss && this.wss.clients) ? this.wss.clients : [];
        for (let client of clients) {
            //todo 发送消息
        }
    }

    /**
     *服务器关闭
     */
    public async onClose() {
        await super.onClose();

    }
}