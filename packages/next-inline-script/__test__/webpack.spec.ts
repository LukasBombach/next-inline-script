import path from "path";
import { promises as fs } from "fs";
import webpack from "webpack";
import { name } from "../package.json";

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
        path: outputPath("output"),
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

    await new Promise<void>((resolve, reject) => compiler.run(err => (err ? reject(err) : resolve())));

    expect(true).toBe(true);
  });
});
