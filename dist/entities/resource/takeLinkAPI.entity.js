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
exports.TakeLink = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
let TakeLink = class TakeLink extends base_entity_1.BaseEntity {
    id;
    name;
    url;
    isUse;
    weight;
    key;
    token;
    getCount;
    successRate;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TakeLink.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 64, comment: "拉取平台名字" }),
    __metadata("design:type", String)
], TakeLink.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", length: 256, comment: "拉取平台链接" }),
    __metadata("design:type", String)
], TakeLink.prototype, "url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", comment: "拉取平台是否可用", default: true }),
    __metadata("design:type", Boolean)
], TakeLink.prototype, "isUse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "使用权重" }),
    __metadata("design:type", Number)
], TakeLink.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "key", nullable: true }),
    __metadata("design:type", String)
], TakeLink.prototype, "key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", comment: "平台请求密钥token", nullable: true }),
    __metadata("design:type", String)
], TakeLink.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "拉取次数", default: 0 }),
    __metadata("design:type", Number)
], TakeLink.prototype, "getCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", comment: "支付成功率", default: 10000 }),
    __metadata("design:type", Number)
], TakeLink.prototype, "successRate", void 0);
TakeLink = __decorate([
    (0, typeorm_1.Entity)({ name: "take_link" })
], TakeLink);
exports.TakeLink = TakeLink;
//# sourceMappingURL=takeLinkAPI.entity.js.map