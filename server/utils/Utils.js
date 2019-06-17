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
class Utils {
    /**
     * 呼叫主服务器
     * @param {string} method
     * @param arg
     * @returns {Promise<*>}
     */
    static callMain(method, ...arg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (process.send) {
                process.setMaxListeners(Infinity);
                return new Promise((resolve) => {
                    let count = process.listenerCount("message");
                    if (count <= 20) {
                        process.once("message", (msg) => {
                            if (msg && msg.method == method) {
                                resolve(msg.data);
                            }
                        });
                    }
                    process.send({ method: method, arg: arg });
                });
            }
        });
    }
    /**
     * 呼叫某个控制器
     * @param {string} serverName
     * @param msg
     */
    static callController(serverName, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.callMain("callController", serverName, msg);
        });
    }
}
exports.default = Utils;
