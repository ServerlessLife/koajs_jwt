import { MyHttpError } from "../services/myHttpError";

export function validateNotNull(val: string, fieldName: string) {
    if (val === null || typeof val === "undefined" || val === "") {
        throw new MyHttpError(`Required field '${fieldName}'.`, 400, true);
    }
}

export function validateMaxLenght(val: string, maxLength: number, fieldName: string) {
    if (val && val.length > maxLength) {
        throw new MyHttpError(`Max. field length for field '${fieldName}' is ${maxLength}.`, 400, true);
    }
}