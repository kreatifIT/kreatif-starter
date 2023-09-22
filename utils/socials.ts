export type Social = {
    name: string;
    url: string;
};

const socialMediaLabels = new Map<string, string>([
    ['facebook', 'Facebook'],
    ['instagram', 'Instagram'],
    ['twitter', 'Twitter'],
    ['youtube', 'YouTube'],
    ['linkedin', 'LinkedIn'],
    ['pinterest', 'Pinterest'],
    ['tiktok', 'TikTok'],
    ['xing', 'Xing'],
    ['whatsapp', 'WhatsApp'],
    ['telegram', 'Telegram'],
    ['snapchat', 'Snapchat'],
    ['twitch', 'Twitch'],
    ['reddit', 'Reddit'],
    ['tumblr', 'Tumblr'],
]);

interface SocialMediaItem {
    name: string;
    url: string;
    label: string;
}

export const getSocialMediaMap = (items: Social[]) => {
    const socialMediaItems = new Map<string, SocialMediaItem>();

    items.forEach(({ name, url }) => {
        socialMediaItems.set(name, {
            name,
            url,
            label: socialMediaLabels.get(name) || '',
        });
    });

    return socialMediaItems;
};
