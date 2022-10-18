import path from "path";
import { promises as fs } from "fs";
import webpack from "webpack";
import { name } from "../package.json";

import type { StatsCompilation } from "webpack";

describe("jest setup", () => {
  test("works", async () => {
    const entryPath = (name: string, ext = "js") => path.join(__dirname, "js", `${name}.${ext}`);
    const outputPath = (name: string, ext = "js") => path.join(__dirname, "js", "output", `${name}.${ext}`);

    const files = {
      entry: `
        import { InlineScript } from "next-inline-script";
        const MyScript = () => <InlineScript src="./helloWorld.js" />;
      `,
      helloWorld: `
        console.log('hello world');
      `,
    };

    await Promise.all(
      Object.entries(files).map(async ([name, content]) => await fs.writeFile(entryPath(name), content))
    );

    const compiler = webpack({
      mode: "production",
      entry: entryPath("entry"),
      output: {
        path: path.join(__dirname, "js", "output"),
      },
      module: {
        rules: [
          {
            test: /\.(jsx|js|tsx|ts)$/,
            exclude: /node_modules/,
            use: `${name}/webpack/cheap-replace-loader.js`,
          },
          {
            test: /\.(jsx|js|tsx|ts)$/,
            exclude: /node_modules/,
            use: {
              loader: "babel-loader",
              options: {
                presets: ["@babel/preset-env", "@babel/preset-typescript", "@babel/preset-react"],
              },
            },
          },
        ],
      },
    });

    const stats = await new Promise<StatsCompilation>((resolve, reject) =>
      compiler.run(async (error, stats) => {
        try {
          const result = stats?.toJson();

          if (error) {
            throw error;
          }

          if (!result) {
            throw new Error(`No result, are are ${typeof stats}, result is ${typeof result}`);
          }

          if (result.warnings?.length) {
            result.warnings.forEach(warning => console.warn(warning.message));
          }

          if (result.errors?.length) {
            throw result.errors[0];
          }

          await new Promise<void>((resolve, reject) => compiler.close(error => (error ? reject(error) : resolve())));

          resolve(result);
        } catch (error) {
          reject(error);
        }
      })
    );

    expect(true).toBe(true);
  });
});
