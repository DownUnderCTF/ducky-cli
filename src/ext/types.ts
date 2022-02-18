export const OUTPUT_FORMATS = ['text', 'json'] as const;
export type OutputFormat = typeof OUTPUT_FORMATS[number];
