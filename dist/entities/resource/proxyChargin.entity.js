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
exports.ProxyCharging = void 0;
const base_entity_1 = require("../base.entity");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let ProxyCharging = class ProxyCharging extends base_entity_1.BaseEntity {
    id;
    target;
    amount;
    pid;
    status;
    codeCount;
    createStatus;
    errInfo;
    pUid;
    notifyUrl;
    oid;
    mOid;
    version;
    weight;
    locking;
    count;
    isClose;
    outTime;
    operator;
    city;
    province;
    callback;
    channel;
    parentChannel;
    lRate;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 128, comment: "目标号码" }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "订单金额" }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "提交代充话单/代理id" }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "pid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付状态:-1支付超时,0未支付,1支付成功,2执行中,3已退单", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "产码次数", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "codeCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "产码状态", default: false }),
    __metadata("design:type", Boolean)
], ProxyCharging.prototype, "createStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 256, comment: "订单出错事件", nullable: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "errInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "代充订单唯一号", unique: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "pUid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 256, comment: "充值通知地址" }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "notifyUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "自身平台支付订单号,创建时为空", unique: true, nullable: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "oid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "上游平台订单号,创建时为空", unique: true, nullable: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "mOid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "乐观锁", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "权重,即优先级,默认0 快充 慢充 加急为 100", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "锁定状态", default: false }),
    __metadata("design:type", Boolean)
], ProxyCharging.prototype, "locking", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "拉单次数", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "关闭状态", default: false }),
    __metadata("design:type", Boolean)
], ProxyCharging.prototype, "isClose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", comment: "超时时间", default: () => "CURRENT_TIMESTAMP" }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], ProxyCharging.prototype, "outTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "运营商 DIANXIN LIANTONG YIDONG" }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "operator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "号码所在的归属的市", nullable: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "号码所在的归属的省", nullable: true }),
    __metadata("design:type", String)
], ProxyCharging.prototype, "province", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "上游平台回调状态 0等待支付回调  1 回调成功 2 回调失败 3 强制回调 ", default: 0 }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "callback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道类型" }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道根类型" }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "parentChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "订单创建时该链接的支付通道实际费率" }),
    __metadata("design:type", Number)
], ProxyCharging.prototype, "lRate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, sysUser => sysUser.topOrder, {
        createForeignKeyConstraints: false
    }),
    __metadata("design:type", sys_user_entity_1.default)
], ProxyCharging.prototype, "SysUser", void 0);
ProxyCharging = __decorate([
    (0, typeorm_1.Entity)({ name: "proxy_charging" })
], ProxyCharging);
exports.ProxyCharging = ProxyCharging;
//# sourceMappingURL=proxyChargin.entity.js.map