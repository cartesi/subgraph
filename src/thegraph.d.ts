export interface Schema {
    file: string;
}

export interface Source {
    address: string;
    abi: string;
    startBlock?: number;
}

export interface Abi {
    name: string;
    file: string;
}

export interface EventHandler {
    event: string;
    handler: string;
}

export interface CallHandler {
    function: string;
    handler: string;
}

export interface BlockFilter {
    kind: string;
}

export interface BlockHandler {
    function: string;
    filter?: BlockFilter;
}

export interface Mapping {
    kind: string;
    apiVersion: string;
    language: string;
    entities: string[];
    abis: Abi[];
    eventHandlers: EventHandler[];
    callHandlers: CallHandler[];
    blockHandlers: BlockHandler[];
    file: string;
}

export interface DataSource {
    kind: string;
    name: string;
    network: string;
    source: Source;
    mapping: Mapping;
}

export interface SubgraphManifest {
    specVersion: string;
    description?: string;
    repository?: string;
    schema?: Schema;
    dataSources?: DataSource[];
}
