export default function createIntegration({
    endpoint,
    root
                                          }) {
    return {
        name: 'redaxo-adapter-integration',
        hooks: {
            'astro:config:setup': ({ injectScript }) => {
                injectScript(
                    'before-hydration',
                    `
                import {RedaxoAdapter} from "redaxo-adapter";
                RedaxoAdapter.init(import.meta.env.PUBLIC_REDAXO_ENDPOINT, import.meta.env.PUBLIC_REDAXO_ROOT);
                `,
                );
            },
        },
    };
}
