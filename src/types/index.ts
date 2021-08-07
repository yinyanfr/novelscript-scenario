export interface LineExtract {
    speaker?: string | null
    status?: string | null
    text: string
}

export interface OptionalParameter {
    name: string
    value: string
}

export interface TagExtract {
    tag: string
    params?: {
        fixed?: string[] | LineExtract
        optional?: OptionalParameter[]
    }
}

export interface BlockExtract {
    name: string
    contents: TagExtract[]
}

export interface ScenarioParser<Extract> {
    (input: string): Extract
}
