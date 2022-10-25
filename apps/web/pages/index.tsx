import Head from "next/head";
import { A } from "../components/A";
import { InlineScript } from "next-inline-script";

import type { ReactElement } from "react";

// function InlineScript(props: { src: string }): ReactElement<JSX.IntrinsicElements["script"], "script"> {}

export default function Web() {
  return (
    <div>
      {/* <A /> */}
      {/* <InlineScript src="../../apps/web/scripts/helloWorld" /> */}
      <A />
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
