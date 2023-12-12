import React from 'preact/compat';
import { h, type VNode } from 'preact';

export interface HeadingProps {
    text?: string;
    class?: string;
    defaultTag?: string;
}

export default function KHeading({
    text,
    class: className = '',
    defaultTag = 'h2',
}: HeadingProps): VNode | null {
    if (!text) return null;
    if (!text.includes('<')) {
        text = `<${defaultTag}>${text}</${defaultTag}>`;
    }
    const tag = text?.match(/<(\w+)>/)?.[1] ?? 'h1';
    text = text?.match(/>(.*)</)?.[1] ?? '';
    return h(tag, {
        dangerouslySetInnerHTML: { __html: text },
        class: className,
    }) as VNode;
}
