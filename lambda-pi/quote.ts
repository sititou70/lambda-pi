import { Name, Neutral, TermCheckable, TermInferable, Value } from "./types";
import { vfree } from "./utils";

export const quote =
  (index: number) =>
  (value: Value): TermCheckable => {
    if (value[0] === "VLam") {
      const [_, func] = value;
      return ["Lam", quote(index + 1)(func(vfree(["Quote", index])))];
    }
    if (value[0] === "VStar") {
      return ["Inf", ["Star"]];
    }
    if (value[0] === "VPi") {
      const exp1 = value[1];
      const exp2 = value[2];
      return [
        "Inf",
        [
          "Pi",
          quote(index)(exp1),
          quote(index + 1)(exp2(vfree(["Quote", index]))),
        ],
      ];
    }
    if (value[0] === "VNeutral") {
      const neutral = value[1];
      return ["Inf", neutralQuote(index)(neutral)];
    }
    if (value[0] === "VNat") {
      return ["Inf", ["Nat"]];
    }
    if (value[0] === "VZero") {
      return ["Inf", ["Zero"]];
    }
    if (value[0] === "VSucc") {
      const [_, prev] = value;
      return ["Inf", ["Succ", quote(index)(prev)]];
    }
    if (value[0] === "VEq") {
      const [_, a, x, y] = value;
      return ["Inf", ["Eq", quote(index)(a), quote(index)(x), quote(index)(y)]];
    }
    if (value[0] === "VRefl") {
      const [_, a, z] = value;
      return ["Inf", ["Refl", quote(index)(a), quote(index)(z)]];
    }

    return value satisfies never;
  };

export const neutralQuote =
  (index: number) =>
  (neutral: Neutral): TermInferable => {
    if (neutral[0] === "NFree") {
      const [_, name] = neutral;
      return boundfree(index)(name);
    }
    if (neutral[0] === "NApp") {
      const [_, exp1, exp2] = neutral;
      return [neutralQuote(index)(exp1), ":@:", quote(index)(exp2)];
    }
    if (neutral[0] === "NNatElim") {
      const [_, prop, propZero, propSucc, nat] = neutral;
      return [
        "NatElim",
        quote(index)(prop),
        quote(index)(propZero),
        quote(index)(propSucc),
        ["Inf", neutralQuote(index)(nat)],
      ];
    }
    if (neutral[0] === "NEqElim") {
      const [_, a, prop, propRefl, x, y, eqaxy] = neutral;
      return [
        "EqElim",
        quote(index)(a),
        quote(index)(prop),
        quote(index)(propRefl),
        quote(index)(x),
        quote(index)(y),
        ["Inf", neutralQuote(index)(eqaxy)],
      ];
    }

    return neutral satisfies never;
  };

export const boundfree =
  (index: number) =>
  (name: Name): TermInferable => {
    if (name[0] === "Quote") {
      const [_, identifier] = name;
      return ["Bound", index - identifier - 1];
    }

    return ["Free", name];
  };
