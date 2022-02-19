import * as handlebars from "handlebars";

export default function registerHelpers(): void {
    handlebars.registerHelper("eq", (a, b) => a === b);
}
