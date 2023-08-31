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
exports.Channel = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
const takeLinkAPI_entity_1 = require("./takeLinkAPI.entity");
let Channel = class Channel extends base_entity_1.BaseEntity {
    id;
    name;
    rate;
    strategy;
    isPublic;
    isUse;
    weight;
    expireTime;
    children;
    parent;
    takeLinks;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Channel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Channel.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Channel.prototype, "rate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0, comment: "API策略,0队列,1优先级,2随机" }),
    __metadata("design:type", Number)
], Channel.prototype, "strategy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, comment: "是否公开" }),
    __metadata("design:type", Boolean)
], Channel.prototype, "isPublic", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "boolean", default: true, comment: "是否启用" }),
    __metadata("design:type", Boolean)
], Channel.prototype, "isUse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 0, comment: "优先级" }),
    __metadata("design:type", Number)
], Channel.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", default: 60 * 60 * 24, comment: "默认过期时间" }),
    __metadata("design:type", Number)
], Channel.prototype, "expireTime", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], Channel.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", Channel)
], Channel.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(type => takeLinkAPI_entity_1.TakeLink, takeLink => takeLink.channel, {
        createForeignKeyConstraints: false
    }),
    (0, typeorm_1.JoinTable)(),
    __metadata("design:type", Array)
], Channel.prototype, "takeLinks", void 0);
Channel = __decorate([
    (0, typeorm_1.Entity)({ name: "channel" }),
    (0, typeorm_1.Tree)("closure-table")
], Channel);
exports.Channel = Channel;
//# sourceMappingURL=channel.entity.js.map