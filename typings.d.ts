declare module "base32-encode" {
  type Variant = "RFC3548" | "RFC4648" | "RFC4648-HEX" | "Crockford";
  function encode(buffer: ArrayBuffer, variant: Variant): string;
  namespace encode {}
  export = encode;
}

declare module "base32-decode" {
  type Variant = "RFC3548" | "RFC4648" | "RFC4648-HEX" | "Crockford";
  function decode(input: string, variant: Variant): ArrayBuffer;
  namespace decode {}
  export = decode;
}
