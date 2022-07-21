# next-inline-script

Importing a file with `createInlineScript`

```tsx
// index.tsx

import Head from "next/head";
import { createInlineScript } from "next-inline-script";

const HelloWorld = createInlineScript(import("./helloWorld"));

export default function Page() {
  return (
    <>
      <h1>Next Inline Script Demo</h1>
      <Head>
        <HelloWorld message="hello my message" />
      </Head>
    </>
  );
}
```

which exports a function that can take props

```ts
// helloWorld.ts

export default function helloWorld(props: { message: string }): void {
  console.log(props.message);
}
```

will compile `helloWorld.ts` and render it **_inline_** in the `<head>` section of your document

```html
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width" />
    <meta charset="utf-8" />
    <script>
      (function helloWorld(props) {
        console.log(props.message);
      })({ message: "hello my message" });
    </script>
  </head>
  <body></body>
</html>
```

## Why

This code gets executed before react or next js has loaded. It is not a silver bullet, inline JavaScript is render
blocking, but there are situations where this is critical. With this plugin you get a tool to design your loading
strategy and an execution order.

- You need to initialize (complex) third party code
- You need exucute code with high priority
- You need to run code synchronously

## Intellisense and TypeScript support

Using next js' built inline script features, you need to write code as a string, which makes debugging and
testing _really_ difficult. Using this plugin you get full IDE and TS integration, including type-safety of
the props of the generated React component and its data.

## Features

- uses code splitting to separate your inline code from your main bundle, so your main bundle will not grow in size
- uses next's compiler with all its settings. Any plugin you use will also be available in the inline code
- code will be rendered at compile time, props will be injected at run time, so you can use dynamic data in your inline code

## Documentaion

Add `next-inline-script/plugin` to your next config

```js
// next.config.js

const withCompileToString = require("next-inline-script/plugin");

module.exports = withCompileToString({
  reactStrictMode: true,
});
```

Create a file that exports a function as default

```ts
// myScript.ts

export default function myScript(props: { message: string }): void {
  console.log(props.message);
}
```

Anywhere in your next js project pass an import statement to `createInlineScript` to create a react Component
that will render the compiled source of that file in a `<script>` tag.

```tsx
import { createInlineScript } from "next-inline-script";

const MyScript = createInlineScript(import("./myScript"));

const MyComponent = () => <MyScript message="my message" />;
```

Rendering `<MyScript message="my message" />` will give you this code:

```html
<script>
  (function myScript(props) {
    console.log(props.message);
  })({ message: "hello my message" });
</script>
```

Your code will get transpiled and inlined and the props of the JSX declaration (`message="my message"`) will
be stringified using `JSON.stringify` and passed to your function.

This means any data that can be serialized with `JSON.stringify` can be passed to the your code.

## Compile time and Run Time

Your code will be transpiled at compile time

```js
(function myScript(props) {
  console.log(props.message);
});
```

but the props will get rendered at run time

```js
(/* function myScript(props) {
  console.log(props.message);
} */)({ message: "hello my message" });
```

This has a big advantage:

Lets say you need to initialze some third party library, like ads, tracking or consent. For the initilization you
often need to use data that you do not know at compile time, but only at run time. By passing in that data as props
instead of hard-coded values in your script, you can _have your cake and eat it too_!

## State

## Quirks

You need to pass an import statement to the `createInlineScript` function. This is to enable IDE and TS support,
but this also comes with an _obligation_ to do this, you can't just us a path as a string, for instance.

You also _need_ a default export which has to be a function. This issue can be resolved, which will happen at
some point.

### Test suite

While this repo does not contain unit-tests yet, this plugin is implicitly unit-tested and battle tested at [t-online.de](https://t-online.de),
Germany's largest news website with millions of users. A test suit will follow as I complete the library.
