import 'jest';

import { testTokens } from './detail/tokens';
import { tokenize, TokenizerError, stringifyTokens, validateTokens } from '../src';

describe('tokenizer.tokenize', () => {
    const makeItMessage = (tkConfig: any) => `expects ${tkConfig.which} input "${tkConfig.name}" to ${tkConfig.valid ? "succeed" : "fail"}`;

    describe('no-option call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const action = () => tokenize(tkConfig.input);

                if (tkConfig.valid) {
                    expect(action()).toMatchObject(tkConfig.parsed.tokens);
                } else {
                    expect(action).toThrowError(TokenizerError);
                }
            });
        });
    });

    describe('optional call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const value = tokenize(tkConfig.input, { optional: true });

                if (tkConfig.valid) {
                    expect(value).toMatchObject(tkConfig.parsed.tokens);
                } else {
                    expect(value).toEqual(undefined);
                }
            });
        });
    });

    describe('optional-violations call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const value: any = tokenize(tkConfig.input, { optional: "violations" });

                if (tkConfig.valid) {
                    expect(value).toMatchObject(tkConfig.parsed.tokens);
                } else {
                    expect(value).toBeInstanceOf(Array);
                    expect(value.length).toBeGreaterThan(0);
                }
            });
        });
    });
});

describe('tokenizer.validateTokens', () => {
    describe('no-option call', () => {
        testTokens.forEach(tkConfig => {
            it(`expects ${tkConfig.which} input "${tkConfig.name}" to ${tkConfig.valid ? "succeed" : "fail"}`, () => {
                const value = validateTokens(tkConfig.parsed.tokens);
                expect(value).toBeInstanceOf(Array);

                if (tkConfig.valid) {
                    expect(value.length).toEqual(0);
                } else {
                    expect(value.length).toBeGreaterThan(0);
                }
            });
        });
    });
});

describe('tokenizer.stringifyTokens', () => {
    describe('no-option call', () => {
        testTokens.forEach(tkConfig => {
            it(`expects ${tkConfig.which} input "${tkConfig.name}" to serialize properly`, () => {
                expect(stringifyTokens(tkConfig.parsed.tokens)).toBe(tkConfig.input);
            });
        });
    });
});
