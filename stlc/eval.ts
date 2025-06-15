import { TermCheckable, TermInferable, Value } from "./types";
import { vapp, vfree } from "./utils";

export type Env = Value[];

export const evalInferable =
  (term: TermInferable) =>
  (env: Env): Value => {
    if (term[0] === "Ann") {
      const exp = term[1];
      return evalCheckable(exp)(env);
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
      const exp1 = term[0];
      const exp2 = term[2];
      return vapp(evalInferable(exp1)(env))(evalCheckable(exp2)(env));
    }

    return term satisfies never;
  };

export const evalCheckable =
  (term: TermCheckable) =>
  (env: Env): Value => {
    if (term[0] === "Inf") {
      const exp = term[1];
      return evalInferable(exp)(env);
    }
    if (term[0] === "Lam") {
      const exp = term[1];
      return ["VLam", (arg: Value) => evalCheckable(exp)([arg, ...env])];
    }

    return term satisfies never;
  };
