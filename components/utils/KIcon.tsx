import React from 'preact/compat';
import './Icon.scss';
type Props = {
    icon: string;
    class: string;
};

export default function KIcon({ icon, class: className = '' }: Props) {
    return <span className={`k-icon-element ${className}`}>{icon}</span>;
}
