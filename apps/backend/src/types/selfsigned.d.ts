declare module "selfsigned" {
  type Attribute = { name: string; value: string };
  type AltName = { type: number; value: string };
  type Extension = { name: string; altNames?: AltName[] };
  type Options = {
    days?: number;
    keySize?: number;
    extensions?: Extension[];
  };
  type SelfSignedResult = {
    private: string;
    public: string;
    cert: string;
  };
  function generate(attrs: Attribute[], options?: Options): SelfSignedResult;
  export default { generate };
}
