import { name } from "./package.json";

export default {
  base: `/${name}/`,
  build: {
    outDir: `../dist/${name}`,
  },
};
