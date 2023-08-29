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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaController = void 0;
const common_1 = require("@nestjs/common");
const ma_service_1 = require("./ma.service");
const admin_user_decorator_1 = require("../../admin/core/decorators/admin-user.decorator");
let MaController = class MaController {
    proxyService;
    constructor(proxyService) {
        this.proxyService = proxyService;
    }
    async page(query, user) {
        return this.proxyService.page(query, user);
    }
    async add(body, user) {
        return this.proxyService.add(body, user);
    }
    async del(body, user) {
        return this.proxyService.del(body, user);
    }
    async edit(body, user) {
        return this.proxyService.edit(body, user);
    }
    async proxyDeduction(body, user) {
        return this.proxyService.proxyDeduction(body, user);
    }
};
__decorate([
    (0, common_1.Get)('page'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaController.prototype, "page", null);
__decorate([
    (0, common_1.Post)('/add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('/del'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaController.prototype, "del", null);
__decorate([
    (0, common_1.Post)('/edit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaController.prototype, "edit", null);
__decorate([
    (0, common_1.Post)('/madeduction'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MaController.prototype, "proxyDeduction", null);
MaController = __decorate([
    (0, common_1.Controller)('/usersys/ma'),
    __metadata("design:paramtypes", [ma_service_1.MaService])
], MaController);
exports.MaController = MaController;
//# sourceMappingURL=ma.controller.js.map