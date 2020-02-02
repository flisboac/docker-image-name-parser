import {
    TokensValidationMode,
    TokenizerMode,
    TokenizerOptions,
    TokensValidationOptions,
    TokenizerViolation,
    ParserOptions,
} from "../types";

export const tokenViolationBase: Pick<TokenizerViolation, "valid" | "type"> = { valid: false, type: "token" };

const tHostnameComponent = "([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9])";
export const tHostname = new RegExp(`${tHostnameComponent}(\\.${tHostnameComponent})*`);

export const tPortNumber = /[0-9]+/;

const tComponentAlphaNumeric = "[a-z0-9]+";
const tComponentSeparator = "([_.]|__|[-]*)";
export const tComponent = new RegExp(`${tComponentAlphaNumeric}(${tComponentSeparator}(${tComponentAlphaNumeric})*)?`);

export const tTag = /[\w][\w.-]{0,127}/;

const tDigestAlgorithmSeparator = "[+.-_]"
const tDigestAlgorithmComponent = "([A-Za-z][A-Za-z0-9]*)";
const tDigestHex = "[0-9a-fA-F]{32,}";
const tDigestAlgorithm = `${tDigestAlgorithmComponent}(${tDigestAlgorithmSeparator}${tDigestAlgorithmComponent})?`;
export const tDigest = new RegExp(`${tDigestAlgorithm}:${tDigestHex}`);

const defaultValidate: TokensValidationMode = 'all';
const defaultMode: TokenizerMode = 'strict';

export const officialHostnames = {
    "v2": [ "index.docker.io" ],
};
export const officialPath: string[] = ['library'];
export const sOfficialPath: string = officialPath.join("/");

export function verifyTokenizerOptions(options: Partial<TokenizerOptions> | undefined): TokenizerOptions {
    options = options || {};

    return {
        mode: options.mode || defaultMode,
        validate: options.validate || defaultValidate,
        optional: options.optional !== undefined ? options.optional : false,
    };
}

export function verifyParserOptions(options: Partial<ParserOptions> | undefined): ParserOptions {
    options = options || {};

    return {
        ...verifyTokenizerOptions(options),
    };
}

export function verifyTokensValidationOptions(options: Partial<TokensValidationOptions> | undefined): TokensValidationOptions {
    options = options || {};

    return {
        validate: options.validate || defaultValidate,
    };
}
