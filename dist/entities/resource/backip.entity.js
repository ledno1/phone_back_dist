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
exports.BackIP = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
let BackIP = class BackIP extends base_entity_1.BaseEntity {
    id;
    address;
    reason;
    uid;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BackIP.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, comment: "ip地址", unique: true }),
    __metadata("design:type", String)
], BackIP.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, comment: "原因", nullable: true }),
    __metadata("design:type", String)
], BackIP.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', comment: "添加人", default: 1 }),
    __metadata("design:type", Number)
], BackIP.prototype, "uid", void 0);
BackIP = __decorate([
    (0, typeorm_1.Entity)({ name: 'back_ip' })
], BackIP);
exports.BackIP = BackIP;
//# sourceMappingURL=backip.entity.js.map