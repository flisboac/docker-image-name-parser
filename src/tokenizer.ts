import {
    TokenizerOptions,
    DockerImageNameTokens,
    TokenizerViolation,
    TokensValidationOptions,
} from './types';

import {
    tPortNumber,
    tHostname,
    tComponent,
    tTag,
    tDigest,
    verifyTokenizerOptions,
    verifyTokensValidationOptions,
    tokenViolationBase,
} from './detail/constants';

import { DockerImageNameError } from './error';

export class TokenizerError extends DockerImageNameError {
    constructor(
        public readonly violations: TokenizerViolation[],
        message?: string
    ) {
        super(message || (
            !violations || violations.length === 0 ? 'A tokenizer error ocurred.'
            : violations.length === 1 ? `Tokenizer error: ${violations[0].message}`
            : `Multiple tokenizer violation errors occured. First error: ${violations[0].message}`
        ));
    }
}

export function tokenize(input: string): DockerImageNameTokens;
export function tokenize(input: string, options: Partial<TokenizerOptions> & { optional: true }): DockerImageNameTokens | undefined;
export function tokenize(input: string, options: Partial<TokenizerOptions> & { optional: 'violations' }): DockerImageNameTokens | TokenizerViolation[];
export function tokenize(input: string, options: Partial<TokenizerOptions> & { optional: boolean }): DockerImageNameTokens | TokenizerViolation[] | undefined;
export function tokenize(input: string, options: Partial<TokenizerOptions>): DockerImageNameTokens;
export function tokenize(input: string, _options?: Partial<TokenizerOptions>): DockerImageNameTokens | TokenizerViolation[] | undefined {
    const options = verifyTokenizerOptions(_options);

    const violations: TokenizerViolation[] = validateTokenizerInput(input);

    if (violations.length > 0) {
        if (options.optional === 'violations') return violations;
        if (options.optional) return undefined;
        throw new TokenizerError(violations);
    }

    let hostname: string | undefined;
    let port: number | string | undefined;
    let path: string[] | undefined;
    let name: string;
    let tag: string | undefined;
    let digest: string | undefined;

    let rest = input;

    const digestIdx = rest.lastIndexOf("@");
    if (digestIdx > 0) {
        digest = rest.slice(digestIdx + 1);
        rest = rest.slice(0, digestIdx);
    }

    const hostnameAndContext = rest.split("/");
    const lastComponentAndTag = hostnameAndContext.splice(hostnameAndContext.length - 1, 1)[0];
    const firstComponents: string[] = [];
    let lastComponent: string;

    const tagIdx = lastComponentAndTag.lastIndexOf(":");

    if (tagIdx > 0) {
        tag = lastComponentAndTag.slice(tagIdx + 1);
        lastComponent = lastComponentAndTag.slice(0, tagIdx);

    } else {
        lastComponent = lastComponentAndTag;
    }

    if (hostnameAndContext.length > 0) {
        const hostOrComponent = hostnameAndContext.splice(0, 1)[0];

        if (/[.:]/.test(hostOrComponent)) {
            const portIdx = hostOrComponent.lastIndexOf(":");

            if (portIdx > 0) {
                port = hostOrComponent.slice(portIdx + 1);
                hostname = hostOrComponent.slice(0, portIdx);

            } else {
                hostname = hostOrComponent;
            }

        } else if (hostOrComponent === "localhost") {
            hostname = hostOrComponent;

        } else {
            firstComponents.push(hostOrComponent);
        }

        hostnameAndContext.forEach(c => firstComponents.push(c));
    }

    path = firstComponents.length > 0 ? firstComponents : undefined;
    name = lastComponent;

    const result = {
        input,
        hostname,
        port,
        path,
        name,
        tag,
        digest,
    };

    if (options.mode === 'strict') {
        const violations = validateTokens(result, options);

        if (violations.length > 0) {
            if (options.optional === 'violations') return violations;
            if (options.optional) return undefined;
            throw new TokenizerError(violations);
        }
    }

    return result;
}

export function validateTokenizerInput(input: string): TokenizerViolation[] {
    const violations: TokenizerViolation[] = [];

    if (!input) {
        violations.push({
            ...tokenViolationBase,
            key: "input",
            message: "A Docker Image Reference string cannot be null-ish or empty.",
        });
    }

    return violations;
}

export function validateTokens(tokens: DockerImageNameTokens, _options?: Partial<TokensValidationOptions>): TokenizerViolation[] {
    const options = verifyTokensValidationOptions(_options);

    const violations: TokenizerViolation[] = [];

    if (tokens.hostname !== undefined) {
        if (!tokens.hostname.match(tHostname)) {
            violations.push({
                ...tokenViolationBase,
                key: 'hostname',
                message: `Invalid hostname "${tokens.hostname}".`,
            });

            if (options.validate === 'some') return violations;
        }
    }

    if (tokens.port !== undefined) {
        let port: number | undefined;

        if (typeof tokens.port === 'string') {
            if (!tokens.port.match(tPortNumber)) {
                violations.push({
                    ...tokenViolationBase,
                    key: 'port',
                    message: `Port "${tokens.port}" does not have a valid number format.`,
                });

                if (options.validate === 'some') return violations;

            } else {
                port = parseInt(tokens.port);
            }

        } else {
            port = tokens.port;
        }

        if (port !== undefined && (port < 1 || port > 65535)) {
            violations.push({
                ...tokenViolationBase,
                key: 'port',
                message: `Port value must be between 1 and 65535, got ${port}.`,
            });

            if (options.validate === 'some') return violations;
        }
    }

    if (tokens.path !== undefined) {
        tokens.path.some((n, i, a) => {
            if (!n.match(tComponent)) {
                violations.push({
                    ...tokenViolationBase,
                    key: "path",
                    index: i,
                    message: `Invalid path component "${n}" at index ${i} in "${a.join("/")}".`,
                });

                if (options.validate === 'some') return true;
            }
        });

        if (options.validate === 'some') return violations;
    }

    if (!tokens.name) {
        violations.push({
            ...tokenViolationBase,
            key: "name",
            message: `Name cannot be null-ish or empty.`,
        });

        if (options.validate === 'some') return violations;

    } else if (!tokens.name.match(tComponent)) {
        violations.push({
            ...tokenViolationBase,
            key: "name",
            message: `Invalid name "${tokens.name}".`,
        });

        if (options.validate === 'some') return violations;
    }

    if (tokens.tag !== undefined) {
        if (!tokens.tag.match(tTag)) {
            violations.push({
                ...tokenViolationBase,
                key: "tag",
                message: `Invalid tag "${tokens.tag}".`,
            });

            if (options.validate === 'some') return violations;
        }
    }

    if (tokens.digest !== undefined) {
        if (!tokens.digest.match(tDigest)) {
            violations.push({
                ...tokenViolationBase,
                key: "digest",
                message: `Invalid digest "${tokens.digest}".`,
            });

            if (options.validate === 'some') return violations;
        }
    }

    return violations;
}

export function stringifyTokens(tokens: DockerImageNameTokens): string {
    const host = tokens.hostname ? `${tokens.hostname}${tokens.port ? `:${tokens.port}` : ''}/` : '';
    const path = tokens.path ? `${tokens.path.join("/")}/` : '';
    const tag = tokens.tag ? `:${tokens.tag}` : '';
    const digest = tokens.digest ? `@${tokens.digest}` : '';

    return `${host}${path}${tokens.name}${tag}${digest}`;
}
