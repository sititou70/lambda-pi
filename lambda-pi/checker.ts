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

const DEBUG = false;
let DEBUG_STEP = 0;

export type Type = Value;

export type Context = [Name, Type][];

export const typeInferable =
  (index: number) =>
  (context: Context) =>
  (term: TermInferable): Type => {
    if (term[0] === "Ann") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Ann");
      const [_, exp, type] = term;
      typeCheckable(index)(context)(type)(["VStar"]);
      const evaluetedType = evalCheckable(type)([]);
      typeCheckable(index)(context)(exp)(evaluetedType);
      return evaluetedType;
    }
    if (term[0] === "Star") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Star");
      return ["VStar"];
    }
    if (term[0] === "Pi") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Pi");
      const [_, type, body] = term;
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Free");
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: :@:");
      const [exp1, _, exp2] = term;
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Nat");
      return ["VStar"];
    }
    if (term[0] === "Zero") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Zero");
      return ["VNat"];
    }
    if (term[0] === "Succ") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Succ");
      const [_, prev] = term;
      typeCheckable(index)(context)(prev);
      return ["VNat"];
    }
    if (term[0] === "NatElim") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: NatElim");
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Eq");
      const [_, a, x, y] = term;
      const aValue = evalCheckable(a)([]);
      typeCheckable(index)(context)(x)(aValue);
      typeCheckable(index)(context)(y)(aValue);
      return ["VStar"];
    }
    if (term[0] === "EqElim") {
      if (DEBUG) console.log(++DEBUG_STEP, "Start: EqElim");
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
        // NOTE: 以下の参考実装では、この部分は(z: Value) => vapp(vapp(propValue)(z))(z)である。
        // しかし、論文の記述ではpropReflの型はforall (z: a). prop z z (Refl a z)なので、(Refl a z)にも適用するように修正する必要がある。
        // 実際、rocqで検証済みのコードを移植しているproof.basic.test.tsの型検査は修正版の方でパスする。
        // おそらく参考実装のバグか、設計の違いによるものなので、ここでは修正版の方を採用する。
        // 参考実装: https://www.andres-loeh.de/LambdaPi/LambdaPi.hs
        // rocqで検証済みのコード：https://github.com/sititou70/rocq-induction-from-scratch/blob/main/src/basic.v
        (z: Value) => vapp(vapp(vapp(propValue)(z))(z))(["VRefl", aValue, z]),
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Inf");
      const [_, exp] = term;
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Lam");
      const [_, exp] = term;
      const [__, typeArg, typeRet] = type;
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
      if (DEBUG) console.log(++DEBUG_STEP, "Start: Refl");
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
