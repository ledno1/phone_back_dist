"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RedisModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisModule = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = __importDefault(require("ioredis"));
const lodash_1 = require("lodash");
const redis_constants_1 = require("./redis.constants");
let RedisModule = RedisModule_1 = class RedisModule {
    static register(options) {
        const clientProvider = this.createAysncProvider();
        return {
            module: RedisModule_1,
            providers: [
                clientProvider,
                {
                    provide: redis_constants_1.REDIS_MODULE_OPTIONS,
                    useValue: options,
                },
            ],
            exports: [clientProvider],
        };
    }
    static registerAsync(options) {
        const clientProvider = this.createAysncProvider();
        return {
            module: RedisModule_1,
            imports: options.imports ?? [],
            providers: [clientProvider, this.createAsyncClientOptions(options)],
            exports: [clientProvider],
        };
    }
    static createAysncProvider() {
        return {
            provide: redis_constants_1.REDIS_CLIENT,
            useFactory: (options) => {
                const clients = new Map();
                if (Array.isArray(options)) {
                    options.forEach((op) => {
                        const name = op.name ?? redis_constants_1.REDIS_DEFAULT_CLIENT_KEY;
                        if (clients.has(name)) {
                            throw new Error('Redis Init Error: name must unique');
                        }
                        let client = this.createClient(op);
                        clients.set(name, client);
                    });
                }
                else {
                    clients.set(redis_constants_1.REDIS_DEFAULT_CLIENT_KEY, this.createClient(options));
                }
                return clients;
            },
            inject: [redis_constants_1.REDIS_MODULE_OPTIONS],
        };
    }
    static createClient(options) {
        const { onClientReady, url, cluster, clusterOptions, nodes, ...opts } = options;
        let client = null;
        if (!(0, lodash_1.isEmpty)(url)) {
            client = new ioredis_1.default(url);
        }
        else if (cluster) {
            client = new ioredis_1.default.Cluster(nodes, clusterOptions);
        }
        else {
            client = new ioredis_1.default(opts);
        }
        if (onClientReady) {
            onClientReady(client);
        }
        return client;
    }
    static createAsyncClientOptions(options) {
        return {
            provide: redis_constants_1.REDIS_MODULE_OPTIONS,
            useFactory: options.useFactory,
            inject: options.inject,
        };
    }
    onModuleDestroy() {
    }
};
RedisModule = RedisModule_1 = __decorate([
    (0, common_1.Module)({})
], RedisModule);
exports.RedisModule = RedisModule;
//# sourceMappingURL=redis.module.js.map