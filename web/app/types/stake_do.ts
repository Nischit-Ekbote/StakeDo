/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/stake_do.json`.
 */
export type StakeDo = {
  "address": "2fakZCn8BtJsuqAeH7N9cHYxwMyMmZjYjXvjjStTTYTg",
  "metadata": {
    "name": "stakeDo",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "completeTodo",
      "discriminator": [
        45,
        107,
        162,
        240,
        39,
        4,
        61,
        92
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "todoAccount"
          ]
        },
        {
          "name": "todoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  100,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "todoId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "todoId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deleteTodo",
      "discriminator": [
        224,
        212,
        234,
        177,
        90,
        57,
        219,
        115
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "todoAccount"
          ]
        },
        {
          "name": "todoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  100,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "arg",
                "path": "todoId"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "todoId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeTodo",
      "discriminator": [
        159,
        78,
        179,
        105,
        124,
        190,
        104,
        186
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "todoAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  100,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "todoId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "todoId",
          "type": "u64"
        },
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "deadline",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "initializeUser",
      "discriminator": [
        111,
        17,
        185,
        250,
        60,
        122,
        38,
        254
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "todoAccount",
      "discriminator": [
        31,
        86,
        84,
        40,
        187,
        31,
        251,
        132
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "alreadyCompleted",
      "msg": "Todo already completed."
    },
    {
      "code": 6001,
      "name": "todoNotCompleted",
      "msg": "Todo Not Completed."
    }
  ],
  "types": [
    {
      "name": "todoAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "todoId",
            "type": "u64"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "deadline",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "updatedAt",
            "type": {
              "option": "i64"
            }
          },
          {
            "name": "isCompleted",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "todoCount",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
