export const formatPrice = (price: number | string, langCode: string) => {
    if (!price) return null;
    if (typeof price === 'string') price = parseFloat(price);
    const formatter = new Intl.NumberFormat(langCode, {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return formatter.format(price);
};

export const formatDateWithWords = (
    date: string | Date,
    langCode: string,
): string => {
    const formatter = new Intl.DateTimeFormat(langCode, {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        weekday: 'long',
    });
    if (typeof date === 'string') date = new Date(date);
    return formatter.format(date);
};

export const formatDateNumeric = (
    date: string | Date,
    langCode: string,
): string => {
    const formatter = new Intl.DateTimeFormat(langCode, {
        year: 'numeric',
        month: 'numeric',
        day: '2-digit',
    });
    if (typeof date === 'string') date = new Date(date);
    return formatter.format(new Date(date));
};

export const getDatepickerTodayDate = (): string => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();

    return `${yyyy}-${mm}-${dd}`;
};

export const sanitizePhoneNumber = (phoneNumber: string): string => {
    return phoneNumber.replace(/\s/g, '');
};
