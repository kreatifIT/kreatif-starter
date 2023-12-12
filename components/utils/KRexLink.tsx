import React from 'preact/compat';
import type { ComponentChild } from 'preact';
import type { Link } from 'redaxo-adapter';

interface Props {
    link: Link;
    title?: string;
    class?: string;
    children?: ComponentChild;
}

export default function KRexLink({
    link,
    title = link.label,
    children,
    class: className,
}: Props) {
    if (!link) {
        return null;
    }
    return (
        <a
            class={className}
            href={link.url}
            {...(link.target && { target: link.target })}
            {...(title && { title })}
        >
            {children ?? link.label}
        </a>
    );
}
