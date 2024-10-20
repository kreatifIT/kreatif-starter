import React from 'preact/compat';
import { getClangId } from '../utils/clang';
import { useEffect, useState } from 'preact/hooks';
import { RedaxoAdapter, getSelectedWildcards } from 'redaxo-adapter';

export default function useWildcards(_wildcards: string[]) {
    const [loading, setLoading] = useState(true);
    const [wildcards, setWildcards] = useState<Map<string, string>>();
    const [error, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(false);
        const clangId = getClangId();
        getSelectedWildcards(clangId, _wildcards)
            .then((wildcards) => {
                setWildcards(
                    new Map(
                        _wildcards.map((key) => [
                            key,
                            wildcards.find((w) => w.wildcard == key)?.replace ??
                                key,
                        ]),
                    ),
                );
            })
            .catch((e) => {
                console.log(e);
                setError(true);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return { loading, wildcards, error };
}
