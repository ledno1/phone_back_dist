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
exports.SysParamConfigService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const api_exception_1 = require("../../../../common/exceptions/api.exception");
const sys_config_entity_1 = __importDefault(require("../../../../entities/admin/sys-config.entity"));
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../../../shared/services/redis.service");
let SysParamConfigService = class SysParamConfigService {
    configRepository;
    redis;
    constructor(configRepository, redis) {
        this.configRepository = configRepository;
        this.redis = redis;
    }
    async getConfigListByPage(page, count) {
        return this.configRepository.find({
            order: {
                id: "ASC"
            },
            take: count,
            skip: page * count
        });
    }
    async countConfigList() {
        return this.configRepository.count();
    }
    async add(dto) {
        await this.configRepository.insert(dto);
    }
    async update(dto) {
        await this.configRepository.update({ id: dto.id }, { name: dto.name, value: dto.value, remark: dto.remark });
    }
    async updateValueByKey(key, value) {
        await this.configRepository.update({ key }, { value: value });
        await this.redis.getRedis().set(`admin:config:${key}`, value, 'EX', 60 * 1);
    }
    async delete(ids) {
        await this.configRepository.delete(ids);
    }
    async findOne(id) {
        return await this.configRepository.findOne({ where: { id } });
    }
    async isExistKey(key) {
        const result = await this.configRepository.findOne({ where: { key } });
        if (result) {
            throw new api_exception_1.ApiException(10021);
        }
    }
    async findValueByKey(key) {
        const redisValue = await this.redis.getRedis().get(`admin:config:${key}`);
        if (redisValue) {
            return redisValue;
        }
        else {
            const result = await this.configRepository.findOne({
                where: { key },
                select: ["value"]
            });
            if (result) {
                await this.redis.getRedis().set(`admin:config:${key}`, result.value, 'EX', 60 * 1);
                return result.value;
            }
            return null;
        }
    }
};
SysParamConfigService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sys_config_entity_1.default)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService])
], SysParamConfigService);
exports.SysParamConfigService = SysParamConfigService;
//# sourceMappingURL=param-config.service.js.map