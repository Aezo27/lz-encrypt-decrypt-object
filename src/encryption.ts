import CryptoJS from 'crypto-js';

type EncryptableObject = { [key: string]: any };

const encrypt = (value: any, secretKey: string): string => {
    if (typeof value !== 'string') {
        value = JSON.stringify(value);
    }
    return CryptoJS.AES.encrypt(value, secretKey).toString();
};

const decrypt = (value: string, secretKey: string): any => {
    const bytes = CryptoJS.AES.decrypt(value, secretKey);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    try {
        return JSON.parse(decryptedValue);
    } catch {
        return decryptedValue;
    }
};

const removeDuplicates = (fields: string[]): string[] => {
    return [...new Set(fields)];
};

const processFields = (
    objects: EncryptableObject[],
    fieldsToProcessNoMatterWhere: string[] = [],
    action: 'encrypt' | 'decrypt',
    secretKey: string
): EncryptableObject[] => {
    fieldsToProcessNoMatterWhere = removeDuplicates(fieldsToProcessNoMatterWhere);

    const processObjectFields = (
        obj: EncryptableObject,
        fieldPath: string[],
        actionFunc: (value: any, secretKey: string) => any
    ): void => {
        const [currentField, ...remainingFields] = fieldPath;

        if (obj[currentField] !== undefined) {
            if (remainingFields.length === 0) {
                obj[currentField] = actionFunc(obj[currentField], secretKey);
            } else if (Array.isArray(obj[currentField])) {
                obj[currentField].forEach((item: EncryptableObject) =>
                    processObjectFields(item, remainingFields, actionFunc)
                );
            } else if (typeof obj[currentField] === 'object') {
                processObjectFields(obj[currentField], remainingFields, actionFunc);
            }
        }
    };

    const processGlobalFields = (
        obj: EncryptableObject,
        actionFunc: (value: any, secretKey: string) => any
    ): void => {
        Object.keys(obj).forEach((key) => {
            if (fieldsToProcessNoMatterWhere.includes(key)) {
                obj[key] = actionFunc(obj[key], secretKey);
            } else if (Array.isArray(obj[key])) {
                obj[key].forEach((item: EncryptableObject) => processGlobalFields(item, actionFunc));
            } else if (typeof obj[key] === 'object') {
                processGlobalFields(obj[key], actionFunc);
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