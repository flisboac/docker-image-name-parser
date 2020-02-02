import { DockerImageName, DockerImageNameTokens } from '../../src';

export interface BaseTestTokens extends DockerImageNameTokens {
    valid: boolean;
    official: boolean;
}

export interface TestTokens extends BaseTestTokens {
    which: string;
    parsed: DockerImageName & { tokens: DockerImageNameTokens };
    input: string;
    stringified: string;
}

const officialHostname = "index.docker.io";
const officialPath = "library";

const ubuntuLatestTokens: BaseTestTokens = {
    valid: true,
    official: true,
    path: ["my", "user"],
    name: "ubuntu",
    tag: "latest",
    digest: "sha256:8d31dad0c58f552e890d68bbfb735588b6b820a46e459672d96e585871acc110",
};

const customImageTokens: BaseTestTokens = {
    valid: true,
    official: false,
    hostname: "my.own-host.com.country",
    port: 1,
    path: ["some", "1long-long_veryLong", "pa__th"],
    name: "my.software-with__puncts",
    tag: "1.2354.42-rc123.45",
    digest: "sha256:8d31dad0c58f552e890d68bbfb735588b6b820a46e459672d96e585871acc110",
};

function createTokensVariations(ts: BaseTestTokens): TestTokens[] {
    const result: TestTokens[] = [];

    if (ts.official) {
        const path = ts.path!.join("/");

        { // official, no-path
            const parsedPayloadBase = {
                official: true,
                localName: ts.name,
                remoteName: `${officialPath}/${ts.name}`,
                canonicalName: `${officialHostname}/${ts.name}`,
                protocol: "https",
                host: officialHostname,
            };

            result.push({
                ...ts,
                which: "official-no-ref",
                input: ts.name,
                stringified: `${officialHostname}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, name: ts.name },
                    tag: 'latest',
                },
            });

            result.push({
                ...ts,
                which: "official-tag",
                input: `${ts.name}:${ts.tag}`,
                stringified: `${officialHostname}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, name: ts.name, tag: ts.tag },
                    tag: ts.tag,
                },
            });

            result.push({
                ...ts,
                which: "official-digest",
                input: `${ts.name}@${ts.digest}`,
                stringified: `${officialHostname}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, name: ts.name, digest: ts.digest },
                    digest: ts.digest,
                },
            });

            result.push({
                ...ts,
                which: "official-tag-digest",
                input: `${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${officialHostname}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, name: ts.name, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            });
        }

        { // official, with path
            const parsedPayloadBase = {
                official: true,
                localName: `${path}/${ts.name}`,
                remoteName: `${path}/${ts.name}`,
                canonicalName: `${officialHostname}/${path}/${ts.name}`,
                protocol: "https",
                host: officialHostname,
            };

            result.push({
                ...ts,
                which: "official-path-no-ref",
                input: `${path}/${ts.name}`,
                stringified: `${officialHostname}/${path}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: ts.path, name: ts.name },
                    tag: 'latest',
                },
            });

            result.push({
                ...ts,
                which: "official-path-tag",
                input: `${path}/${ts.name}:${ts.tag}`,
                stringified: `${officialHostname}/${path}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: ts.path, name: ts.name, tag: ts.tag },
                    tag: ts.tag,
                },
            });

            result.push({
                ...ts,
                which: "official-path-digest",
                input: `${path}/${ts.name}@${ts.digest}`,
                stringified: `${officialHostname}/${path}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: ts.path, name: ts.name, digest: ts.digest },
                    digest: ts.digest,
                },
            });

            result.push({
                ...ts,
                which: "official-path-tag-digest",
                input: `${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${officialHostname}/${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: ts.path, name: ts.name, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            });
        }

    } else {
        const path = ts.path!.join("/");
        const sPort = typeof ts.port === 'number' ? String(ts.port) : ts.port;
        const port = typeof ts.port === 'number' ? ts.port : parseInt(ts.port!);

        { // Hostname-only
            const parsedPayloadBase = {
                official: false,
                localName: `${ts.hostname}/${ts.name}`,
                remoteName: `${ts.name}`,
                canonicalName: `${ts.hostname}/${ts.name}`,
                host: ts.hostname!,
            };

            const noRefPayload = {
                ...ts,
                which: "hostname-no-ref",
                input: `${ts.hostname}/${ts.name}`,
                stringified: `${ts.hostname}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, name: ts.name },
                    tag: 'latest',
                },
            };

            const tagPayload = {
                ...ts,
                which: "hostname-tag",
                input: `${ts.hostname}/${ts.name}:${ts.tag}`,
                stringified: `${ts.hostname}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, name: ts.name, tag: ts.tag },
                    tag: ts.tag,
                },
            };

            const digestPayload = {
                ...ts,
                which: "hostname-digest",
                input: `${ts.hostname}/${ts.name}@${ts.digest}`,
                stringified: `${ts.hostname}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, name: ts.name, digest: ts.digest },
                    digest: ts.digest,
                },
            };

            const tagDigestPayload = {
                ...ts,
                which: "hostname-tag-digest",
                input: `${ts.hostname}/${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${ts.hostname}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, name: ts.name, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            };

            result.push(noRefPayload);
            result.push(tagPayload);
            result.push(digestPayload);
            result.push(tagDigestPayload);
        }

        { // hostname and port
            const parsedPayloadBase = {
                official: false,
                localName: `${ts.hostname}:${ts.port}/${ts.name}`,
                remoteName: `${ts.name}`,
                canonicalName: `${ts.hostname}:${ts.port}/${ts.name}`,
                host: `${ts.hostname}:${ts.port}`,
                port,
            };

            const noRefPayload = {
                ...ts,
                which: "hostname-port-no-ref",
                input: `${ts.hostname}:${ts.port}/${ts.name}`,
                stringified: `${ts.hostname}:${ts.port}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, port: sPort, name: ts.name },
                    tag: 'latest',
                },
            };

            const tagPayload = {
                ...ts,
                which: "hostname-port-tag",
                input: `${ts.hostname}:${ts.port}/${ts.name}:${ts.tag}`,
                stringified: `${ts.hostname}:${ts.port}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, port: sPort, name: ts.name, tag: ts.tag },
                    tag: ts.tag,
                },
            };

            const digestPayload = {
                ...ts,
                which: "hostname-port-digest",
                input: `${ts.hostname}:${ts.port}/${ts.name}@${ts.digest}`,
                stringified: `${ts.hostname}:${ts.port}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, port: sPort, name: ts.name, digest: ts.digest },
                    digest: ts.digest,
                },
            };

            const tagDigestPayload = {
                ...ts,
                which: "hostname-port-tag-digest",
                input: `${ts.hostname}:${ts.port}/${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${ts.hostname}:${ts.port}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { path: undefined, hostname: ts.hostname, port: sPort, name: ts.name, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            };

            result.push(noRefPayload);
            result.push(tagPayload);
            result.push(digestPayload);
            result.push(tagDigestPayload);
        }

        { // hostname and path
            const parsedPayloadBase = {
                official: false,
                localName: `${ts.hostname}/${path}/${ts.name}`,
                remoteName: `${path}/${ts.name}`,
                canonicalName: `${ts.hostname}/${path}/${ts.name}`,
                host: ts.hostname!,
            };

            const noRefPayload = {
                ...ts,
                which: "hostname-path-no-ref",
                input: `${ts.hostname}/${path}/${ts.name}`,
                stringified: `${ts.hostname}/${path}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, name: ts.name, path: ts.path },
                    tag: 'latest',
                },
            };

            const tagPayload = {
                ...ts,
                which: "hostname-path-tag",
                input: `${ts.hostname}/${path}/${ts.name}:${ts.tag}`,
                stringified: `${ts.hostname}/${path}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, name: ts.name, path: ts.path, tag: ts.tag },
                    tag: ts.tag,
                },
            };

            const digestPayload = {
                ...ts,
                which: "hostname-path-digest",
                input: `${ts.hostname}/${path}/${ts.name}@${ts.digest}`,
                stringified: `${ts.hostname}/${path}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, name: ts.name, path: ts.path, digest: ts.digest },
                    digest: ts.digest,
                },
            };

            const tagDigestPayload = {
                ...ts,
                which: "hostname-path-tag-digest",
                input: `${ts.hostname}/${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${ts.hostname}/${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, name: ts.name, path: ts.path, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            };

            result.push(noRefPayload);
            result.push(tagPayload);
            result.push(digestPayload);
            result.push(tagDigestPayload);
        }

        { // hostname, port and path
            const parsedPayloadBase = {
                official: false,
                localName: `${ts.hostname}:${ts.port}/${path}/${ts.name}`,
                remoteName: `${path}/${ts.name}`,
                canonicalName: `${ts.hostname}:${ts.port}/${path}/${ts.name}`,
                host: `${ts.hostname}:${ts.port}`,
                port,
            };

            const noRefPayload = {
                ...ts,
                which: "hostname-port-path-no-ref",
                input: `${ts.hostname}:${ts.port}/${path}/${ts.name}`,
                stringified: `${ts.hostname}:${ts.port}/${path}/${ts.name}:latest`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, port: sPort, name: ts.name, path: ts.path },
                    tag: 'latest',
                },
            };

            const tagPayload = {
                ...ts,
                which: "hostname-port-path-tag",
                input: `${ts.hostname}:${ts.port}/${path}/${ts.name}:${ts.tag}`,
                stringified: `${ts.hostname}:${ts.port}/${path}/${ts.name}:${ts.tag}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, port: sPort, name: ts.name, path: ts.path, tag: ts.tag },
                    tag: ts.tag,
                },
            };

            const digestPayload = {
                ...ts,
                which: "hostname-port-path-digest",
                input: `${ts.hostname}:${ts.port}/${path}/${ts.name}@${ts.digest}`,
                stringified: `${ts.hostname}:${ts.port}/${path}/${ts.name}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, port: sPort, name: ts.name, path: ts.path, digest: ts.digest },
                    digest: ts.digest,
                },
            };

            const tagDigestPayload = {
                ...ts,
                which: "hostname-port-path-tag-digest",
                input: `${ts.hostname}:${ts.port}/${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                stringified: `${ts.hostname}:${ts.port}/${path}/${ts.name}:${ts.tag}@${ts.digest}`,
                parsed: {
                    ...parsedPayloadBase,
                    tokens: { hostname: ts.hostname, port: sPort, name: ts.name, path: ts.path, tag: ts.tag, digest: ts.digest },
                    tag: ts.tag,
                    digest: ts.digest,
                },
            };

            result.push(noRefPayload);
            result.push(tagPayload);
            result.push(digestPayload);
            result.push(tagDigestPayload);
        }
    }

    return result;
}

// TODO Failures
export const testTokens: TestTokens[] = [
    ...createTokensVariations(ubuntuLatestTokens),
    ...createTokensVariations(customImageTokens),
];
