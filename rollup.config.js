import typescript from "@rollup/plugin-typescript";

export default {
  input: "./src/index.ts",
  plugins: [typescript({ tsconfig: "./tsconfig.json" })],
  output: {
    file: "./dist/index.js",
    format: "esm",
    sourcemap: true,
  },
};
