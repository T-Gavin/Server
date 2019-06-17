import ByteArray from "../../utils/ByteArray";
import User from "../../db/User";
import WebSocket = require("ws");
import TServer from "../../net/TServer";


export default new class GameTwoController extends TServer {

    public constructor() {
        super();
    }

    public async onStart() {
        await super.onStart();
    }

    public async onDisConnect(user: User, code?: number, message?: string) {
        await super.onDisConnect(user);
    }
// todo 业务处理 业务处理。。。。。。

}

 