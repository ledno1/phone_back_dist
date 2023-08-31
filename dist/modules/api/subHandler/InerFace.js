"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderRedis = exports.PayAccountEx = exports.PayAccountAndMerchant = exports.HaveAmount = exports.ProcessModel = exports.ChannelType = void 0;
const payaccount_entity_1 = require("../../../entities/resource/payaccount.entity");
var ChannelType;
(function (ChannelType) {
    ChannelType["PROXY"] = "proxy";
    ChannelType["DIRECT"] = "direct";
})(ChannelType = exports.ChannelType || (exports.ChannelType = {}));
var ProcessModel;
(function (ProcessModel) {
    ProcessModel["SERVICE"] = "service";
    ProcessModel["CHECK"] = "check";
})(ProcessModel = exports.ProcessModel || (exports.ProcessModel = {}));
class HaveAmount {
    username;
    id;
    uuid;
    count;
    rate;
}
exports.HaveAmount = HaveAmount;
class PayAccountAndMerchant {
    payAccount;
    merchant;
}
exports.PayAccountAndMerchant = PayAccountAndMerchant;
class PayAccountEx extends payaccount_entity_1.PayAccount {
    realAmount;
}
exports.PayAccountEx = PayAccountEx;
class OrderRedis {
    createAt;
    req;
    order;
    resource;
    user;
    showOrder;
    realAmount;
}
exports.OrderRedis = OrderRedis;
//# sourceMappingURL=InerFace.js.map