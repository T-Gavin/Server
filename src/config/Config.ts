export default class Config {
    /**
     * 客户端路径
     * @type {string}
     */
    public static clientPath = "../client";

    /**
     * 配置文件
     * @type {string}
     */
    public static manifestFileName = "../manifest.json";

    /**
     * 最大错误重启次数
     * @type {number}
     */
    public static maxErrorRestart = 5;

    /**
     * 设置的路由
     * @type {{}}
     */
    public static route = {

    };

    /**
     * 屏蔽的路由
     * @type {[]}
     */
    public static unableRoute = [

    ];
}