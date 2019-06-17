/**
 * 文 件 名：AjaxRoute
 * 功    能：
 * 作    者：Aiden
 * 小    组：h5项目组-技术部
 * 生成日期：2018/10/23 上午10:21
 * 版 本 号：v1.0.0
 * 修改日期：2018/10/23 上午10:21
 * 修改日志：
 * 版权说明：Copyright (c) 2018,aidentang All rights reserved.
 */
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