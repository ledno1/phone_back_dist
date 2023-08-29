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
exports.Link = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const zh_entity_1 = require("./zh.entity");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let Link = class Link extends base_entity_1.BaseEntity {
    id;
    amount;
    mid;
    url;
    paymentStatus;
    tid;
    createStatus;
    oid;
    lockTime;
    channel;
    parentChannel;
    reuse;
    version;
    zh;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Link.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "充值金额,除100" }),
    __metadata("design:type", Number)
], Link.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "提取的上游商家id 0则未提取", default: 0 }),
    __metadata("design:type", Number)
], Link.prototype, "mid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 512 }),
    __metadata("design:type", String)
], Link.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付状态:-1支付失败,0未支付,1支付成功,2支付中", default: 0 }),
    __metadata("design:type", Number)
], Link.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "自身系统订单号", nullable: true }),
    __metadata("design:type", String)
], Link.prototype, "tid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "创建状态:-1创建失败,0未创建,1创建成功,2创建中", default: 1 }),
    __metadata("design:type", Number)
], Link.prototype, "createStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "TX平台订单号", unique: true }),
    __metadata("design:type", String)
], Link.prototype, "oid", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "锁定时间", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], Link.prototype, "lockTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道id" }),
    __metadata("design:type", Number)
], Link.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "父级支付通道id" }),
    __metadata("design:type", Number)
], Link.prototype, "parentChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "链接是否复用,继承账号的该状态" }),
    __metadata("design:type", Boolean)
], Link.prototype, "reuse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "乐观锁", default: 0 }),
    __metadata("design:type", Number)
], Link.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => zh_entity_1.ZH, ZH => ZH.link, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", zh_entity_1.ZH)
], Link.prototype, "zh", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, SysUser => SysUser.link, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", sys_user_entity_1.default)
], Link.prototype, "SysUser", void 0);
Link = __decorate([
    (0, typeorm_1.Entity)({ name: 'link' })
], Link);
exports.Link = Link;
//# sourceMappingURL=link.entity.js.map