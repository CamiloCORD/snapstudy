import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition duration-150 ease-in-out focus:outline-none ${
                active
                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
            } ${className}`}
        >
            {children}
        </Link>
    );
}
