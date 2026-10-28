import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function CodeBlock({ children, className, ...props }) {
    const [copied, setCopied] = useState(false);
    const codeString = String(children).replace(/\n$/, '');
    const match = /language-(\w+)/.exec(className || '');
    const language = match ? match[1] : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative my-4 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg text-slate-100">
            {/* Header del bloque de código */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-xs">
                <span className="font-mono text-purple-400 font-semibold uppercase tracking-wider">
                    {language || 'código'}
                </span>
                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all active:scale-95"
                >
                    {copied ? (
                        <>
                            <span className="text-emerald-400">✓</span>
                            <span className="text-emerald-400">¡Copiado!</span>
                        </>
                    ) : (
                        <>
                            <span>📋</span>
                            <span>Copiar</span>
                        </>
                    )}
                </button>
            </div>

            {/* Contenido del código */}
            <pre className="p-4 overflow-x-auto font-mono text-xs md:text-sm leading-relaxed text-slate-200">
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        </div>
    );
}

export default function MarkdownViewer({ content, className = '' }) {
    if (!content) {
        return (
            <p className="text-slate-400 italic text-sm">Sin contenido registrado.</p>
        );
    }

    return (
        <div className={`markdown-body space-y-4 font-sans text-slate-700 dark:text-slate-200 leading-relaxed ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
                            <span className="w-1.5 h-6 rounded-full bg-gradient-to-b from-purple-600 to-indigo-600 inline-block"></span>
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white mt-5 mb-2.5 flex items-center gap-2">
                            <span className="w-1 h-5 rounded-full bg-purple-500 inline-block"></span>
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mt-4 mb-2">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-base font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1">
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="my-2.5 text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300">
                            {children}
                        </p>
                    ),
                    strong: ({ children }) => (
                        <strong className="font-bold text-slate-900 dark:text-white bg-purple-50/80 dark:bg-purple-950/40 px-1 py-0.5 rounded">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-slate-800 dark:text-slate-200">{children}</em>
                    ),
                    ul: ({ children }) => (
                        <ul className="my-3 space-y-1.5 ps-5 list-disc marker:text-purple-500">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="my-3 space-y-1.5 ps-5 list-decimal marker:font-bold marker:text-purple-600 dark:marker:text-purple-400">
                            {children}
                        </ol>
                    ),
                    li: ({ children }) => (
                        <li className="text-slate-700 dark:text-slate-300 text-base md:text-lg leading-relaxed">
                            {children}
                        </li>
                    ),
                    blockquote: ({ children }) => (
                        <blockquote className="my-4 border-l-4 border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 px-4 py-3 rounded-r-2xl italic text-slate-700 dark:text-slate-300 shadow-xs">
                            {children}
                        </blockquote>
                    ),
                    code: ({ inline, className, children, ...props }) => {
                        if (inline) {
                            return (
                                <code
                                    className="font-mono text-sm px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/50 font-semibold"
                                    {...props}
                                >
                                    {children}
                                </code>
                            );
                        }
                        return (
                            <CodeBlock className={className} {...props}>
                                {children}
                            </CodeBlock>
                        );
                    },
                    table: ({ children }) => (
                        <div className="my-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 text-sm md:text-base">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-800 dark:text-slate-100">
                            {children}
                        </thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900/60">
                            {children}
                        </tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="hover:bg-purple-50/30 dark:hover:bg-purple-950/20 transition-colors">
                            {children}
                        </tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-3 text-left font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                            {children}
                        </td>
                    ),
                    hr: () => (
                        <hr className="my-6 border-slate-200 dark:border-slate-800" />
                    ),
                    a: ({ href, children }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-purple-600 dark:text-purple-400 underline underline-offset-2 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                            {children} ↗
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
