# lz-encrypt-decrypt-object

`lz-encrypt-decrypt-object` is a TypeScript library for encrypting and decrypting fields within deeply nested objects using AES encryption.

## Installation

To install the package, use npm:

```bash
npm install lz-encrypt-decrypt-object
```

## Usage

### Importing the Library

```typescript
import { processFields, EncryptableObject } from 'lz-encrypt-decrypt-object';
```

### Example Usage

```typescript
const secretKey = 'user-defined-secret-key';

const objects: EncryptableObject[] = [
    {
        id: "aff0f07d-970b-48da-b7e4-709a1b8cf1bc",
        code: "NEW_PRINTING_LOGIC",
        description: "New flow for fe to generate patient rather than get from API",
        central_value: "1",
        status: 1,
        created_at: "2024-10-03T05:43:15.931Z",
        updated_at: "2024-10-03T05:43:15.931Z"
    },
    // More objects...
];

const fieldsToEncrypt = ["id", "detail"];

const encryptedObjects = processFields(objects, fieldsToEncrypt, 'encrypt', secretKey);

console.log(JSON.stringify(encryptedObjects, null, 2));

setTimeout(() => {
    const decryptedObjects = processFields(encryptedObjects, fieldsToEncrypt, 'decrypt', secretKey);
    console.log(JSON.stringify(decryptedObjects, null, 2));
}, 1500);
```

## API

### `processFields`

Processes the specified fields in the given objects for encryption or decryption.

#### Parameters

- `objects: EncryptableObject[]` - The array of objects to process.
- `fieldsToProcessNoMatterWhere: string[]` - The fields to encrypt or decrypt, no matter where they are nested.
- `action: 'encrypt' | 'decrypt'` - The action to perform, either 'encrypt' or 'decrypt'.
- `secretKey: string` - The secret key used for encryption and decryption.

#### Returns

- `EncryptableObject[]` - The processed array of objects.

### `EncryptableObject`

A type representing an object with string keys and any type of values.

## License

This project is licensed under the MIT License.

## Author

Your Name

## Repository

[GitHub Repository](https://github.com/lutfi-zain/lz-encrypt-decrypt-object)
