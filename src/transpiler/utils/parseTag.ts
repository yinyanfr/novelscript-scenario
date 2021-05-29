// @tagName ...fixedParameterValues [...optionalParameterName=value]

import { OptionalParameter, ScenarioParser, TagExtract } from "../../types";
import parseLine from "./parseLine";

const LineTags = [
    "print",
    "push",
]

const parseTag: ScenarioParser<TagExtract> = (input) => {
    let tag = ""
    let fixed = <string[]>[]
    let optional = <OptionalParameter[]>[]

    const tagMatch = input.match(/^@[^ ]+/)

    // grammar sugar
    if (!tagMatch) {
        if (!input.replace(/[ \t\r]/g, "").length) {
            return {
                tag: "next",
            }
        }
        else {
            return {
                tag: "print",
                params: {
                    fixed: parseLine(input)
                },
            }
        }
    }

    tag = tagMatch[0].replace(/^@/, "")
    if (LineTags.includes(tag)) {
        return {
            tag,
            params: {
                fixed: parseLine(input)
            },
        }
    }

    // TODO




    return {
        tag,
        params: {
            fixed,
            optional,
        }
    }
}

export default parseTag
