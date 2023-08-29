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
exports.MenuItemAndParentInfoResult = void 0;
const swagger_1 = require("@nestjs/swagger");
const sys_menu_entity_1 = __importDefault(require("../../../../entities/admin/sys-menu.entity"));
class MenuItemAndParentInfoResult {
    menu;
    parentMenu;
}
__decorate([
    (0, swagger_1.ApiProperty)({ description: '菜单' }),
    __metadata("design:type", sys_menu_entity_1.default)
], MenuItemAndParentInfoResult.prototype, "menu", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: '父级菜单' }),
    __metadata("design:type", sys_menu_entity_1.default)
], MenuItemAndParentInfoResult.prototype, "parentMenu", void 0);
exports.MenuItemAndParentInfoResult = MenuItemAndParentInfoResult;
//# sourceMappingURL=menu.class.js.map