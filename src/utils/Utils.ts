export default class Utils {

    /**
     * 呼叫主服务器
     * @param {string} method
     * @param arg
     * @returns {Promise<*>}
     */
    public static async callMain(method: string, ...arg: any[]) {
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
                process.send({method: method, arg: arg});
            });
        }
    }

    /**
     * 呼叫某个控制器
     * @param {string} serverName
     * @param msg
     */
    public static async callController(serverName: string, msg: any) {
        await this.callMain("callController", serverName, msg);
    }
}