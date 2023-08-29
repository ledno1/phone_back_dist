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
exports.TopService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const param_config_contants_1 = require("../../../common/contants/param-config.contants");
const sys_user_role_entity_1 = __importDefault(require("../../../entities/admin/sys-user-role.entity"));
const TOPUSER = 2;
let TopService = class TopService {
    paramConfigService;
    entityManager;
    userRepository;
    redisService;
    util;
    constructor(paramConfigService, entityManager, userRepository, redisService, util) {
        this.paramConfigService = paramConfigService;
        this.entityManager = entityManager;
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.util = util;
    }
    async page(params, user) {
        let { page, limit, nickName, username } = params;
        let qb = await this.userRepository.createQueryBuilder("user")
            .innerJoinAndSelect("sys_user_role", "user_role", "user_role.user_id = user.id")
            .where("user.id != 1")
            .andWhere("user_role.role_id = 2")
            .andWhere(nickName ? "user.nick_name LIKE :nickName" : "1=1", { nickName: `%${nickName}%` })
            .andWhere(username ? "user.username LIKE :username" : "1=1", { username: `%${username}%` })
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
        let { username, password, nickName } = params;
        const exists = await this.userRepository.findOne({
            where: { username: username }
        });
        if (!(0, lodash_1.isEmpty)(exists)) {
            throw new api_exception_1.ApiException(10001);
        }
        await this.entityManager.transaction(async (manager) => {
            const salt = this.util.generateRandomValue(32);
            const md5Key = this.util.generateRandomValue(8);
            const uuid = this.util.generateUUID();
            const initPassword = await this.paramConfigService.findValueByKey(param_config_contants_1.SYS_USER_INITPASSWORD);
            const password2 = this.util.md5(`${password ? password : initPassword || "123456"}${salt}`);
            const u = manager.create(sys_user_entity_1.default, {
                departmentId: 1,
                username: username,
                password: password2,
                name: "",
                nickName: nickName,
                email: "",
                phone: "",
                remark: "",
                status: 1,
                psalt: salt,
                parentRate: 0,
                uuid,
                md5key: md5Key
            });
            const result = await manager.save(u);
            await manager.insert(sys_user_role_entity_1.default, {
                userId: result.id,
                roleId: TOPUSER
            });
        });
    }
    async edit(params, user) {
        let { action, data } = params;
        switch (action) {
            case "delete":
                await this.userRepository.createQueryBuilder("user")
                    .where("id IN (:...ids)", { ids: data.ids })
                    .delete()
                    .execute();
                break;
            case "resetpwd":
                let psalt = this.util.generateRandomValue(32);
                await this.userRepository.createQueryBuilder("user")
                    .update(sys_user_entity_1.default)
                    .set({
                    password: this.util.md5(`123456${psalt}`),
                    psalt
                })
                    .where("id IN (:...ids)", { ids: data.ids })
                    .execute();
                break;
        }
    }
    async userInfoById(id) {
        return await this.userRepository.findOne({ where: { id: id } });
    }
    async getMd5Key(id) {
        let topUser = await this.redisService.getRedis().get(`usersys:top:${id}`);
        if (!topUser) {
            topUser = await this.userInfoById(id);
            if (!topUser) {
                throw new api_exception_1.ApiException(10017);
            }
            await this.redisService.getRedis().set(`usersys:top:${id}`, JSON.stringify(topUser), "EX", 60 * 60 * 24);
        }
        else {
            topUser = JSON.parse(topUser);
        }
        return topUser.md5key;
    }
    async getPayUser(amount) {
        try {
            let qb = await this.userRepository.createQueryBuilder('user')
                .leftJoin(sys_user_role_entity_1.default, 'user_role', 'user_role.user_id = user.id')
                .select(['user.id', 'user.uuid', 'user.username'])
                .where('user_role.role_id = 3')
                .andWhere('user.selfOpen = 1')
                .andWhere("user.parentOpen = 1")
                .andWhere('user.balance >= :amount', { amount: amount })
                .getMany();
            return qb;
        }
        catch (e) {
            throw new api_exception_1.ApiException(10017);
        }
    }
};
TopService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __metadata("design:paramtypes", [param_config_service_1.SysParamConfigService,
        typeorm_2.EntityManager,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], TopService);
exports.TopService = TopService;
//# sourceMappingURL=top.service.js.map