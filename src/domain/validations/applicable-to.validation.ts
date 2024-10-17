import { ValidationArguments, registerDecorator } from 'class-validator';
import { ELegalType } from '../enum/legal-type.enum';

const validate = (value: string): boolean =>
  Object.values(ELegalType).includes(value as ELegalType);

const defaultMessage = (args: ValidationArguments) =>
  `${args.value} isn't a valid actor type.`;

export const isActorType = (object: object, propertyName: string) => {
  registerDecorator({
    name: `isActorType`,
    target: object.constructor,
    propertyName: propertyName,
    validator: {
      validate,
      defaultMessage,
    },
  });
};
