'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import styles from './Search.module.css';

export default function SearchUsers() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const { replace } = useRouter();

    const [inputValue, setInputValue] = useState(
        searchParams.get('search')?.toString() || ''
    );

    useEffect(() => {
        setInputValue(searchParams.get('search')?.toString() || '');
    }, [searchParams]);

    const handleSearch = useDebouncedCallback((term) => {
        const params = new URLSearchParams(searchParams.toString());
        const trimmed = term.trim();

        if (trimmed) {
            params.set('search', trimmed);
        } else {
            params.delete('search');
        }

        replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 200);

    return (
        <div className={styles.searchWrap}>
            <Search size={15} className={styles.searchIcon} aria-hidden="true" />
            <input
                type="text"
                placeholder="Pretraži korisnike..."
                value={inputValue}
                onChange={(e) => {
                    const value = e.target.value;
                    setInputValue(value);
                    handleSearch(value);
                }}
                className={styles.searchInput}
                aria-label="Pretraži korisnike"
            />
        </div>
    );
}