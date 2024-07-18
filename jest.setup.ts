import { loadEnvironment } from "%/load-environment.ts";
import { TextDecoder, TextEncoder } from "util";

loadEnvironment();

// https://github.com/inrupt/solid-client-authn-js/issues/1676
global.TextEncoder = TextEncoder;
// @ts-expect-error -- i do not care
global.TextDecoder = TextDecoder;
