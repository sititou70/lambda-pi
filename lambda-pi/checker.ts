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
import { vapp, vfree } from "./utils";

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
    if (term[0] === "Nat") {
      return ["VStar"];
    }
    if (term[0] === "Zero") {
      return ["VNat"];
    }
    if (term[0] === "Succ") {
      const [_, prev] = term;
      typeCheckable(index)(context)(prev);
      return ["VNat"];
    }
    if (term[0] === "NatElim") {
      const [_, prop, propZero, propSucc, nat] = term;
      typeCheckable(index)(context)(prop)(["VPi", ["VNat"], () => ["VStar"]]);
      const propValue = evalCheckable(prop)([]);
      typeCheckable(index)(context)(propZero)(vapp(propValue)(["VZero"]));
      typeCheckable(index)(context)(propSucc)([
        "VPi",
        ["VNat"],
        (nat: Value) => [
          "VPi",
          vapp(propValue)(nat),
          () => vapp(propValue)(["VSucc", nat]),
        ],
      ]);
      typeCheckable(index)(context)(nat)(["VNat"]);
      const natValue = evalCheckable(nat)([]);
      return vapp(propValue)(natValue);
    }
    if (term[0] === "Eq") {
      const [_, a, x, y] = term;
      const aValue = evalCheckable(a)([]);
      typeCheckable(index)(context)(x)(aValue);
      typeCheckable(index)(context)(y)(aValue);
      return ["VStar"];
    }
    if (term[0] === "EqElim") {
      const [_, a, prop, propRefl, x, y, eqaxy] = term;
      typeCheckable(index)(context)(a)(["VStar"]);
      const aValue = evalCheckable(a)([]);
      typeCheckable(index)(context)(prop)([
        "VPi",
        aValue,
        (x: Value) => [
          "VPi",
          aValue,
          (y: Value) => ["VPi", ["VEq", aValue, x, y], () => ["VStar"]],
        ],
      ]);
      const propValue = evalCheckable(prop)([]);
      typeCheckable(index)(context)(propRefl)([
        "VPi",
        aValue,
        (x: Value) => vapp(vapp(propValue)(x))(x),
      ]);
      typeCheckable(index)(context)(x)(aValue);
      const xValue = evalCheckable(x)([]);
      typeCheckable(index)(context)(y)(aValue);
      const yValue = evalCheckable(y)([]);
      typeCheckable(index)(context)(eqaxy)(["VEq", aValue, xValue, yValue]);
      const eqaxyValue = evalCheckable(eqaxy)([]);
      return vapp(vapp(vapp(propValue)(xValue))(yValue))(eqaxyValue);
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
    if (term[0] === "Refl" && type[0] === "VEq") {
      const [_, a, z] = term;
      const [__, bValue, xValue, yValue] = type;
      typeCheckable(index)(context)(a)(["VStar"]);
      const aValue = evalCheckable(a)([]);
      if (!isEqTermCheckable(quote(0)(aValue))(quote(0)(bValue)))
        throw {
          msg: "type mismatch",
          index,
          context,
          term,
          type,
          aValue,
          bValue,
        };

      typeCheckable(index)(context)(z)(aValue);
      const zValue = evalCheckable(z)([]);
      if (!isEqTermCheckable(quote(0)(zValue))(quote(0)(xValue)))
        throw {
          msg: "type mismatch",
          index,
          context,
          term,
          type,
          zValue,
          xValue,
        };
      if (!isEqTermCheckable(quote(0)(zValue))(quote(0)(yValue)))
        throw {
          msg: "type mismatch",
          index,
          context,
          term,
          type,
          zValue,
          yValue,
        };

      return;
    }

    throw { msg: "type mismatch", index, context, term, type };
  };
