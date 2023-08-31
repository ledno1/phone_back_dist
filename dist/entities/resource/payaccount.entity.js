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
exports.PayAccount = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let PayAccount = class PayAccount extends base_entity_1.BaseEntity {
    id;
    name;
    _id;
    uid;
    cookies;
    mark;
    rechargeLimit;
    lockLimit;
    totalRecharge;
    payMode;
    accountType;
    open;
    status;
    weight;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: "支付宝账户" }),
    __metadata("design:type", String)
], PayAccount.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, comment: "浏览器文件夹id" }),
    __metadata("design:type", String)
], PayAccount.prototype, "_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true, comment: "支付宝uid" }),
    __metadata("design:type", String)
], PayAccount.prototype, "uid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', comment: "支付宝cookies" }),
    __metadata("design:type", String)
], PayAccount.prototype, "cookies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1024, comment: "备注", nullable: true }),
    __metadata("design:type", String)
], PayAccount.prototype, "mark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天充值金额限制,除100", default: 1000000 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "rechargeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天锁定限额,特定时间归0", default: 0 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "lockLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "充值总额", default: 0 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "totalRecharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "付款模式 0自定义金额 1二维码固定金额", default: 1 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "payMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "付款模式 0个人码 1企业码", default: 1 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "是否开启充值", default: true }),
    __metadata("design:type", Boolean)
], PayAccount.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "cookies状态", default: true }),
    __metadata("design:type", Boolean)
], PayAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "账号权重,即生产的链接优先级,默认1", default: 0 }),
    __metadata("design:type", Number)
], PayAccount.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, SysUser => SysUser.id, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", sys_user_entity_1.default)
], PayAccount.prototype, "SysUser", void 0);
PayAccount = __decorate([
    (0, typeorm_1.Entity)({ name: 'pay_account' })
], PayAccount);
exports.PayAccount = PayAccount;
//# sourceMappingURL=payaccount.entity.js.map