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
exports.AController = void 0;
const common_1 = require("@nestjs/common");
const a_service_1 = require("./a.service");
const platform_express_1 = require("@nestjs/platform-express");
let AController = class AController {
    topService;
    constructor(topService) {
        this.topService = topService;
    }
    page(dto) {
        return;
    }
    async upfile(file) {
        return;
    }
};
__decorate([
    (0, common_1.Get)('page'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AController.prototype, "page", null);
__decorate([
    (0, common_1.Post)('/upfile'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AController.prototype, "upfile", null);
AController = __decorate([
    (0, common_1.Controller)('newtest'),
    __metadata("design:paramtypes", [a_service_1.AService])
], AController);
exports.AController = AController;
//# sourceMappingURL=a.controller.js.map