import { test } from "vitest";
import { TermCheckable, TermInferable } from "../types";
import { typeInferable } from "../checker";

// forall (A: Type) (P: A -> Prop) (x: A) (y: A),
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
export const eqIndRAnn: TermInferable = ["Ann", eqIndRProof, eqIndRType];
test("check eqIndR", () => {
  typeInferable(0)([])(eqIndRAnn);
});
