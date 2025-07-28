import { vfree } from "./utils";

export type TermInferable =
  | ["Ann", TermCheckable, TermCheckable]
  | ["Star", number]
  | ["Pi", TermInferable, TermInferable]
  | ["Bound", number]
  | ["Free", Name]
  | [TermInferable, ":@:", TermCheckable]
  | ["Nat"]
  | ["NatElim", TermCheckable, TermCheckable, TermCheckable, TermCheckable]
  | ["Zero"]
  | ["Succ", TermCheckable]
  | ["Eq", TermCheckable, TermCheckable, TermCheckable]
  | ["Refl", TermCheckable, TermCheckable]
  | [
      "EqElim",
      TermCheckable,
      TermCheckable,
      TermCheckable,
      TermCheckable,
      TermCheckable,
      TermCheckable
    ];

export type TermCheckable = ["Inf", TermInferable] | ["Lam", TermCheckable];

export type Name = ["Global", string] | ["Local", number] | ["Quote", number];

export type Value =
  | ["VLam", (arg: Value) => Value]
  | ["VStar", number | "any"]
  | ["VPi", Value, (arg: Value) => Value]
  | ["VNat"]
  | ["VZero"]
  | ["VSucc", Value]
  | ["VEq", Value, Value, Value]
  | ["VRefl", Value, Value]
  | ["VNeutral", Neutral];

export type Neutral =
  | ["NFree", Name]
  | ["NApp", Neutral, Value]
  | ["NNatElim", Value, Value, Value, Neutral]
  | ["NEqElim", Value, Value, Value, Value, Value, Neutral];

// utils
export const isEqName =
  (name1: Name) =>
  (name2: Name): boolean => {
    if (name1[0] !== name2[0]) return false;
    if (name1[1] !== name2[1]) return false;
    return true;
  };

export const isEqTermCheckable =
  (term1: TermCheckable) =>
  (term2: TermCheckable): boolean => {
    if (term1[0] === "Inf" && term2[0] === "Inf") {
      return isEqTermInferable(term1[1])(term2[1]);
    }
    if (term1[0] === "Lam" && term2[0] === "Lam") {
      return isEqTermCheckable(term1[1])(term2[1]);
    }

    return false;
  };

export const isEqTermInferable =
  (term1: TermInferable) =>
  (term2: TermInferable): boolean => {
    if (term1[0] === "Ann" && term2[0] === "Ann") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2])
      );
    }
    if (term1[0] === "Star" && term2[0] === "Star" && term1[1] === term2[1]) {
      return true;
    }
    if (term1[0] === "Pi" && term2[0] === "Pi") {
      return (
        isEqTermInferable(term1[1])(term2[1]) &&
        isEqTermInferable(term1[2])(term2[2])
      );
    }
    if (term1[0] === "Bound" && term2[0] === "Bound") {
      return term1[1] === term2[1];
    }
    if (term1[0] === "Free" && term2[0] === "Free") {
      return isEqName(term1[1])(term2[1]);
    }
    if (term1[1] === ":@:" && term2[1] === ":@:") {
      return (
        isEqTermInferable(term1[0])(term2[0]) &&
        isEqTermCheckable(term1[2])(term2[2])
      );
    }
    if (term1[0] === "Nat" && term2[0] === "Nat") {
      return true;
    }
    if (term1[0] === "NatElim" && term2[0] === "NatElim") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2]) &&
        isEqTermCheckable(term1[3])(term2[3]) &&
        isEqTermCheckable(term1[4])(term2[4])
      );
    }
    if (term1[0] === "Zero" && term2[0] === "Zero") {
      return true;
    }
    if (term1[0] === "Succ" && term2[0] === "Succ") {
      return isEqTermCheckable(term1[1])(term2[1]);
    }
    if (term1[0] === "Eq" && term2[0] === "Eq") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2]) &&
        isEqTermCheckable(term1[3])(term2[3])
      );
    }
    if (term1[0] === "Refl" && term2[0] === "Refl") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2])
      );
    }
    if (term1[0] === "EqElim" && term2[0] === "EqElim") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2]) &&
        isEqTermCheckable(term1[3])(term2[3]) &&
        isEqTermCheckable(term1[4])(term2[4]) &&
        isEqTermCheckable(term1[5])(term2[5]) &&
        isEqTermCheckable(term1[6])(term2[6])
      );
    }

    return false;
  };

