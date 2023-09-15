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
exports.PhoneInfo = exports.ProxyChargingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const channel_entity_1 = require("../../../entities/resource/channel.entity");
const user_service_1 = require("../../admin/system/user/user.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const proxyChargin_entity_1 = require("../../../entities/resource/proxyChargin.entity");
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const channel_service_1 = require("../channel/channel.service");
const param_config_dto_1 = require("../../admin/system/param-config/param-config.dto");
const checklog_entity_1 = require("../../../entities/resource/checklog.entity");
const code_service_1 = require("../../code/code/code.service");
const backphone_entity_1 = require("../../../entities/resource/backphone.entity");
const phoneQuery = require('query-mobile-phone-area');
let ProxyChargingService = class ProxyChargingService {
    userService;
    channelRepository;
    entityManager;
    proxyChargingRepository;
    redisService;
    paramsConfig;
    channelService;
    codeService;
    util;
    DIANXINCHANNEL;
    LIANTONGCHANNEL;
    YIDONGCHANNEL;
    constructor(userService, channelRepository, entityManager, proxyChargingRepository, redisService, paramsConfig, channelService, codeService, util) {
        this.userService = userService;
        this.channelRepository = channelRepository;
        this.entityManager = entityManager;
        this.proxyChargingRepository = proxyChargingRepository;
        this.redisService = redisService;
        this.paramsConfig = paramsConfig;
        this.channelService = channelService;
        this.codeService = codeService;
        this.util = util;
    }
    async onModuleInit() {
        this.LIANTONGCHANNEL = await this.channelService.getChannelIdByName("联通");
        this.YIDONGCHANNEL = await this.channelService.getChannelIdByName("移动");
        this.DIANXINCHANNEL = await this.channelService.getChannelIdByName("电信");
        let dIs = await this.paramsConfig.findValueByKey('DIANXIN');
        if (!dIs) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "电信入单开关";
            t.key = "DIANXIN";
            t.value = '1';
            t.remark = "电信入单开关,话费充值运营商开关";
            await this.paramsConfig.add(t);
        }
        let lIs = await this.paramsConfig.findValueByKey('LIANTONG');
        if (!lIs) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "联通入单开关";
            t.key = "LIANTONG";
            t.value = '1';
            t.remark = "联通入单开关,话费充值运营商开关";
            await this.paramsConfig.add(t);
        }
        let yIs = await this.paramsConfig.findValueByKey('YIDONG');
        if (!yIs) {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "移动入单开关";
            t.key = "YIDONG";
            t.value = '1';
            t.remark = "移动入单开关,话费充值运营商开关";
            await this.paramsConfig.add(t);
        }
        let yIsList = await this.paramsConfig.findValueByKey('YIDONG_LIST');
        if (!yIsList && yIsList != '') {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "移动禁止入单省份";
            t.key = "YIDONG_LIST";
            t.value = '';
            t.remark = "移动禁止入单省份";
            await this.paramsConfig.add(t);
        }
        let lIsList = await this.paramsConfig.findValueByKey('LIANTONG_LIST');
        if (!lIsList && lIsList != '') {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "联通禁止入单省份";
            t.key = "LIANTONG_LIST";
            t.value = '';
            t.remark = "联通禁止入单省份";
            await this.paramsConfig.add(t);
        }
        let dIsList = await this.paramsConfig.findValueByKey('DIANXIN_LIST');
        if (!dIsList && dIsList != '') {
            let t = new param_config_dto_1.CreateParamConfigDto();
            t.name = "电信禁止入单省份";
            t.key = "DIANXIN_LIST";
            t.value = '';
            t.remark = "电信禁止入单省份";
            await this.paramsConfig.add(t);
        }
    }
    async page(params, user) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, action } = params;
        if (action == "use") {
            let ls = await this.paramsConfig.findValueByKey("proxyChargingType");
            console.log(ls);
            if (ls) {
                console.log(ls.split(",").map((n) => ({ label: n, value: n })));
                return ls.split(",").map((n) => ({ label: n, value: n }));
            }
            else {
                throw new api_exception_1.ApiException(70001);
            }
        }
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.proxyChargingRepository.createQueryBuilder("proxyCharging")
            .leftJoin("proxyCharging.SysUser", "user")
            .leftJoin("channel", "channel", "channel.id = proxyCharging.channel")
            .select([
            "proxyCharging.id AS id", "proxyCharging.target AS target", "proxyCharging.pid AS pid", "proxyCharging.mOid AS mOid", "proxyCharging.oid AS oid", "proxyCharging.amount AS amount",
            "proxyCharging.status AS status", "proxyCharging.callback AS callback", "proxyCharging.created_at AS createdAt", "proxyCharging.outTime AS outTime", "proxyCharging.pUid AS pUid",
            "proxyCharging.operator AS operator", "proxyCharging.weight AS weight", "proxyCharging.locking AS locking", "proxyCharging.isClose AS isClose", "proxyCharging.errInfo AS errInfo",
            "proxyCharging.count AS count"
        ])
            .addSelect("user.username AS pidName")
            .addSelect([
            "channel.name AS channelName"
        ])
            .where(user.roleLabel == "admin" ? "1=1" : "proxyCharging.sysUserId = :id", { id: user.id })
            .andWhere(oid ? "proxyCharging.oid = :oid" : "1=1", { oid })
            .andWhere(amount ? "proxyCharging.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "proxyCharging.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "channel.id = :channelName" : "1=1", { channelName })
            .andWhere(callback ? "proxyCharging.callback = :callback" : "1=1", { callback: callback })
            .andWhere(status ? "proxyCharging.status = :status" : "1=1", { status })
            .orderBy("proxyCharging.created_at", "DESC")
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
    async add(params, user) {
        let { phone, amount, channel, operator } = params;
        let phoneInfo;
        phoneInfo = phoneQuery(phone);
        let operator2 = await this.operatorType(phoneInfo.type);
        let u = await this.userService.findUserIdByNameOrId(user.id.toString());
        let rate = await this.channelService.getRateByChannelId(user.id, Number(channel), u.uuid);
        let proxyCharging = new proxyChargin_entity_1.ProxyCharging();
        proxyCharging.pid = user.id;
        proxyCharging.channel = Number(channel);
        proxyCharging.target = phone;
        proxyCharging.amount = Number(amount) * 100;
        proxyCharging.mOid = `test` + this.util.generateUUID();
        proxyCharging.status = 0;
        proxyCharging.notifyUrl = 'http://www.baidu.com';
        proxyCharging.pUid = this.util.generateUUID();
        proxyCharging.weight = (0, lodash_1.isNaN)(Number(operator)) ? 0 : Number(operator);
        proxyCharging.operator = operator2;
        proxyCharging.parentChannel = 3;
        proxyCharging.province = phoneInfo.province;
        proxyCharging.city = phoneInfo.city;
        proxyCharging.lRate = rate;
        proxyCharging.SysUser = u;
        proxyCharging.outTime = (0, lodash_1.isNaN)(Number(operator)) ? this.util.dayjs().add(3, "day").toDate() : Number(operator) == 100 ? this.util.dayjs().add(10, "minute").toDate() : this.util.dayjs().add(3, "day").toDate();
        await this.proxyChargingRepository.save(proxyCharging);
        return "ok";
    }
    async edit(params, user) {
        let { action, ids, pUid } = params;
        if (pUid) {
            let obj = { pUid, pid: user.id };
            user.roleLabel == "admin" ? delete obj.pid : null;
            let proxyChargingInfo = await this.proxyChargingRepository.findOne({ where: obj });
            if (!proxyChargingInfo)
                return;
            switch (action) {
                case "urgent":
                    proxyChargingInfo.weight = proxyChargingInfo.weight == 100 ? 0 : 100;
                    break;
                case "close":
                    proxyChargingInfo.isClose = true;
                    break;
                case "lock":
                    proxyChargingInfo.locking = !proxyChargingInfo.locking;
                    break;
                case "success":
                    proxyChargingInfo.status = 1;
                    break;
                case "delete":
                    if (user.roleLabel == "admin") {
                        await this.proxyChargingRepository.delete(obj);
                    }
                    return "ok";
                case "checkLog":
                    let l = await this.entityManager.createQueryBuilder(checklog_entity_1.CheckLog, "checkLog")
                        .select()
                        .where(`checkLog.phone = :phone`, { phone: proxyChargingInfo.target })
                        .orderBy("checkLog.createdAt", "DESC")
                        .limit(4)
                        .getMany();
                    return l.sort((n1, n2) => new Date(n1.createdAt).getTime() - new Date(n2.createdAt).getTime());
                    break;
                case "nowBalance":
                    let isBackPhone = await this.entityManager.findOne(backphone_entity_1.BackPhone, {
                        where: {
                            phone: proxyChargingInfo.target
                        }
                    });
                    if (isBackPhone) {
                        throw new api_exception_1.ApiException(40008);
                    }
                    let l2 = await this.entityManager.createQueryBuilder(checklog_entity_1.CheckLog, "checkLog")
                        .select()
                        .where(`checkLog.phone = :phone`, { phone: proxyChargingInfo.target })
                        .orderBy("checkLog.createdAt", "DESC")
                        .limit(4)
                        .getMany();
                    try {
                        let res = await this.codeService.checkPhoneBalanceByProductOnly(proxyChargingInfo, 4);
                        console.log(res);
                        if (res.is) {
                            let t = new checklog_entity_1.CheckLog();
                            t.createdAt = new Date();
                            t.phone = proxyChargingInfo.target;
                            t.balance = res.balance;
                            await this.entityManager.save(t);
                            l2.push(t);
                            return l2.sort((n1, n2) => new Date(n1.createdAt).getTime() - new Date(n2.createdAt).getTime());
                        }
                        else {
                            return "查询失败";
                        }
                    }
                    catch (e) {
                        return "查询失败";
                    }
                    break;
            }
            await this.proxyChargingRepository.save(proxyChargingInfo);
        }
        if (ids) {
            let obj = { pUid: (0, typeorm_2.In)(ids), pid: user.id };
            user.roleLabel == "admin" ? delete obj.pid : null;
            let proxyChargingInfo = await this.proxyChargingRepository.find({ where: obj });
            switch (action) {
                case "urgent":
                    proxyChargingInfo.forEach((n) => {
                        n.weight = n.weight == 100 ? 0 : 100;
                    });
                    break;
                case "close":
                    proxyChargingInfo.forEach((n) => {
                        n.isClose = true;
                    });
                    break;
                case "lock":
                    proxyChargingInfo.forEach((n) => {
                        n.locking = !n.locking;
                    });
                    break;
                case "success":
                    proxyChargingInfo.forEach((n) => {
                        n.status = 1;
                    });
                    break;
                case "delete":
                    if (user.roleLabel == "admin") {
                        await this.proxyChargingRepository.delete({ id: (0, typeorm_2.In)(ids) });
                    }
                    return "ok";
            }
            await this.proxyChargingRepository.save(proxyChargingInfo);
        }
        return "ok";
    }
    async setStatus(id, state) {
        try {
            await this.proxyChargingRepository.createQueryBuilder("proxyCharging")
                .update()
                .set({ status: state })
                .where("id = :id", { id })
                .execute();
        }
        catch (e) {
        }
    }
    async directBack(params) {
        try {
            let { merId, orderId, channel } = params;
            let qb = await this.entityManager.transaction(async (entityManager) => {
                let proxyCharging = await entityManager.findOne(proxyChargin_entity_1.ProxyCharging, {
                    where: {
                        mOid: orderId,
                        pid: Number(merId),
                        status: 0,
                        channel: Number(channel)
                    }
                });
                if (proxyCharging) {
                    proxyCharging.status = 3;
                    await entityManager.save(proxyCharging);
                    return 1;
                }
                else {
                    let pc = await entityManager.findOne(proxyChargin_entity_1.ProxyCharging, {
                        where: {
                            mOid: orderId,
                            pid: Number(merId),
                            status: 3,
                            channel: Number(channel)
                        }
                    });
                    if (pc.status == 3) {
                        return 3;
                    }
                }
                return 0;
            });
            if (qb == 1) {
                return {
                    code: 70000,
                    message: "退单成功"
                };
            }
            else if (qb == 3) {
                return {
                    code: 61201,
                    message: "该订单已经退单成功"
                };
            }
            return {
                code: 61400,
                message: "退单失败,不存在该订单或该订单正处于充值中,无法退单"
            };
        }
        catch (e) {
            console.error(e);
            return {
                code: 60010,
                message: "系统配置错误,请联系管理员"
            };
        }
    }
    async directPush(params) {
        let { merId, orderId, channel, orderAmt, rechargeNumber, notifyUrl, weight } = params;
        let phoneInfo;
        phoneInfo = phoneQuery(rechargeNumber);
        let operator = await this.operatorType(phoneInfo.type);
        let r = await this.provinceType(operator, phoneInfo.province);
        if (!r) {
            return {
                code: 70003,
                message: `不允许${phoneInfo.type}的${phoneInfo.province}省份的推单号码`
            };
        }
        let w = Number(weight);
        if (w != 0 && w != 100) {
            throw new api_exception_1.ApiException(70004);
        }
        try {
            let u = await this.userService.findUserIdByNameOrId(merId);
            let rate = await this.channelService.getRateByChannelId(Number(merId), Number(channel), u.uuid);
            let proxyCharging = new proxyChargin_entity_1.ProxyCharging();
            proxyCharging.pid = Number(merId);
            proxyCharging.channel = Number(channel);
            proxyCharging.target = rechargeNumber;
            proxyCharging.amount = Number(orderAmt) * 100;
            proxyCharging.mOid = orderId;
            proxyCharging.status = 0;
            proxyCharging.notifyUrl = notifyUrl;
            proxyCharging.pUid = this.util.generateUUID();
            proxyCharging.weight = w;
            proxyCharging.operator = operator;
            proxyCharging.parentChannel = 3;
            proxyCharging.province = phoneInfo.province;
            proxyCharging.city = phoneInfo.city;
            proxyCharging.lRate = rate;
            proxyCharging.SysUser = u;
            proxyCharging.outTime = w == 0 ? this.util.dayjs().add(3, "day").toDate() : this.util.dayjs().add(10, "minute").toDate();
            await this.proxyChargingRepository.save(proxyCharging);
            return {
                code: 70000,
                message: "success"
            };
        }
        catch (e) {
            if (e.code == 'ER_DUP_ENTRY') {
                throw new api_exception_1.ApiException(60019);
            }
            throw new api_exception_1.ApiException(60010);
        }
    }
    async operatorType(type) {
        if (type.includes("电信")) {
            let is = await this.paramsConfig.findValueByKey("DIANXIN");
            if (is == '1') {
                return "DIANXIN";
            }
        }
        else if (type.includes("移动")) {
            let is = await this.paramsConfig.findValueByKey("YIDONG");
            if (is == '1') {
                return "YIDONG";
            }
        }
        else if (type.includes("联通")) {
            let is = await this.paramsConfig.findValueByKey("LIANTONG");
            if (is == '1') {
                return "LIANTONG";
            }
        }
        throw new api_exception_1.ApiException(70002);
    }
    async provinceType(type, province) {
        let l = await this.paramsConfig.findValueByKey(type + '_LIST');
        if (l.includes(province)) {
            return false;
        }
        return true;
    }
};
ProxyChargingService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(channel_entity_1.Channel)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __param(3, (0, typeorm_1.InjectRepository)(proxyChargin_entity_1.ProxyCharging)),
    __metadata("design:paramtypes", [user_service_1.SysUserService,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        typeorm_2.Repository,
        redis_service_1.RedisService,
        param_config_service_1.SysParamConfigService,
        channel_service_1.ChannelService,
        code_service_1.CodeService,
        util_service_1.UtilService])
], ProxyChargingService);
exports.ProxyChargingService = ProxyChargingService;
class PhoneInfo {
    province;
    city;
    type;
}
exports.PhoneInfo = PhoneInfo;
//# sourceMappingURL=proxyChargin.service.js.map