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
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const group_entity_1 = require("../../../entities/resource/group.entity");
const zh_service_1 = require("../zh/zh.service");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
let GroupService = class GroupService {
    groupRepository;
    redisService;
    zhService;
    proxyUserService;
    util;
    constructor(groupRepository, redisService, zhService, proxyUserService, util) {
        this.groupRepository = groupRepository;
        this.redisService = redisService;
        this.zhService = zhService;
        this.proxyUserService = proxyUserService;
        this.util = util;
    }
    async page(params, user) {
        let { action, page, limit, country } = params;
        if (action == 'use') {
            let gList = await this.groupRepository.createQueryBuilder("group")
                .leftJoin("group.SysUser", "SysUser")
                .where("SysUser.id = :id", { id: user.id })
                .getMany();
            return gList;
        }
        let qb = await this.groupRepository.createQueryBuilder("group")
            .leftJoin("group.SysUser", "SysUser")
            .leftJoin("group.children", "children")
            .select(["group.id", "group.name", "children.zuid", "children.accountNumber"])
            .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getMany();
        return {
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async add(params, user) {
        console.log(params);
        let { name, ids } = params;
        if (ids.length <= 0 || !ids)
            throw new api_exception_1.ApiException(50001);
        let group = new group_entity_1.Group();
        let children = await this.zhService.getInstantiationByZuid(ids, user.id);
        let u = await this.proxyUserService.getInstantiationByUserId(user.id);
        if (!u) {
            throw new api_exception_1.ApiException(10017);
        }
        group.name = name;
        group.children = children;
        group.SysUser = u;
        await this.groupRepository.save(group);
    }
    async edit(params, user) {
        console.log(params);
        let { action, data } = params;
        if (action == 'all') {
            let gList = await this.groupRepository.createQueryBuilder("group")
                .leftJoin("group.SysUser", "SysUser")
                .leftJoinAndSelect("group.children", "children")
                .where("SysUser.id = :id", { id: user.id })
                .getMany();
            for (let g of gList) {
                g.children = [];
                await this.groupRepository.save(g);
                await this.groupRepository.delete(g.id);
            }
            return;
        }
        let { groupId, ids } = data;
        if (action == "delAccount" || action == "addAccount") {
            let g = await this.groupRepository.createQueryBuilder("group")
                .leftJoin("group.SysUser", "SysUser")
                .leftJoinAndSelect("group.children", "children")
                .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                .andWhere("group.id = :groupId", { groupId })
                .getOne();
            if (!g) {
                throw new api_exception_1.ApiException(10017);
            }
            if (action == "delAccount") {
                g.children = g.children.filter((item) => item.zuid != ids);
                await this.groupRepository.save(g);
            }
            else if (action == "addAccount") {
                let children = await this.zhService.getInstantiationByZuid(ids, user.id);
                g.children = [...g.children, ...children];
                g.children = this.util.unique(g.children, "zuid");
                await this.groupRepository.save(g);
            }
        }
        else if (action == "delGroup") {
            try {
                await this.groupRepository.createQueryBuilder("group")
                    .leftJoin("group.SysUser", "SysUser")
                    .delete()
                    .where(user.roleLabel == "admin" ? "1=1" : "SysUser.id = :id", { id: user.id })
                    .andWhere("group.id = :groupId", { groupId: groupId })
                    .execute();
            }
            catch (e) {
                throw new api_exception_1.ApiException(50002);
            }
        }
    }
};
GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        zh_service_1.ZhService,
        proxy_service_1.ProxyService,
        util_service_1.UtilService])
], GroupService);
exports.GroupService = GroupService;
//# sourceMappingURL=group.service.js.map