"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelfFile = exports.UpdateNewtestDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_newtest_dto_1 = require("./create-newtest.dto");
class UpdateNewtestDto extends (0, swagger_1.PartialType)(create_newtest_dto_1.CreateNewtestDto) {
}
exports.UpdateNewtestDto = UpdateNewtestDto;
class SelfFile {
    fieldname;
    originalname;
    encoding;
    mimetype;
    buffer;
    size;
}
exports.SelfFile = SelfFile;
//# sourceMappingURL=update-newtest.dto.js.map