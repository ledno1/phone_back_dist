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
exports.SysBalanceLog = exports.EventEnum = exports.TypeEnum = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
var TypeEnum;
(function (TypeEnum) {
    TypeEnum["ADD"] = "ADD";
    TypeEnum["REDUCE"] = "REDUCE";
})(TypeEnum = exports.TypeEnum || (exports.TypeEnum = {}));
var EventEnum;
(function (EventEnum) {
    EventEnum["recharge"] = "recharge";
    EventEnum["deduction"] = "deduction";
    EventEnum["commission"] = "commission";
    EventEnum["topOrder"] = "topOrder";
    EventEnum["topOrderRe"] = "topOrderRe";
    EventEnum["rechargeSub"] = "rechargeSub";
})(EventEnum = exports.EventEnum || (exports.EventEnum = {}));
let SysBalanceLog = class SysBalanceLog extends base_entity_1.BaseEntity {
    id;
    uuid;
    typeEnum;
    amount;
    event;
    actionUuid;
    orderUuid;
    balance;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SysBalanceLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 32, comment: "用户uuid" }),
    __metadata("design:type", String)
], SysBalanceLog.prototype, "uuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "类型,增加还是减少" }),
    __metadata("design:type", String)
], SysBalanceLog.prototype, "typeEnum", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "金额" }),
    __metadata("design:type", Number)
], SysBalanceLog.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "事件 充值,扣费,佣金,上游订单,上游订单超时退款" }),
    __metadata("design:type", String)
], SysBalanceLog.prototype, "event", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "执行事件的发起用户", default: "" }),
    __metadata("design:type", String)
], SysBalanceLog.prototype, "actionUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "或者自身平台订单oid号", default: "" }),
    __metadata("design:type", String)
], SysBalanceLog.prototype, "orderUuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "执行后余额" }),
    __metadata("design:type", Number)
], SysBalanceLog.prototype, "balance", void 0);
SysBalanceLog = __decorate([
    (0, typeorm_1.Entity)({ name: "sys_balance_log" })
], SysBalanceLog);
exports.SysBalanceLog = SysBalanceLog;
//# sourceMappingURL=sys-balance.entity.js.map