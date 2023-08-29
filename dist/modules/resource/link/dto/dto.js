"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyResult = exports.Notify = exports.AddLink = void 0;
class AddLink {
    amount;
    channel;
    oid;
    pay_link;
    accountNumber;
    zuid;
}
exports.AddLink = AddLink;
class Notify {
    merId;
    orderId;
    sysOrderId;
    orderAmt;
    desc;
    status;
    nonceStr;
    attch;
}
exports.Notify = Notify;
class NotifyResult {
    result;
    msg;
}
exports.NotifyResult = NotifyResult;
//# sourceMappingURL=dto.js.map