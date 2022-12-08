import { PluginOption } from "vite";

const generate = (exportRaw: string, code: string, lang?: string) => `
<script${lang ? ` lang=${lang}` : ""}>export default { ${exportRaw} }</script><!-- generate by vite-plugin-vue-script-attrs -->
${code}
`;

const transferAttribute = (raw: string) => {
  const attributes = raw.match(/\".*?\"/imgs) || [];
  const transfered = attributes.map(item => [item, item.replace(/(>)/imgs, "\\$1")]);
  transfered.forEach(([searchValue, replaceValue]) => raw = raw.replace(searchValue, replaceValue));
  return raw;
}

const attrRawToMap = (raw: string) => {
  const result = new Map<string, string | boolean>();
  const re = /([^\s]+)\s*?=\s*?((?:\".*?\")|(?:\'.*?\'))/imgs;
  for (const [, key, val] of raw.matchAll(re))
    result.set(key, val);
  for (const [, key] of raw.replace(re, "").matchAll(/\s+([^\s]+)/imgs))
    result.set(key, true);
  return result;
}

const attrMapToRaw = (map: Map<string, string | boolean>) =>
  [...map.entries()].map(([key, val]) => val === true ? `${key}` : `${key}=${val}`).join(" ");

const getAttrVal = (map: Map<string, string | boolean>, key: string) => {
  let val = map.get(key);
  if (val) return val;
  val = map.get(":" + key);
  if (typeof val != "string") return val;
  console.log(val);
  return JSON.parse(val);
}

const exportMapToRaw = (map: Map<string, string | boolean>) =>
  [...map.entries()].map(([key, val]) => {
    if (key.startsWith(":")) key = key.slice(1);
    return `${key}: ${val}`;
  }).join(", ");

export default ({ attrNames = ["name"], autoName = false } = {}): PluginOption => ({
  name: "vite-plugin-vue-script-attrs",
  enforce: "pre",
  transform(code, id) {
    if (!id.toLowerCase().endsWith(".vue")) return;

    const matches = transferAttribute(code).match(/<script.*?(?<!\\)>/imgs);
    let matched = matches?.find(item => item.includes("setup"))?.replace(/<script|(?<!\\)>/imgs, "");
    if (!matches || !matched || matches.length > 1) return;

    matched = matched.replace(/\\>/imgs, ">");
    const attrMap = attrRawToMap(matched);

    if (autoName && !attrMap.has("name") && id.toLowerCase().endsWith("index.vue")) {
      attrMap.set("name", id.split(/[\\/]/).reverse()[1]);
      attrNames.includes("name") || attrNames.push("name");
    }

    const exportMap = new Map();

    attrNames.forEach(key => {
      const val = getAttrVal(attrMap, key);
      if (val === undefined) return;
      exportMap.set(key, val);
      attrMap.delete(key);
    });

    const attrRaw = attrMapToRaw(attrMap);
    code = code.replace(matched, " " + attrRaw);
    const exportRaw = exportMapToRaw(exportMap);
    const lang = getAttrVal(attrMap, "lang");

    if (exportRaw) return generate(exportRaw, code, lang);
  }
});