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
exports.ZH = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
const link_entity_1 = require("./link.entity");
const group_entity_1 = require("./group.entity");
const top_entity_1 = require("../order/top.entity");
let ZH = class ZH extends base_entity_1.BaseEntity {
    id;
    accountNumber;
    cookie;
    balance;
    balanceLock;
    rechargeLimit;
    lockLimit;
    totalRecharge;
    open;
    reuse;
    zuid;
    openid;
    openkey;
    weight;
    SysUser;
    link;
    group;
    topOrder;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ZH.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], ZH.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], ZH.prototype, "cookie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "账号QB余额,除100", default: 0 }),
    __metadata("design:type", Number)
], ZH.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "锁定金额", default: 0 }),
    __metadata("design:type", Number)
], ZH.prototype, "balanceLock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天充值金额限制,除100", default: 10000 }),
    __metadata("design:type", Number)
], ZH.prototype, "rechargeLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "当天锁定限额,特定时间归0", default: 0 }),
    __metadata("design:type", Number)
], ZH.prototype, "lockLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "充值总额", default: 0 }),
    __metadata("design:type", Number)
], ZH.prototype, "totalRecharge", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "是否开启充值", default: true }),
    __metadata("design:type", Boolean)
], ZH.prototype, "open", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "链接是否复用", default: true }),
    __metadata("design:type", Boolean)
], ZH.prototype, "reuse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64, comment: "账号uid", unique: true }),
    __metadata("design:type", String)
], ZH.prototype, "zuid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, comment: "" }),
    __metadata("design:type", String)
], ZH.prototype, "openid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, comment: "" }),
    __metadata("design:type", String)
], ZH.prototype, "openkey", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "账号权重,即生产的链接优先级,默认1", default: 0 }),
    __metadata("design:type", Number)
], ZH.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, SysUser => SysUser.id, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", sys_user_entity_1.default)
], ZH.prototype, "SysUser", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => link_entity_1.Link, Link => Link.zh, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", Array)
], ZH.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => group_entity_1.Group, Group => Group.children, {
        createForeignKeyConstraints: false,
    }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], ZH.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => top_entity_1.TopOrder, topOrder => topOrder.zh, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", Array)
], ZH.prototype, "topOrder", void 0);
ZH = __decorate([
    (0, typeorm_1.Entity)({ name: 'zh' })
], ZH);
exports.ZH = ZH;
//# sourceMappingURL=zh.entity.js.map