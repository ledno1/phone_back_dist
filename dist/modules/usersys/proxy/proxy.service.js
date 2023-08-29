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
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const param_config_contants_1 = require("../../../common/contants/param-config.contants");
const sys_user_role_entity_1 = __importDefault(require("../../../entities/admin/sys-user-role.entity"));
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
let ProxyService = class ProxyService {
    paramConfigService;
    entityManager;
    userRepository;
    redisService;
    util;
    PROXYUSER = 3;
    constructor(paramConfigService, entityManager, userRepository, redisService, util) {
        this.paramConfigService = paramConfigService;
        this.entityManager = entityManager;
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.util = util;
    }
    async page(params, user) {
        if (user.roleLabel == "admin") {
            return this.pageByAdmin(params, user);
        }
        else if (user.roleLabel == "proxy") {
            return this.pageByUser(params, user);
        }
    }
    async pageByAdmin(params, user) {
        let { page, limit, nickName, username, uuid } = params;
        let all = nickName || username || uuid ? false : true;
        let qb = await this.userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.children", "children")
            .leftJoinAndSelect("children.children", "children2")
            .innerJoinAndSelect("sys_user_role", "user_role", "user_role.user_id = user.id")
            .where("user.id != 1")
            .andWhere("user_role.role_id = 3")
            .andWhere(all ? "user.lv =1" : "1=1")
            .andWhere(nickName ? "user.nick_name LIKE :nickName" : "1=1", { nickName: `%${nickName}%` })
            .andWhere(username ? "user.username LIKE :username" : "1=1", { username: `%${username}%` })
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getMany();
        for (let i = 0; i < list.length; i++) {
            let user = list[i];
            let yesterday = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${user.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);
            let today = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${user.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = CURDATE()`);
            user.yesterdayAmount = yesterday[0].total ? yesterday[0].total : 0;
            user.todayAmount = today[0].total ? today[0].total : 0;
            if (user.children.length > 0) {
                for (let j = 0; j < user.children.length; j++) {
                    let child = user.children[j];
                    let yesterday = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${child.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);
                    let today = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${child.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = CURDATE()`);
                    child.yesterdayAmount = yesterday[0].total ? yesterday[0].total : 0;
                    child.todayAmount = today[0].total ? today[0].total : 0;
                    if (child.children.length) {
                        for (let k = 0; k < child.children.length; k++) {
                            let subChild = child.children[k];
                            let yesterday = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${subChild.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);
                            let today = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${subChild.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = CURDATE()`);
                            subChild.yesterdayAmount = yesterday[0].total ? yesterday[0].total : 0;
                            subChild.todayAmount = today[0].total ? today[0].total : 0;
                        }
                    }
                }
            }
        }
        return {
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async pageByUser(params, user) {
        if (user.lv === 3)
            throw new api_exception_1.ApiException(11001);
        let { page, limit, nickName, username } = params;
        let qb = await this.userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.parent", "parent")
            .leftJoinAndSelect("user.children", "children")
            .leftJoinAndSelect("children.children", "children2")
            .innerJoinAndSelect("sys_user_role", "user_role", "user_role.user_id = user.id")
            .where("user.id != 1")
            .andWhere("parent.uuid = :uuid", { uuid: user.uuid })
            .andWhere("user.id != :id", { id: user.id })
            .andWhere("user_role.role_id = 3")
            .andWhere(nickName ? "user.nick_name LIKE :nickName" : "1=1", { nickName: `%${nickName}%` })
            .andWhere(username ? "user.username LIKE :username" : "1=1", { username: `%${username}%` })
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getMany();
        for (let i = 0; i < list.length; i++) {
            let user = list[i];
            let yesterday = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${user.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);
            let today = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${user.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = CURDATE()`);
            user.yesterdayAmount = yesterday[0].total ? yesterday[0].total : 0;
            user.todayAmount = today[0].total ? today[0].total : 0;
            if (user.children.length > 0) {
                for (let j = 0; j < user.children.length; j++) {
                    let child = user.children[j];
                    let yesterday = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${child.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`);
                    let today = await this.entityManager.query(`SELECT SUM(amount) as total FROM top_order WHERE sysUserId = ${child.id} AND (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = CURDATE()`);
                    child.yesterdayAmount = yesterday[0].total ? yesterday[0].total : 0;
                    child.todayAmount = today[0].total ? today[0].total : 0;
                }
            }
        }
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
        if (user.lv === 3) {
            throw new api_exception_1.ApiException(30001);
        }
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
            const userObj = await manager.findOne(sys_user_entity_1.default, { where: { id: user.id } });
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
                parentRate: userObj.rate,
                uuid,
                md5key: md5Key,
                lv: user.roleLabel == "admin" ? 1 : user.lv + 1
            });
            u.parent = userObj;
            const result = await manager.save(u);
            await manager.insert(sys_user_role_entity_1.default, {
                userId: result.id,
                roleId: this.PROXYUSER
            });
        });
    }
    async edit(params, user) {
        let { action, data } = params;
        let { uuid, parentOpen, rate } = data;
        let u = await this.userRepository.createQueryBuilder("user")
            .leftJoinAndSelect("user.parent", "parent")
            .where("user.uuid = :uuid", { uuid })
            .getOne();
        switch (action) {
            case "parentOpen":
                parentOpen = Boolean(parentOpen);
                if (u.parent.uuid == user.uuid || user.roleLabel == "admin") {
                    await this.userRepository.createQueryBuilder()
                        .update()
                        .set({ parentOpen })
                        .where("uuid = :uuid", { uuid })
                        .execute();
                }
                else {
                    throw new api_exception_1.ApiException(11003);
                }
                break;
            case "rate":
                rate = Number(rate);
                if (u.parent.uuid == user.uuid || user.roleLabel == "admin") {
                    console.log(params);
                    await this.userRepository.createQueryBuilder()
                        .update()
                        .set({ parentRate: rate })
                        .where("uuid = :uuid", { uuid })
                        .execute();
                    await this.redisService.getRedis().del(`usersys:proxy:${uuid}:ratetotal`);
                }
                else {
                    throw new api_exception_1.ApiException(11003);
                }
                break;
            case "recharge":
                if (!Number.isInteger(Number(params.data.amount))) {
                    throw new api_exception_1.ApiException(30003);
                }
                let amount = Number(params.data.amount) * 100;
                let have = await this.userRepository.createQueryBuilder("user")
                    .where("user.uuid = :uuid", { uuid: user.uuid })
                    .andWhere("user.balance >= :balance", { balance: amount })
                    .getOne();
                if (!have && user.roleLabel != "admin") {
                    throw new api_exception_1.ApiException(30002);
                }
                await this.entityManager.transaction(async (manager) => {
                    try {
                        if (user.roleLabel != "admin") {
                            let h = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid: user.uuid } });
                            await manager.update(sys_user_entity_1.default, { uuid: user.uuid }, { balance: () => `balance-${amount}` });
                            await manager.insert(sys_balance_entity_1.SysBalanceLog, {
                                amount,
                                typeEnum: "sub",
                                event: "rechargeSub",
                                actionUuid: user.uuid,
                                uuid: user.uuid,
                                balance: h.balance - amount
                            });
                        }
                        await manager.update(sys_user_entity_1.default, { uuid: params.data.uuid }, { balance: () => `balance+${amount}` });
                        let t = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid: params.data.uuid } });
                        await manager.insert(sys_balance_entity_1.SysBalanceLog, {
                            amount,
                            typeEnum: "add",
                            event: "recharge",
                            actionUuid: user.uuid,
                            uuid: params.data.uuid,
                            balance: t.balance
                        });
                    }
                    catch (error) {
                        console.log(error);
                    }
                });
                break;
            case "deduction":
                if (user.roleLabel != "admin")
                    throw new api_exception_1.ApiException(11003);
                if (!Number.isInteger(Number(params.data.amount))) {
                    throw new api_exception_1.ApiException(30003);
                }
                let amount2 = Number(params.data.amount) * 100;
                let setZero = false;
                if (u.balance < amount2) {
                    setZero = true;
                }
                await this.entityManager.transaction(async (manager) => {
                    await manager.update(sys_user_entity_1.default, { uuid: params.data.uuid }, { balance: setZero ? 0 : () => `balance-${amount2}` });
                    await manager.insert(sys_balance_entity_1.SysBalanceLog, {
                        amount: setZero ? u.balance : amount2,
                        typeEnum: "sub",
                        event: "deduction",
                        actionUuid: user.uuid,
                        uuid,
                        balance: setZero ? 0 : u.balance - amount2
                    });
                });
                break;
        }
    }
    async proxyDeduction(params, user) {
        if (user.lv > 2) {
            common_1.Logger.error(`代理商${user.username}执行非法扣费`);
            throw new api_exception_1.ApiException(30004);
        }
        let { uuid, amount } = params;
        let u = await this.userRepository.findOne({ where: { uuid } });
        let parents = await this.entityManager.getTreeRepository(sys_user_entity_1.default).findAncestorsTree(u);
        let isHave = false;
        let parent = parents;
        while (parent) {
            if (parent.uuid == user.uuid) {
                isHave = true;
                break;
            }
            parent = parent.parent;
        }
        if (isHave) {
            await this.entityManager.transaction(async (manager) => {
                let u = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid } });
                if (u.balance === 0)
                    throw new api_exception_1.ApiException(30005);
                let deductionAmount = amount * 100;
                if (u.balance < amount * 100) {
                    deductionAmount = u.balance;
                }
                await manager.update(sys_user_entity_1.default, { uuid }, { balance: () => `balance-${deductionAmount}` });
                let uu = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid } });
                await manager.insert(sys_balance_entity_1.SysBalanceLog, {
                    amount: deductionAmount,
                    typeEnum: "sub",
                    event: "deduction",
                    actionUuid: user.uuid,
                    uuid,
                    balance: uu.balance
                });
                await manager.update(sys_user_entity_1.default, { uuid: user.uuid }, { balance: () => `balance+${deductionAmount}` });
                let t = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid: user.uuid } });
                await manager.insert(sys_balance_entity_1.SysBalanceLog, {
                    amount: deductionAmount,
                    typeEnum: "add",
                    event: "deduction",
                    actionUuid: user.uuid,
                    uuid: user.uuid,
                    balance: t.balance
                });
            });
            return;
        }
        common_1.Logger.error(`代理商${user.username}非法执行扣费`);
        throw new api_exception_1.ApiException(30004);
    }
    async del(params, user) {
        let { ids } = params;
        for (let j = 0; j < ids.length; j++) {
            let u = await this.userRepository.findOne({ where: { id: ids[j] } });
            let r = await this.entityManager.getTreeRepository(sys_user_entity_1.default).findDescendantsTree(u);
            if (r.children.length > 0) {
                for (let i = 0; i < r.children.length; i++) {
                    let c = r.children[i];
                    if (c.children && c.children.length > 0) {
                        await this.entityManager.getTreeRepository(sys_user_entity_1.default).remove(c.children);
                    }
                }
            }
            await this.entityManager.getTreeRepository(sys_user_entity_1.default).remove(r.children);
            await this.entityManager.getTreeRepository(sys_user_entity_1.default).remove(r);
        }
    }
    async getInstantiationByUserId(userId) {
        return await this.userRepository.findOne({ where: { id: userId } });
    }
    async checkBalance(uuid, amount) {
        let haveBalance = await this.userRepository.createQueryBuilder("user")
            .select(["user.balance", "user.uuid", "user.username", "user.id"])
            .where("user.uuid = :uuid", { uuid })
            .andWhere("user.balance >= :balance", { balance: amount })
            .andWhere("user.balance >= :minBalance", { minBalance: await this.paramConfigService.findValueByKey("minBalance") })
            .getOne();
        if (!haveBalance)
            return false;
        return haveBalance;
    }
    async updateBalance(uuid, amount, typeEnum) {
        try {
            let nowBalance = await this.entityManager.transaction(async (manager) => {
                await manager.update(sys_user_entity_1.default, { uuid }, { balance: () => `balance${typeEnum == "add" ? "+" : "-"}${amount}` });
                let u = await manager.findOne(sys_user_entity_1.default, { select: { balance: true }, where: { uuid } });
                return u.balance;
            });
            return nowBalance;
        }
        catch (e) {
            common_1.Logger.error(`更新用户余额失败${uuid}`, e.stack);
            return 0;
        }
    }
    async setOrderCommission(oInfo) {
        let u = await this.userRepository.findOne({ where: { uuid: oInfo.SysUser.uuid } });
        let parents = await this.entityManager.getTreeRepository(sys_user_entity_1.default).findAncestorsTree(u);
        let parent = parents;
        let commission = 0;
        while (parent) {
            commission = oInfo.amount * parent.parentRate / 10000;
            let nowBalance = await this.updateBalance(parent.parent ? parent.parent.uuid : "1", commission, "add");
            await this.entityManager.insert(sys_balance_entity_1.SysBalanceLog, {
                amount: commission,
                typeEnum: "add",
                event: "commission",
                actionUuid: u.uuid,
                orderUuid: oInfo.oid,
                uuid: parent.parent ? parent.parent.uuid : "1",
                balance: nowBalance ? nowBalance : 0
            });
            parent = parent.parent;
        }
    }
};
ProxyService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectEntityManager)()),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __metadata("design:paramtypes", [param_config_service_1.SysParamConfigService,
        typeorm_2.EntityManager,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], ProxyService);
exports.ProxyService = ProxyService;
//# sourceMappingURL=proxy.service.js.map