import { expect, test } from "vitest";
import { Context, typeInferable } from "./checker";
import { evalInferable } from "./eval";
import { quote } from "./quote";
import { TermCheckable, TermInferable, Value } from "./types";

const env: Context = [
  [["Global", "Bool"], ["VStar"]],
  [
    ["Global", "false"],
    ["VNeutral", ["NFree", ["Global", "Bool"]]],
  ],
];

const id: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];
const idPoly: TermCheckable = ["Lam", id];

const exp1: TermInferable = [
  "Ann",
  idPoly,
  [
    "Inf",
    [
      "Pi",
      ["Inf", ["Star"]],
      ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", ["Bound", 1]]]],
    ],
  ],
];
test("check exp1", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp1));
  const expected: TermCheckable = [
    "Inf",
    [
      "Pi",
      ["Inf", ["Star"]],
      ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", ["Bound", 1]]]],
    ],
  ];
  expect(actual).toEqual(expected);
});

const boolTerm: TermCheckable = ["Inf", ["Free", ["Global", "Bool"]]];
const exp2: TermInferable = [exp1, ":@:", boolTerm];
test("check exp2", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp2));
  const expected: TermCheckable = [
    "Inf",
    [
      "Pi",
      ["Inf", ["Free", ["Global", "Bool"]]],
      ["Inf", ["Free", ["Global", "Bool"]]],
    ],
  ];
  expect(actual).toEqual(expected);
});

const falseTerm: TermCheckable = ["Inf", ["Free", ["Global", "false"]]];
const exp3: TermInferable = [exp2, ":@:", falseTerm];
test("check exp3", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp3));
  const expected: TermCheckable = ["Inf", ["Free", ["Global", "Bool"]]];
  expect(actual).toEqual(expected);
});

test("eval exp3", () => {
  const actual: Value = evalInferable(exp3)([]);
  const expected: Value = ["VNeutral", ["NFree", ["Global", "false"]]];
  expect(actual).toEqual(expected);
});
