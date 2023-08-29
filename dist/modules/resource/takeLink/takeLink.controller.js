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
exports.TakeLinkController = void 0;
const common_1 = require("@nestjs/common");
const takeLink_service_1 = require("./takeLink.service");
const admin_user_decorator_1 = require("../../admin/core/decorators/admin-user.decorator");
let TakeLinkController = class TakeLinkController {
    takeLinkService;
    constructor(takeLinkService) {
        this.takeLinkService = takeLinkService;
    }
    page(query, user) {
        return this.takeLinkService.page(query, user);
    }
    add(body, user) {
        return this.takeLinkService.add(body, user);
    }
    edit(body, user) {
        return this.takeLinkService.edit(body, user);
    }
};
__decorate([
    (0, common_1.Get)('page'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TakeLinkController.prototype, "page", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TakeLinkController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('edit'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, admin_user_decorator_1.AdminUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TakeLinkController.prototype, "edit", null);
TakeLinkController = __decorate([
    (0, common_1.Controller)('/resource/takeLink'),
    __metadata("design:paramtypes", [takeLink_service_1.TakeLinkService])
], TakeLinkController);
exports.TakeLinkController = TakeLinkController;
//# sourceMappingURL=takeLink.controller.js.map