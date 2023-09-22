type Props = {
    icon: string;
    class: string;
};

//todo: rethink name
export default function Icon({ icon, class: className = '' }: Props) {
    return <span className={`icon-element ${className}`}>{icon}</span>;
}
