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
exports.HeroController = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const authorize_decorator_1 = require("../modules/admin/core/decorators/authorize.decorator");
let HeroController = class HeroController {
    client;
    heroService;
    constructor(client) {
        this.client = client;
    }
    onModuleInit() {
        this.heroService = this.client.getService('HeroService');
    }
    getMany() {
        const ids$ = new rxjs_1.ReplaySubject();
        ids$.next({ id: 1 });
        ids$.next({ id: 2 });
        ids$.complete();
        const stream = this.heroService.findMany(ids$.asObservable());
        return stream.pipe((0, operators_1.toArray)());
    }
    getById(id) {
        return this.heroService.findOne({ id: +id });
    }
};
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", rxjs_1.Observable)
], HeroController.prototype, "getMany", null);
__decorate([
    (0, authorize_decorator_1.Authorize)(),
    (0, common_1.Get)('id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", rxjs_1.Observable)
], HeroController.prototype, "getById", null);
HeroController = __decorate([
    (0, common_1.Controller)('hero'),
    __param(0, (0, common_1.Inject)('HERO_PACKAGE')),
    __metadata("design:paramtypes", [Object])
], HeroController);
exports.HeroController = HeroController;
//# sourceMappingURL=hero.controller.js.map