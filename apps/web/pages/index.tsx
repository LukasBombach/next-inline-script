import Head from "next/head";
import { createInlineScript } from "next-inline-script";

const HelloWorld = createInlineScript(import("../head/helloWorld"));
// const WithProps = createInlineScript(import("../head/withProps"));
const WithoutExports = createInlineScript(import("../head/withoutExport"));

export default function Web() {
  return (
    <div>
      <Head>
        <HelloWorld />
        {/* <WithProps message="hello my message" /> */}
        <WithoutExports />
      </Head>
      <h1>Web</h1>
    </div>
  );
}
