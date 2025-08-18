export const trim = (text: string): string => {
    return text.replaceAll(/\s+/g, ' ').replaceAll('\n', '').replaceAll('\t', '').replaceAll('\r', '').trim();
}