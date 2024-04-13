import crypto from 'crypto';

export const generateRandomString = (length : number) : string => {
    // Declare all possible characters (lowercase, uppercase letters, and numbers)
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let result = '';

    // Generate random bytes and map them to our characters
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        const randomIndex = randomBytes[i] % charactersLength;
        result += characters[randomIndex];
    }

    return result;
}
