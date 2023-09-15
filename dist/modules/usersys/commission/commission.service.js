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
exports.CommissionService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const config_1 = require("@nestjs/config");
const lodash_1 = require("lodash");
const top_entity_1 = require("../../../entities/order/top.entity");
let CommissionService = class CommissionService {
    logRepository;
    configService;
    userRepository;
    entityManager;
    paramConfigService;
    redisService;
    util;
    appName;
    constructor(logRepository, configService, userRepository, entityManager, paramConfigService, redisService, util) {
        this.logRepository = logRepository;
        this.configService = configService;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.paramConfigService = paramConfigService;
        this.redisService = redisService;
        this.util = util;
        this.appName = this.configService.get("resources").APP_NAME;
        if (!this.appName) {
            throw new Error("APP_NAME is not defined in .env file");
        }
    }
    async page(params, user) {
        let { page, limit } = params;
        let qb = null;
        if (user.roleLabel == "admin") {
            let { event, createdAt, uuid } = params;
            qb = await this.logRepository.createQueryBuilder("log")
                .leftJoin(sys_user_entity_1.default, "user", "user.uuid = log.uuid")
                .leftJoin(sys_user_entity_1.default, "actionUser", "actionUser.uuid = log.actionUuid")
                .select([
                "log.id AS id", "log.event AS event", "log.actionUuid AS actionUuid", "log.amount AS amount", "log.balance AS balance", "log.createdAt AS createdAt",
                "log.orderUuid AS orderUuid", "log.typeEnum as typeEnum", "log.uuid AS uuid",
                "user.username AS username",
                "actionUser.username AS actionUsername"
            ])
                .where(uuid ? "log.uuid = :uuid" : "1=1", { uuid })
                .andWhere(event ? "log.event = :event" : "1=1", { event })
                .andWhere(createdAt ? "DATE_FORMAT(log.created_at,'%Y-%m-%d') >= :createdStart AND DATE_FORMAT(log.created_at,'%Y-%m-%d') <= :createdEnd" : "1=1", {
                createdStart: createdAt ? createdAt[0] : "",
                createdEnd: createdAt ? createdAt[1] : ""
            })
                .orderBy("log.created_at", "DESC")
                .offset((page - 1) * limit)
                .limit(limit);
            const [_, total] = await qb.getManyAndCount();
            let list = await qb.getRawMany();
            return {
                list,
                pagination: {
                    total,
                    page: Number(page),
                    size: Number(limit)
                }
            };
        }
        else {
            let { event, createdAt } = params;
            let { uuid } = user;
            qb = await this.logRepository.createQueryBuilder("log")
                .select(["log.id", "log.event", "log.amount", "log.balance", "log.createdAt", "log.orderUuid", "log.typeEnum"])
                .where("log.uuid = :uuid", { uuid })
                .andWhere(event ? "log.event = :event" : "1=1", { event })
                .andWhere(createdAt ? "DATE_FORMAT(log.created_at,'%Y-%m-%d') >= :createdStart AND DATE_FORMAT(log.created_at,'%Y-%m-%d') <= :createdEnd" : "1=1", {
                createdStart: createdAt ? createdAt[0] : "",
                createdEnd: createdAt ? createdAt[1] : ""
            })
                .orderBy("log.created_at", "DESC")
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
    }
    async statistics(params, user) {
        let isBind = await this.entityManager.query(`SELECT googleSecret FROM sys_user WHERE uuid = '${user.uuid}'`);
        let DIANXIN = await this.paramConfigService.findValueByKey("DIANXIN");
        let YIDONG = await this.paramConfigService.findValueByKey("YIDONG");
        let LIANTONG = await this.paramConfigService.findValueByKey("LIANTONG");
        let DIANXINLIST = await this.paramConfigService.findValueByKey("DIANXIN_LIST");
        let YIDONGLIST = await this.paramConfigService.findValueByKey("YIDONG_LIST");
        let LIANTONGLIST = await this.paramConfigService.findValueByKey("LIANTONG_LIST");
        let testMode = await this.paramConfigService.findValueByKey("TestOpen");
        let showPhone = await this.paramConfigService.findValueByKey(`showPhone`);
        if (user.roleLabel == "admin") {
            let date;
            let createdAt = [this.util.dayjsFormat(this.util.dayjs().startOf("day").valueOf()), this.util.dayjsFormat(this.util.dayjs().endOf("day").valueOf())];
            let todayStatics = await this.statistics2({ createdAt });
            date = this.util.dayjs().subtract(1, "day").valueOf();
            createdAt = [this.util.dayjsFormat(this.util.dayjs(date).startOf("day").valueOf()), this.util.dayjsFormat(this.util.dayjs(date).endOf("day").valueOf())];
            let yesterdayStatics = await this.statistics2({ createdAt });
            let zhList = await this.entityManager.query(`SELECT COUNT(*)AS total FROM zh`);
            let yesterdayTopOrder = await this.entityManager.query(`SELECT SUM(amount) AS amountTotal,COUNT(*) AS orderTotal FROM top_order WHERE (status = 1 OR status = 4 OR status = 3) AND DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 1 DAY),'%Y-%m-%d')`);
            let todayTopOrder = await this.entityManager.query(`SELECT SUM(amount) AS amountTotal,COUNT(*) AS orderTotal FROM top_order WHERE (status = 1 OR status = 4 OR status = 3) AND  DATE_FORMAT(created_at,'%Y-%m-%d') = DATE_FORMAT(NOW(),'%Y-%m-%d')`);
            let linkList = await this.entityManager.query(`SELECT link.amount,link.paymentStatus,link.created_at AS createdAt,sys_user.balance FROM link 
               LEFT JOIN channel ON link.channel = channel.id 
               LEFT JOIN zh ON link.zhId = zh.id
               LEFT JOIN sys_user ON link.sysUserId = sys_user.id
               WHERE (paymentStatus = 0 OR paymentStatus = 2) 
               AND zh.open = 1 AND zh.rechargeLimit - zh.lockLimit > link.amount
               AND sys_user.selfOpen = 1 AND sys_user.parentOpen = 1 AND sys_user.balance > 100000
               `);
            let channelList = await this.entityManager.query(`SELECT id,name FROM channel WHERE isUse = 1 and  parentId is not null`);
            let pay = await this.paramConfigService.findValueByKey("pay_open");
            let aLiPayModel = await this.paramConfigService.findValueByKey("aLiPayModel");
            return {
                ZHCount: zhList[0].total,
                todayOrder: todayTopOrder[0].orderTotal,
                todaySale: todayTopOrder[0].amountTotal ? todayTopOrder[0].amountTotal : 0,
                yesterdayOrder: yesterdayTopOrder[0].orderTotal,
                yesterdaySale: yesterdayTopOrder[0].amountTotal ? yesterdayTopOrder[0].amountTotal : 0,
                link: linkList,
                sysOpen: pay == "1" ? true : false,
                googleCodeBind: isBind[0].googleSecret ? true : false,
                channelList,
                aLiPayModel: aLiPayModel == "1" ? true : false,
                yesterdayStatics,
                todayStatics,
                DIANXIN: DIANXIN == '1' ? true : false,
                YIDONG: YIDONG == '1' ? true : false,
                LIANTONG: LIANTONG == '1' ? true : false,
                DIANXINLIST,
                YIDONGLIST,
                LIANTONGLIST,
                testMode: testMode == '66666' ? true : false,
                showPhone: showPhone == '66666' ? true : false
            };
        }
        else if (user.roleLabel == "top") {
            let topOrder = await this.entityManager.query(`SELECT status,amount FROM top_order WHERE (status = 1 OR status = 4 OR status = 3) AND created_at >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 48 HOUR),'%Y-%m-%d %H:%i:%s') AND mid = ${user.id}`);
            let linkList = await this.entityManager.query(`SELECT link.amount,link.paymentStatus,link.created_at AS createdAt FROM link 
               LEFT JOIN channel ON link.channel = channel.id 
               LEFT JOIN zh ON link.zhId = zh.id
               LEFT JOIN sys_user ON link.sysUserId = sys_user.id
               WHERE (paymentStatus = 0 OR paymentStatus = 2) AND unix_timestamp(now()) < unix_timestamp(link.created_at) + channel.expireTime
               AND zh.open = 1 AND zh.rechargeLimit - zh.lockLimit > link.amount
               AND sys_user.selfOpen = 1 AND sys_user.parentOpen = 1
               `);
            let qb = await this.entityManager.transaction(async (entity) => {
                let userData = {};
                let userinfo = await entity.query(`SELECT balance,selfOpen,whiteIp FROM sys_user WHERE uuid = '${user.uuid}'`);
                userData["whiteIp"] = userinfo[0].whiteIp;
                return userData;
            });
            let channelList = await this.entityManager.query(`SELECT id,name FROM channel WHERE isUse = 1 and  parentId is not null`);
            return Object.assign({
                googleCodeBind: isBind[0].googleSecret ? true : false,
                whiteIp: qb.whiteIp,
                channelList
            }, {
                topOrder,
                link: linkList
            });
        }
        else if (user.roleLabel == "proxy") {
            let qb = await this.entityManager.transaction(async (entity) => {
                let userData = {};
                let topOrder = await entity.query(`SELECT status,amount FROM top_order WHERE (status = 1 OR status = 4 OR status = 3) AND created_at >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 48 HOUR),'%Y-%m-%d %H:%i:%s') AND sysUserId = ${user.id}`);
                userData["topOrder"] = topOrder;
                let linkList = await entity.query(`SELECT link.amount AS amount,link.paymentStatus,link.created_at AS createdAt FROM link 
                                                  LEFT JOIN channel ON link.channel = channel.id  
                                                  LEFT JOIN zh ON link.zhId = zh.id
                                                  WHERE zh.open = 1 AND zh.rechargeLimit - zh.lockLimit > link.amount
                                                  AND link.sysUserId = ${user.id}
                                                  `);
                userData["link"] = linkList;
                let userinfo = await entity.query(`SELECT balance,selfOpen,whiteIp FROM sys_user WHERE uuid = '${user.uuid}'`);
                userData["balance"] = userinfo[0].balance;
                userData["selfOpen"] = Boolean(userinfo[0].selfOpen);
                let zhList = await entity.query(`SELECT id FROM zh WHERE sysUserId = ${user.id}`);
                userData["zh"] = zhList;
                userData["whiteIp"] = userinfo[0].whiteIp;
                return userData;
            });
            return Object.assign({
                googleCodeBind: isBind[0].googleSecret ? true : false,
                DIANXIN: DIANXIN == '1' ? true : false,
                YIDONG: YIDONG == '1' ? true : false,
                LIANTONG: LIANTONG == '1' ? true : false,
                DIANXINLIST,
                YIDONGLIST,
                LIANTONGLIST,
                testMode: testMode == '66666' ? true : false
            }, qb);
        }
        else if (user.roleLabel == "ma") {
            let qb = await this.entityManager.transaction(async (entity) => {
                let userData = {};
                let topOrder = await entity.query(`SELECT status,amount FROM top_order WHERE (status = 1 OR status = 4 OR status = 3) AND created_at >= DATE_FORMAT(DATE_SUB(NOW(),INTERVAL 48 HOUR),'%Y-%m-%d %H:%i:%s') AND sysUserId = ${user.id}`);
                userData["topOrder"] = topOrder;
                let userinfo = await entity.query(`SELECT balance,selfOpen FROM sys_user WHERE uuid = '${user.uuid}'`);
                userData["balance"] = userinfo[0].balance;
                userData["selfOpen"] = Boolean(userinfo[0].selfOpen);
                return userData;
            });
            return Object.assign({ googleCodeBind: isBind[0].googleSecret ? true : false }, qb);
        }
    }
    async edit(params, user) {
        let { action, open, phoneType } = params;
        let userInfo = await this.userRepository.findOne({ where: { uuid: user.uuid } });
        switch (action) {
            case "open":
                if (user.roleLabel == "proxy") {
                    await this.userRepository.update({ uuid: user.uuid }, { selfOpen: open });
                }
                else if (user.roleLabel == "admin") {
                    let t = open ? "1" : "0";
                    await this.paramConfigService.updateValueByKey("pay_open", t);
                }
                else if (user.roleLabel == "ma") {
                    await this.userRepository.update({ uuid: user.uuid }, { selfOpen: open });
                }
                break;
            case "aLiPayModel":
                if (user.roleLabel == "admin") {
                    let { aLiPayModel } = params;
                    let t = aLiPayModel ? "1" : "0";
                    await this.paramConfigService.updateValueByKey("aLiPayModel", t);
                }
                return 1;
                break;
            case "googleOpen":
                await this.redisService.getRedis().del(`googleQrUrl:${user.uuid}`);
                let secretQrUrl = await this.util.createSeedSecret(user.username, this.appName);
                await this.redisService.getRedis().set(`googleQrUrl:${user.uuid}`, JSON.stringify(secretQrUrl), "EX", 60 * 3);
                return secretQrUrl.qrcodeUrl;
                break;
            case "googleBind":
                let googleQrUrl = await this.redisService.getRedis().get(`googleQrUrl:${user.uuid}`);
                let { NowPassword } = params;
                if (!googleQrUrl) {
                    throw new api_exception_1.ApiException(11101);
                }
                googleQrUrl = JSON.parse(googleQrUrl);
                let verify = this.util.isCodeCorrect(params.googleCode, googleQrUrl.secret);
                if (!verify) {
                    throw new api_exception_1.ApiException(11102);
                }
                else {
                    const comparePassword = this.util.md5(`${NowPassword}${userInfo.psalt}`);
                    if (userInfo.password !== comparePassword) {
                        throw new api_exception_1.ApiException(11102);
                    }
                    await this.userRepository.update({ uuid: user.uuid }, { googleSecret: googleQrUrl.secret });
                    return "绑定成功";
                }
                break;
            case "googleUnBind":
                const comparePassword = this.util.md5(`${params.password}${userInfo.psalt}`);
                if (userInfo.password !== comparePassword) {
                    throw new api_exception_1.ApiException(11103);
                }
                let verifyUnBind = this.util.isCodeCorrect(params.googleCode, userInfo.googleSecret);
                if (!verifyUnBind) {
                    throw new api_exception_1.ApiException(11102);
                }
                await this.userRepository.update({ uuid: user.uuid }, { googleSecret: null });
                return "解绑成功";
                break;
            case "updatePassword":
                if (!userInfo.googleSecret || userInfo.googleSecret == null || userInfo.googleSecret == "") {
                    throw new api_exception_1.ApiException(10113);
                }
                const comparePassword2 = this.util.md5(`${params.oldPwd}${userInfo.psalt}`);
                if (userInfo.password !== comparePassword2) {
                    throw new api_exception_1.ApiException(11103);
                }
                let verifyUnBind2 = this.util.isCodeCorrect(params.googleCode, userInfo.googleSecret);
                if (!verifyUnBind2) {
                    throw new api_exception_1.ApiException(11102);
                }
                let psalt = this.util.generateRandomValue(32);
                let password = this.util.md5(`${params.newPassword}${psalt}`);
                await this.userRepository.update({ uuid: user.uuid }, { password: password, psalt });
                return "修改成功";
                break;
            case "whiteIp":
                let { whiteIp } = params;
                if (!userInfo.googleSecret || userInfo.googleSecret == null || userInfo.googleSecret == "") {
                    throw new api_exception_1.ApiException(10113);
                }
                let reg = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
                if (!reg.test(whiteIp)) {
                    throw new api_exception_1.ApiException(10112);
                }
                let verifyUnBindWhite = this.util.isCodeCorrect(params.googleCode, userInfo.googleSecret);
                if (!verifyUnBindWhite) {
                    throw new api_exception_1.ApiException(11102);
                }
                userInfo.whiteIP = whiteIp;
                await this.userRepository.save(userInfo);
                return "修改成功";
                break;
            case "md5Key":
                let { md5Key } = params;
                if (!userInfo.googleSecret || userInfo.googleSecret == null || userInfo.googleSecret == "") {
                    throw new api_exception_1.ApiException(10113);
                }
                if (md5Key.length < 8 || md5Key.length > 32) {
                    throw new api_exception_1.ApiException(10114);
                }
                let verifyUnBindmd5Key = this.util.isCodeCorrect(params.googleCode, userInfo.googleSecret);
                if (!verifyUnBindmd5Key) {
                    throw new api_exception_1.ApiException(11102);
                }
                userInfo.md5key = md5Key;
                await this.userRepository.save(userInfo);
                return "修改成功";
                break;
            case "test":
                if (user.roleLabel == "admin" || user.roleLabel == "top") {
                    let { test } = params;
                    return "修改成功";
                }
                return 1;
                break;
            case "phoneOpen":
                let { phoneOpen } = params;
                if (user.roleLabel == "admin") {
                    let t = phoneOpen ? "1" : "0";
                    await this.paramConfigService.updateValueByKey(phoneType, t);
                }
                return 1;
                break;
            case "comeIn":
                let { data } = params;
                if (user.roleLabel == "admin") {
                    await this.paramConfigService.updateValueByKey(phoneType + '_LIST', data);
                }
                return 1;
                break;
        }
    }
    async statistics2(params, user = undefined) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, mOid } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let totalAmount = null, totalSuccessCount = null, totalCount = null;
        let qbSuccessTotal = await this.entityManager.createQueryBuilder(top_entity_1.TopOrder, "order")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select(["SUM(order.amount) AS totalAmount", "COUNT(order.id) AS totalCount"])
            .where(user && user.id != 1 ? "order.sysUserId = :mid" : "1=1", { mid: user?.id })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "order.channel = :channelName" : "1=1", { channelName })
            .andWhere("(order.status = 1 OR order.status = 3 OR order.status = 4)")
            .getRawOne();
        let qbFailTotal = await this.entityManager.createQueryBuilder(top_entity_1.TopOrder, "order")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select(["SUM(order.amount) AS totalAmount", "COUNT(order.id) AS totalCount"])
            .where(user && user.id != 1 ? "order.sysUserId = :mid" : "1=1", { mid: user?.id })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "order.channel = :channelName" : "1=1", { channelName })
            .andWhere("(order.status = -1 OR order.status = 2 )")
            .getRawOne();
        let qbTotal = await this.entityManager.createQueryBuilder(top_entity_1.TopOrder, "order")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select(["COUNT(order.id) AS totalCount"])
            .where(user && user.id != 1 ? "order.sysUserId = :mid" : "1=1", { mid: user?.id })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "order.channel = :channelName" : "1=1", { channelName })
            .getRawOne();
        totalAmount = qbSuccessTotal.totalAmount;
        totalSuccessCount = qbSuccessTotal.totalCount;
        totalCount = qbTotal.totalCount;
        return {
            totalFailCount: qbFailTotal.totalCount ? qbFailTotal.totalCount : 0,
            totalFailAmount: qbFailTotal.totalAmount ? qbFailTotal.totalAmount : 0,
            totalAmount: totalAmount ? totalAmount : 0,
            totalSuccessCount: totalSuccessCount ? totalSuccessCount : 0,
            totalCount: totalCount ? totalCount : 0,
        };
    }
};
CommissionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sys_balance_entity_1.SysBalanceLog)),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(3, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        param_config_service_1.SysParamConfigService,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], CommissionService);
exports.CommissionService = CommissionService;
//# sourceMappingURL=commission.service.js.map