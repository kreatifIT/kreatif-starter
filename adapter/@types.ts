import type { Social } from '../utils/socials.ts';
import type { Media } from 'redaxo-adapter';

export type ProjectSettings = {
    organization: {
        name: string;
        streetAddress: string;
        zip: string;
        city: string;
        region: string;
        province: string;
        country: string;
        isoCountryCode: string;
        vatNumber: string;
        chamberOfCommerce: string;
        chamberOfCommerceNumber: string;
        reaNumber: string;
        shareholderEquity: string;
        images: Media[];
    };
    contact: {
        phone: string;
        email: string;
        emailPec: string;
        socials: Social[];
        coordinates: number[];
    };
    seoGeoRegion?: string;
    websiteName?: string;
    iubendaCookieBanner: {
        bannerData: string;
        showLanguageSwitch: boolean;
    };
    tokens: {
        googleTagManager?: string;
        googleAnalytics?: string;
        googleWebmasterId?: string;
        bingValidateId?: string;
        facebookPixelId?: string;
        facebookDomainVerification?: string;
        linkedInInsightId?: string;
        mapboxAccessToken?: string;
        recaptchaSiteKey?: string;
    };
};
