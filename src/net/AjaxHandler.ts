import http = require("http");

export default class AjaxHandler {

    /**
     * 请求的数据
     * @type {Object}
     */
    readonly query: Object;

    /**
     * post数据
     * @type {string|Buffer}
     */
    readonly postData: Buffer;

    /**
     * 请求实例
     * @type {http.IncomingMessage}
     */
    readonly req: http.IncomingMessage;

    /**
     * 响应实例
     * @type {http.ServerResponse}
     */
    readonly res: http.ServerResponse;

    /**
     * 构造器
     * @param {Object} query
     * @param {Buffer} postData
     * @param {"http".IncomingMessage} req
     * @param {"http".ServerResponse} res
     */
    public constructor(query: Object, postData: Buffer, req: http.IncomingMessage, res: http.ServerResponse) {
        this.query = query;
        this.postData = postData;
        this.req = req;
        this.res = res;
    }

    /**
     * 响应请求
     * @param status 状态码
     * @param data 数据
     * @param msg 信息
     * @param statusCode 服务器状态码
     */
    public response(status: number = 0, data: any = null, msg: string = "请求成功.", statusCode = 200) {
        if (!this.res["finished"]) {
            this.res.writeHead(statusCode, {"Content-Type": "text/plain;charset=utf-8"});
            this.res.end(JSON.stringify({status: status, data: data, msg: msg}));
        }
    }

    /**
     * 页面响应
     * @param {number} status
     * @param data
     * @param {string} msg
     * @param {number} count
     * @param {number} statusCode
     */
    public pageResponse(status: number = 0, data: any = null, msg: string = "请求成功.", count: number, statusCode = 200) {
        if (!this.res["finished"]) {
            this.res.writeHead(statusCode, {"Content-Type": "text/plain;charset=utf-8"});
            this.res.end(JSON.stringify({code: status, data: data, count: count, msg: msg}));
        }
    }

    /**
     * 获取ajax数据key
     * @param key 键值
     * @returns {string|null}
     */
    public input(key: string): string | null {
        return this.query[key];
    }
}