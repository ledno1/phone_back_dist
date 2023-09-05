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
exports.PayCode = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const zh_entity_1 = require("../resource/zh.entity");
const sys_user_entity_1 = __importDefault(require("../admin/sys-user.entity"));
let PayCode = class PayCode extends base_entity_1.BaseEntity {
    id;
    lUid;
    amount;
    target;
    parentChannel;
    payMode;
    useCount;
    payStatus;
    confirmStatus;
    platformExpireTime;
    placeIp;
    proCode;
    parseIp;
    parseProCode;
    buyerInfo;
    ipInfo;
    mid;
    url;
    paymentStatus;
    oid;
    createStatus;
    gOid;
    lockTime;
    channel;
    reuse;
    version;
    zh;
    SysUser;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PayCode.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "支付码唯一号", unique: true }),
    __metadata("design:type", String)
], PayCode.prototype, "lUid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "充值金额,除100" }),
    __metadata("design:type", Number)
], PayCode.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "充值目标号码" }),
    __metadata("design:type", String)
], PayCode.prototype, "target", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "父级支付通道id,支付渠道" }),
    __metadata("design:type", Number)
], PayCode.prototype, "parentChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "支付方式:h5跳转 等" }),
    __metadata("design:type", String)
], PayCode.prototype, "payMode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "使用次数", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "useCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付状态", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "payStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "结算状态,是否回调到平台", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "confirmStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "datetime", comment: "平台时效，支付码超时时间" }),
    __metadata("design:type", Date)
], PayCode.prototype, "platformExpireTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "拉起支付时客户的ip" }),
    __metadata("design:type", String)
], PayCode.prototype, "placeIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "拉起支付时客户的ip解析的省/市/区县代码" }),
    __metadata("design:type", String)
], PayCode.prototype, "proCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "代理ip" }),
    __metadata("design:type", String)
], PayCode.prototype, "parseIp", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "代理ip解析的省/市/区县代码" }),
    __metadata("design:type", String)
], PayCode.prototype, "parseProCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "拉起代理的用户详细" }),
    __metadata("design:type", String)
], PayCode.prototype, "buyerInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "产码时使用的代理ip" }),
    __metadata("design:type", String)
], PayCode.prototype, "ipInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "提取的上游商家id 0则未提取", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "mid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 512, comment: "支付连接" }),
    __metadata("design:type", String)
], PayCode.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付状态:-1支付失败,0未支付,1支付成功,2支付中", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "自身系统订单号", nullable: true }),
    __metadata("design:type", String)
], PayCode.prototype, "oid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "创建状态:-1创建失败,0未创建,1创建成功,2创建中", default: 1 }),
    __metadata("design:type", Number)
], PayCode.prototype, "createStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "官方订单号，即产码时官方给予的", unique: true }),
    __metadata("design:type", String)
], PayCode.prototype, "gOid", void 0);
__decorate([
    (0, typeorm_1.Column)({ comment: "锁定时间", default: () => "CURRENT_TIMESTAMP" }),
    __metadata("design:type", Date)
], PayCode.prototype, "lockTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付通道id" }),
    __metadata("design:type", Number)
], PayCode.prototype, "channel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', comment: "链接是否复用,继承账号的该状态" }),
    __metadata("design:type", Boolean)
], PayCode.prototype, "reuse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "乐观锁", default: 0 }),
    __metadata("design:type", Number)
], PayCode.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => zh_entity_1.ZH, ZH => ZH.link, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", zh_entity_1.ZH)
], PayCode.prototype, "zh", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(type => sys_user_entity_1.default, SysUser => SysUser.link, {
        createForeignKeyConstraints: false,
    }),
    __metadata("design:type", sys_user_entity_1.default)
], PayCode.prototype, "SysUser", void 0);
PayCode = __decorate([
    (0, typeorm_1.Entity)({ name: 'pay_code' })
], PayCode);
exports.PayCode = PayCode;
//# sourceMappingURL=code.entity.js.map