"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RabbitExampleModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitExampleModule = void 0;
const nestjs_rabbitmq_1 = require("@golevelup/nestjs-rabbitmq");
const common_1 = require("@nestjs/common");
let RabbitExampleModule = RabbitExampleModule_1 = class RabbitExampleModule {
};
RabbitExampleModule = RabbitExampleModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_rabbitmq_1.RabbitMQModule.forRoot(nestjs_rabbitmq_1.RabbitMQModule, {
                exchanges: [
                    {
                        name: 'exchange1',
                        type: 'x-delayed-type',
                        options: {
                            arguments: { 'x-delayed-type': 'direct' },
                        }
                    },
                ],
                uri: 'amqp://admin:admin@192.168.23.132:5672',
                connectionInitOptions: { wait: true },
                enableControllerDiscovery: true,
            }),
            RabbitExampleModule_1
        ],
        providers: [],
        exports: [nestjs_rabbitmq_1.RabbitMQModule]
    })
], RabbitExampleModule);
exports.RabbitExampleModule = RabbitExampleModule;
//# sourceMappingURL=rmq.module.js.map