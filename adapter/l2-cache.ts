import { AbstractCache } from 'redaxo-adapter';
import type { AdvancedRuntime } from '@astrojs/cloudflare';

export default class L2Cache extends AbstractCache {
    private static RUNTIME: AdvancedRuntime['runtime'];

    constructor(runTime: AdvancedRuntime) {
        super();
        L2Cache.RUNTIME = runTime.runtime;
    }

    prepareKey(key: string): string {
        key = key.replace(/[^a-z0-9]/gi, '');
        key = key.slice(0, 512);

        return key;
    }
    async get(key: string): Promise<any> {
        key = this.prepareKey(key);
        const data = await Cache.RUNTIME.env.REX_HEADLESS?.get(key);
        return data ? JSON.parse(data) : undefined;
    }

    set(key: string, value: any): void {
        key = this.prepareKey(key);
        Cache.RUNTIME.env.REX_HEADLESS?.put(key, JSON.stringify(value), {
            expirationTtl: 60 * 60 * 24 * 3,
        });
    }
}
