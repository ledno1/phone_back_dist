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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopOrder = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const zh_entity_1 = require("../resource/zh.entity");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let TopOrder = class TopOrder extends base_entity_1.BaseEntity {
    id;
    amount;
    mid;
    status;
    os;
    errInfo;
    pid;
    oid;
    mOid;
    mIp;
    mNotifyUrl;
    callbackInfo;
    callback;
    channel;
    parentChannel;
    lOid;
    queryUrl;
    APIKey;
    lRate;
    zh;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TopOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "订单金额" }),
    __metadata("design:type", Number)
], TopOrder.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "上游商家id" }),
    __metadata("design:type", Number)
], TopOrder.prototype, "mid", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "int",
        comment: "支付状态:-1支付超时,0未支付,1支付成功,2支付中 3强制回调 4支付成功强制回调",
        default: 2
    }),
    __metadata("design:type", Number)
], TopOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 32, comment: "客户端访问网页收银台的设备系统类型", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "os", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "订单出错事件", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "errInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付宝账户id,话单id,话单或者代充 id", nullable: true }),
    __metadata("design:type", Number)
], TopOrder.prototype, "pid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "自身平台订单号", unique: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "oid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "上游平台订单号", unique: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "mOid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "上游平台客户请求ip", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "mIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 512, comment: "上游平台回调地址" }),
    __metadata("design:type", String)
], TopOrder.prototype, "mNotifyUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 256, comment: "上游平台回调状态信息", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "callbackInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "上游平台回调状态 0等待支付回调  1 回调成功 2 回调失败 3 强制回调 ", default: 0 }),
    __metadata("design:type", Number)
], TopOrder.prototype, "callback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道类型" }),
    __metadata("design:type", Number)
], TopOrder.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道根类型" }),
    __metadata("design:type", Number)
], TopOrder.prototype, "parentChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 256, comment: "订单创建时使用的链接的oid,或者API平台的oid" }),
    __metadata("design:type", String)
], TopOrder.prototype, "lOid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 512, comment: "查单链接", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "queryUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 50, comment: "提取APIKey", nullable: true }),
    __metadata("design:type", String)
], TopOrder.prototype, "APIKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "订单创建时该链接的支付通道实际费率" }),
    __metadata("design:type", Number)
], TopOrder.prototype, "lRate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => zh_entity_1.ZH, zh => zh.topOrder, {
        createForeignKeyConstraints: false
    }),
    __metadata("design:type", zh_entity_1.ZH)
], TopOrder.prototype, "zh", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, sysUser => sysUser.topOrder, {
        createForeignKeyConstraints: false
    }),
    __metadata("design:type", sys_user_entity_1.default)
], TopOrder.prototype, "SysUser", void 0);
TopOrder = __decorate([
    (0, typeorm_1.Entity)({ name: "top_order" })
], TopOrder);
exports.TopOrder = TopOrder;
//# sourceMappingURL=top.entity.js.map