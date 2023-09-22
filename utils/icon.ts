export function getIconFromJson(name: string, json: any) {
    const icon: any = json[name];
    if (!icon) {
        return '□';
    }
    return unescape('%u' + icon['encodedCode'].replace('\\', '')) || '□';
}
