import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;

@ValidatorConstraint({ name: 'isRecentPastDate', async: false })
export class IsRecentPastDate implements ValidatorConstraintInterface {
    validate(value: any, _args: ValidationArguments): boolean {
        if (!value) {
            return true; // let @IsOptional / @IsDateString handle absence / format
        }

        const date = new Date(value);
        if (isNaN(date.getTime())) {
            return false;
        }

        const now = Date.now();
        return date.getTime() <= now && date.getTime() >= now - TWELVE_HOURS_MS;
    }

    defaultMessage(_args: ValidationArguments): string {
        return 'occurredAt must be in the past and no older than 12 hours';
    }
}
