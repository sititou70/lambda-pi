import { Name, Value } from "./types";

export const vfree = (name: Name): Value => ["VNeutral", ["NFree", name]];

export const vapp =
  (v1: Value) =>
  (v2: Value): Value => {
    if (v1[0] === "VLam") {
      const [_, func] = v1;
      return func(v2);
    }
    if (v1[0] === "VStar") {
      throw { msg: "illgal application: v1 is VSter", v1, v2 };
    }
    if (v1[0] === "VPi") {
      throw { msg: "illgal application: v1 is VPi", v1, v2 };
    }
    if (v1[0] === "VNat") {
      throw { msg: "illgal application: v1 is VNat", v1, v2 };
    }
    if (v1[0] === "VZero") {
      throw { msg: "illgal application: v1 is VZero", v1, v2 };
    }
    if (v1[0] === "VSucc") {
      throw { msg: "illgal application: v1 is VSucc", v1, v2 };
    }
    if (v1[0] === "VEq") {
      throw { msg: "illgal application: v1 is VEq", v1, v2 };
    }
    if (v1[0] === "VRefl") {
      throw { msg: "illgal application: v1 is VRefl", v1, v2 };
    }
    if (v1[0] === "VNeutral") {
      const [_, neutral] = v1;
      return ["VNeutral", ["NApp", neutral, v2]];
    }

    return v1 satisfies never;
  };
