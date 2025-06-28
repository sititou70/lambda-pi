import { describe, expect, test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";
import { makeNat } from "./makeNat";
import { plusAnn } from "./plus.test";
import { quote } from "../quote";
import { evalInferable } from "../eval";

const sum: TermCheckable = [
  "Lam",
  [
    "Inf",
    [
      "NatElim",
      // prop
      ["Lam", ["Inf", ["Nat"]]],
      // propZero
      makeNat(0),
      // propSucc
      [
        "Lam", // arg: x
        [
          "Lam", // arg: prop x
          // prop (Succ x)
          [
            "Inf",
            [
              [
                plusAnn,
                ":@:",
                ["Inf", ["Succ", ["Inf", ["Bound", 1]]]], // Succ x
              ],
              ":@:",
              ["Inf", ["Bound", 0]], // prop x
            ],
          ],
        ],
      ],
      // nat
      ["Inf", ["Bound", 0]],
    ],
  ],
];
const sumType: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]],
];
export const sumAnn: TermInferable = ["Ann", sum, sumType];
test("check sum", () => {
  typeInferable(0)([])(sumAnn);
});

describe.each([
  { n: 0, result: 0 },
  { n: 1, result: 1 },
  { n: 2, result: 3 },
  { n: 3, result: 6 },
  { n: 10, result: 55 },
])("case: sum $n", ({ n, result }) => {
  const exp: TermInferable = [sumAnn, ":@:", makeNat(n)];
  test(`eval result is ${result}`, () => {
    const actual: TermCheckable = quote(0)(evalInferable(exp)([]));
    const expected: TermCheckable = makeNat(result);
    expect(actual).toEqual(expected);
  });

  test(`check result is Nat`, () => {
    const actual: TermCheckable = quote(0)(typeInferable(0)([])(exp));
    const expected: TermCheckable = ["Inf", ["Nat"]];
    expect(actual).toEqual(expected);
  });
});
