import 'jest';

import { testTokens } from './detail/tokens';
import { parse, stringify, DockerImageNameError } from '../src';

describe('parser.parse', () => {
    const makeItMessage = (tkConfig: any) => `expects ${tkConfig.which} input for "${tkConfig.name}" to ${tkConfig.valid ? "succeed" : "fail"}`;

    describe('no-option call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const action = () => parse(tkConfig.input);

                if (tkConfig.valid) {
                    expect(action()).toMatchObject(tkConfig.parsed);
                } else {
                    expect(action).toThrow(DockerImageNameError);
                }
            });
        });
    });

    describe('optional call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const action = () => parse(tkConfig.input, { optional: true });

                if (tkConfig.valid) {
                    expect(action()).toMatchObject(tkConfig.parsed);
                } else {
                    expect(action()).toEqual(undefined);
                }
            });
        });
    });

    describe('optional-violations call', () => {
        testTokens.forEach(tkConfig => {
            it(makeItMessage(tkConfig), () => {
                const action = () => parse(tkConfig.input, { optional: "violations" });

                if (tkConfig.valid) {
                    expect(action()).toMatchObject(tkConfig.parsed);
                } else {
                    const value: any = action();
                    expect(value).toBeInstanceOf(Array);
                    expect(value.length).toBeGreaterThan(0);
                }
            });
        });
    });
});

describe('parser.stringify', () => {
    describe('no-option call', () => {
        testTokens.forEach(tkConfig => {
            it(`expects ${tkConfig.which} input "${tkConfig.name}" to serialize properly`, () => {
                expect(stringify(tkConfig.parsed)).toBe(tkConfig.stringified);
            });
        });
    });
});
