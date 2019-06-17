"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AjaxHandler {
    /**
     * 构造器
     * @param {Object} query
     * @param {Buffer} postData
     * @param {"http".IncomingMessage} req
     * @param {"http".ServerResponse} res
     */
    constructor(query, postData, req, res) {
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
    response(status = 0, data = null, msg = "请求成功.", statusCode = 200) {
        if (!this.res["finished"]) {
            this.res.writeHead(statusCode, { "Content-Type": "text/plain;charset=utf-8" });
            this.res.end(JSON.stringify({ status: status, data: data, msg: msg }));
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
    pageResponse(status = 0, data = null, msg = "请求成功.", count, statusCode = 200) {
        if (!this.res["finished"]) {
            this.res.writeHead(statusCode, { "Content-Type": "text/plain;charset=utf-8" });
            this.res.end(JSON.stringify({ code: status, data: data, count: count, msg: msg }));
        }
    }
    /**
     * 获取ajax数据key
     * @param key 键值
     * @returns {string|null}
     */
    input(key) {
        return this.query[key];
    }
}
exports.default = AjaxHandler;
