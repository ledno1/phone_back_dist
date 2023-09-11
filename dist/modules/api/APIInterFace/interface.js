"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayResponseError = exports.PayResponse = exports.SysPay = exports.ALiPayNotify = exports.PayCheck = exports.DirectBack = exports.DirectPush = exports.Pay = exports.KaKaResponseData = exports.KaKaResponse = exports.KaKaCode = exports.KaKa = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class KaKa {
    user_id;
    order_sn;
    channel;
    payment;
    amount;
    phone;
    ip;
    ua;
    prov;
    method;
}
exports.KaKa = KaKa;
exports.KaKaCode = {
    10000: "成功",
    10001: "下单错误,请重试",
    10010: "参数错误/配置错误/该渠道未配置价格",
    10011: "此渠道禁止下单",
    10012: "手机号在黑名单,请更换话单",
    10013: "ip不在白名单",
    10014: "账户余额不足/扣除余额失败",
    10015: "号码错误/运营商不支持,请更换话单",
    10016: "渠道维护,暂时无法下单"
};
class KaKaResponse {
    code;
    msg;
    data;
}
exports.KaKaResponse = KaKaResponse;
class KaKaResponseData {
    orderId;
    payParams;
    query_url;
    charge_num_type;
}
exports.KaKaResponseData = KaKaResponseData;
class Pay {
    merId;
    orderId;
    orderAmt;
    channel;
    desc;
    smstyle;
    userId;
    ip;
    notifyUrl;
    returnUrl;
    nonceStr;
    sign;
    attch;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "商户号" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 4),
    __metadata("design:type", String)
], Pay.prototype, "merId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "请求方系统订单号" }),
    (0, class_validator_1.Length)(1, 32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "交易金额" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10),
    __metadata("design:type", String)
], Pay.prototype, "orderAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "通道类型" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 1),
    __metadata("design:type", String)
], Pay.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "订单描述" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "desc", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "扫码模式" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "smstyle", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "用户编号" }),
    (0, class_validator_1.Length)(1, 32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "下单ip地址" }),
    (0, class_validator_1.IsIP)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "ip", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "通知地址" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "notifyUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "页面跳转地址" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "returnUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "随机字符串" }),
    (0, class_validator_1.Length)(1, 32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "nonceStr", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "签名" }),
    (0, class_validator_1.Length)(32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "sign", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "附加信息,子通道id,可忽略" }),
    (0, class_validator_1.Length)(0, 4),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Pay.prototype, "attch", void 0);
exports.Pay = Pay;
class DirectPush {
    merId;
    orderId;
    orderAmt;
    attch;
    channel;
    rechargeNumber;
    notifyUrl;
    weight;
    sign;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "商户号" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 4),
    __metadata("design:type", String)
], DirectPush.prototype, "merId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "请求方系统订单号" }),
    (0, class_validator_1.Length)(1, 32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectPush.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "交易金额" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 10),
    __metadata("design:type", String)
], DirectPush.prototype, "orderAmt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "附加信息,暂定空字符串" }),
    (0, class_validator_1.Length)(0, 4),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectPush.prototype, "attch", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "通道编码" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 2),
    __metadata("design:type", String)
], DirectPush.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "充值号码" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(8, 32),
    __metadata("design:type", String)
], DirectPush.prototype, "rechargeNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "充值成功或失败的异步回调地址，用于通知代充商户充值结果" }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectPush.prototype, "notifyUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "权重用于加急,0/100" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 3),
    __metadata("design:type", String)
], DirectPush.prototype, "weight", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "签名" }),
    (0, class_validator_1.Length)(32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectPush.prototype, "sign", void 0);
exports.DirectPush = DirectPush;
class DirectBack {
    merId;
    orderId;
    channel;
    sign;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "商户号" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 4),
    __metadata("design:type", String)
], DirectBack.prototype, "merId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "请求方系统订单号" }),
    (0, class_validator_1.Length)(1, 32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectBack.prototype, "orderId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "通道编码" }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 2),
    __metadata("design:type", String)
], DirectBack.prototype, "channel", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "签名" }),
    (0, class_validator_1.Length)(32),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DirectBack.prototype, "sign", void 0);
exports.DirectBack = DirectBack;
class PayCheck {
    merId;
    orderId;
    nonceStr;
    sign;
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 4),
    __metadata("design:type", String)
], PayCheck.prototype, "merId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 32),
    __metadata("design:type", String)
], PayCheck.prototype, "orderId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 32),
    __metadata("design:type", String)
], PayCheck.prototype, "nonceStr", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32),
    __metadata("design:type", String)
], PayCheck.prototype, "sign", void 0);
exports.PayCheck = PayCheck;
class ALiPayNotify {
    type;
    no;
    money;
    mark;
    dt;
    idnumber;
    sign;
}
exports.ALiPayNotify = ALiPayNotify;
class SysPay extends Pay {
    amount;
    subChannel;
    aliAmount;
    md5Key;
}
exports.SysPay = SysPay;
class PayResponse {
    code;
    payurl;
    sysorderno;
    orderno;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "响应码" }),
    __metadata("design:type", Number)
], PayResponse.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "收银台地址" }),
    __metadata("design:type", String)
], PayResponse.prototype, "payurl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "系统订单号" }),
    __metadata("design:type", String)
], PayResponse.prototype, "sysorderno", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "请求方系统订单号" }),
    __metadata("design:type", String)
], PayResponse.prototype, "orderno", void 0);
exports.PayResponse = PayResponse;
class PayResponseError {
    code;
    data;
    message;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: "错误码" }),
    __metadata("design:type", Number)
], PayResponseError.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "" }),
    __metadata("design:type", String)
], PayResponseError.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: "错误喜喜" }),
    __metadata("design:type", String)
], PayResponseError.prototype, "message", void 0);
exports.PayResponseError = PayResponseError;
//# sourceMappingURL=interface.js.map