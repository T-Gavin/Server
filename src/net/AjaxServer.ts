import http = require("http");
import url = require("url");

/**
 * 文 件 名：AjaxServer
 * 内    容：
 * 功    能：
 * 作    者：Aiden
 * 小    组：h5项目组-技术部
 * 版 本 号：v1.0.0
 * 修改日期：2018/10/22 上午10:37
 * 修改日志：
 * 版权说明：Copyright (c) 2018,aidentang All rights reserved.
 */
export default class AjaxServer {

    /**
     * 版本
     * @type {string}
     */
    public version = "0.01";

    /**
     * 服务实例
     * @type {http.Server}
     */
    public server: http.Server;

    /**
     * 端口
     * @type {number}
     */
    readonly port: number;

    /**
     * 服务名
     * @type {string}
     */
    readonly serverName: string;

    /**
     * 调试
     * @type {boolean}
     */
    readonly debug: boolean;

    /**
     * 构造器
     */
    public constructor() {
        // 0 node 解析器 1.js路径 2.应用程序参数
        let data = JSON.parse(decodeURIComponent(process.argv[2]));
        this.port = data.port;
        this.serverName = data.serverName;
        this.debug = data.debug;
        this.debug && console.log(process.argv[2]);
        // 设置最大连接数
        http.globalAgent.maxSockets = Infinity;
        this.server = http.createServer(async (request: http.IncomingMessage, response: http.ServerResponse) => {
            request.socket.setNoDelay(true);
            await this.onRequest(request, response);
        });

        this.server.listen(this.port, async () => {
            await this.onStart(this.server);
        });

        !this.server.listenerCount("error") && this.server.on("error", (err: Error) => {
            this.onError(err);
        });

        process.on("SIGINT", async () => {
            await this.onClose();
        });

        process.on("message", (data: any) => {
            if (data && data.serverName == this.serverName) {
                this.onCall(data.msg);
            }
        });
    }

    /**
     * 接收到呼叫 各个process进程之间的通信！！！
     * @param msg
     */
    public onCall(msg: any) {
    }

    /**
     * 服务开启后调度
     * @param server
     */
    public async onStart(server?: http.Server) {
        console.log(this.serverName + "->服务已开启！", "端口:" + this.port, "版本:" + this.version);

    }


    /**
     * 接收到请求后调度
     * @param request
     * @param response
     */
    private async onRequest(request: http.IncomingMessage, response: http.ServerResponse) {
        // todo 开启跨域 文件缓存 路由分析（文件路由 数据路由）
        console.log("收到http请求，开启路由分析...");
    }

    /**
     * 服务出错后调度
     * @param err
     */
    public async onError(err: Error) {
        console.error(err);
    }

    /**
     * 服务器被关闭
     */
    public async onClose() {
        process.exit()
    }
}