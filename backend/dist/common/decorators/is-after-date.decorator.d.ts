import { ValidationOptions, ValidationArguments, ValidatorConstraintInterface } from 'class-validator';
export declare class IsAfterDateConstraint implements ValidatorConstraintInterface {
    validate(propertyValue: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsAfterDate(property: string, validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
