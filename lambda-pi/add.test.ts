import { describe, expect, test } from "vitest";
import { typeCheckable, typeInferable } from "./checker";
import { evalInferable } from "./eval";
import { quote } from "./quote";
import { TermCheckable, TermInferable } from "./types";

const plus: TermCheckable = [
  "Lam",
  [
    "Inf",
    [
      "NatElim",
      // prop :: Nat -> *
      // 今回の場合は、特定のNatを受け取ってそれに依存せずにNat -> Nat型を返す
      ["Lam", ["Inf", ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]]]],
      // propZero :: prop Zero
      // つまりNat -> Nat型。0が適用された場合の挙動で、addの場合は数値を変化させないのでid
      ["Lam", ["Inf", ["Bound", 0]]],
      // propSucc :: forall n :: nat. prop n -> prop (Succ n)
      // 今回はpropsが何を受け取ってもNat -> Natなので、forall n :: nat. (Nat -> Nat) -> (Nat -> Nat)型になる
      // 0以外が適用された場合の挙動。
      [
        "Lam",
        [
          "Lam",
          [
            "Lam",
            [
              "Inf",
              ["Succ", ["Inf", [["Bound", 1], ":@:", ["Inf", ["Bound", 0]]]]],
            ],
          ],
        ],
      ],
      ["Inf", ["Bound", 0]],
    ],
  ],
];
const plusType: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Nat"]], ["Inf", ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]]]],
];
const annotatedPlus: TermInferable = ["Ann", plus, plusType];

test("check plus", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)([])(annotatedPlus));
  const expected: TermCheckable = plusType;
  expect(actual).toEqual(expected);
});

const makeNat = (n: number): TermCheckable => {
  if (n === 0) return ["Inf", ["Zero"]];
  return ["Inf", ["Succ", makeNat(n - 1)]];
};

describe.each([
  { lhs: 0, rhs: 0, result: 0 },
  { lhs: 1, rhs: 0, result: 1 },
  { lhs: 0, rhs: 1, result: 1 },
  { lhs: 2, rhs: 1, result: 3 },
  { lhs: 1, rhs: 2, result: 3 },
  { lhs: 1, rhs: 3, result: 4 },
  { lhs: 3, rhs: 2, result: 5 },
  { lhs: 40, rhs: 2, result: 42 },
])("case: plus $lhs $rhs", ({ lhs, rhs, result }) => {
  const exp: TermInferable = [
    [annotatedPlus, ":@:", makeNat(lhs)],
    ":@:",
    makeNat(rhs),
  ];

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
