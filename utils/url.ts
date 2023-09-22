export const mergeUrl = (baseUrl: string, url: string) => {
    if (url.startsWith('http')) {
        return url;
    }
    baseUrl = baseUrl.replace(/\/$/, '');
    url = url.replace(/^\//, '');
    return `${baseUrl}/${url}`;
};

export const buildLogoUrl = (baseUrl: string) => {
    return mergeUrl(baseUrl, '/img/logo.svg');
};
