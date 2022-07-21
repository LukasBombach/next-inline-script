import Head from "next/head";
import { createInlineScript } from "next-inline-script";

const HelloWorld = createInlineScript(import("../head/helloWorld"));
const WithProps = createInlineScript(import("../head/withProps"));

export default function Web() {
  return (
    <div>
      <Head>
        <HelloWorld />
        <WithProps message="hello my message" />
      </Head>
      <h1>Next Inline Script Demo</h1>
      <ul>
        <li>Open the console to see the logs from the inline scripts</li>
        <li>
          View the source (usually <code>cmd</code> + <code>u</code>) code to see your scripts rendered in the head of
          your document
        </li>
      </ul>
    </div>
  );
}
