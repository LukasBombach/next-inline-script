import { createInlineScript } from "next-inline-script";

const HelloWorld = createInlineScript(import("../head/helloWorld"));
const WithProps = createInlineScript(import("../head/withProps"));
const WithoutExports = createInlineScript(import("../head/withoutExport"));

export default function Web() {
  return (
    <div>
      <h1>Web</h1>
      <HelloWorld />
      <WithProps message="hello my message" />
      <WithoutExports />
    </div>
  );
}
