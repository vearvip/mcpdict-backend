
// @ts-ignore
import dbClient from "./mcpdict.db" with { "type": "sqlite" };
// @ts-ignore
import subDbClient from "./sub_mcpdict.db" with { "type": "sqlite" };


export { dbClient, subDbClient };