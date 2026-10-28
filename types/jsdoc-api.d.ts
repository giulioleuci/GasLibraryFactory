// jsdoc-api 9 has no bundled declarations; describe the API used by the docs generator.
declare module 'jsdoc-api' {
  export interface Doclet {
    kind: string;
    name: string;
    memberof?: string;
    scope?: string;
    classdesc?: string;
    description?: string;
    comment?: string;
    undocumented?: boolean;
    meta: { path: string; filename: string; lineno?: number };
    params?: { name: string; type?: { names: string[] } }[];
    returns?: { type?: { names: string[] } }[];
  }
  const api: {
    explain(options: { files: string[]; cache?: boolean }): Promise<Doclet[]>;
  };
  export default api;
}
