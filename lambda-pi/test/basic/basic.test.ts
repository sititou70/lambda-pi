import { expect, test } from "vitest";
import { Context, typeInferable } from "../../checker";
import { evalInferable } from "../../eval";
import { quote } from "../../quote";
import { TermCheckable, TermInferable, Value } from "../../types";

const env: Context = [
  [["Global", "Bool"], ["VStar"]],
  [
    ["Global", "false"],
    ["VNeutral", ["NFree", ["Global", "Bool"]]],
  ],
];

const id: TermCheckable = ["Lam", ["Inf", ["Bound", 0]]];
const idPoly: TermCheckable = ["Lam", id];

const type1: TermCheckable = [
  "Inf",
  [
    "Pi",
    ["Inf", ["Star"]],
    ["Inf", ["Pi", ["Inf", ["Bound", 0]], ["Inf", ["Bound", 1]]]],
  ],
];
const exp1: TermInferable = ["Ann", idPoly, type1];
test("check exp1", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp1));
  const expected: TermCheckable = type1;
  expect(actual).toEqual(expected);
});

const boolTerm: TermCheckable = ["Inf", ["Free", ["Global", "Bool"]]];
const exp2: TermInferable = [exp1, ":@:", boolTerm];
test("check exp2", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp2));
  const expected: TermCheckable = ["Inf", ["Pi", boolTerm, boolTerm]];
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

const starTerm: TermCheckable = ["Inf", ["Star"]];
const exp4: TermInferable = [exp1, ":@:", starTerm];
test("check exp4", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp4));
  const expected: TermCheckable = ["Inf", ["Pi", starTerm, starTerm]];
  expect(actual).toEqual(expected);
});

const exp5: TermInferable = [exp4, ":@:", boolTerm];
test("check exp5", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)(env)(exp5));
  const expected: TermCheckable = starTerm;
  expect(actual).toEqual(expected);
});

test("eval exp5", () => {
  const actual: Value = evalInferable(exp5)([]);
  const expected: Value = ["VNeutral", ["NFree", ["Global", "Bool"]]];
  expect(actual).toEqual(expected);
});
