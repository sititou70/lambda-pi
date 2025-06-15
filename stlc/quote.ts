import { Name, Neutral, TermCheckable, TermInferable, Value } from "./types";
import { vfree } from "./utils";

export const quote =
  (index: number) =>
  (value: Value): TermCheckable => {
    if (value[0] === "VLam") {
      const func = value[1];
      return ["Lam", quote(index + 1)(func(vfree(["Quote", index])))];
    }
    if (value[0] === "VNeutral") {
      const neutral = value[1];
      return ["Inf", neutralQuote(index)(neutral)];
    }

    return value satisfies never;
  };

export const neutralQuote =
  (index: number) =>
  (neutral: Neutral): TermInferable => {
    if (neutral[0] === "NFree") {
      const name = neutral[1];
      return boundfree(index)(name);
    }
    if (neutral[0] === "NApp") {
      const exp1 = neutral[1];
      const exp2 = neutral[2];
      return [neutralQuote(index)(exp1), ":@:", quote(index)(exp2)];
    }

    return neutral satisfies never;
  };

export const boundfree =
  (index: number) =>
  (name: Name): TermInferable => {
    if (name[0] === "Quote") {
      const identifier = name[1];
      return ["Bound", index - identifier - 1];
    }

    return ["Free", name];
  };