export const isEqValue =
  (index: number) =>
  (value1: Value) =>
  (value2: Value): boolean => {
    if (value1[0] === "VLam" && value2[0] === "VLam") {
      const [_, func1] = value1;
      const [__, func2] = value2;
      return isEqValue(index + 1)(func1(vfree(["Quote", index])))(
        func2(vfree(["Quote", index]))
      );
    }
    if (value1[0] === "VStar" && value2[0] === "VStar") {
      // 今回の型検査器のユースケースでは、anyはvalue2の方にしか現れない。
      // 本来のこの関数の意味を考えればvalue1にanyが現れてもtrueを返すべきだが、いったん安全側に寄せて実装する。
      if (typeof value1[1] === "number" && value2[1] === "any") return true;
      if (typeof value1[1] === "number" && typeof value2[1] === "number")
        return value1[1] === value2[1];
      return false;
    }
    if (value1[0] === "VPi" && value2[0] === "VPi") {
      const [_, arg1, ret1] = value1;
      const [__, arg2, ret2] = value2;
      return (
        isEqValue(index)(arg1)(arg2) &&
        isEqValue(index + 1)(ret1(vfree(["Quote", index])))(
          ret2(vfree(["Quote", index]))
        )
      );
    }
    if (value1[0] === "VNat" && value2[0] === "VNat") return true;
    if (value1[0] === "VZero" && value2[0] === "VZero") return true;
    if (value1[0] === "VSucc" && value2[0] === "VSucc") {
      const [_, prev1] = value1;
      const [__, prev2] = value2;
      return isEqValue(index)(prev1)(prev2);
    }
    if (value1[0] === "VEq" && value2[0] === "VEq") {
      const [_, a1, x1, y1] = value1;
      const [__, a2, x2, y2] = value2;
      return (
        isEqValue(index)(a1)(a2) &&
        isEqValue(index)(x1)(x2) &&
        isEqValue(index)(y1)(y2)
      );
    }
    if (value1[0] === "VRefl" && value2[0] === "VRefl") {
      const [_, a1, z1] = value1;
      const [__, a2, z2] = value2;
      return isEqValue(index)(a1)(a2) && isEqValue(index)(z1)(z2);
    }
    if (value1[0] === "VNeutral" && value2[0] === "VNeutral") {
      const [_, neutral1] = value1;
      const [__, neutral2] = value2;
      return isEqNeutral(index)(neutral1)(neutral2);
    }

    return false;
  };

const isEqNeutral =
  (index: number) =>
  (neutral1: Neutral) =>
  (neutral2: Neutral): boolean => {
    if (neutral1[0] === "NFree" && neutral2[0] === "NFree") {
      const [_, name1] = neutral1;
      const [__, name2] = neutral2;
      return isEqName(name1)(name2);
    }
    if (neutral1[0] === "NApp" && neutral2[0] === "NApp") {
      const [_, exp1, exp2] = neutral1;
      const [__, exp3, exp4] = neutral2;
      return isEqNeutral(index)(exp1)(exp3) && isEqValue(index)(exp2)(exp4);
    }
    if (neutral1[0] === "NNatElim" && neutral2[0] === "NNatElim") {
      const [_, prop1, propZero1, propSucc1, nat1] = neutral1;
      const [__, prop2, propZero2, propSucc2, nat2] = neutral2;
      return (
        isEqValue(index)(prop1)(prop2) &&
        isEqValue(index)(propZero1)(propZero2) &&
        isEqValue(index)(propSucc1)(propSucc2) &&
        isEqNeutral(index)(nat1)(nat2)
      );
    }
    if (neutral1[0] === "NEqElim" && neutral2[0] === "NEqElim") {
      const [_, a1, prop1, propRefl1, x1, y1, eqaxy1] = neutral1;
      const [__, a2, prop2, propRefl2, x2, y2, eqaxy2] = neutral2;
      return (
        isEqValue(index)(a1)(a2) &&
        isEqValue(index)(prop1)(prop2) &&
        isEqValue(index)(propRefl1)(propRefl2) &&
        isEqValue(index)(x1)(x2) &&
        isEqValue(index)(y1)(y2) &&
        isEqNeutral(index)(eqaxy1)(eqaxy2)
      );
    }

    return false;
  };
