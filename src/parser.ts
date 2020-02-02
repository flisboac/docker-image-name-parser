import { tokenize, validateTokens } from './tokenizer';
import { verifyParserOptions, officialHostnames, sOfficialPath } from './detail/constants';

import {
    ParserOptions,
    DockerImageName,
    AnyViolation,
    DockerImageNameTokens,
    Violation,
    ParserViolation,
} from "./types";
import { DockerImageNameError } from './error';

export class ParserError extends DockerImageNameError {
    constructor(
        public readonly violations: Violation[],
        message?: string
    ) {
        super(message || (
            !violations || violations.length === 0 ? 'A parser error ocurred.'
            : violations.length === 1 ? `Parser error: ${violations[0].message}`
            : `Multiple parser violation errors occured. First error: ${violations[0].message}`
        ));
    }
}

export function parse(input: string | DockerImageNameTokens): DockerImageName;
export function parse(input: string | DockerImageNameTokens, options: Partial<ParserOptions>): DockerImageName;
export function parse(input: string | DockerImageNameTokens, options: Partial<ParserOptions> & { optional: true }): DockerImageName | undefined;
export function parse(input: string | DockerImageNameTokens, options: Partial<ParserOptions> & { optional: 'violations' }): DockerImageName | AnyViolation[];
export function parse(input: string | DockerImageNameTokens, _options?: Partial<ParserOptions>): DockerImageName | AnyViolation[] | undefined {
    const options = verifyParserOptions(_options);

    const { tokens, violations } = coerceToTokens(input, options);

    const processViolations = (): undefined | AnyViolation[] => {
        if (options.optional === 'violations') return violations;
        if (options.optional) return undefined;
        throw new ParserError(violations);
    }

    if (!tokens) {
        return processViolations();
    }

    const hostname = tokens.hostname || options.defaultHostname;
    let port = typeof tokens.port === 'string' ? parseInt(tokens.port) : tokens.port;

    if (port === undefined) {
        port = options.defaultPort;
    }

    const sPort = port !== undefined ? `:${port}` : '';

    let official: boolean;
    let remoteName: string;
    let canonicalName: string;
    let localName: string;
    let protocol: string | undefined;
    let host: string;
    let tag: string | undefined;
    let digest: string | undefined;

    const officialV2Hostnames = officialHostnames.v2;
    official = tokens.hostname === undefined || officialV2Hostnames.some(h => h === hostname);

    const tokensPath = tokens.path && tokens.path.length > 0 ? `${tokens.path.join("/")}/`: '';
    const defaultOfficialPath = sOfficialPath ? `${sOfficialPath}/` : '';

    if (official) {
        protocol = "https";
        host = officialV2Hostnames[0];
        port = undefined;
        remoteName = `${tokensPath || defaultOfficialPath}${tokens.name}`;
        localName = `${tokensPath}${tokens.name}`;
        canonicalName = `${host}/${tokensPath}${tokens.name}`;

    } else if (hostname) {
        host = `${hostname}${sPort}`;
        remoteName = `${tokensPath}${tokens.name}`;
        localName = `${host}/${tokensPath}${tokens.name}`;
        canonicalName = localName;

    } else {
        const violation: ParserViolation = {
            type: "part",
            valid: false,
            key: "host",
            message: "Missing hostame.",
        };

        violations.push(violation);
        return processViolations();
    }

    digest = tokens.digest;
    tag = tokens.tag !== undefined ? tokens.tag : digest === undefined ? 'latest' : undefined;

    const name: DockerImageName = {
        tokens,
        official,
        remoteName,
        canonicalName,
        localName,
        protocol,
        host,
        port,
        tag,
        digest,
    };

    return name;
}

export function stringify(input: DockerImageName): string {
    const name = input.canonicalName;
    const tag = input.tag !== undefined ? `:${input.tag}` : '';
    const digest = input.digest !== undefined ? `@${input.digest}` : '';

    return `${name}${tag}${digest}`;
}

function coerceToTokens(
    input: string | DockerImageNameTokens,
    options: Partial<ParserOptions>,
): {
    tokens?: DockerImageNameTokens;
    violations: AnyViolation[];
} {

    if (typeof input === 'object') {
        if (options.mode === 'fast') {
            return { tokens: input, violations: [] };
        }

        return { tokens: input, violations: validateTokens(input, options) };
    }

    const tokenizeResults = tokenize(input, options);

    if (Array.isArray(tokenizeResults)) {
        return { violations: tokenizeResults };
    }

    return { tokens: tokenizeResults, violations: [] };
}
