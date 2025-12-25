"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderEmailTemplate = renderEmailTemplate;
const fs_1 = require("fs");
const path_1 = require("path");
const templateCache = new Map();
function loadTemplate(relativePath) {
    const cacheKey = relativePath;
    const cached = templateCache.get(cacheKey);
    if (cached)
        return cached;
    const absolute = (0, path_1.join)(process.cwd(), relativePath);
    const content = (0, fs_1.readFileSync)(absolute, 'utf8');
    templateCache.set(cacheKey, content);
    return content;
}
function getValue(data, keyPath) {
    const keys = keyPath.split('.');
    let current = data;
    for (const key of keys) {
        if (current == null)
            return undefined;
        current = current[key];
    }
    return current;
}
function renderIfBlocks(template, data) {
    return template.replace(/{{#if\s+([a-zA-Z0-9_.]+)\s*}}([\s\S]*?){{\/if}}/g, (_match, keyPath, inner) => {
        const value = getValue(data, keyPath);
        return value ? inner : '';
    });
}
function renderVariables(template, data) {
    return template.replace(/{{\s*([a-zA-Z0-9_.]+)\s*}}/g, (_match, keyPath) => {
        const value = getValue(data, keyPath);
        if (value === undefined || value === null)
            return '';
        return String(value);
    });
}
function renderEmailTemplate(templateName, data) {
    const raw = loadTemplate(`templates/email/${templateName}.hbs`);
    const withIf = renderIfBlocks(raw, data);
    return renderVariables(withIf, data);
}
//# sourceMappingURL=template.util.js.map