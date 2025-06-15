export type TermInferable =
  | ["Ann", TermCheckable, Type]
  | ["Bound", number]
  | ["Free", Name]
  | [TermInferable, ":@:", TermCheckable];

export type TermCheckable = ["Inf", TermInferable] | ["Lam", TermCheckable];

export type Name = ["Global", string] | ["Local", number] | ["Quote", number];

export type Type = ["TFree", Name] | ["Fun", Type, Type];

export type Value = ["VLam", (arg: Value) => Value] | ["VNeutral", Neutral];

export type Neutral = ["NFree", Name] | ["NApp", Neutral, Value];

// utils
export const isEqName =
  (name1: Name) =>
  (name2: Name): boolean => {
    if (name1[0] !== name2[0]) return false;
    if (name1[1] !== name2[1]) return false;
    return true;
  };

export const isEqType =
  (type1: Type) =>
  (type2: Type): boolean => {
    if (type1[0] === "TFree" && type2[0] === "TFree")
      return isEqName(type1[1])(type2[1]);
    if (type1[0] === "Fun" && type2[0] === "Fun")
      return isEqType(type1[1])(type2[1]) && isEqType(type1[2])(type2[2]);

    return false;
  };
