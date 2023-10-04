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
exports.Fingerprint = void 0;
const base_entity_1 = require("../base.entity");
const typeorm_1 = require("typeorm");
let Fingerprint = class Fingerprint extends base_entity_1.BaseEntity {
    id;
    name;
    reason;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Fingerprint.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 128, comment: "fingerprint指纹值", unique: true }),
    __metadata("design:type", String)
], Fingerprint.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 512, comment: "原因", nullable: true }),
    __metadata("design:type", String)
], Fingerprint.prototype, "reason", void 0);
Fingerprint = __decorate([
    (0, typeorm_1.Entity)({ name: 'fingerprint' })
], Fingerprint);
exports.Fingerprint = Fingerprint;
//# sourceMappingURL=fingerprint.entity.js.map