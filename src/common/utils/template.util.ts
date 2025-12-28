import { readFileSync } from 'fs';
import { join } from 'path';

const templateCache = new Map<string, string>();

function loadTemplate(relativePath: string): string {
    const cacheKey = relativePath;
    const cached = templateCache.get(cacheKey);
    if (cached) return cached;

    const absolute = join(process.cwd(), relativePath);
    const content = readFileSync(absolute, 'utf8');
    templateCache.set(cacheKey, content);
    return content;
}

function getValue(data: Record<string, any>, keyPath: string) {
    const keys = keyPath.split('.');
    let current: any = data;
    for (const key of keys) {
        if (current == null) return undefined;
        current = current[key];
    }
    return current;
}

function renderIfBlocks(template: string, data: Record<string, any>) {
    const ifBlock = /{{#if\s+([a-zA-Z0-9_.]+)\s*}}([\s\S]*?)(?:{{else}}([\s\S]*?))?{{\/if}}/g;
    let output = template;
    let prev = '';
    while (output !== prev) {
        prev = output;
        output = output.replace(
            ifBlock,
            (_match, keyPath: string, truthy: string, falsy: string) => {
                const value = getValue(data, keyPath);
                return value ? truthy : (falsy ?? '');
            },
        );
    }
    return output;
}

function renderVariables(template: string, data: Record<string, any>) {
    return template.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_match, keyPath: string) => {
        const value = getValue(data, keyPath);
        if (value === undefined || value === null) return '';
        return String(value);
    });
}

export function renderEmailTemplate(templateName: string, data: Record<string, any>) {
    const raw = loadTemplate(`templates/email/${templateName}.hbs`);
    const withIf = renderIfBlocks(raw, data);
    return renderVariables(withIf, data);
}
