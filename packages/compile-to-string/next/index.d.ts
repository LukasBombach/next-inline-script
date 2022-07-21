import type { VFC } from 'react';

type ScriptImport<P> = Promise<{
  getScriptProps: (props: P) => void;
}>;

/**
 * Accepts an import() statement to a file, compiles it and returns a react
 * component that renders the compiled sources as an inline <script> tag
 *
 * This happens compile time, when your bundle gets created and will not
 * inject any compilation code in your bundle
 *
 * You should export a function called `getScriptProps(props)` which will
 * receive the props of the generated script at runtime
 *
 * The props that `getScriptProps` receives have to be serialzable by
 * JSON.stringify
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#description
 *
 * @todo make `getScriptProps` optional
 * @todo typeguard props with serializable data
 * @todo type Props = Record<string, boolean | string | number | null>;
 */
export function createInlineScript<P = Record<string, never>>(scriptImport: ScriptImport<P>): VFC<P>;
