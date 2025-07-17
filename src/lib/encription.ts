const salt = process.env.NEXT_PUBLIC_ENCRIPTION_KEY
const CryptoJS: any = require("crypto-js");

export const encrypt = (signature: string): string => {
    const ciphertext = CryptoJS.AES.encrypt(signature, salt).toString();
    return ciphertext
}
export const decrypt = (encryptedSignature: string): string => {
    const bytes = CryptoJS.AES.decrypt(encryptedSignature, salt);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText
}