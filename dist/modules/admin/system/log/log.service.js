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
exports.SysLogService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const sys_login_log_entity_1 = __importDefault(require("../../../../entities/admin/sys-login-log.entity"));
const sys_task_log_entity_1 = __importDefault(require("../../../../entities/admin/sys-task-log.entity"));
const sys_user_entity_1 = __importDefault(require("../../../../entities/admin/sys-user.entity"));
const typeorm_2 = require("typeorm");
const ua_parser_js_1 = require("ua-parser-js");
const util_service_1 = require("../../../../shared/services/util.service");
let SysLogService = class SysLogService {
    loginLogRepository;
    taskLogRepository;
    userRepository;
    utilService;
    constructor(loginLogRepository, taskLogRepository, userRepository, utilService) {
        this.loginLogRepository = loginLogRepository;
        this.taskLogRepository = taskLogRepository;
        this.userRepository = userRepository;
        this.utilService = utilService;
    }
    async saveLoginLog(uid, ip, ua) {
        if (typeof ip !== 'string')
            return;
        const loginLocation = await this.utilService.getLocation(ip.split(',').at(-1).trim());
        await this.loginLogRepository.save({
            ip,
            loginLocation,
            userId: uid,
            ua,
        });
    }
    async countLoginLog() {
        const userIds = await this.userRepository
            .createQueryBuilder('user')
            .select(['user.id'])
            .getMany();
        return await this.loginLogRepository.count({
            where: { userId: (0, typeorm_2.In)(userIds.map((n) => n.id)) },
        });
    }
    async pageGetLoginLog(page, count) {
        const result = await this.loginLogRepository
            .createQueryBuilder('login_log')
            .innerJoinAndSelect('sys_user', 'user', 'login_log.user_id = user.id')
            .orderBy('login_log.created_at', 'DESC')
            .offset(page * count)
            .limit(count)
            .getRawMany();
        const parser = new ua_parser_js_1.UAParser();
        return result.map((e) => {
            const u = parser.setUA(e.login_log_ua).getResult();
            return {
                id: e.login_log_id,
                ip: e.login_log_ip,
                os: `${u.os.name} ${u.os.version}`,
                browser: `${u.browser.name} ${u.browser.version}`,
                time: e.login_log_created_at,
                username: e.user_username,
                loginLocation: e.login_log_login_location,
            };
        });
    }
    async clearLoginLog() {
        await this.loginLogRepository.clear();
    }
    async recordTaskLog(tid, status, time, err) {
        const result = await this.taskLogRepository.save({
            taskId: tid,
            status,
            detail: err,
        });
        return result.id;
    }
    async countTaskLog() {
        return await this.taskLogRepository.count();
    }
    async page(page, count) {
        const result = await this.taskLogRepository
            .createQueryBuilder('task_log')
            .leftJoinAndSelect('sys_task', 'task', 'task_log.task_id = task.id')
            .orderBy('task_log.id', 'DESC')
            .offset(page * count)
            .limit(count)
            .getRawMany();
        return result.map((e) => {
            return {
                id: e.task_log_id,
                taskId: e.task_id,
                name: e.task_name,
                createdAt: e.task_log_created_at,
                consumeTime: e.task_log_consume_time,
                detail: e.task_log_detail,
                status: e.task_log_status,
            };
        });
    }
    async clearTaskLog() {
        await this.taskLogRepository.clear();
    }
};
SysLogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sys_login_log_entity_1.default)),
    __param(1, (0, typeorm_1.InjectRepository)(sys_task_log_entity_1.default)),
    __param(2, (0, typeorm_1.InjectRepository)(sys_user_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        util_service_1.UtilService])
], SysLogService);
exports.SysLogService = SysLogService;
//# sourceMappingURL=log.service.js.map