import React from 'preact/compat';
import { createPortal, useEffect } from 'preact/compat';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    children: any;
    visible: boolean;
    containerClass?: string;
    innerClass?: string;
}

export default function KModalPopupWrapper({
    children,
    visible,
    containerClass = 'fixed inset-0 after:bg-white after:opacity-95 after:absolute after:inset-0 after:-z-10',
    innerClass = ' absolute inset-0 top-0 b-0 md:flex md:flex-col md:justify-center',
}: Props) {
    useEffect(() => {
        if (visible) {
            document.body.classList.add('overflow-hidden');
        } else {
            document.body.classList.remove('overflow-hidden');
        }
    }, [visible]);

    return createPortal(
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, translateY: '100%' }}
                    animate={{ opacity: 1, translateY: 0 }}
                    exit={{ opacity: 0, translateY: '100%' }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    class={containerClass}
                >
                    <div className={innerClass}>{children}</div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.querySelector('#popup-target')!,
    );
}
