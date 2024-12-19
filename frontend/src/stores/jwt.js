export const decodeJWT = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('Invalid JWT token');
    }

    const decoded = JSON.parse(atob(parts[1]));

   

    return decoded;
};
