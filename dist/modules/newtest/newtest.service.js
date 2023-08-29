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
exports.NewtestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const redis_service_1 = require("../../shared/services/redis.service");
const util_service_1 = require("../../shared/services/util.service");
const newtest_entity_1 = require("../../entities/newTest/newtest.entity");
let NewtestService = class NewtestService {
    newtestRepository;
    redisService;
    entityManager;
    util;
    constructor(newtestRepository, redisService, entityManager, util) {
        this.newtestRepository = newtestRepository;
        this.redisService = redisService;
        this.entityManager = entityManager;
        this.util = util;
    }
    async findOne(params) {
        let r = await this.newtestRepository.find({
            where: { id: params.id },
        });
        await this.newtestRepository.findOne({ where: { name: 'test' } }).then(async (res) => {
            if (!res) {
                await this.newtestRepository.save({ name: 'test' }).then(async (res) => {
                    console.log(res);
                });
            }
        });
        return `This action returns a #${params.id} 23 ${r[0].name}`;
    }
    async upfile(file) {
        console.log(file.originalname);
        return 'ok';
    }
};
NewtestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(newtest_entity_1.Newtest)),
    __param(2, (0, typeorm_1.InjectEntityManager)()),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        redis_service_1.RedisService,
        typeorm_2.EntityManager,
        util_service_1.UtilService])
], NewtestService);
exports.NewtestService = NewtestService;
//# sourceMappingURL=newtest.service.js.map