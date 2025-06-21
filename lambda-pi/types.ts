export type TermInferable =
  | ["Ann", TermCheckable, TermCheckable]
  | ["Star"]
  | ["Pi", TermCheckable, TermCheckable]
  | ["Bound", number]
  | ["Free", Name]
  | [TermInferable, ":@:", TermCheckable]
  | ["Nat"]
  | ["NatElim", TermCheckable, TermCheckable, TermCheckable, TermCheckable]
  | ["Zero"]
  | ["Succ", TermCheckable];

export type TermCheckable = ["Inf", TermInferable] | ["Lam", TermCheckable];

export type Name = ["Global", string] | ["Local", number] | ["Quote", number];

export type Value =
  | ["VLam", (arg: Value) => Value]
  | ["VStar"]
  | ["VPi", Value, (arg: Value) => Value]
  | ["VNat"]
  | ["VZero"]
  | ["VSucc", Value]
  | ["VNeutral", Neutral];

export type Neutral =
  | ["NFree", Name]
  | ["NApp", Neutral, Value]
  | ["NNatElim", Value, Value, Value, Neutral];

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
    if (term1[0] === "Star" && term2[0] === "Star") {
      return true;
    }
    if (term1[0] === "Pi" && term2[0] === "Pi") {
      return (
        isEqTermCheckable(term1[1])(term2[1]) &&
        isEqTermCheckable(term1[2])(term2[2])
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

    return false;
  };
