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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminWSService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt_1 = require("@nestjs/jwt");
const typeorm_2 = require("typeorm");
const sys_role_menu_entity_1 = __importDefault(require("../../entities/admin/sys-role-menu.entity"));
const sys_user_role_entity_1 = __importDefault(require("../../entities/admin/sys-user-role.entity"));
const admin_ws_gateway_1 = require("./admin-ws.gateway");
const ws_event_1 = require("./ws.event");
let AdminWSService = class AdminWSService {
    jwtService;
    roleMenuRepository;
    userRoleRepository;
    adminWsGateWay;
    constructor(jwtService, roleMenuRepository, userRoleRepository, adminWsGateWay) {
        this.jwtService = jwtService;
        this.roleMenuRepository = roleMenuRepository;
        this.userRoleRepository = userRoleRepository;
        this.adminWsGateWay = adminWsGateWay;
    }
    async getOnlineSockets() {
        const onlineSockets = await this.adminWsGateWay.socketServer.fetchSockets();
        return onlineSockets;
    }
    async findSocketIdByUid(uid) {
        const onlineSockets = await this.getOnlineSockets();
        const socket = onlineSockets.find((socket) => {
            const token = socket.handshake.query?.token;
            const tokenUid = this.jwtService.verify(token).uid;
            return tokenUid === uid;
        });
        return socket;
    }
    async filterSocketIdByUidArr(uids) {
        const onlineSockets = await this.getOnlineSockets();
        const sockets = onlineSockets.filter((socket) => {
            const token = socket.handshake.query?.token;
            const tokenUid = this.jwtService.verify(token).uid;
            return uids.includes(tokenUid);
        });
        return sockets;
    }
    async noticeUserToUpdateMenusByUserIds(uid) {
        const userIds = Array.isArray(uid) ? uid : [uid];
        const sockets = await this.filterSocketIdByUidArr(userIds);
        if (sockets) {
            this.adminWsGateWay.socketServer
                .to(sockets.map((n) => n.id))
                .emit(ws_event_1.EVENT_UPDATE_MENU);
        }
    }
    async noticeUserToUpdateMenusByMenuIds(menuIds) {
        const roleMenus = await this.roleMenuRepository.find({
            where: { menuId: (0, typeorm_2.In)(menuIds) },
        });
        const roleIds = roleMenus.map((n) => n.roleId);
        await this.noticeUserToUpdateMenusByRoleIds(roleIds);
    }
    async noticeUserToUpdateMenusByRoleIds(roleIds) {
        const users = await this.userRoleRepository.find({
            where: { roleId: (0, typeorm_2.In)(roleIds) },
        });
        if (users) {
            const userIds = users.map((n) => n.userId);
            await this.noticeUserToUpdateMenusByUserIds(userIds);
        }
    }
};
AdminWSService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(sys_role_menu_entity_1.default)),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_role_entity_1.default)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        admin_ws_gateway_1.AdminWSGateway])
], AdminWSService);
exports.AdminWSService = AdminWSService;
//# sourceMappingURL=admin-ws.service.js.map