declare module 'xo-connect' {
  export interface XOClient {
    alias?: string;
    [key: string]: any;
  }

  export class XOConnect {
    static getClient(): Promise<XOClient>;
  }
}

