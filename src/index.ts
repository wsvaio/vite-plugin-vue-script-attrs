import { PluginOption } from "vite";

const generate = (content: string, code: string, lang?: string) => `
<script${lang}>export default { ${content} }</script><!-- generate by vite-plugin-vue-script-attrs -->
${code}
`;

const RE = (pattern: string, flags?: string) => new RegExp(pattern, flags);

const getAttribute = (raw: string, key: string): string | undefined => (raw.match(RE(`${key}=?\"(.*?)\"`, "ims")) || [])[1];
const rmAttribute = (raw: string, ...keys: string[]) => {
  keys.forEach(key => raw = raw.replace(RE(`${key}=?\"(.*?)\" ?`, "imgs"), ""));
  return raw;
};

export default ({ attrNames = ["name"], autoName = false } = {}): PluginOption => ({
  name: "vite-plugin-vue-script-attrs",
  enforce: "pre",
  transform(code, id) {
    if (!id.toLowerCase().endsWith(".vue")) return;

    const matches = code.match(/<script[^>/]*?>/imgs);
    const matched = matches?.find(item => item.includes("setup"))?.replace(/<script|>/imgs, "");
    if (!matches || !matched || matches.length > 2) return;

    let name = getAttribute(matched, "name");
    if (autoName && !name && id.toLowerCase().endsWith("index.vue")) {
      name = id.split(/[\\/]/).reverse()[1];
      attrNames.includes("name") || attrNames.push("name");
    }

    const setupAttr = rmAttribute(matched, ...attrNames);
    code = code.replace(/<script[^/>]*?setup[^/>]*?>/ims, `<script${setupAttr}>`);

    const content = attrNames.map(key => {
      let val: string | undefined | boolean = getAttribute(matched, key);
      if (!val) return;
      val = val == "true" ? true : val == "false" ? false : val;
      typeof val == "string" && (val = `"${val}"`);
      return `${key}: ${val}`;
    }).filter(item => item).join(", ");

    let lang = getAttribute(matched, "lang");
    lang = lang ? ` lang="${lang}"` : "";

    if (content) return generate(content, code, lang);
  }
});