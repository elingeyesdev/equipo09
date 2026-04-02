"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsAfterDateConstraint = void 0;
exports.IsAfterDate = IsAfterDate;
const class_validator_1 = require("class-validator");
let IsAfterDateConstraint = class IsAfterDateConstraint {
    validate(propertyValue, args) {
        const [relatedPropertyName] = args.constraints;
        const relatedValue = args.object[relatedPropertyName];
        if (!propertyValue)
            return true;
        const startDate = relatedValue ? new Date(relatedValue) : new Date();
        const endDate = new Date(propertyValue);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return false;
        }
        return endDate.getTime() > startDate.getTime();
    }
    defaultMessage(args) {
        const [relatedPropertyName] = args.constraints;
        return `La fecha de cierre (${args.property}) debe ser posterior a la fecha de inicio (${relatedPropertyName || 'hoy'})`;
    }
};
exports.IsAfterDateConstraint = IsAfterDateConstraint;
exports.IsAfterDateConstraint = IsAfterDateConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isAfterDate', async: false })
], IsAfterDateConstraint);
function IsAfterDate(property, validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [property],
            validator: IsAfterDateConstraint,
        });
    };
}
//# sourceMappingURL=is-after-date.decorator.js.map