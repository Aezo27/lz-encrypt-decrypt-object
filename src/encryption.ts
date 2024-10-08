import CryptoJS from 'crypto-js';

type EncryptableObject<T> = { [K in keyof T]: T[K] };

const encrypt = <T>(value: T, secretKey: string): string => {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    return CryptoJS.AES.encrypt(stringValue, secretKey).toString();
};

const decrypt = <T>(value: string, secretKey: string): T => {
    const bytes = CryptoJS.AES.decrypt(value, secretKey);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    try {
        return JSON.parse(decryptedValue) as T;
    } catch {
        return decryptedValue as unknown as T;
    }
};

const removeDuplicates = (fields: string[]): string[] => {
    return [...new Set(fields)];
};

const processFields = <T>(
    objects: EncryptableObject<T>[],
    fieldsToProcessNoMatterWhere: string[] = [],
    action: 'encrypt' | 'decrypt',
    secretKey: string
): EncryptableObject<T>[] => {
    fieldsToProcessNoMatterWhere = removeDuplicates(fieldsToProcessNoMatterWhere);

    const processObjectFields = (
        obj: EncryptableObject<T>,
        fieldPath: string[],
        actionFunc: (value: any, secretKey: string) => any
    ): void => {
        const [currentField, ...remainingFields] = fieldPath;

        if (obj[currentField as keyof T] !== undefined) {
            if (remainingFields.length === 0) {
                obj[currentField as keyof T] = actionFunc(obj[currentField as keyof T], secretKey);
            } else if (Array.isArray(obj[currentField as keyof T])) {
                (obj[currentField as keyof T] as unknown as EncryptableObject<T>[]).forEach((item) =>
                    processObjectFields(item, remainingFields, actionFunc)
                );
            } else if (typeof obj[currentField as keyof T] === 'object' && obj[currentField as keyof T] !== null) {
                processObjectFields(obj[currentField as keyof T] as unknown as EncryptableObject<T>, remainingFields, actionFunc);
            }
        }
    };

    const processGlobalFields = (
        obj: EncryptableObject<T>,
        actionFunc: (value: any, secretKey: string) => any
    ): void => {
        if (!obj) return;
        Object.keys(obj).forEach((key) => {
            if (fieldsToProcessNoMatterWhere.includes(key)) {
                obj[key as keyof T] = actionFunc(obj[key as keyof T], secretKey);
            } else if (Array.isArray(obj[key as keyof T])) {
                (obj[key as keyof T] as unknown as EncryptableObject<T>[]).forEach((item) => processGlobalFields(item, actionFunc));
            } else if (typeof obj[key as keyof T] === 'object' && obj[key as keyof T] !== null) {
                processGlobalFields(obj[key as keyof T] as unknown as EncryptableObject<T>, actionFunc);
            }
        });
    };

    const actionFunc = action === 'encrypt' ? encrypt : decrypt;

    return objects.map((object) => {
        processGlobalFields(object, actionFunc);
        return object;
    });
};

export { processFields, EncryptableObject, encrypt, decrypt };