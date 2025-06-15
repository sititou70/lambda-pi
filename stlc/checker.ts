import { substCheckable } from "./subst";
import {
  isEqName,
  isEqType,
  Name,
  TermCheckable,
  TermInferable,
  Type,
} from "./types";

export type Kind = "*";

export type Info = ["HasKind", Kind] | ["HasType", Type];

export type Context = [Name, Info][];

export const kindCheckable =
  (context: Context) =>
  (type: Type) =>
  (kind: Kind): void => {
    if (type[0] === "TFree") {
      const name = type[1];
      const nameAndInfo = context.find((x) => isEqName(x[0])(name));
      if (nameAndInfo === undefined)
        throw { msg: "unknown identifier", context, type, kind };
      const info = nameAndInfo[1];
      if (info[0] !== "HasKind")
        throw { msg: "unknown identifier", context, type, kind };
      if (info[1] !== kind)
        throw { msg: "unknown identifier", context, type, kind };
      return;
    }
    if (type[0] === "Fun") {
      const type1 = type[1];
      const type2 = type[2];
      kindCheckable(context)(type1)(kind);
      kindCheckable(context)(type2)(kind);
    }
  };

export const typeInferable =
  (index: number) =>
  (context: Context) =>
  (term: TermInferable): Type => {
    if (term[0] === "Ann") {
      const exp = term[1];
      const type = term[2];
      kindCheckable(context)(type)("*");
      typeCheckable(index)(context)(exp)(type);
      return type;
    }
    if (term[0] === "Bound") {
      throw {
        msg: "undefined behaviour: bound variable must be substituted to free variable.",
        index,
        context,
        term,
      };
    }
    if (term[0] === "Free") {
      const name = term[1];
      const nameAndInfo = context.find((x) => isEqName(x[0])(name));
      if (nameAndInfo === undefined)
        throw {
          msg: "unknown identifier",
          index,
          context,
          term,
        };
      const info = nameAndInfo[1];
      if (info[0] !== "HasType")
        throw {
          msg: "unknown identifier",
          index,
          context,
          term,
        };
      return info[1];
    }
    if (term[1] === ":@:") {
      const exp1 = term[0];
      const exp2 = term[2];
      const type1 = typeInferable(index)(context)(exp1);
      if (type1[0] !== "Fun")
        throw { msg: "illigal application", index, context, term };
      const type1Arg = type1[1];
      const type1Ret = type1[2];
      typeCheckable(index)(context)(exp2)(type1Arg);
      return type1Ret;
    }

    return term satisfies never;
  };

export const typeCheckable =
  (index: number) =>
  (context: Context) =>
  (term: TermCheckable) =>
  (type: Type): void => {
    if (term[0] === "Inf") {
      const exp = term[1];
      const inferredType = typeInferable(index)(context)(exp);
      if (!isEqType(inferredType)(type))
        throw { msg: "type mismatch", index, context, term, type };
      return;
    }
    if (term[0] === "Lam" && type[0] === "Fun") {
      const exp = term[1];
      const typeArg = type[1];
      const typeRet = type[2];
      const extendedContext: Context = [
        [
          ["Local", index],
          ["HasType", typeArg],
        ],
        ...context,
      ];
      const substitutedExp = substCheckable(0)(["Free", ["Local", index]])(exp);
      typeCheckable(index + 1)(extendedContext)(substitutedExp)(typeRet);
      return;
    }

    throw { msg: "type mismatch", index, context, term, type };
  };
