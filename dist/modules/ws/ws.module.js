"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WSModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sys_user_role_entity_1 = __importDefault(require("../../entities/admin/sys-user-role.entity"));
const sys_role_menu_entity_1 = __importDefault(require("../../entities/admin/sys-role-menu.entity"));
const admin_ws_gateway_1 = require("./admin-ws.gateway");
const auth_service_1 = require("./auth.service");
const admin_ws_service_1 = require("./admin-ws.service");
const providers = [admin_ws_gateway_1.AdminWSGateway, auth_service_1.AuthService, admin_ws_service_1.AdminWSService];
let WSModule = class WSModule {
};
WSModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([sys_user_role_entity_1.default, sys_role_menu_entity_1.default])],
        providers,
        exports: providers,
    })
], WSModule);
exports.WSModule = WSModule;
//# sourceMappingURL=ws.module.js.map