import { expect, test } from "vitest";
import { typeInferable } from "../../checker";
import { evalInferable } from "../../eval";
import { quote } from "../../quote";
import { TermCheckable, TermInferable, Value } from "../../types";

const one: TermCheckable = ["Inf", ["Succ", ["Inf", ["Zero"]]]];

const oneEqOneType: TermCheckable = ["Inf", ["Eq", ["Inf", ["Nat"]], one, one]];
const oneEqOneProof: TermCheckable = ["Inf", ["Refl", ["Inf", ["Nat"]], one]];
const oneEqOneAnn: TermInferable = ["Ann", oneEqOneProof, oneEqOneType];

test("check 1 = 1", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)([])(oneEqOneAnn));
  const expected: TermCheckable = oneEqOneType;
  expect(actual).toEqual(expected);
});

test("eval 1 = 1", () => {
  const actual: Value = evalInferable(oneEqOneAnn)([]);
  const expected: Value = ["VRefl", ["VNat"], ["VSucc", ["VZero"]]];
  expect(actual).toEqual(expected);
});

const two: TermCheckable = [
  "Inf",
  ["Succ", ["Inf", ["Succ", ["Inf", ["Zero"]]]]],
];

const succ: TermCheckable = ["Lam", ["Inf", ["Succ", ["Inf", ["Bound", 0]]]]];
const succType: TermCheckable = [
  "Inf",
  ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]],
];
const succAnn: TermInferable = ["Ann", succ, succType];

const succOne: TermCheckable = ["Inf", [succAnn, ":@:", one]];
const succOneEqTwoType: TermCheckable = [
  "Inf",
  ["Eq", ["Inf", ["Nat"]], succOne, two],
];
const succOneEqTwoProof: TermCheckable = [
  "Inf",
  ["Refl", ["Inf", ["Nat"]], two],
];
const succOneEqTwoAnn: TermInferable = [
  "Ann",
  succOneEqTwoProof,
  succOneEqTwoType,
];

test("check succ 1 = 2", () => {
  const actual: TermCheckable = quote(0)(typeInferable(0)([])(succOneEqTwoAnn));
  const expected: TermCheckable = ["Inf", ["Eq", ["Inf", ["Nat"]], two, two]];
  expect(actual).toEqual(expected);
});

test("eval succ 1 = 2", () => {
  const actual: Value = evalInferable(succOneEqTwoAnn)([]);
  const expected: Value = ["VRefl", ["VNat"], ["VSucc", ["VSucc", ["VZero"]]]];
  expect(actual).toEqual(expected);
});
