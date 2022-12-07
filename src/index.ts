import { PluginOption } from "vite";

const generate = (content: string, code: string, lang?: string) => `
<script${lang}>export default { ${content} }</script><!-- generate by vite-plugin-vue-script-attrs -->
${code}
`;

const scriptTagAttrToObject = (raw: string) => {
  const result: Record<string, string | boolean> = {};
  raw.replace(/(<script)|[>'"]/img, "")
    .split(/\s+/mg)
    .slice(1)
    .forEach(item => {
      const [key, val = true] = item.split("=");
      result[key] = val === "true" ? true : val === "false" ? false : val;
    });
  return result;
}

const objectToScriptTagAttr = <T extends object>(raw: T, exclude = [] as string[]) =>
  Object.entries(raw).filter(([key, val]) => !exclude.includes(key))
    .map(([key, val]) => val === true ? key : `${key}="${val}"`)
    .join(" ");

const objectToString = <T extends object>(raw: T, include = [] as string[]) =>
  Object.entries(raw).filter(([key, val]) => include.includes(key))
    .map(([key, val]) => typeof val == "boolean" ? `${key}: ${val}` : `${key}: "${val}"`)
    .join(", ");

export default ({ attrNames = ["name"], autoName = false } = {}): PluginOption => {

  return {
    name: "vite-plugin-vue-script-attrs",
    enforce: "pre",
    transform(code, id) {
      if (!id.toLowerCase().endsWith(".vue")) return;

      const matches = code.match(/<script[^>/]*?>/imgs);
      const matched = matches?.find(item => item.includes("setup"));
      if (!matches || !matched || matches.length > 2) return;

      const attr = scriptTagAttrToObject(matched);
      if (autoName && !attr.name && id.toLowerCase().endsWith("index.vue")) {
        attr.name = id.split(/[\\/]/).reverse()[1];
        attrNames.includes("name") || attrNames.push("name");
      }

      let setupAttr = objectToScriptTagAttr(attr, attrNames);
      setupAttr = setupAttr ? ` ${setupAttr}` : "";
      code = code.replace(/<script[^/>]*?setup[^/>]*?>/ims, `<script${setupAttr}>`);
      const content = objectToString(attr, attrNames);
      const lang = attr.lang ? ` lang=${attr.lang}` : ""

      console.log(generate(content, code, lang));
      if (content) return generate(content, code, lang);
    }
  }
}