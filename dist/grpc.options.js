"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grpcOptions = void 0;
const microservices_1 = require("@nestjs/microservices");
const path_1 = require("path");
exports.grpcOptions = {
    transport: microservices_1.Transport.GRPC,
    options: {
        package: 'hero',
        protoPath: (0, path_1.join)(__dirname, './hero/hero.proto'),
    },
};
//# sourceMappingURL=grpc.options.js.map