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
let SysLoginLog = class SysLoginLog extends base_entity_1.BaseEntity {
    id;
    userId;
    ip;
    loginLocation;
    time;
    ua;
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SysLoginLog.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, name: 'user_id' }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], SysLoginLog.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysLoginLog.prototype, "ip", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'login_location',
        comment: '登录地点',
        length: 255,
        default: '',
    }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysLoginLog.prototype, "loginLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'datetime', nullable: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SysLoginLog.prototype, "time", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SysLoginLog.prototype, "ua", void 0);
SysLoginLog = __decorate([
    (0, typeorm_1.Entity)({ name: 'sys_login_log' })
], SysLoginLog);
exports.default = SysLoginLog;
//# sourceMappingURL=sys-login-log.entity.js.map