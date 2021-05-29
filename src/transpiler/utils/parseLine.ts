// 连雨遥@急切：非洲农业不发达，必须要有金坷垃。

import { LineExtract, ScenarioParser } from "../../types";

const parseLine: ScenarioParser<LineExtract> = (input) => {
    let speaker = null
    let status = null
    let text = input

    const speakerMatch = input.split(/[:：]/g)
    if (speakerMatch.length > 1) {
        const match = speakerMatch[0]
        const statusMatch = match.split(/@/)
        if (statusMatch.length > 1) {
            speaker = statusMatch[0]
            status = statusMatch[1]
        }
        else {
            speaker = match
        }
        text = input.replace(/.*[:：]/, "")
    }

    return { speaker, status, text }
}

export default parseLine
