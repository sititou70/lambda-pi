import { TermCheckable, TermInferable } from "./types";

export const substInferable =
  (index: number) =>
  (to: TermInferable) =>
  (term: TermInferable): TermInferable => {
    if (term[0] === "Ann") {
      const [_, exp, type] = term;
      const substitutedExp = substCheckable(index)(to)(exp);
      return ["Ann", substitutedExp, type];
    }
    if (term[0] === "Star") {
      return term;
    }
    if (term[0] === "Pi") {
      const [_, exp1, exp2] = term;
      return [
        "Pi",
        substInferable(index)(to)(exp1),
        substInferable(index + 1)(to)(exp2),
      ];
    }
    if (term[0] === "Bound") {
      const identifier = term[1];
      if (index === identifier) return to;
      return ["Bound", identifier];
    }
    if (term[0] === "Free") {
      return term;
    }
    if (term[1] === ":@:") {
      const [exp1, _, exp2] = term;
      const substitutedExp1 = substInferable(index)(to)(exp1);
      const substitutedExp2 = substCheckable(index)(to)(exp2);
      return [substitutedExp1, ":@:", substitutedExp2];
    }
    if (term[0] === "Nat") {
      return ["Nat"];
    }
    if (term[0] === "NatElim") {
      const [_, prop, propZero, propSucc, nat] = term;
      const substitutedProp = substCheckable(index)(to)(prop);
      const substitutedPropZero = substCheckable(index)(to)(propZero);
      const substitutedPropSucc = substCheckable(index)(to)(propSucc);
      const substitutedNat = substCheckable(index)(to)(nat);
      return [
        "NatElim",
        substitutedProp,
        substitutedPropZero,
        substitutedPropSucc,
        substitutedNat,
      ];
    }
    if (term[0] === "Zero") {
      return ["Zero"];
    }
    if (term[0] === "Succ") {
      const [_, prev] = term;
      const substitutedPrev = substCheckable(index)(to)(prev);
      return ["Succ", substitutedPrev];
    }
    if (term[0] === "Eq") {
      const [_, a, x, y] = term;
      const substitutedA = substCheckable(index)(to)(a);
      const substitutedX = substCheckable(index)(to)(x);
      const substitutedY = substCheckable(index)(to)(y);
      return ["Eq", substitutedA, substitutedX, substitutedY];
    }
    if (term[0] === "Refl") {
      const [_, a, z] = term;
      const substitutedA = substCheckable(index)(to)(a);
      const substitutedZ = substCheckable(index)(to)(z);
      return ["Refl", substitutedA, substitutedZ];
    }
    if (term[0] === "EqElim") {
      const [_, a, prop, propRefl, x, y, eqaxy] = term;
      const substitutedA = substCheckable(index)(to)(a);
      const substitutedProp = substCheckable(index)(to)(prop);
      const substitutedPropRefl = substCheckable(index)(to)(propRefl);
      const substitutedX = substCheckable(index)(to)(x);
      const substitutedY = substCheckable(index)(to)(y);
      const substitutedEqaxy = substCheckable(index)(to)(eqaxy);
      return [
        "EqElim",
        substitutedA,
        substitutedProp,
        substitutedPropRefl,
        substitutedX,
        substitutedY,
        substitutedEqaxy,
      ];
    }

    return term satisfies never;
  };

export const substCheckable =
  (index: number) =>
  (to: TermInferable) =>
  (term: TermCheckable): TermCheckable => {
    if (term[0] === "Inf") {
      const [_, exp] = term;
      const substitutedExp = substInferable(index)(to)(exp);
      return ["Inf", substitutedExp];
    }
    if (term[0] === "Lam") {
      const exp = term[1];
      const substitutedExp = substCheckable(index + 1)(to)(exp);
      return ["Lam", substitutedExp];
    }

    return term satisfies never;
  };
