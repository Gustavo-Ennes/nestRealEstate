import { ValidationArguments, registerDecorator } from 'class-validator';
import { EActorType } from '../enum/actor-type.enum';

const validate = (value: string): boolean =>
  Object.values(EActorType).includes(value as EActorType);

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
