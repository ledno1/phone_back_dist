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
exports.PayAccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../shared/services/redis.service");
const util_service_1 = require("../../../shared/services/util.service");
const sys_user_entity_1 = __importDefault(require("../../../entities/admin/sys-user.entity"));
const api_exception_1 = require("../../../common/exceptions/api.exception");
const top_entity_1 = require("../../../entities/order/top.entity");
const REQ = require("request-promise-native");
const fs = require("fs");
const alipay_sdk_1 = __importDefault(require("alipay-sdk"));
const payaccount_entity_1 = require("../../../entities/resource/payaccount.entity");
const dayjs_1 = __importDefault(require("dayjs"));
const param_config_service_1 = require("../../admin/system/param-config/param-config.service");
const InerFace_1 = require("../../api/subHandler/InerFace");
const process_1 = __importDefault(require("process"));
var CheckStatus;
(function (CheckStatus) {
    CheckStatus["success"] = "success";
    CheckStatus["deny"] = "deny";
    CheckStatus["failed"] = "failed";
    CheckStatus["error"] = "error";
})(CheckStatus || (CheckStatus = {}));
let PayAccountService = class PayAccountService {
    payAccountRepository;
    userRepository;
    entityManager;
    paramConfigService;
    redisService;
    util;
    revisionInfo = null;
    task_page_map = {};
    mainFrameUrl = `https://auth.alipay.com/login/homeB.htm?redirectType=https%3A%2F%2Fb.alipay.com%2Fpage%2Fhome`;
    pupHost;
    constructor(payAccountRepository, userRepository, entityManager, paramConfigService, redisService, util) {
        this.payAccountRepository = payAccountRepository;
        this.userRepository = userRepository;
        this.entityManager = entityManager;
        this.paramConfigService = paramConfigService;
        this.redisService = redisService;
        this.util = util;
    }
    async onModuleInit() {
        let port = process_1.default.env.PUP_PORT;
        let host = process_1.default.env.PUP_HOST;
        if (!port) {
            throw new Error("未设置pup端口 请在.env.prod文件中设置PUP_PORT");
        }
        if (!host) {
            throw new Error("未设置pup主机 例：http://xxx.xxx.xxx.xxx 请在.env.prod文件中设置PUP_HOST");
        }
        this.pupHost = host + ":" + port;
    }
    async page(params, user) {
        let { page, limit, zuid, accountNumber, open, username, action } = params;
        let qb = null;
        if (user.roleLabel == "ma" || user.roleLabel == "admin") {
            return await this.getByPage(params, user.id);
        }
        return 1;
    }
    async getByPage(params, userid) {
        let { page, limit, zuid, name, open, username, action, groupId } = params;
        let fsq = userid == 1 ? "1=1 " : `pay_account.sysUserId = ${userid} `;
        let nameSql = name ? ` AND pay_account.name like '%${name}%'` : "";
        let openSql = open ? ` AND pay_account.open = ${open == "true" ? 1 : 0}` : "";
        let tqb = await this.entityManager.query(`
SELECT pay_account.uid,pay_account.id,pay_account.name,pay_account.rechargeLimit,pay_account.lockLimit,pay_account.totalRecharge,pay_account.open,pay_account.accountType,pay_account.payMode,pay_account.weight,pay_account.status,
sys_user.username,COUNT(top_order.id) AS totalCount,success_order.order_total_count AS successTotalCount,amount_order_today.totalAmount AS todaySale,amount_order_yesterday.totalAmount AS yesterdaySale
FROM pay_account
LEFT JOIN top_order ON pay_account.id = top_order.pid 
LEFT JOIN (
SELECT COUNT(*) AS order_total_count,pid FROM top_order WHERE status = 1 or status = 4 OR status = 3 group by pid
)success_order ON pay_account.id = success_order.pid
LEFT JOIN (
SELECT pid,sum(amount) AS totalAmount FROM top_order WHERE (top_order.status = 1 OR top_order.status = 3 OR top_order.status = 4) AND TO_DAYS(created_at) = TO_DAYS(NOW()) group by pid
)amount_order_today ON pay_account.id = amount_order_today.pid
LEFT JOIN (
SELECT pid,sum(amount) AS totalAmount FROM top_order WHERE (top_order.status = 1 OR top_order.status = 3 OR top_order.status = 4) AND TO_DAYS(NOW()) - TO_DAYS(created_at) = 1 group by pid
)amount_order_yesterday ON pay_account.id = amount_order_yesterday.pid
LEFT JOIN sys_user ON pay_account.sysUserId = sys_user.id

where ${fsq}
${nameSql}
${openSql}
group by pay_account.uid
limit ${(page - 1) * limit},${limit}
`);
        let total = await this.entityManager.query(`SELECT COUNT(*) AS total FROM pay_account where ${fsq} ${nameSql} ${openSql}`);
        return {
            list: tqb,
            pagination: {
                total,
                page: Number(page),
                size: Number(limit)
            }
        };
    }
    async del(params, user) {
        let { ids, action } = params;
        if (action == "some") {
        }
        else if (action == "all") {
        }
    }
    async add(params, user) {
        let checkMode = await this.paramConfigService.findValueByKey(InerFace_1.PayMode.aLiPayCheckMode);
        let { action } = params;
        if (action == "getQrCode") {
            try {
                let res = await this.util.requestGet(`${this.pupHost}/api/create`);
                let { code, image, id, task } = res;
                if (code == 1) {
                    return { image, id };
                }
            }
            catch (e) {
                console.error("add二维码", e);
            }
        }
        else if (action == "close") {
            let { id } = params;
            let have = await this.payAccountRepository.findOne({ where: { _id: id } });
            if (id && !have) {
                let res = await this.util.requestGet(`${this.pupHost}/api/close/${id}`);
                let { code, tasks } = res;
                if (code == 1) {
                    return 1;
                }
            }
            return 0;
        }
        else if (action == "getQrCodeStatus") {
            let { id } = params;
            let res = await this.util.requestGet(`${this.pupHost}/api/status/${id}`);
            let { code, cookies, uid } = res;
            if (code == 1) {
                return {
                    cookies: Buffer.from(cookies).toString("base64"),
                    uid
                };
            }
            else if (code == 0) {
                return {
                    cookies: ""
                };
            }
        }
        else if (action == "add") {
            let u = await this.userRepository.findOne({ where: { id: user.id } });
            let { name, mark, cookies, uid, id, act, payMode, accountType } = params.data;
            let p = await this.payAccountRepository.findOne({ where: { uid } });
            if (!checkMode || checkMode == "0") {
                if (act == "update") {
                    try {
                        if (p) {
                            p?._id ? await this.util.requestGet(`${this.pupHost}/api/close/${p._id}`) : null;
                            p.name = name;
                            p.mark = mark;
                            p.cookies = cookies;
                            p.uid = uid;
                            p.SysUser = u;
                            p.status = true;
                            p.open = false;
                            p._id = id;
                            p.payMode = payMode;
                            p.accountType = accountType;
                            await this.payAccountRepository.save(p);
                        }
                        else {
                            p = new payaccount_entity_1.PayAccount();
                            p.name = name;
                            p.mark = mark;
                            p.cookies = cookies;
                            p.uid = uid;
                            p.SysUser = u;
                            p.open = false;
                            p._id = id;
                            p.payMode = payMode;
                            p.accountType = accountType;
                            await this.payAccountRepository.save(p);
                        }
                    }
                    catch (e) {
                        console.log(e);
                    }
                }
                else {
                    if (p) {
                        await this.util.requestGet(`${this.pupHost}/api/close/${p._id}`);
                        p.name = name;
                        p.mark = mark;
                        p.cookies = cookies;
                        p.uid = uid;
                        p.SysUser = u;
                        p._id = id;
                        p.payMode = payMode;
                        p.accountType = accountType;
                        p.open = false;
                        await this.payAccountRepository.save(p);
                    }
                    else {
                        p = new payaccount_entity_1.PayAccount();
                        p.name = name;
                        p.mark = mark;
                        p.cookies = cookies;
                        p.uid = uid;
                        p.SysUser = u;
                        p.open = false;
                        p._id = id;
                        p.payMode = payMode;
                        p.accountType = accountType;
                        await this.payAccountRepository.save(p);
                    }
                }
            }
            else {
                if (p) {
                    await this.util.requestGet(`${this.pupHost}/api/close/${p._id}`);
                    p.name = name;
                    p.mark = mark;
                    p.cookies = cookies;
                    p.uid = uid;
                    p.SysUser = u;
                    p._id = id;
                    p.payMode = payMode;
                    p.accountType = accountType;
                    p.open = false;
                    await this.payAccountRepository.save(p);
                }
                else {
                    p = new payaccount_entity_1.PayAccount();
                    p.name = name;
                    p.mark = mark;
                    p.cookies = cookies;
                    p.uid = uid;
                    p.SysUser = u;
                    p.open = false;
                    p._id = id;
                    p.payMode = payMode;
                    p.accountType = accountType;
                    await this.payAccountRepository.save(p);
                }
                await this.util.requestGet(`${this.pupHost}/api/close/${id}`);
            }
            return 1;
        }
    }
    async addAppid(params, user) {
        let { appId, privateKey, name, mark } = params;
        let u = await this.userRepository.findOne({ where: { id: user.id } });
        if (!u) {
            return;
        }
        try {
            let config = {
                appId,
                privateKey
            };
            if (process_1.default.env.NODE_ENV == "development") {
                config["gateway"] = "https://openapi-sandbox.alipaydev.com/gateway.do";
            }
            let alipaySdk = new alipay_sdk_1.default(config);
            const bizContent = {
                out_trade_no: "ALIPfdf1211sdfsd12gfddsgs3",
                product_code: "FAST_INSTANT_TRADE_PAY",
                subject: "100元充值",
                body: "234",
                total_amount: "100.00"
            };
            const result = alipaySdk.pageExec("alipay.trade.wap.pay", {
                method: "POST",
                bizContent,
                returnUrl: "https://www.taobao.com"
            });
        }
        catch (e) {
            console.log(e);
            console.error("支付宝账户接入失败");
            throw new api_exception_1.ApiException(40006);
        }
        console.log("录入数据库");
        return 1;
    }
    async edit(params, user) {
        let { action, ids, id, open, rechargeLimit } = params;
        let checkMode = await this.paramConfigService.findValueByKey("aLiPayCheckMode");
        try {
            if (action == "all") {
                let u = await this.userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.pay_account", "pay_account")
                    .where("user.id = :id", { id: user.id })
                    .getOne();
                await this.payAccountRepository.remove(u.pay_account);
                for (let i = 0; i < u.pay_account.length; i++) {
                    let res = await this.util.requestGet(`${this.pupHost}/api/close/${u.pay_account[i]._id}`);
                    if (res.code == 0) {
                        common_1.Logger.error("关闭浏览器实例失败" + u.pay_account[i].uid);
                    }
                }
                return;
            }
            if (ids) {
                let qb = await this.payAccountRepository.createQueryBuilder("pay_account")
                    .leftJoin("pay_account.SysUser", "user")
                    .where("pay_account.id in (:...ids)", { ids })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :userid", { userid: user.id })
                    .getMany();
                if (action == "open") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = true;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
                else if (action == "del") {
                    for (let i = 0; i < qb.length; i++) {
                        await this.payAccountRepository.remove(qb[i]);
                        let res = await this.util.requestGet(`${this.pupHost}/api/close/${qb[i]._id}`);
                        if (res.code == 0) {
                            common_1.Logger.error("关闭浏览器实例失败" + qb[i].uid);
                        }
                    }
                }
                else if (action == "upRechargeLimit") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].rechargeLimit = Number(rechargeLimit) * 100;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
                else if (action == "close") {
                    for (let i = 0; i < qb.length; i++) {
                        qb[i].open = false;
                        await this.payAccountRepository.save(qb[i]);
                    }
                }
            }
            else {
                let p = await this.payAccountRepository.createQueryBuilder("pay_account")
                    .leftJoin("pay_account.SysUser", "user")
                    .where("pay_account.id = :id", { id })
                    .andWhere(user.roleLabel == "admin" ? "1=1" : "user.id = :userid", { userid: user.id })
                    .getOne();
                if (!p)
                    throw new api_exception_1.ApiException(10017);
                if (action == "open") {
                    p.open = open;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "check") {
                    if (checkMode == "1") {
                        return { code: 0, msg: "系统现在使用云机查单" };
                    }
                    if (p.open) {
                        return { code: 0, msg: "请先关闭账号启用" };
                    }
                    let have = await this.entityManager.findOne(top_entity_1.TopOrder, { where: { pid: p.id, status: 2 } });
                    if (have) {
                        return { code: 0, msg: "请等待未完成订单超时,避免重复查询" };
                    }
                    let s = await this.redisService.getRedis().get(`order:result:${p.uid}`);
                    if (s) {
                        return { code: 0, msg: "请等待缓存失效再查询,避免重复多次请求" };
                    }
                    let is = await this.redisService.getRedis().get("cache:status:" + p.uid);
                    if (is == "1") {
                        let cookies = await this.redisService.getRedis().get(`cache:cookies:${p.uid}`);
                        let ctoken = cookies.split("ctoken=")[1].split(";")[0];
                        let res = await this.requestApi(p.uid, cookies, ctoken);
                        if (res == CheckStatus.error) {
                            return { code: 0, msg: "发起查单请求失败,重试" };
                        }
                        else if (res == CheckStatus.success) {
                            return { code: 1, msg: "查单正常" };
                        }
                        else if (res == CheckStatus.failed) {
                            return { code: 0, msg: "查单频繁" };
                        }
                    }
                    p.status = false;
                    await this.payAccountRepository.save(p);
                    return { code: 0, msg: "cookies失效" };
                }
                else if (action == "payMode") {
                    p.payMode = params.payMode;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "upRechargeLimit") {
                    p.rechargeLimit = Number(rechargeLimit) * 100;
                    ;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "resetRechargeLimit") {
                    p.lockLimit = 0;
                    await this.payAccountRepository.save(p);
                }
                else if (action == "del") {
                    await this.payAccountRepository.remove(p);
                    let res = await this.util.requestGet(`${this.pupHost}/api/close/${p._id}`);
                    if (res.code == 0) {
                        common_1.Logger.error("关闭浏览器实例失败" + p.uid);
                    }
                }
                else if (action == "weight") {
                    p.weight = Number(params.weight) <= 0 ? 0 : Number(params.weight) > 100 ? 100 : Number(params.weight);
                    await this.payAccountRepository.save(p);
                }
                else if (action == "notify") {
                    let key = this.util.md5(p.id + p.uid);
                    let appHost = await this.paramConfigService.findValueByKey("appHost");
                    return { code: 1, address: `${appHost}/api/alipay/notify?id=${key}&channel=18` };
                }
            }
        }
        catch (e) {
            throw new api_exception_1.ApiException(40002);
        }
    }
    requestApi(uid, cookies, ctoken) {
        return new Promise(async (resolve, reject) => {
            try {
                let url = `https://mbillexprod.alipay.com/enterprise/fundAccountDetail.json?ctoken=${ctoken}&_output_charset=utf-8`;
                let headers = {
                    Cookie: cookies,
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    Referer: "https://b.alipay.com/",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                };
                let data = {
                    billUserId: uid,
                    startDateInput: (0, dayjs_1.default)().subtract(8, "minute").format("YYYY-MM-DD HH:mm:ss"),
                    endDateInput: (0, dayjs_1.default)().format("YYYY-MM-DD HH:mm:ss"),
                    pageNum: "1",
                    pageSize: "100",
                    showType: "0",
                    settleBillRadio: "1",
                    queryEntrance: "1",
                    querySettleAccount: false,
                    switchToFrontEnd: true,
                    accountType: "",
                    _input_charset: "gbk"
                };
                let isproxy = await this.paramConfigService.findValueByKey("isProxy");
                let p = false;
                if (isproxy == "1") {
                    p = `socks://socks5:socks5@45.89.230.134:5555`;
                }
                let res = await this.util.requestPost(url, data, headers, p);
                if (res.stat == "deny") {
                    console.error(`aLiPay订单查单失败,${uid}===cookies失效`);
                    common_1.Logger.error(`aLiPay订单查单失败,${uid}===cookies失效`);
                    await this.redisService.getRedis().set(`cache:status:${uid}`, "0");
                    resolve(CheckStatus.deny);
                    return;
                }
                if (res.status == "failed") {
                    console.error("aLiPay订单查单失败,频繁等待90秒");
                    await this.redisService.getRedis().set(`order:result:${uid}`, JSON.stringify([]), "EX", 90);
                    resolve(CheckStatus.failed);
                    return;
                }
                else {
                    if (res.result?.detail) {
                        console.log(res.result?.detail);
                        await this.redisService.getRedis().set(`order:result:${uid}`, JSON.stringify(res.result?.detail), "EX", 20);
                        resolve(CheckStatus.success);
                        return;
                    }
                }
                resolve(false);
            }
            catch (e) {
                console.error("requestApi请求查单" + e.toString());
                common_1.Logger.error(e);
                resolve(CheckStatus.error);
            }
        });
    }
};
PayAccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payaccount_entity_1.PayAccount)),
    __param(1, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.EntityManager,
        param_config_service_1.SysParamConfigService,
        redis_service_1.RedisService,
        util_service_1.UtilService])
], PayAccountService);
exports.PayAccountService = PayAccountService;
//# sourceMappingURL=payaccount.service.js.map