import { expect, test } from "vitest";
import { typeInferable } from "../checker";
import { quote } from "../quote";
import { TermCheckable, TermInferable } from "../types";

const plus: TermCheckable = [
  "Lam",
  [
    "Inf",
    [
      "NatElim",
      ["Lam", ["Inf", ["Pi", ["Inf", ["Nat"]], ["Inf", ["Nat"]]]]],
      ["Lam", ["Inf", ["Bound", 0]]],
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

const zero: TermCheckable = ["Inf", ["Zero"]];
const one: TermCheckable = ["Inf", ["Succ", ["Inf", ["Zero"]]]];
const testPlus1Type: TermCheckable = [
  "Inf",
  [
    "Eq",
    ["Inf", ["Nat"]],
    ["Inf", [[annotatedPlus, ":@:", one], ":@:", zero]],
    one,
  ],
];
const testPlus1Proof: TermCheckable = ["Refl", ["Inf", ["Nat"]], one];
const testPlus1Check: TermInferable = ["Ann", testPlus1Proof, testPlus1Type];
test("check testPlus1", () => {
  typeInferable(0)([])(testPlus1Check);
});

const two: TermCheckable = [
  "Inf",
  ["Succ", ["Inf", ["Succ", ["Inf", ["Zero"]]]]],
];
const three: TermCheckable = [
  "Inf",
  ["Succ", ["Inf", ["Succ", ["Inf", ["Succ", ["Inf", ["Zero"]]]]]]],
];
const five: TermCheckable = [
  "Inf",
  [
    "Succ",
    [
      "Inf",
      [
        "Succ",
        [
          "Inf",
          ["Succ", ["Inf", ["Succ", ["Inf", ["Succ", ["Inf", ["Zero"]]]]]]],
        ],
      ],
    ],
  ],
];
const testPlus2Type: TermCheckable = [
  "Inf",
  [
    "Eq",
    ["Inf", ["Nat"]],
    ["Inf", [[annotatedPlus, ":@:", two], ":@:", three]],
    five,
  ],
];
const testPlus2Proof: TermCheckable = ["Refl", ["Inf", ["Nat"]], five];
const testPlus2Check: TermInferable = ["Ann", testPlus2Proof, testPlus2Type];
test("check testPlus2", () => {
  typeInferable(0)([])(testPlus2Check);
});

const plusZeroLType: TermCheckable = [
  "Inf",
  [
    "Pi",
    ["Inf", ["Nat"]],
    [
      "Inf",
      [
        "Eq",
        ["Inf", ["Nat"]],
        ["Inf", [[annotatedPlus, ":@:", zero], ":@:", ["Inf", ["Bound", 0]]]],
        ["Inf", ["Bound", 0]],
      ],
    ],
  ],
];
const plusZeroLProof: TermCheckable = [
  "Lam",
  ["Refl", ["Inf", ["Nat"]], ["Inf", ["Bound", 0]]],
];
const plusZeroLCheck: TermInferable = ["Ann", plusZeroLProof, plusZeroLType];
test("check plusZeroL", () => {
  typeInferable(0)([])(plusZeroLCheck);
});

// forall [A: Type] (P: A -> Prop) (x: A) (y: A),
// P x ->
// y = x ->
// P y
const eqIndRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    // a :: Star
    ["Inf", ["Star"]],
    [
      "Inf",
      [
        "Pi",
        // prop :: a -> Star
        [
          "Inf",
          [
            "Pi",
            ["Inf", ["Bound", 0]], // a
            ["Inf", ["Star"]],
          ],
        ],
        [
          "Inf",
          [
            "Pi",
            // x :: a
            ["Inf", ["Bound", 1]], // a
            [
              "Inf",
              [
                "Pi",
                // y :: a
                ["Inf", ["Bound", 2]], // a
                [
                  "Inf",
                  [
                    "Pi",
                    // hpx :: prop x
                    [
                      "Inf",
                      [
                        ["Bound", 2], // prop
                        ":@:",
                        ["Inf", ["Bound", 1]], // x
                      ],
                    ],
                    [
                      "Inf",
                      [
                        "Pi",
                        // heq :: y = x
                        [
                          "Inf",
                          [
                            "Eq",
                            ["Inf", ["Bound", 4]], // a
                            ["Inf", ["Bound", 1]], // y
                            ["Inf", ["Bound", 2]], // x
                          ],
                        ],
                        [
                          "Inf",
                          [
                            ["Bound", 4], // prop
                            ":@:",
                            ["Inf", ["Bound", 2]], // y
                          ],
                        ],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ],
  ],
];
const eqIndRProof: TermCheckable = [
  "Lam", // arg: a
  [
    "Lam", // arg: prop
    [
      "Lam", // arg: x
      [
        "Lam", // arg: y
        [
          "Lam", // arg: prop x
          [
            "Lam", // arg: y = x
            [
              "Inf",
              [
                [
                  "EqElim",
                  // EqElim_a
                  ["Inf", ["Bound", 5]],
                  // EqElim_prop :: forall (x: a) (y: a) (eqaxy: Eq a x y), forall (py: prop y), prop x
                  [
                    "Lam", // arg: x
                    [
                      "Lam", // arg: y
                      [
                        "Lam", // arg: eqaxy
                        [
                          "Inf",
                          [
                            "Pi",
                            // py :: prop y
                            [
                              "Inf",
                              [
                                ["Bound", 7], // prop
                                ":@:",
                                ["Inf", ["Bound", 1]], // y
                              ],
                            ],
                            // prop x
                            [
                              "Inf",
                              [
                                ["Bound", 8], // prop
                                ":@:",
                                ["Inf", ["Bound", 3]], // x
                              ],
                            ],
                          ],
                        ],
                      ],
                    ],
                  ],
                  // EqElim_propRefl :: forall (z: a), EqElim_prop z z (Refl a z)
                  //                                   ^^^^^^^^^^^^^^^^^^^^^^^^^^
                  //                                   forall (pz: prop z), prop z
                  ["Lam", ["Lam", ["Inf", ["Bound", 0]]]],
                  // EqElim_x
                  ["Inf", ["Bound", 2]], // y
                  // EqElim_y
                  ["Inf", ["Bound", 3]], // x
                  // EqElim_eqaxy
                  ["Inf", ["Bound", 0]], // y = x
                ],
                ":@:",
                ["Inf", ["Bound", 1]], // prop x
              ],
            ],
          ],
        ],
      ],
    ],
  ],
];
const eqIndRCheck: TermInferable = ["Ann", eqIndRProof, eqIndRType];
test("check eqIndR", () => {
  typeInferable(0)([])(eqIndRCheck);
});

const plusZeroRType: TermCheckable = [
  "Inf",
  [
    "Pi",
    ["Inf", ["Nat"]],
    [
      "Inf",
      [
        "Eq",
        ["Inf", ["Nat"]],
        ["Inf", [[annotatedPlus, ":@:", ["Inf", ["Bound", 0]]], ":@:", zero]],
        ["Inf", ["Bound", 0]],
      ],
    ],
  ],
];
const plusZeroRProof: TermCheckable = [
  "Lam", // arg: n
  [
    "Inf",
    [
      "NatElim",
      // NatElim_prop :: forall (n: Nat), n + Zero = n
      [
        "Lam", // arg: n
        [
          "Inf",
          [
            "Eq",
            ["Inf", ["Nat"]],
            [
              "Inf",
              [[annotatedPlus, ":@:", ["Inf", ["Bound", 0]]], ":@:", zero],
            ],
            ["Inf", ["Bound", 0]],
          ],
        ],
      ],
      // NatElim_propZero
      ["Refl", ["Inf", ["Nat"]], zero],
      // NatElim_propSucc
      [
        "Lam", // arg: n
        [
          "Lam", // arg: n + 0 = n
          [
            "Inf",
            [
              [
                [
                  [
                    [
                      [
                        eqIndRCheck,
                        ":@:",
                        // eqIndR_a
                        ["Inf", ["Nat"]],
                      ],
                      ":@:",
                      // eqIndR_prop :: forall (target: Nat), Succ target = Succ n
                      [
                        "Lam", // arg: target
                        [
                          "Inf",
                          [
                            "Eq",
                            ["Inf", ["Nat"]],
                            // Succ target
                            ["Inf", ["Succ", ["Inf", ["Bound", 0]]]],
                            // Succ n
                            ["Inf", ["Succ", ["Inf", ["Bound", 2]]]],
                          ],
                        ],
                      ],
                    ],
                    ":@:",
                    // eqIndR_x
                    ["Inf", ["Bound", 1]], // n
                  ],
                  ":@:",
                  // eqIndR_y
                  // n + 0
                  [
                    "Inf",
                    [
                      [
                        annotatedPlus,
                        ":@:",
                        ["Inf", ["Bound", 1]], // n
                      ],
                      ":@:",
                      zero,
                    ],
                  ],
                ],
                ":@:",
                // eqIndR_px
                [
                  "Refl",
                  ["Inf", ["Nat"]],
                  ["Inf", ["Succ", ["Inf", ["Bound", 1]]]],
                ],
              ],
              ":@:",
              // eqIndR_eqyx
              ["Inf", ["Bound", 0]], // n + 0 = n
            ],
          ],
        ],
      ],
      // NatElim_nat
      ["Inf", ["Bound", 0]],
    ],
  ],
];
const plusZeroRCheck: TermInferable = ["Ann", plusZeroRProof, plusZeroRType];
test("check plusZeroR", () => {
  typeInferable(0)([])(plusZeroRCheck);
});
