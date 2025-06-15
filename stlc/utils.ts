import { Name, Value } from "./types";

export const vfree = (name: Name): Value => ["VNeutral", ["NFree", name]];

export const vapp =
  (v1: Value) =>
  (v2: Value): Value => {
    if (v1[0] === "VLam") {
      const func = v1[1];
      return func(v2);
    }
    if (v1[0] === "VNeutral") {
      const neutral = v1[1];
      return ["VNeutral", ["NApp", neutral, v2]];
    }

    return v1 satisfies never;
  };
