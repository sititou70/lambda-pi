import { TermCheckable, TermInferable, Value } from "./types";
import { vapp, vfree } from "./utils";

export type Env = Value[];

export const evalInferable =
  (term: TermInferable) =>
  (env: Env): Value => {
    if (term[0] === "Ann") {
      const [_, exp] = term;
      return evalCheckable(exp)(env);
    }
    if (term[0] === "Star") {
      return ["VStar", term[1]];
    }
    if (term[0] === "Pi") {
      const [_, exp1, exp2] = term;
      return [
        "VPi",
        evalInferable(exp1)(env),
        (arg: Value) => evalInferable(exp2)([arg, ...env]),
      ];
    }
    if (term[0] === "Free") {
      const x = term[1];
      return vfree(x);
    }
    if (term[0] === "Bound") {
      const identifier = term[1];
      return env[identifier];
    }
    if (term[1] === ":@:") {
      const [exp1, _, exp2] = term;
      return vapp(evalInferable(exp1)(env))(evalCheckable(exp2)(env));
    }
    if (term[0] === "Nat") {
      return ["VNat"];
    }
    if (term[0] === "Zero") {
      return ["VZero"];
    }
    if (term[0] === "Succ") {
      const [_, prev] = term;
      return ["VSucc", evalCheckable(prev)(env)];
    }
    if (term[0] === "NatElim") {
      const [_, prop, propZero, propSucc, nat] = term;
      const natVal = evalCheckable(nat)(env);
      const propZeroValue = evalCheckable(propZero)(env);
      const propSuccValue = evalCheckable(propSucc)(env);

      const evaluateResultValue = (natVal: Value): Value => {
        if (natVal[0] === "VZero") {
          return propZeroValue;
        }
        if (natVal[0] === "VSucc") {
          const [_, prevNat] = natVal;
          const prevNatResultValue = evaluateResultValue(prevNat);
          return vapp(vapp(propSuccValue)(prevNat))(prevNatResultValue);
        }
        if (natVal[0] === "VNeutral") {
          const [_, natValContent] = natVal;
          const propValue = evalCheckable(prop)(env);
          return [
            "VNeutral",
            [
              "NNatElim",
              propValue,
              propZeroValue,
              propSuccValue,
              natValContent,
            ],
          ];
        }

        throw {
          msg: "natElim: invalid nat",
          nat,
        };
      };

      return evaluateResultValue(natVal);
    }
    if (term[0] === "Eq") {
      const [_, a, x, y] = term;
      const aValue = evalCheckable(a)(env);
      const xValue = evalCheckable(x)(env);
      const yValue = evalCheckable(y)(env);
      return ["VEq", aValue, xValue, yValue];
    }
    if (term[0] === "Refl") {
      const [_, a, x] = term;
      const aValue = evalCheckable(a)(env);
      const xValue = evalCheckable(x)(env);
      return ["VRefl", aValue, xValue];
    }
    if (term[0] === "EqElim") {
      const [_, a, prop, propRefl, x, y, eqaxy] = term;
      const propReflValue = evalCheckable(propRefl)(env);
      const eqaxyValue = evalCheckable(eqaxy)(env);

      const evaluateResultValue = (eqaxyValue: Value): Value => {
        if (eqaxyValue[0] === "VRefl") {
          const [_, __, reflValue] = eqaxyValue;
          return vapp(propReflValue)(reflValue);
        }
        if (eqaxyValue[0] === "VNeutral") {
          const [_, eqaxyValueContent] = eqaxyValue;
          const aValue = evalCheckable(a)(env);
          const propValue = evalCheckable(prop)(env);
          const xValue = evalCheckable(x)(env);
          const yValue = evalCheckable(y)(env);
          return [
            "VNeutral",
            [
              "NEqElim",
              aValue,
              propValue,
              propReflValue,
              xValue,
              yValue,
              eqaxyValueContent,
            ],
          ];
        }

        throw {
          msg: "eqElim: invalid eqaxy",
          eqaxy,
        };
      };

      return evaluateResultValue(eqaxyValue);
    }

    return term satisfies never;
  };

export const evalCheckable =
  (term: TermCheckable) =>
  (env: Env): Value => {
    if (term[0] === "Inf") {
      const [_, exp] = term;
      return evalInferable(exp)(env);
    }
    if (term[0] === "Lam") {
      const [_, exp] = term;
      return ["VLam", (arg: Value) => evalCheckable(exp)([arg, ...env])];
    }

    return term satisfies never;
  };
