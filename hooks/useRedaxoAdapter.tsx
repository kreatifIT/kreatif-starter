import { getClangId } from '../utils/clang';
import { useEffect, useState } from 'preact/hooks';
import { RedaxoAdapter } from 'redaxo-adapter';

export default function useRedaxoAdapter<T>(
    operation: (clangId: string) => Promise<T>,
) {
    const [data, setData] = useState<T>();
    const [error, setError] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const f = () => operation(getClangId());

    const fetchData = async () => {
        try {
            const data = await f();
            setData(data);
            setError(false);
        } catch (e) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => {
        f().then(setData).catch(setError);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return {
        data,
        error,
        loading,
        refresh,
    };
}
