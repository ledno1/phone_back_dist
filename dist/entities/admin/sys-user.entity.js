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
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("typeorm");
const base_entity_1 = require("../base.entity");
const zh_entity_1 = require("../resource/zh.entity");
const link_entity_1 = require("../resource/link.entity");
const group_entity_1 = require("../resource/group.entity");
const top_entity_1 = require("../order/top.entity");
const payaccount_entity_1 = require("../resource/payaccount.entity");
let SysUser = class SysUser extends base_entity_1.BaseEntity {
    id;
    departmentId;
    name;
    username;
    password;
    psalt;
    nickName;
    headImg;
    email;
    phone;
    remark;
    whiteIP;
    status;
    googleSecret;
    uuid;
    parent;
    children;
    zh;
    pay_account;
    link;
    group;
    topOrder;
    balance;
    lv;
    selfOpen;
    parentOpen;
    parentRate;
    rate;
    payAccountMode;
    md5key;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SysUser.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'department_id' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SysUser.prototype, "departmentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 32, comment: '登录密码盐值' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "psalt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nick_name', nullable: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "nickName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'head_img', nullable: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "headImg", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "remark", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, default: '0.0.0.0' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysUser.prototype, "whiteIP", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', nullable: true, default: 1 }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SysUser.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', nullable: true }),
    __metadata("design:type", String)
], SysUser.prototype, "googleSecret", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'uuid', type: 'varchar', length: 64, unique: true, comment: "自身系统用户属性" }),
    __metadata("design:type", String)
], SysUser.prototype, "uuid", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", SysUser)
], SysUser.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], SysUser.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => zh_entity_1.ZH, zh => zh.SysUser),
    __metadata("design:type", Array)
], SysUser.prototype, "zh", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => payaccount_entity_1.PayAccount, pay_account => pay_account.SysUser),
    __metadata("design:type", Array)
], SysUser.prototype, "pay_account", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => link_entity_1.Link, link => link.SysUser),
    __metadata("design:type", Array)
], SysUser.prototype, "link", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => group_entity_1.Group, Group => Group.SysUser),
    __metadata("design:type", Array)
], SysUser.prototype, "group", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(type => top_entity_1.TopOrder, topOrder => topOrder.SysUser),
    __metadata("design:type", Array)
], SysUser.prototype, "topOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "余额", default: 0 }),
    __metadata("design:type", Number)
], SysUser.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "代理商级别", default: 0 }),
    __metadata("design:type", Number)
], SysUser.prototype, "lv", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "自身设置是否接单", default: true }),
    __metadata("design:type", Boolean)
], SysUser.prototype, "selfOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "父节点设置是否接单", default: true }),
    __metadata("design:type", Boolean)
], SysUser.prototype, "parentOpen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "父节点费率设置" }),
    __metadata("design:type", Number)
], SysUser.prototype, "parentRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "自身费率设 置费率 万份位 100 即 1%", default: 100 }),
    __metadata("design:type", Number)
], SysUser.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "pay_account_mode", type: "int", comment: "支付账户模式 0 轮流 1 比例派单 ", default: 0 }),
    __metadata("design:type", Number)
], SysUser.prototype, "payAccountMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "md5盐值", default: "" }),
    __metadata("design:type", String)
], SysUser.prototype, "md5key", void 0);
SysUser = __decorate([
    (0, typeorm_1.Entity)({ name: 'sys_user' }),
    (0, typeorm_1.Tree)("closure-table")
], SysUser);
exports.default = SysUser;
//# sourceMappingURL=sys-user.entity.js.map