import path from "path";
import { promises as fs } from "fs";
import webpack from "webpack";
import { name } from "../package.json";

const pluginDir = path.join(__dirname, "js");
const outputDir = path.join(pluginDir, "output");

describe("jest setup", () => {
  test("works", async () => {
    const entryFile = path.join(pluginDir, "entry1.js");
    const outputFile = path.join(outputDir, "entry1.js");

    const compiler = webpack({
      mode: "development",
      entry: entryFile,
      output: {
        path: outputDir,
      },
      module: {
        rules: [
          {
            test: /\.(jsx|js|tsx|ts)$/,
            exclude: /node_modules/,
            use: `${name}/webpack/cheap-replace-loader.js`,
          },
        ],
      },
    });

    await fs.writeFile(entryFile, "console.log('hello world');", "utf-8");

    await new Promise<void>((resolve, reject) => compiler.run(err => (err ? reject(err) : resolve())));

    expect(entryFile).toBe(outputFile);
  });
});
