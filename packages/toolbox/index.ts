export function resolveModulePath(
    moduleName: string,
    additionalPath?: string
): string {
    const base = require.resolve(moduleName).split(moduleName)[0]
    return `${base}${moduleName}/${additionalPath || ""}`
}
