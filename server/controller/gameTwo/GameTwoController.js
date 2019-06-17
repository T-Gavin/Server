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
const TServer_1 = require("../../net/TServer");
exports.default = new class GameTwoController extends TServer_1.default {
    constructor() {
        super();
    }
    onStart() {
        const _super = Object.create(null, {
            onStart: { get: () => super.onStart }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onStart.call(this);
        });
    }
    onDisConnect(user, code, message) {
        const _super = Object.create(null, {
            onDisConnect: { get: () => super.onDisConnect }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onDisConnect.call(this, user);
        });
    }
};
