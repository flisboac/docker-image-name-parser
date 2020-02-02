export type TokenizerMode = 'strict' | 'fast';
export type TokensValidationMode = 'all' | 'some';

export interface DockerImageNameTokens {
    input?: string;
    hostname?: string;
    port?: number | string;
    path?: string[];
    name: string;
    tag?: string;
    digest?: string;
}

export interface Violation {
    type: "token" | "part";
    valid: false;
    key: string;
    message: string;
}

export interface TokenizerViolation extends Violation {
    type: "token";
    valid: false;
    key: keyof DockerImageNameTokens;
    index?: number;
    message: string;
}

export interface TokensValidationOptions {
    validate: TokensValidationMode;
}

export interface TokenizerOptions {
    optional?: boolean | 'violations';
    mode: TokenizerMode;
    validate: TokensValidationMode;
}