import {
    TokenizerOptions,
    DockerImageNameTokens,
    TokenizerViolation,
    Violation,
} from "./tokenizer";

export type AnyDockerImageName = DockerImageName | string;
export type AnyViolation = TokenizerViolation | ParserViolation;

export interface DockerImageName {
    tokens?: DockerImageNameTokens;
    official: boolean;
    remoteName: string;
    canonicalName: string;
    localName: string;
    protocol?: string;
    host: string;
    port?: number;
    tag?: string;
    digest?: string;
}

export interface ParserViolation extends Violation {
    type: "part";
    valid: false;
    key: Exclude<keyof DockerImageName, "tokens">;
    message: string;
}

export interface ParserOptions extends TokenizerOptions {
    defaultHostname?: string;
    defaultPort?: number;
}
