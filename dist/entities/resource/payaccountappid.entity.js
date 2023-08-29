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
exports.PayAccountAppid = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let PayAccountAppid = class PayAccountAppid extends base_entity_1.BaseEntity {
    id;
    name;
    appId;
    privateKey;
    mark;
    rechargeLimit;
    lockLimit;
    totalRecharge;
    open;
    weight;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayAccountAppid.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true, comment: "支付宝账户" }),
    __metadata("design:type", String)
], PayAccountAppid.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, unique: true, comment: "APPID" }),
    __metadata("design:type", String)
], PayAccountAppid.prototype, "appId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', unique: true, comment: "私钥" }),
    __metadata("design:type", String)
], PayAccountAppid.prototype, "privateKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, comment: "备注" }),
    __metadata("design:type", String)
], PayAccountAppid.prototype, "mark", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天充值金额限制,除100", default: 10000 }),
    __metadata("design:type", Number)
], PayAccountAppid.prototype, "rechargeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天锁定限额,特定时间归0", default: 0 }),
    __metadata("design:type", Number)
], PayAccountAppid.prototype, "lockLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "充值总额", default: 0 }),
    __metadata("design:type", Number)
], PayAccountAppid.prototype, "totalRecharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "是否开启充值", default: true }),
    __metadata("design:type", Boolean)
], PayAccountAppid.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "账号权重,即生产的链接优先级,默认1", default: 0 }),
    __metadata("design:type", Number)
], PayAccountAppid.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, SysUser => SysUser.id, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", sys_user_entity_1.default)
], PayAccountAppid.prototype, "SysUser", void 0);
PayAccountAppid = __decorate([
    (0, typeorm_1.Entity)({ name: 'pay_account_appid' })
], PayAccountAppid);
exports.PayAccountAppid = PayAccountAppid;
//# sourceMappingURL=payaccountappid.entity.js.map