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
exports.SysUserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../../common/exceptions/api.exception");
const sys_department_entity_1 = __importDefault(require("../../../../entities/admin/sys-department.entity"));
const sys_user_role_entity_1 = __importDefault(require("../../../../entities/admin/sys-user-role.entity"));
const sys_user_entity_1 = __importDefault(require("../../../../entities/admin/sys-user.entity"));
const util_service_1 = require("../../../../shared/services/util.service");
const typeorm_2 = require("typeorm");
const admin_constants_1 = require("../../admin.constants");
const redis_service_1 = require("../../../../shared/services/redis.service");
const param_config_contants_1 = require("../../../../common/contants/param-config.contants");
const param_config_service_1 = require("../param-config/param-config.service");
const sys_role_entity_1 = __importDefault(require("../../../../entities/admin/sys-role.entity"));
let SysUserService = class SysUserService {
    userRepository;
    departmentRepository;
    userRoleRepository;
    sysRoleRepository;
    redisService;
    paramConfigService;
    entityManager;
    rootRoleId;
    util;
    constructor(userRepository, departmentRepository, userRoleRepository, sysRoleRepository, redisService, paramConfigService, entityManager, rootRoleId, util) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.userRoleRepository = userRoleRepository;
        this.sysRoleRepository = sysRoleRepository;
        this.redisService = redisService;
        this.paramConfigService = paramConfigService;
        this.entityManager = entityManager;
        this.rootRoleId = rootRoleId;
        this.util = util;
    }
    async getParents(uid) {
        const user = await this.userRepository.findOne({
            where: { id: uid }
        });
        let p = await this.entityManager.getTreeRepository(sys_user_entity_1.default).findAncestors(user);
        return [...p, user];
    }
    async getParentsRate(uid) {
        const user = await this.userRepository.findOne({
            where: { id: uid }
        });
        let p = await this.entityManager.getTreeRepository(sys_user_entity_1.default).findAncestors(user);
        let rateTotal = 0;
        p.forEach((item) => {
            rateTotal += item.parentRate;
        });
        return rateTotal;
    }
    async findUserByUserName(username) {
        return await this.userRepository.findOne({
            where: { username: username, status: 1 },
        });
    }
    async getAccountInfo(uid, ip) {
        const user = await this.userRepository.findOne({
            where: { id: uid },
        });
        const userInfo = await this.info(uid);
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10017);
        }
        return {
            name: user.name,
            nickName: user.nickName,
            email: user.email,
            phone: user.phone,
            remark: user.remark,
            headImg: user.headImg,
            loginIp: ip,
            roleLabel: userInfo.roleLabel,
            lv: userInfo.lv,
            uuid: userInfo.uuid,
        };
    }
    async updatePersonInfo(uid, info) {
        await this.userRepository.update(uid, info);
    }
    async updatePassword(uid, dto) {
        const user = await this.userRepository.findOne({ where: { id: uid } });
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10017);
        }
        const comparePassword = this.util.md5(`${dto.originPassword}${user.psalt}`);
        if (user.password !== comparePassword) {
            throw new api_exception_1.ApiException(10011);
        }
        const password = this.util.md5(`${dto.newPassword}${user.psalt}`);
        await this.userRepository.update({ id: uid }, { password });
        await this.upgradePasswordV(user.id);
    }
    async forceUpdatePassword(uid, password) {
        const user = await this.userRepository.findOne({ where: { id: uid } });
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10017);
        }
        const newPassword = this.util.md5(`${password}${user.psalt}`);
        await this.userRepository.update({ id: uid }, { password: newPassword });
        await this.upgradePasswordV(user.id);
    }
    async add(param) {
        const exists = await this.userRepository.findOne({
            where: { username: param.username },
        });
        if (!(0, lodash_1.isEmpty)(exists)) {
            throw new api_exception_1.ApiException(10001);
        }
        await this.entityManager.transaction(async (manager) => {
            const salt = this.util.generateRandomValue(32);
            const initPassword = await this.paramConfigService.findValueByKey(param_config_contants_1.SYS_USER_INITPASSWORD);
            const password = this.util.md5(`${initPassword ?? '123456'}${salt}`);
            const u = manager.create(sys_user_entity_1.default, {
                departmentId: param.departmentId,
                username: param.username,
                password,
                name: param.name,
                nickName: param.nickName,
                email: param.email,
                phone: param.phone,
                remark: param.remark,
                status: param.status,
                psalt: salt,
            });
            const result = await manager.save(u);
            const { roles } = param;
            const insertRoles = roles.map((e) => {
                return {
                    roleId: e,
                    userId: result.id,
                };
            });
            await manager.insert(sys_user_role_entity_1.default, insertRoles);
        });
    }
    async update(param) {
        await this.entityManager.transaction(async (manager) => {
            await manager.update(sys_user_entity_1.default, param.id, {
                departmentId: param.departmentId,
                username: param.username,
                name: param.name,
                nickName: param.nickName,
                email: param.email,
                phone: param.phone,
                remark: param.remark,
                status: param.status,
            });
            await manager.delete(sys_user_role_entity_1.default, { userId: param.id });
            const insertRoles = param.roles.map((e) => {
                return {
                    roleId: e,
                    userId: param.id,
                };
            });
            await manager.insert(sys_user_role_entity_1.default, insertRoles);
            if (param.status === 0) {
                await this.forbidden(param.id);
            }
        });
    }
    async findUserIdByNameOrId(nameOrId) {
        const user = await this.userRepository.findOne({
            where: [
                { id: Number(nameOrId) ? Number(nameOrId) : null },
                { username: (0, typeorm_2.Like)(`%${nameOrId}%`) },
                { name: (0, typeorm_2.Like)(`%${nameOrId}%`) },
            ],
        });
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10017);
        }
        return user;
    }
    async info(id) {
        const user = await this.userRepository.findOne({ where: { id } });
        if ((0, lodash_1.isEmpty)(user)) {
            throw new api_exception_1.ApiException(10017);
        }
        const departmentRow = await this.departmentRepository.findOne({
            where: { id: user.departmentId },
        });
        if ((0, lodash_1.isEmpty)(departmentRow) && this.rootRoleId !== id) {
            throw new api_exception_1.ApiException(10018);
        }
        const roleRows = await this.userRoleRepository.find({
            where: { userId: user.id },
        });
        const roles = roleRows.map((e) => {
            return e.roleId;
        });
        const roleLabel = await this.sysRoleRepository.findOne({
            where: { id: (0, typeorm_2.In)(roles) },
        });
        delete user.password;
        delete user.md5key;
        return {
            ...user,
            roles,
            departmentName: departmentRow && departmentRow.name
                ? departmentRow.name
                : this.rootRoleId === id
                    ? '超级管理员'
                    : '未分配部门',
            roleLabel: roleLabel && roleLabel.label
                ? roleLabel.label
                : this.rootRoleId === id
                    ? 'admin'
                    : '未分配角色',
            lv: user.lv
        };
    }
    async infoList(ids) {
        const users = await this.userRepository.findBy({ id: (0, typeorm_2.In)(ids) });
        return users;
    }
    async delete(userIds) {
        const rootUserId = await this.findRootUserId();
        if (userIds.includes(rootUserId)) {
            throw new Error('can not delete root user!');
        }
        await this.userRepository.delete(userIds);
        await this.userRoleRepository.delete({ userId: (0, typeorm_2.In)(userIds) });
    }
    async count(uid, deptIds) {
        const queryAll = (0, lodash_1.isEmpty)(deptIds);
        const rootUserId = await this.findRootUserId();
        if (queryAll) {
            return await this.userRepository.count({
                where: { id: (0, typeorm_2.Not)((0, typeorm_2.In)([rootUserId, uid])) },
            });
        }
        return await this.userRepository.count({
            where: { id: (0, typeorm_2.Not)((0, typeorm_2.In)([rootUserId, uid])), departmentId: (0, typeorm_2.In)(deptIds) },
        });
    }
    async findRootUserId() {
        const result = await this.userRoleRepository.findOne({
            where: { id: this.rootRoleId },
        });
        return result.userId;
    }
    async list(user) {
        let { lv, uid, departmentName } = user;
        const rootUserId = await this.findRootUserId();
        const qb = this.userRepository
            .createQueryBuilder('user')
            .select(['user.id', 'user.name'])
            .where('user.id NOT IN (:...ids)', { ids: [rootUserId, user.uid] })
            .andWhere(lv === 1
            ? '1=1'
            : lv === 2
                ? 'department_id = :department_id'
                : 'id < 0', lv === 1
            ? null
            : lv === 2
                ? { department_id: user.departmentId }
                : null)
            .getMany();
        return qb;
    }
    async page(uid, params) {
        const { departmentIds, limit, page, name, username, phone, remark } = params;
        const queryAll = (0, lodash_1.isEmpty)(departmentIds);
        const rootUserId = await this.findRootUserId();
        const qb = this.userRepository
            .createQueryBuilder('user')
            .innerJoinAndSelect('sys_department', 'dept', 'dept.id = user.departmentId')
            .innerJoinAndSelect('sys_user_role', 'user_role', 'user_role.user_id = user.id')
            .innerJoinAndSelect('sys_role', 'role', 'role.id = user_role.role_id')
            .select([
            'user.id,GROUP_CONCAT(role.name) as roleNames',
            'dept.name',
            'user.*',
        ])
            .where('user.id NOT IN (:...ids)', { ids: [rootUserId, uid] })
            .andWhere(queryAll ? '1 = 1' : 'user.departmentId IN (:...deptIds)', {
            deptIds: departmentIds,
        })
            .andWhere('user.name LIKE :name', { name: `%${name}%` })
            .andWhere('user.username LIKE :username', { username: `%${username}%` })
            .andWhere('user.remark LIKE :remark', { remark: `%${remark}%` })
            .andWhere('user.phone LIKE :phone', { phone: `%${phone}%` })
            .orderBy('user.updated_at', 'DESC')
            .groupBy('user.id')
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        const list = await qb.getRawMany();
        const dealResult = list.map((n) => {
            const convertData = Object.entries(n).map(([key, value]) => [(0, lodash_1.camelCase)(key), value]);
            return {
                ...Object.fromEntries(convertData),
                departmentName: n.dept_name,
                roleNames: n.roleNames.split(','),
            };
        });
        return [dealResult, total];
    }
    async forbidden(uid) {
        await this.redisService.getRedis().del(`admin:passwordVersion:${uid}`);
        await this.redisService.getRedis().del(`admin:token:${uid}`);
        await this.redisService.getRedis().del(`admin:perms:${uid}`);
    }
    async multiForbidden(uids) {
        if (uids) {
            const pvs = [];
            const ts = [];
            const ps = [];
            uids.forEach((e) => {
                pvs.push(`admin:passwordVersion:${e}`);
                ts.push(`admin:token:${e}`);
                ps.push(`admin:perms:${e}`);
            });
            await this.redisService.getRedis().del(pvs);
            await this.redisService.getRedis().del(ts);
            await this.redisService.getRedis().del(ps);
        }
    }
    async upgradePasswordV(id) {
        const v = await this.redisService
            .getRedis()
            .get(`admin:passwordVersion:${id}`);
        if (!(0, lodash_1.isEmpty)(v)) {
            await this.redisService
                .getRedis()
                .set(`admin:passwordVersion:${id}`, parseInt(v) + 1);
        }
    }
};
SysUserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(1, (0, typeorm_1.InjectRepository)(sys_department_entity_1.default)),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_role_entity_1.default)),
    __param(3, (0, typeorm_1.InjectRepository)(sys_role_entity_1.default)),
    __param(6, (0, typeorm_1.InjectEntityManager)()),
    __param(7, (0, common_1.Inject)(admin_constants_1.ROOT_ROLE_ID)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        param_config_service_1.SysParamConfigService,
        typeorm_2.EntityManager, Number, util_service_1.UtilService])
], SysUserService);
exports.SysUserService = SysUserService;
//# sourceMappingURL=user.service.js.map