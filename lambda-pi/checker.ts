import { evalCheckable } from "./eval";
import { quote } from "./quote";
import { substCheckable } from "./subst";
import {
  isEqName,
  isEqTermCheckable,
  Name,
  TermCheckable,
  TermInferable,
  Value,
} from "./types";
import { vfree } from "./utils";

export type Type = Value;

export type Context = [Name, Type][];

export const typeInferable =
  (index: number) =>
  (context: Context) =>
  (term: TermInferable): Type => {
    if (term[0] === "Ann") {
      const exp = term[1];
      const type = term[2];
      typeCheckable(index)(context)(type)(["VStar"]);
      const evaluetedType = evalCheckable(type)([]);
      typeCheckable(index)(context)(exp)(evaluetedType);
      return evaluetedType;
    }
    if (term[0] === "Star") {
      return ["VStar"];
    }
    if (term[0] === "Pi") {
      const type = term[1];
      const body = term[2];
      typeCheckable(index)(context)(type)(["VStar"]);
      const evaluetedType = evalCheckable(type)([]);
      const substitutedBody = substCheckable(0)(["Free", ["Local", index]])(
        body
      );
      typeCheckable(index + 1)([[["Local", index], evaluetedType], ...context])(
        substitutedBody
      )(["VStar"]);
      return ["VStar"];
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
      const nameAndType = context.find((x) => isEqName(x[0])(name));
      if (nameAndType === undefined)
        throw {
          msg: "unknown identifier",
          index,
          context,
          term,
        };
      return nameAndType[1];
    }
    if (term[1] === ":@:") {
      const exp1 = term[0];
      const exp2 = term[2];
      const inferredExp1Type = typeInferable(index)(context)(exp1);
      if (inferredExp1Type[0] !== "VPi")
        throw { msg: "illigal application", index, context, term };
      const inferredExp1ArgType = inferredExp1Type[1];
      const inferredExp1RetType = inferredExp1Type[2];
      typeCheckable(index)(context)(exp2)(inferredExp1ArgType);
      const evaluatedExp2 = evalCheckable(exp2)([]);
      return inferredExp1RetType(evaluatedExp2);
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
      if (!isEqTermCheckable(quote(0)(inferredType))(quote(0)(type)))
        throw {
          msg: "type mismatch",
          index,
          context,
          term,
          type,
          exp,
          inferredType,
        };
      return;
    }
    if (term[0] === "Lam" && type[0] === "VPi") {
      const exp = term[1];
      const typeArg = type[1];
      const typeRet = type[2];
      const extendedContext: Context = [
        [["Local", index], typeArg],
        ...context,
      ];
      const substitutedExp = substCheckable(0)(["Free", ["Local", index]])(exp);
      typeCheckable(index + 1)(extendedContext)(substitutedExp)(
        typeRet(vfree(["Local", index]))
      );
      return;
    }

    throw { msg: "type mismatch", index, context, term, type };
  };
