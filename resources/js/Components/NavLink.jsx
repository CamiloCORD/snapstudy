import { Link } from '@inertiajs/react';

export default function NavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={
                'inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-xl transition duration-150 ease-in-out focus:outline-none ' +
                (active
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 shadow-xs '
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 ') +
                className
            }
        >
            {children}
        </Link>
    );
}
