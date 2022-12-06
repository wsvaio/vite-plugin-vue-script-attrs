import { PluginOption } from "vite";

const generate = (content: string) => `
<!-- vite-plugin-vue-script-attrs generate start -->
<script>export default { ${content} }</script>
<!-- vite-plugin-vue-script-attrs generate end -->
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

      const setupAttrText = attrs.filter(item => attrNames.every(sub => !item.startsWith(sub))).join(" ");
      code = code.replace(/<script[^/>]*?setup[^/>]*?>/ims, `<script ${setupAttrText}>`);

      const generateContent = attrs.filter(item => attrNames.some(sub => item.startsWith(sub) && item.includes("=")))
        .map(item => item.replace("=", ": "))
        .join(", ");
      return generate(generateContent) + code;
    }
  }
}