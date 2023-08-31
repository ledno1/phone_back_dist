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
exports.OrderTopService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const zh_service_1 = require("../../resource/zh/zh.service");
const link_service_1 = require("../../resource/link/link.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const top_entity_1 = require("../../../entities/order/top.entity");
const proxy_service_1 = require("../../usersys/proxy/proxy.service");
const sys_balance_entity_1 = require("../../../entities/admin/sys-balance.entity");
const lodash_1 = require("lodash");
const api_exception_1 = require("../../../common/exceptions/api.exception");
const top_service_1 = require("../../usersys/top/top.service");
const REQ = require("request-promise-native");
const proxyChargin_service_1 = require("../../resource/proxyCharging/proxyChargin.service");
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const bull_1 = require("@nestjs/bull");
const top_temp_entity_1 = require("../../../entities/order/top_temp.entity");
let OrderTopService = class OrderTopService {
    redisService;
    util;
    zhService;
    linkService;
    proxyUserService;
    topUserService;
    proxyCharging;
    paramConfigService;
    entityManager;
    orderRepository;
    orderQueue;
    defaultSystemOutTime;
    constructor(redisService, util, zhService, linkService, proxyUserService, topUserService, proxyCharging, paramConfigService, entityManager, orderRepository, orderQueue) {
        this.redisService = redisService;
        this.util = util;
        this.zhService = zhService;
        this.linkService = linkService;
        this.proxyUserService = proxyUserService;
        this.topUserService = topUserService;
        this.proxyCharging = proxyCharging;
        this.paramConfigService = paramConfigService;
        this.entityManager = entityManager;
        this.orderRepository = orderRepository;
        this.orderQueue = orderQueue;
        if (process.env.NODE_ENV == "development") {
            this.defaultSystemOutTime = 0;
        }
        else {
            this.defaultSystemOutTime = 600;
        }
    }
    async onModuleInit() {
        await this.orderRepository.update({
            createdAt: (0, typeorm_2.LessThan)(this.util.dayjs().subtract(10, "minute").toDate()),
            status: 2
        }, { status: -1 });
    }
    async notifyRequest(url, notify, yan) {
        let sign = this.util.ascesign(notify, yan);
        let form = JSON.stringify(notify);
        form = JSON.parse(form);
        form["sign"] = sign;
        console.log(form);
        try {
            let r = await REQ.post({ url: url, form: form, timeout: 1000 * 20 });
            console.log("强制回调结果");
            console.log(r);
            common_1.Logger.log("强制回调结果");
            common_1.Logger.log(r);
            if (r && r === "success") {
                return {
                    result: true,
                    msg: ""
                };
            }
            return {
                result: false,
                msg: r
            };
        }
        catch (error) {
            console.log("强制回调请求出错", error);
            return {
                result: false,
                msg: error.toString()
            };
        }
    }
    async page(params, user) {
        switch (user.roleLabel) {
            case "admin":
                return await this.pageByAdmin(params, user);
            case "proxy":
                return await this.pageByProxy(params, user);
            case "top":
                return await this.pageByTop(params, user);
            case "ma":
                return await this.pageByMa(params, user);
        }
    }
    async statistic(params) {
        let { date, mid, all } = params;
        params.limit = 1;
        params.page = 1;
        if (!date && !all) {
            params.createdAt = [this.util.dayjsFormat(this.util.dayjs().startOf("day").valueOf()), this.util.dayjsFormat(this.util.dayjs().endOf("day").valueOf())];
        }
        else if (!all) {
            let reg = /^\d{4}-\d{2}-\d{2}$/;
            if (!reg.test(date)) {
                return "日期格式不正确,例子:2020-01-01";
            }
            params.createdAt = [this.util.dayjsFormat(this.util.dayjs(date).startOf("day").valueOf()), this.util.dayjsFormat(this.util.dayjs(date).endOf("day").valueOf())];
        }
        let r = await this.statistics(params);
        let t = await this.statisticsTemp(params);
        let iosRate = await this.entityManager.transaction(async (entityManager) => {
            let iosTotalCount = await entityManager.query(`SELECT COUNT(*) as count FROM top_order WHERE created_at BETWEEN '${params.createdAt[0]}' AND '${params.createdAt[1]}' AND os='ios'`);
            let iosSuccessCount = await entityManager.query(`SELECT COUNT(*) as count FROM top_order WHERE created_at BETWEEN '${params.createdAt[0]}' AND '${params.createdAt[1]}' AND os='ios' AND status <> -1`);
            return (iosSuccessCount[0].count / iosTotalCount[0].count * 100).toFixed(2);
        });
        let androidRate = await this.entityManager.transaction(async (entityManager) => {
            let androidTotalCount = await entityManager.query(`SELECT COUNT(*) as count FROM top_order WHERE created_at BETWEEN '${params.createdAt[0]}' AND '${params.createdAt[1]}' AND os='android'`);
            let androidSuccessCount = await entityManager.query(`SELECT COUNT(*) as count FROM top_order WHERE created_at BETWEEN '${params.createdAt[0]}' AND '${params.createdAt[1]}' AND os='android' AND status <> -1`);
            return (androidSuccessCount[0].count / androidTotalCount[0].count * 100).toFixed(2);
        });
        return {
            "查询时间": this.util.dayjs().format("YYYY-MM-DD HH:mm:ss"),
            "日期": !date && !all ? "今天" : (all ? "全部" : date),
            "成功总额": (r.totalAmount / 100).toFixed(2),
            "成功笔数": r.totalSuccessCount,
            "安卓成功率": androidRate,
            "苹果成功率": iosRate,
            "总笔数": r.totalCount,
            "总额": (r.totalAmount / 100 + r.totalFailAmount / 100).toFixed(2),
            "无法录入笔数": t.tempTotalCount,
            "无法录入总额": (t.tempTotalAmount / 100).toFixed(2),
            "合计总笔数": Number(r.totalCount) + Number(t.tempTotalCount),
            "合计总额": ((Number(r.totalAmount) + Number(t.tempTotalAmount)) / 100).toFixed(2),
            "失败总额": (r.totalFailAmount / 100).toFixed(2),
            "失败笔数": r.totalFailCount,
            "成功率": (r.totalSuccessCount / r.totalCount * 100).toFixed(2) + "%"
        };
    }
    async pageByAdmin(params, user = undefined) {
        let { page, limit, mid, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, mOid } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.orderRepository.createQueryBuilder("order")
            .leftJoin("order.SysUser", "user")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select([
            "order.amount AS amount", "order.mOid AS mOid", "order.mid AS mid", "order.status AS status", "order.created_at AS createdAt", "order.oid AS oid",
            "order.lOid AS lOid", "order.callback AS callback"
        ])
            .addSelect([
            "channel.name AS channelName"
        ])
            .addSelect([
            "zh.accountNumber AS accountNumber"
        ])
            .where(mid ? "order.mid = :mid" : "1=1", { mid })
            .andWhere(mOid ? "order.mOid = :mOid" : "1=1", { mOid })
            .andWhere(oid ? "order.oid = :oid" : "1=1", { oid })
            .andWhere(lOid ? "order.lOid = :lOid" : "1=1", { lOid })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "channel.id = :channelName" : "1=1", { channelName })
            .andWhere(callback ? "order.callback = :callback" : "1=1", { callback })
            .andWhere(status ? "order.status = :status" : "1=1", { status })
            .orderBy("order.created_at", "DESC")
            .offset((page - 1) * limit)
            .limit(limit);
        let r = await this.statistics(params, user);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getRawMany();
        return {
            totalAmount: r.totalAmount,
            totalSuccessCount: r.totalSuccessCount,
            totalCount: r.totalCount,
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async pageByProxy(params, user) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.orderRepository.createQueryBuilder("order")
            .leftJoin("order.SysUser", "user")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select([
            "order.amount AS amount", "order.mOid AS mOid", "order.status AS status", "order.created_at AS createdAt", "order.oid AS oid",
            "order.lOid AS lOid", "order.callback AS callback"
        ])
            .addSelect([
            "channel.name AS channelName"
        ])
            .addSelect([
            "zh.accountNumber AS accountNumber"
        ])
            .where("user.uuid = :uuid", { uuid: user.uuid })
            .andWhere(oid ? "order.oid = :oid" : "1=1", { oid })
            .andWhere(lOid ? "order.lOid = :lOid" : "1=1", { lOid })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "channel.id = :channelName" : "1=1", { channelName })
            .andWhere(callback ? "order.callback = :callback" : "1=1", { callback: callback })
            .andWhere(status ? "order.status = :status" : "1=1", { status })
            .orderBy("order.created_at", "DESC")
            .offset((page - 1) * limit)
            .limit(limit);
        let r = await this.statistics(params, user);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getRawMany();
        return {
            totalAmount: r.totalAmount,
            totalSuccessCount: r.totalSuccessCount,
            totalCount: r.totalCount,
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async pageByTop(params, user) {
        let { page, limit, oid, lOid, mOid, amount, createdAt, channelName, status, callbackInfo, accountNumber } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.orderRepository.createQueryBuilder("order")
            .leftJoin("channel", "channel", "channel.id = order.parentChannel")
            .select([
            "order.amount AS amount", "order.mOid AS mOid", "order.mid AS mid", "order.status AS status", "order.created_at AS createdAt", "order.oid AS oid",
            "order.lOid AS lOid", "order.callback AS callback"
        ])
            .addSelect([
            "channel.name AS channelName"
        ])
            .where("order.mid = :mid", { mid: user.id })
            .andWhere(mOid ? "order.mOid = :mOid" : "1=1", { mOid })
            .andWhere(oid ? "order.oid = :oid" : "1=1", { oid })
            .andWhere(lOid ? "order.lOid = :lOid" : "1=1", { lOid })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "order.parentChannel = :channelName" : "1=1", { channelName })
            .andWhere(callbackInfo ? "order.callbackInfo = :callbackInfo" : "1=1", { callbackInfo: callbackInfo == "-1" ? null : callbackInfo })
            .andWhere(status ? "order.status = :status" : "1=1", { status })
            .orderBy("order.created_at", "DESC")
            .offset((page - 1) * limit)
            .limit(limit);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getRawMany();
        let r = await this.statistics(params, user);
        return {
            totalAmount: r.totalAmount,
            totalSuccessCount: r.totalSuccessCount,
            totalCount: r.totalCount,
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async pageByMa(params, user) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, mOid } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let qb = await this.orderRepository.createQueryBuilder("order")
            .leftJoin("order.SysUser", "user")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select([
            "order.amount AS amount", "order.mOid AS mOid", "order.status AS status", "order.created_at AS createdAt", "order.oid AS oid",
            "order.lOid AS lOid", "order.callback AS callback"
        ])
            .addSelect([
            "channel.name AS channelName"
        ])
            .addSelect([
            "zh.accountNumber AS accountNumber"
        ])
            .where("user.uuid = :uuid", { uuid: user.uuid })
            .andWhere(mOid ? "order.mOid = :mOid" : "1=1", { mOid })
            .andWhere(oid ? "order.oid = :oid" : "1=1", { oid })
            .andWhere(lOid ? "order.lOid = :lOid" : "1=1", { lOid })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(amount ? "order.amount = :amount" : "1=1", { amount: !(0, lodash_1.isNaN)(amount) ? amount : null })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "channel.id = :channelName" : "1=1", { channelName })
            .andWhere(callback ? "order.callback = :callback" : "1=1", { callback: callback })
            .andWhere(status ? "order.status = :status" : "1=1", { status })
            .orderBy("order.created_at", "DESC")
            .offset((page - 1) * limit)
            .limit(limit);
        let r = await this.statistics(params, user);
        const [_, total] = await qb.getManyAndCount();
        let list = await qb.getRawMany();
        return {
            totalAmount: r.totalAmount,
            totalSuccessCount: r.totalSuccessCount,
            totalCount: r.totalCount,
            list,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async statisticsTemp(params, user = undefined) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, mOid } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let qbTempTotal = await this.entityManager.createQueryBuilder(top_temp_entity_1.TopOrderTemp, "order")
            .leftJoin("order.zh", "zh")
            .leftJoin("channel", "channel", "channel.id = order.channel")
            .select(["SUM(order.amount) AS totalAmount", "COUNT(order.id) AS totalCount"])
            .where(user && user.id != 1 ? "order.sysUserId = :mid" : "1=1", { mid: user?.id })
            .andWhere(accountNumber ? "zh.accountNumber = :accountNumber" : "1=1", { accountNumber })
            .andWhere(createdAt ? "order.created_at BETWEEN :createdStart AND :createdEnd" : "1=1", {
            createdStart: createdAt ? createdAt[0] : this.util.dayjsFormat(new Date()),
            createdEnd: createdAt ? createdAt[1] : this.util.dayjsFormat(new Date())
        })
            .andWhere(channelName ? "order.channel = :channelName" : "1=1", { channelName })
            .andWhere("(order.status = -1 OR order.status = 2 )")
            .getRawOne();
        return {
            tempTotalAmount: qbTempTotal.totalAmount,
            tempTotalCount: qbTempTotal.totalCount
        };
    }
    async statistics(params, user = undefined) {
        let { page, limit, oid, lOid, accountNumber, amount, createdAt, channelName, callback, status, mOid } = params;
        amount ? amount = Number(amount) * 100 : 0;
        let totalAmount = null, totalSuccessCount = null, totalCount = null;
        let qbSuccessTotal = await this.orderRepository.createQueryBuilder("order")
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
        let qbFailTotal = await this.orderRepository.createQueryBuilder("order")
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
        let qbTotal = await this.orderRepository.createQueryBuilder("order")
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
            totalCount: totalCount ? totalCount : 0
        };
    }
    async callback(params, user) {
        let { oid } = params;
        let order = await this.orderRepository.createQueryBuilder("order")
            .leftJoin("order.SysUser", "user")
            .where(user.roleLabel == "admin" ? "1=1" : "user.uuid = :uuid", { uuid: user.uuid })
            .andWhere("order.oid = :oid", { oid })
            .getOne();
        if (order?.status == 3) {
            throw new api_exception_1.ApiException(60009);
        }
        await this.linkService.setLinkCallback(order.lOid);
        let oInfo = await this.getOrderInfoByMOid(order.mOid);
        let oAmt = oInfo.amount / 100;
        let tNotify = {
            merId: oInfo.mid.toString(),
            orderId: oInfo.mOid,
            sysOrderId: oInfo.oid,
            desc: "no",
            orderAmt: oAmt.toString(),
            status: "1",
            nonceStr: this.util.generateRandomValue(16),
            attch: "1"
        };
        console.log("执行回调" + oInfo.mNotifyUrl);
        let md5Key = await this.topUserService.getMd5Key(oInfo.mid);
        await this.setOrderCallbackStatus(order.oid, "强制回调");
        let res = await this.notifyRequest(oInfo.mNotifyUrl.toString().replace(' ', ''), tNotify, md5Key);
        if (res.result) {
            await this.proxyUserService.setOrderCommission(oInfo);
            let balance = await this.proxyUserService.updateBalance(oInfo.SysUser.uuid, oInfo.amount * order.lRate / 10000, "sub");
            let balanceLog = new sys_balance_entity_1.SysBalanceLog();
            balanceLog.amount = oInfo.amount * order.lRate / 10000;
            balanceLog.balance = balance;
            balanceLog.typeEnum = "sub";
            balanceLog.event = "orderCallback";
            balanceLog.actionUuid = user.uuid;
            balanceLog.orderUuid = order.oid;
            balanceLog.uuid = oInfo.SysUser.uuid;
            await this.entityManager.save(balanceLog);
        }
        else {
            await this.entityManager.update(top_entity_1.TopOrder, { oid: order.oid }, { status: -1, callback: 0 });
            return res;
        }
    }
    async orderOuTtime(job) {
        let { data } = job;
        let { zh, SysUser, oid, lOid, lRate, amount } = data;
        let order = await this.orderRepository.createQueryBuilder("order")
            .where("order.oid = :oid", { oid })
            .getOne();
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            return;
        }
        let ishave = await this.checkOrderApi(order.mOid, 2);
        if (ishave)
            return;
        await this.zhService.updateLockLimitByZuid(zh.zuid, job.data.amount);
        await this.linkService.reSetLinkStatus(lOid, 0);
        await this.setOrderStatus(oid, -1);
        let addAmount = amount * lRate / 10000;
        let nowBalance = await this.proxyUserService.updateBalance(SysUser.uuid, addAmount, "add");
        let log = new sys_balance_entity_1.SysBalanceLog();
        log.amount = addAmount;
        log.uuid = SysUser.uuid;
        log.typeEnum = "add";
        log.event = "topOrderRe";
        log.actionUuid = "1";
        log.orderUuid = oid;
        log.balance = nowBalance ? nowBalance : 0;
        await this.entityManager.save(log);
        await this.redisService.getRedis().srem(`topOrder`, oid);
    }
    async setOrderStatus(oid, status) {
        console.log(oid);
        try {
            await this.orderRepository.createQueryBuilder()
                .update()
                .set({ status: status })
                .where("oid = :oid", { oid: oid })
                .execute();
        }
        catch (e) {
            common_1.Logger.error("更新订单状态失败");
            common_1.Logger.error(e.stack);
        }
    }
    async setOrderCallbackStatus(oid, callbackInfo) {
        try {
            await this.orderRepository.createQueryBuilder()
                .update()
                .set({
                callbackInfo,
                status: () => {
                    return `case when status = 1 or status = 4 then 4 else 3 end`;
                },
                callback: 3
            })
                .where("oid = :oid", { oid: oid })
                .execute();
        }
        catch (e) {
            common_1.Logger.error("更新订单回调状态失败");
            common_1.Logger.error(e.stack);
        }
    }
    async setOrderNotifyStatus(oid, res) {
        console.log("回调结果");
        console.log(res);
        try {
            await this.orderRepository.createQueryBuilder()
                .update()
                .set({
                callbackInfo: res.msg,
                callback: res.result ? 1 : 2
            })
                .where("oid = :oid", { oid: oid })
                .execute();
        }
        catch (e) {
            common_1.Logger.error("更新 请求通知回调状态失败");
            common_1.Logger.error(e.stack);
        }
    }
    async getOrderStatusByMOid(mOid) {
        try {
            let qb = await this.orderRepository.createQueryBuilder("order")
                .where("order.mOid = :mOid", { mOid })
                .getOne();
            return qb;
        }
        catch (e) {
            console.error("查询指定订单状态出错", e);
        }
    }
    async getOrderInfoByMOid(mOid) {
        try {
            let qb = await this.orderRepository.createQueryBuilder("order")
                .leftJoinAndSelect("order.SysUser", "SysUser")
                .leftJoinAndSelect("order.zh", "zh")
                .select(["order.lOid", "order.amount", "order.oid", "order.mNotifyUrl", "order.mid", "order.mOid", "order.APIKey", "order.queryUrl", "order.pid",
                "zh.zuid", "zh.accountNumber", "zh.openid", "zh.openkey",
                "SysUser.uuid", "SysUser.username"
            ])
                .where("order.mOid = :mOid", { mOid })
                .getOne();
            return qb;
        }
        catch (e) {
            common_1.Logger.error("查询订单信息失败");
            return false;
        }
    }
    async checkOrder() {
        let orders = await this.redisService.getRedis().smembers("topOrder");
        if (orders.length == 0)
            return;
        for (let i = 0; i < orders.length; i++) {
            let orderInfo = await this.redisService.getRedis().get(`order:${orders[i]}`);
            if (!orderInfo) {
                await this.redisService.getRedis().srem(`topOrder`, orders[i]);
                continue;
            }
            orderInfo = JSON.parse(orderInfo);
            let ishave = await this.checkOrderApi(orderInfo.mOid, 2);
            console.log(`订单${orders[i]}是否到账:${ishave}`);
            if (ishave)
                await this.redisService.getRedis().srem(`topOrder`, orders[i]);
        }
    }
    async payCheck(mOid) {
        try {
            let qb = await this.orderRepository.createQueryBuilder("order")
                .where("order.mOid = :mOid", { mOid })
                .getOne();
            return qb;
        }
        catch (e) {
            console.error("查询指定订单状态出错", e);
            return null;
        }
    }
    async checkOrderApi(orderId, type = 1) {
        let order = await this.getOrderStatusByMOid(orderId);
        let isPay = 0;
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            isPay = 1;
        }
        else {
            if (order) {
                let oInfo = await this.getOrderInfoByMOid(orderId);
                if (!oInfo) {
                    if (type == 1)
                        throw new api_exception_1.ApiException(60006);
                    return false;
                }
                let have = await this.zhService.checkHaveLOid(oInfo.zh, oInfo.lOid);
                if (have) {
                    console.log("到账成功");
                    isPay = 1;
                    await this.setOrderStatus(oInfo.oid, 1);
                    await this.linkService.setLinkStatus(oInfo.lOid, 1);
                    await this.proxyUserService.setOrderCommission(oInfo);
                    let oAmt = oInfo.amount / 100;
                    let tNotify = {
                        merId: oInfo.mid.toString(),
                        orderId: oInfo.mOid,
                        sysOrderId: oInfo.oid,
                        desc: "no",
                        orderAmt: oAmt.toString(),
                        status: isPay.toString(),
                        nonceStr: this.util.generateRandomValue(16),
                        attch: "1"
                    };
                    console.log("执行回调" + oInfo.mNotifyUrl);
                    let md5Key = await this.topUserService.getMd5Key(oInfo.mid);
                    let res = await this.notifyRequest(oInfo.mNotifyUrl, tNotify, md5Key);
                    console.log("更新订单回调状态");
                    await this.setOrderNotifyStatus(oInfo.oid, res);
                }
            }
            else {
                throw new api_exception_1.ApiException(60006);
            }
        }
        if (type == 1) {
            let res = {
                merId: order.mid,
                status: isPay.toString(),
                orderId: order.mOid,
                sysOrderId: order.oid,
                orderAmt: order.amount,
                nonceStr: this.util.generateRandomValue(16)
            };
            let md5Key = await this.topUserService.getMd5Key(order.mid);
            let sign = this.util.ascesign(res, md5Key);
            res["sign"] = sign;
            return res;
        }
        else if (type == 2) {
            return Boolean(isPay);
        }
    }
    async checkOrderVXMDL() {
        let orders = await this.redisService.getRedis().smembers("WXTopOrder");
        if (orders.length == 0)
            return;
        for (let i = 0; i < orders.length; i++) {
            let orderInfo = await this.redisService.getRedis().get(`WXOrder:${orders[i]}`);
            if (!orderInfo) {
                await this.redisService.getRedis().srem(`WXTopOrder`, orders[i]);
                continue;
            }
            orderInfo = JSON.parse(orderInfo);
            try {
                let ishave = await this.checkOrderApiMDL(orderInfo.mOid, 2);
                console.log(`微信订单${orders[i]}是否到账:${ishave}`);
                if (ishave)
                    await this.redisService.getRedis().srem(`WXTopOrder`, orders[i]);
            }
            catch (e) {
                console.log(e);
            }
        }
    }
    async createOrderMDL(linkObj, body) {
        let { merId, orderAmt } = body;
        let amount = orderAmt;
        orderAmt = Number(orderAmt) * 100;
        let order = new top_entity_1.TopOrder();
        let time = await this.paramConfigService.findValueByKey("orderOutTime");
        console.log("超时时间", time);
        try {
            let parentChannel = body.parentChannel.toString().padStart(2, "0");
            let buAmount = amount.toString().split(".")[0].padStart(4, "0");
            let oid = "WX_" + this.util.generateUUID() + parentChannel + buAmount;
            common_1.Logger.log("系统订单号:" + oid);
            if ((0, lodash_1.isNaN)(Number(time)))
                throw new api_exception_1.ApiException(60010);
            order.SysUser = { id: 1 };
            order.amount = Number(amount) * 100;
            order.mid = Number(merId);
            order.oid = oid;
            order.mOid = body.orderId;
            order.mIp = body.ip;
            order.mNotifyUrl = body.notifyUrl;
            order.channel = body.subChannelId;
            order.parentChannel = body.parentChannel;
            order.lOid = linkObj.APIOrderId;
            order.lRate = 0;
            await this.entityManager.save(order);
            await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", time);
            await this.redisService.getRedis().set(`WXOrder:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", Number(time) + this.defaultSystemOutTime);
            await this.redisService.getRedis().sadd("WXTopOrder", oid);
        }
        catch (e) {
            common_1.Logger.error("麦当劳订单创建失败", e);
            throw new api_exception_1.ApiException(60005);
        }
        finally {
            await this.orderQueue.add("WXOrderOutTime", order, {
                delay: (Number(time) + this.defaultSystemOutTime) * 1000,
                removeOnComplete: true
            });
        }
        return Object.assign(linkObj, { oid: order.oid });
    }
    async checkOrderApiMDL(orderId, type = 1) {
        let order = await this.getOrderStatusByMOid(orderId);
        let isPay = 0;
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            isPay = 1;
        }
        else {
            if (order) {
                let oInfo = await this.getOrderInfoByMOid(orderId);
                if (!oInfo) {
                    if (type == 1)
                        throw new api_exception_1.ApiException(60006);
                    return false;
                }
                let t = Math.floor(new Date().getTime() / 1000);
                let sign = this.util.md5(t.toString() + "0123456789ABCDEF");
                let b = {
                    t,
                    sign,
                    order: order.lOid
                };
                let have = false;
                try {
                    let res = await this.util.requestPost("http://45.195.198.41/GetOrder", b);
                    if (res.data.orderStaus == 1) {
                        have = false;
                    }
                    else if (res.data.orderStaus == 3) {
                        have = true;
                    }
                }
                catch (e) {
                    console.error("麦当劳查询失败", e);
                }
                if (have) {
                    console.log("到账成功");
                    isPay = 1;
                    await this.setOrderStatus(oInfo.oid, 1);
                    let oAmt = oInfo.amount / 100;
                    let tNotify = {
                        merId: oInfo.mid.toString(),
                        orderId: oInfo.mOid,
                        sysOrderId: oInfo.oid,
                        desc: "no",
                        orderAmt: oAmt.toString(),
                        status: isPay.toString(),
                        nonceStr: this.util.generateRandomValue(16),
                        attch: "1"
                    };
                    console.log("执行回调" + oInfo.mNotifyUrl);
                    let md5Key = await this.topUserService.getMd5Key(oInfo.mid);
                    let res = await this.notifyRequest(oInfo.mNotifyUrl, tNotify, md5Key);
                    console.log("更新订单回调状态");
                    await this.setOrderNotifyStatus(oInfo.oid, res);
                }
            }
            else {
                throw new api_exception_1.ApiException(60006);
            }
        }
        if (type == 1) {
            let res = {
                merId: order.mid,
                status: isPay.toString(),
                orderId: order.mOid,
                sysOrderId: order.oid,
                orderAmt: order.amount,
                nonceStr: this.util.generateRandomValue(16)
            };
            let md5Key = await this.topUserService.getMd5Key(order.mid);
            let sign = this.util.ascesign(res, md5Key);
            res["sign"] = sign;
            return res;
        }
        else if (type == 2) {
            return Boolean(isPay);
        }
    }
    async WXOrderOuTTime(job) {
        let { data } = job;
        let { zh, SysUser, oid, lOid, lRate, amount } = data;
        console.log(`订单超时:${data.amount / 100}元`);
        let order = await this.orderRepository.createQueryBuilder("order")
            .where("order.oid = :oid", { oid })
            .getOne();
        console.log(order);
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            return;
        }
        let ishave = await this.checkOrderApiMDL(order.mOid, 2);
        if (ishave)
            return;
        await this.setOrderStatus(oid, -1);
        await this.redisService.getRedis().srem(`WXTopOrder`, oid);
    }
    async checkOrderPhone() {
        let orders = await this.redisService.getRedis().smembers("phoneTopOrder");
        console.log("检查手机订单是否到账", orders.length);
        if (orders.length == 0)
            return;
        for (let i = 0; i < orders.length; i++) {
            let orderInfo = await this.redisService.getRedis().get(`phoneOrder:${orders[i]}`);
            if (!orderInfo) {
                await this.redisService.getRedis().srem(`phoneTopOrder`, orders[i]);
                continue;
            }
            orderInfo = JSON.parse(orderInfo);
            let ishave = await this.checkOrderApiPhone(orderInfo.mOid, 2);
            if (ishave)
                await this.redisService.getRedis().srem(`phoneTopOrder`, orders[i]);
        }
    }
    async checkOrderApiPhone(orderId, type = 1) {
        let order = await this.getOrderStatusByMOid(orderId);
        if (!order && type == 1) {
            console.log("查单失败");
            throw new api_exception_1.ApiException(60006);
        }
        else if (!order && type == 2) {
            console.log("查单失败false");
            return false;
        }
        let isPay = 0;
        if (order?.status == 1 || order?.status == 4 || order?.status == 3) {
            isPay = 1;
        }
        else {
            if (order) {
                let oInfo = await this.getOrderInfoByMOid(orderId);
                if (!oInfo) {
                    if (type == 1)
                        throw new api_exception_1.ApiException(60006);
                    return false;
                }
                let have = false;
                if (oInfo.APIKey == "KaKa") {
                    have = await this.checkOrderApiKaKa(oInfo.queryUrl);
                }
                if (have) {
                    console.log("到账成功");
                    isPay = 1;
                    await this.setOrderStatus(oInfo.oid, 1);
                    await this.proxyCharging.setStatus(oInfo.pid, 1);
                    await this.proxyUserService.setOrderCommission(oInfo);
                    let oAmt = oInfo.amount / 100;
                    let tNotify = {
                        merId: oInfo.mid.toString(),
                        orderId: oInfo.mOid,
                        sysOrderId: oInfo.oid,
                        desc: "no",
                        orderAmt: oAmt.toString(),
                        status: isPay.toString(),
                        nonceStr: this.util.generateRandomValue(16),
                        attch: "1"
                    };
                    console.log("执行回调" + oInfo.mNotifyUrl);
                    let md5Key = await this.topUserService.getMd5Key(oInfo.mid);
                    let res = await this.notifyRequest(oInfo.mNotifyUrl, tNotify, md5Key);
                    console.log("更新订单回调状态");
                    await this.setOrderNotifyStatus(oInfo.oid, res);
                }
            }
            else if (!order && type == 1) {
                throw new api_exception_1.ApiException(60006);
            }
            else if (!order && type == 2) {
                return false;
            }
        }
        if (type == 1) {
            let res = {
                merId: order.mid,
                status: isPay.toString(),
                orderId: order.mOid,
                sysOrderId: order.oid,
                orderAmt: order.amount,
                nonceStr: this.util.generateRandomValue(16)
            };
            let md5Key = await this.topUserService.getMd5Key(order.mid);
            let sign = this.util.ascesign(res, md5Key);
            res["sign"] = sign;
            return res;
        }
        else if (type == 2) {
            return Boolean(isPay);
        }
    }
    async createOrderMY(linkObj, body, proxyCharging, oid) {
        let { merId, orderAmt } = body;
        let amount = orderAmt;
        orderAmt = Number(orderAmt) * 100;
        let order = new top_entity_1.TopOrder();
        let time = await this.paramConfigService.findValueByKey("orderOutTime");
        try {
            common_1.Logger.log("系统订单号:" + oid);
            if ((0, lodash_1.isNaN)(Number(time)))
                throw new api_exception_1.ApiException(60010);
            order.SysUser = proxyCharging.user;
            order.amount = Number(amount) * 100;
            order.mid = Number(merId);
            order.oid = oid;
            order.mOid = body.orderId;
            order.mIp = body.ip;
            order.mNotifyUrl = body.notifyUrl;
            order.channel = body.subChannelId;
            order.parentChannel = body.parentChannel;
            order.lOid = linkObj.APIOrderId;
            order.lRate = proxyCharging.proxyChargingInfo.lRate;
            order.pid = proxyCharging.proxyChargingInfo.id;
            await this.entityManager.save(order);
            await this.proxyCharging.updateOnOrderCreate(proxyCharging.proxyChargingInfo.id, oid, body.orderId);
            await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", time);
            await this.redisService.getRedis().set(`phoneOrder:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", Number(time) + this.defaultSystemOutTime);
            await this.redisService.getRedis().sadd("phoneTopOrder", oid);
        }
        catch (e) {
            common_1.Logger.error("话费订单创建失败", e);
            throw new api_exception_1.ApiException(60005);
        }
        finally {
            await this.orderQueue.add("phoneOrderOutTime", order, {
                delay: (Number(time) + this.defaultSystemOutTime) * 1000,
                removeOnComplete: true
            });
        }
        return Object.assign(linkObj, { oid: order.oid });
    }
    async checkOrderApiMY(orderId, type = 1) {
        let order = await this.getOrderStatusByMOid(orderId);
        let isPay = 0;
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            isPay = 1;
        }
        else {
            if (order) {
                let oInfo = await this.getOrderInfoByMOid(orderId);
                if (!oInfo) {
                    if (type == 1)
                        throw new api_exception_1.ApiException(60006);
                    return false;
                }
                let have = false;
                try {
                }
                catch (e) {
                    console.error("麦当劳查询失败", e);
                }
                if (have) {
                    console.log("到账成功");
                    isPay = 1;
                    await this.setOrderStatus(oInfo.oid, 1);
                    let oAmt = oInfo.amount / 100;
                    let tNotify = {
                        merId: oInfo.mid.toString(),
                        orderId: oInfo.mOid,
                        sysOrderId: oInfo.oid,
                        desc: "no",
                        orderAmt: oAmt.toString(),
                        status: isPay.toString(),
                        nonceStr: this.util.generateRandomValue(16),
                        attch: "1"
                    };
                    console.log("执行回调" + oInfo.mNotifyUrl);
                    let md5Key = await this.topUserService.getMd5Key(oInfo.mid);
                    let res = await this.notifyRequest(oInfo.mNotifyUrl, tNotify, md5Key);
                    console.log("更新订单回调状态");
                    await this.setOrderNotifyStatus(oInfo.oid, res);
                }
            }
            else {
                throw new api_exception_1.ApiException(60006);
            }
        }
        if (type == 1) {
            let res = {
                merId: order.mid,
                status: isPay.toString(),
                orderId: order.mOid,
                sysOrderId: order.oid,
                orderAmt: order.amount,
                nonceStr: this.util.generateRandomValue(16)
            };
            let md5Key = await this.topUserService.getMd5Key(order.mid);
            let sign = this.util.ascesign(res, md5Key);
            res["sign"] = sign;
            return res;
        }
        else if (type == 2) {
            return Boolean(isPay);
        }
    }
    async createOrderKaKa(linkObj, body, proxyCharging, oid) {
        let { merId, orderAmt } = body;
        let amount = orderAmt;
        orderAmt = Number(orderAmt) * 100;
        let order = new top_entity_1.TopOrder();
        let time = await this.paramConfigService.findValueByKey("orderOutTime");
        try {
            common_1.Logger.log("系统订单号:" + oid);
            if ((0, lodash_1.isNaN)(Number(time)))
                throw new api_exception_1.ApiException(60010);
            order.SysUser = proxyCharging.user;
            order.amount = Number(amount) * 100;
            order.mid = Number(merId);
            order.oid = oid;
            order.mOid = body.orderId;
            order.mIp = body.ip;
            order.mNotifyUrl = body.notifyUrl;
            order.channel = body.subChannelId;
            order.parentChannel = body.parentChannel;
            order.lOid = linkObj.APIOrderId;
            order.lRate = proxyCharging.proxyChargingInfo.lRate;
            order.pid = proxyCharging.proxyChargingInfo.id;
            order.APIKey = "KaKa";
            order.queryUrl = linkObj.queryUrl ? linkObj.queryUrl : null;
            await this.entityManager.save(order);
            await this.proxyCharging.updateOnOrderCreate(proxyCharging.proxyChargingInfo.id, oid, body.orderId);
            await this.redisService.getRedis().set(`orderClient:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", time);
            await this.redisService.getRedis().set(`phoneOrder:${oid}`, JSON.stringify(Object.assign(order, { url: linkObj.link })), "EX", Number(time) + this.defaultSystemOutTime);
            await this.redisService.getRedis().sadd("phoneTopOrder", oid);
        }
        catch (e) {
            common_1.Logger.error("话费订单创建失败", e);
            throw new api_exception_1.ApiException(60005);
        }
        finally {
            await this.orderQueue.add("phoneOrderOutTime", order, {
                delay: (Number(time) + this.defaultSystemOutTime) * 1000,
                removeOnComplete: true
            });
        }
        return Object.assign(linkObj, { oid: order.oid });
    }
    async checkOrderApiKaKa(url) {
        let result = false;
        try {
            let res = await this.util.requestGet(url);
            if (res.indexOf("尚未完成") != -1) {
                result = true;
            }
            else {
                result = false;
            }
        }
        catch (e) {
            console.error("KaKa查询订单失败", e);
            console.error(url);
            return result;
        }
    }
    async phoneOrderOuTTime(job) {
        let { data } = job;
        let { zh, SysUser, oid, lOid, mOid, lRate, amount, pid } = data;
        console.log(`话单订单超时:${data.amount / 100}元`);
        console.log(data.oid);
        let order = await this.orderRepository.createQueryBuilder("order")
            .where("order.oid = :oid", { oid })
            .getOne();
        if (order?.status == 1 || order?.status == 3 || order?.status == 4) {
            return;
        }
        else {
            if (order) {
                let ishave = await this.checkOrderApiPhone(order.mOid, 2);
                console.log("是否到账", ishave);
                if (ishave)
                    return;
                console.log("更新话单状态");
                await this.proxyCharging.resetOnOutTime(pid);
                console.log("更新订单状态");
                await this.setOrderStatus(oid, -1);
            }
            else {
                console.log("更新话单状态");
                await this.proxyCharging.resetOnOutTime(pid);
            }
            let addAmount = amount * lRate / 10000;
            console.log(`实际增加${addAmount}.费率${lRate},金额${amount}`);
            let nowBalance = await this.proxyUserService.updateBalance(SysUser.uuid, addAmount, "add");
            let log = new sys_balance_entity_1.SysBalanceLog();
            log.amount = addAmount;
            log.uuid = SysUser.uuid;
            log.typeEnum = "add";
            log.event = "topOrderRe";
            log.actionUuid = "1";
            log.orderUuid = oid;
            log.balance = nowBalance ? nowBalance : 0;
            await this.entityManager.save(log);
            await this.redisService.getRedis().srem(`phoneTopOrder`, oid);
        }
    }
};
OrderTopService = __decorate([
    (0, common_1.Injectable)(),
    __param(8, (0, typeorm_1.InjectEntityManager)()),
    __param(9, (0, typeorm_1.InjectRepository)(top_entity_1.TopOrder)),
    __param(10, (0, bull_1.InjectQueue)("order")),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        util_service_1.UtilService,
        zh_service_1.ZhService,
        link_service_1.LinkService,
        proxy_service_1.ProxyService,
        top_service_1.TopService,
        proxyChargin_service_1.ProxyChargingService,
        param_config_service_1.SysParamConfigService,
        typeorm_2.EntityManager,
        typeorm_2.Repository, Object])
], OrderTopService);
exports.OrderTopService = OrderTopService;
//# sourceMappingURL=orderTop.service.js.map