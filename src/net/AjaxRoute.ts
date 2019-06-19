
import AjaxServer from "./AjaxServer";

export default class AjaxRoute {

    /**
     * 服务器实例
     * @type {AjaxServer}
     */
    public main: AjaxServer;

    /**
     * 工具库
     * @type {Utils}
     */
    public utils;

    /**
     * 实例化完成
     */
    public async onStart() {
    }

}
