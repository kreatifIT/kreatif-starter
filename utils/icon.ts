export function getIconFromJson(name: string, json: any) {
    const icon: any = json[name];
    if (!icon) {
        return '□';
    }
    return unescape('%u' + icon['encodedCode'].replace('\\', '')) || '□';
}

export const getIconString = (name: string): string => {
    const icon: any = fontInfo[name];
    return icon['encodedCode'] || '□';
};
