import { BadRequestException, ValidationPipe } from '@nestjs/common';

export const validationPipe = new ValidationPipe({
  transform: false,
  exceptionFactory: (errors) => {
    return new BadRequestException(
      errors.map((err) => ({
        property: err.property,
        constraints: err.constraints,
      })),
    );
  },
});
