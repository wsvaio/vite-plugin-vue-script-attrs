import { PluginOption } from "vite";

const generate = (content: string, code: string, lang?: string) => `
<script${lang ? " " + lang : ""}>export default { ${content} }</script><!-- generate by vite-plugin-vue-script-attrs -->
${code}
`;

export default ({ attrNames = ["name"] } = {}): PluginOption => {

  return {
    name: "vite-plugin-vue-script-attrs",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith(".vue")) return;

      const matches = code.match(/<script[^>/]*?>/imgs);
      const matched = matches?.find(item => item.includes("setup"));
      if (!matched) return;

      const attrs = matched.replace(/(<script)|>/img, "")
        .split(/\s+/mg)
        .slice(1)
      const langText = attrs.find(item => item.startsWith("lang"));
      const setupAttrText = attrs.filter(item => attrNames.every(sub => !item.startsWith(sub))).join(" ");
      code = code.replace(/<script[^/>]*?setup[^/>]*?>/ims, `<script ${setupAttrText}>`);

      const generateContent = attrs.filter(item => attrNames.some(sub => item.startsWith(sub) && item.includes("=")))
        .map(item => item.replace("=", ": "))
        .join(", ")
        .replace(/["']((true)|(false))["']/imgs, "$1");

      if (generateContent) return generate(generateContent, code, langText);
    }
  }
}