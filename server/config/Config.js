"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Config {
}
/**
 * 客户端路径
 * @type {string}
 */
Config.clientPath = "../client";
/**
 * 配置文件
 * @type {string}
 */
Config.manifestFileName = "../manifest.json";
/**
 * 最大错误重启次数
 * @type {number}
 */
Config.maxErrorRestart = 5;
/**
 * 设置的路由
 * @type {{}}
 */
Config.route = {};
/**
 * 屏蔽的路由
 * @type {[]}
 */
Config.unableRoute = [];
exports.default = Config;
