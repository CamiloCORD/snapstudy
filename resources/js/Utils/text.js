/**
 * Limpia y extrae texto plano legible a partir de una cadena con marcado Markdown y LaTeX.
 * Ideal para snippets, extractos y tarjetas de previsualización sin mostrar símbolos como #, **, $$, etc.
 *
 * @param {string} content
 * @returns {string}
 */
export function stripMarkdown(content) {
    if (!content || typeof content !== 'string') {
        return '';
    }

    return content
        // Eliminar bloques de código cercados
        .replace(/```[\s\S]*?```/g, '')
        // Eliminar código inline
        .replace(/`([^`]+)`/g, '$1')
        // Eliminar fórmulas LaTeX en bloque ($$...$$)
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        // Eliminar fórmulas LaTeX en línea ($...$)
        .replace(/\$([^\$]+)\$/g, '$1')
        // Eliminar imágenes en markdown (![alt](url))
        .replace(/!\[([^\]]*)\]\([^\)]+\)/g, '')
        // Eliminar enlaces dejando solo el texto ([texto](url))
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
        // Eliminar encabezados (#, ##, ###...) al inicio de línea
        .replace(/^\s*#{1,6}\s*/gm, '')
        // Eliminar negritas y cursivas (***, **, *, __, _)
        .replace(/(\*{1,3}|_{1,3})(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        // Eliminar citas en bloque (>)
        .replace(/^\s*>\s+/gm, '')
        // Eliminar viñetas de listas (-, *, +, 1.)
        .replace(/^\s*[-*+]\s+/gm, '')
        .replace(/^\s*\d+\.\s+/gm, '')
        // Eliminar líneas horizontales
        .replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')
        // Limpiar cualquier asterisco, almohadilla o tilde huérfana
        .replace(/[*#~]/g, '')
        // Colapsar saltos de línea y espacios múltiples
        .replace(/\s+/g, ' ')
        .trim();
}
