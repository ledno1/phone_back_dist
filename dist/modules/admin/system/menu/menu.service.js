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
exports.SysMenuService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const admin_constants_1 = require("../../admin.constants");
const api_exception_1 = require("../../../../common/exceptions/api.exception");
const sys_menu_entity_1 = __importDefault(require("../../../../entities/admin/sys-menu.entity"));
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../../shared/services/redis.service");
const admin_ws_service_1 = require("../../../ws/admin-ws.service");
const role_service_1 = require("../role/role.service");
let SysMenuService = class SysMenuService {
    menuRepository;
    redisService;
    rootRoleId;
    roleService;
    adminWSService;
    constructor(menuRepository, redisService, rootRoleId, roleService, adminWSService) {
        this.menuRepository = menuRepository;
        this.redisService = redisService;
        this.rootRoleId = rootRoleId;
        this.roleService = roleService;
        this.adminWSService = adminWSService;
    }
    async list() {
        return await this.menuRepository.find();
    }
    async save(menu) {
        await this.menuRepository.save(menu);
        this.adminWSService.noticeUserToUpdateMenusByRoleIds([this.rootRoleId]);
    }
    async getMenus(uid) {
        const roleIds = await this.roleService.getRoleIdByUser(uid);
        let menus = [];
        if ((0, lodash_1.includes)(roleIds, this.rootRoleId)) {
            menus = await this.menuRepository.find();
        }
        else {
            menus = await this.menuRepository
                .createQueryBuilder('menu')
                .innerJoinAndSelect('sys_role_menu', 'role_menu', 'menu.id = role_menu.menu_id')
                .andWhere('role_menu.role_id IN (:...roldIds)', { roldIds: roleIds })
                .orderBy('menu.order_num', 'DESC')
                .getMany();
        }
        return menus;
    }
    async check(dto) {
        if (dto.type === 2 && dto.parentId === -1) {
            throw new api_exception_1.ApiException(10005);
        }
        if (dto.type === 1 && dto.parentId !== -1) {
            const parent = await this.getMenuItemInfo(dto.parentId);
            if ((0, lodash_1.isEmpty)(parent)) {
                throw new api_exception_1.ApiException(10014);
            }
            if (parent && parent.type === 1) {
                throw new api_exception_1.ApiException(10006);
            }
        }
        if (!Object.is(dto.type, 2)) {
            const menus = await this.menuRepository.find({
                where: { parentId: Object.is(dto.parentId, -1) ? null : dto.parentId },
            });
            const router = dto.router.split('/').filter(Boolean).join('/');
            const pathReg = new RegExp(`^/?${router}/?$`);
            const isExist = menus.some((n) => pathReg.test(n.router) && n.id !== dto.menuId);
            if (isExist) {
                throw new api_exception_1.ApiException(10004);
            }
        }
    }
    async findChildMenus(mid) {
        const allMenus = [];
        const menus = await this.menuRepository.find({ where: { parentId: mid } });
        for (let i = 0; i < menus.length; i++) {
            if (menus[i].type !== 2) {
                const c = await this.findChildMenus(menus[i].id);
                allMenus.push(c);
            }
            allMenus.push(menus[i].id);
        }
        return allMenus;
    }
    async getMenuItemInfo(mid) {
        const menu = await this.menuRepository.findOne({ where: { id: mid } });
        return menu;
    }
    async getMenuItemAndParentInfo(mid) {
        const menu = await this.menuRepository.findOne({ where: { id: mid } });
        let parentMenu = undefined;
        if (menu && menu.parentId) {
            parentMenu = await this.menuRepository.findOne({
                where: { id: menu.parentId },
            });
        }
        return { menu, parentMenu };
    }
    async findRouterExist(router) {
        const menus = await this.menuRepository.findOne({ where: { router } });
        return !(0, lodash_1.isEmpty)(menus);
    }
    async getPerms(uid) {
        const roleIds = await this.roleService.getRoleIdByUser(uid);
        let perms = [];
        let result = null;
        if ((0, lodash_1.includes)(roleIds, this.rootRoleId)) {
            result = await this.menuRepository.find({
                where: { perms: (0, typeorm_2.Not)((0, typeorm_2.IsNull)()), type: 2 },
            });
        }
        else {
            result = await this.menuRepository
                .createQueryBuilder('menu')
                .innerJoinAndSelect('sys_role_menu', 'role_menu', 'menu.id = role_menu.menu_id')
                .andWhere('role_menu.role_id IN (:...roldIds)', { roldIds: roleIds })
                .andWhere('menu.type = 2')
                .andWhere('menu.perms IS NOT NULL')
                .getMany();
        }
        if (!(0, lodash_1.isEmpty)(result)) {
            result.forEach((e) => {
                perms = (0, lodash_1.concat)(perms, e.perms.split(','));
            });
            perms = (0, lodash_1.uniq)(perms);
        }
        return perms;
    }
    async deleteMenuItem(mids) {
        await this.menuRepository.delete(mids);
        this.adminWSService.noticeUserToUpdateMenusByMenuIds(mids);
    }
    async refreshPerms(uid) {
        const perms = await this.getPerms(uid);
        const online = await this.redisService.getRedis().get(`admin:token:${uid}`);
        if (online) {
            await this.redisService
                .getRedis()
                .set(`admin:perms:${uid}`, JSON.stringify(perms));
        }
    }
    async refreshOnlineUserPerms() {
        const onlineUserIds = await this.redisService
            .getRedis()
            .keys('admin:token:*');
        if (onlineUserIds && onlineUserIds.length > 0) {
            for (let i = 0; i < onlineUserIds.length; i++) {
                const uid = onlineUserIds[i].split('admin:token:')[1];
                const perms = await this.getPerms(parseInt(uid));
                await this.redisService
                    .getRedis()
                    .set(`admin:perms:${uid}`, JSON.stringify(perms));
            }
        }
    }
};
SysMenuService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sys_menu_entity_1.default)),
    __param(2, (0, common_1.Inject)(admin_constants_1.ROOT_ROLE_ID)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService, Number, role_service_1.SysRoleService,
        admin_ws_service_1.AdminWSService])
], SysMenuService);
exports.SysMenuService = SysMenuService;
//# sourceMappingURL=menu.service.js.map