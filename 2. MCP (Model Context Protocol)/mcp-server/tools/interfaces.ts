import type { ZodRawShape } from "zod";

export interface Tool {
    function: (args: any) => any,
    declaration: {
        name: string,
        description: string,
        parameters?: ZodRawShape
    }
}