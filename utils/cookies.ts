export const parseCookieData = (key: string) => {
    const cookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(key));
    if (!cookie) return null;
    return cookie.split('=')[1];
};
