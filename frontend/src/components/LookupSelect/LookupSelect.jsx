'use client';

import styles from './LookupSelect.module.css';

export function LookupSelect({
    register,
    name,
    rules,
    options = [],
    placeholder = '— Odaberi —',
    disabled = false,
    className = '',
    error = false,
}) {
    return (
        <select
            className={`${styles.select} ${error ? styles.inputError : ''} ${className}`}
            disabled={disabled}
            {...register(name, rules)}
        >
            <option value="">{placeholder}</option>
            {options.map((option) => {
                const value = typeof option === 'string' ? option : option.name;
                const label = typeof option === 'string' ? option : option.name;
                const key = typeof option === 'string' ? option : option.id;
                return (
                    <option key={key} value={value}>
                        {label}
                    </option>
                );
            })}
        </select>
    );
}

export function LocationLookupInput({
    register,
    name,
    rules,
    locations = [],
    listId,
    placeholder,
    className = '',
    error = false,
}) {
    return (
        <>
            <input
                className={`${styles.input} ${error ? styles.inputError : ''} ${className}`}
                list={listId}
                placeholder={placeholder}
                autoComplete="off"
                {...register(name, rules)}
            />
            <datalist id={listId}>
                {locations.map((location) => (
                    <option key={location.id} value={location.name} />
                ))}
            </datalist>
        </>
    );
}

export function PositionLookupSelect({
    register,
    name,
    rules,
    positions = [],
    sportName,
    placeholder = '— Pozicija —',
    className = '',
    error = false,
}) {
    const disabled = !sportName;
    const hint = sportName ? placeholder : 'Prvo odaberi sport';

    return (
        <LookupSelect
            register={register}
            name={name}
            rules={rules}
            options={positions}
            placeholder={hint}
            disabled={disabled}
            className={className}
            error={error}
        />
    );
}
