import { assert } from "console";

// Basic types
export type u8 = number;
export type u16 = number;
export type u32 = number;
export type usize = number;
export type VecU8 = number[];
export type OptionU16 = number | undefined;

// SingleByteOpcode
export interface SingleByteOpcode {
  address: u32;
  opcode: u8;
}

// BasicOpcode2
export interface BasicOpcode2 {
  address: u32;
  opcode: u8;
  arg1: u16;
}

// BasicOpcode3
export interface BasicOpcode3 {
  address: u32;
  opcode: u8;
  arg1: u16;
  padding: u8;
}

// BasicOpcode4
export interface BasicOpcode4 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
}

// BasicOpcode6
export interface BasicOpcode6 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
}

// BasicOpcode8
export interface BasicOpcode8 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
}

// BasicOpcode10
export interface BasicOpcode10 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
  arg5: u16;
}

// BasicOpcode12
export interface BasicOpcode12 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
  arg5: u16;
  arg6: u16;
}

// BasicOpcode16
export interface BasicOpcode16 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
  arg5: u16;
  arg6: u16;
  arg7: u16;
  arg8: u16;
}

// Op44Opcode
export interface Op44Opcode {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  padding_end: OptionU16;
  size: usize;
}

// SwitchArm
export interface SwitchArm {
  index: u16;
  jump_address: u32;
}

// SwitchOpcode
export interface SwitchOpcode {
  address: u32;
  opcode: u8;
  comparison_value: u16;
  count: u16;
  arms: SwitchArm[];
  size: usize;
}

// StringOpcode
export interface StringOpcode {
  address: u32;
  opcode: u8;
  header: [u8, u8, u8, u8];
  sjis_bytes: VecU8;
  size: usize;
  unicode: string;
  notes: string | undefined;
  translation: string | undefined;
}

// String47Opcode
export interface String47Opcode {
  address: u32;
  opcode: u8;
  arg1: u16;
  opt_arg2: OptionU16;
  sjis_bytes: VecU8;
  size: usize;
  unicode: string;
  notes: string | undefined;
  translation: string | undefined;
}

// JumpOpcode2
export interface JumpOpcode2 {
  address: u32;
  opcode: u8;
  arg1: u16;
  jump_address: u32;
}

// JumpOpcode4
export interface JumpOpcode4 {
  address: u32;
  opcode: u8;
  arg1: u16;
  arg2: u16;
  jump_address: u32;
}

// LongJumpOpcode
export interface LongJumpOpcode {
  address: u32;
  opcode: u8;
  target_script: u16;
  jump_address: u16;
}

// DirectJumpOpcode
export interface DirectJumpOpcode {
  address: u32;
  opcode: u8;
  jump_address: u32;
}

// Choice
export interface Choice {
  address: u32;
  header: [u8, u8, u8, u8, u8, u8, u8, u8, u8, u8];
  sjis_bytes: VecU8;
  unicode: string;
  notes: string | undefined;
  translation: string | undefined;
}

// ChoiceOpcode
export interface ChoiceOpcode {
  address: u32;
  opcode: u8;
  pre_header: [u8, u8];
  n_choices: u8;
  header: [u8, u8, u8];
  choices: Choice[];
  size: usize;
}

// Custom77
export interface Custom77 {
  address: u32;
  opcode: u8;
  condition: u8;
  skip: u16;
  skip_bytes: u16;
}

// InsertOpcode
export interface InsertOpcode {
  contents: Opcode[];
}

// Enum for Opcode types
export enum OpcodeType {
  OP_RESET = 0,
  OP_DIRECT_JUMP = 1,
  OP_JUMP_TO_SCRIPT = 2,
  OP_03 = 3,
  OP_04 = 4,
  OP_SCRIPT_RETURN = 5,
  JE = 6,
  JNE = 7,
  JG = 8,
  JGE = 9,
  JL = 10,
  JLE = 11,
  JZ = 12,
  JNZ = 13,
  Switch = 14,
  OP_10 = 16,
  OP_11 = 17,
  OP_12 = 18,
  OP_13 = 19,
  OP_14 = 20,
  OP_15 = 21,
  OP_16 = 22,
  OP_17 = 23,
  OP_1A = 26,
  OP_1B = 27,
  OP_1C = 28,
  OP_1D = 29,
  OP_1E = 30,
  OP_1F = 31,
  OP_20 = 32,
  OP_21 = 33,
  OP_22 = 34,
  OP_23 = 35,
  OP_24 = 36,
  OP_25 = 37,
  OP_2D = 45,
  OP_2E = 46,
  OP_2F = 47,
  OP_30 = 48,
  OP_CHOICE = 49,
  OP_MENU_CHOICE = 50,
  OP_33 = 51,
  OP_34 = 52,
  OP_36 = 54,
  OP_39 = 57,
  OP_3A = 58,
  OP_3B = 59,
  OP_3C = 60,
  OP_42 = 66,
  OP_43 = 67,
  OP_PLAY_VOICE = 68,
  OP_TEXTBOX_DISPLAY = 69,
  OP_FREE_TEXT_OR_CHARNAME = 71,
  OP_48 = 72,
  OP_CLEAR_SCREEN = 73,
  OP_WAIT = 74,
  OP_4B = 75,
  OP_4C = 76,
  OP_4F = 79,
  OP_51 = 81,
  OP_59 = 89,
  OP_5A = 90,
  OP_5F = 95,
  OP_68 = 104,
  OP_69 = 105,
  OP_6A = 106,
  OP_6C = 108,
  OP_6E = 110,
  OP_6F = 111,
  OP_71 = 113,
  OP_72 = 114,
  OP_74 = 116,
  OP_75 = 117,
  OP_CUSTOM_TIP_77 = 119,
  OP_7B = 123,
  OP_82 = 130,
  OP_83 = 131,
  OP_DEBUG_PRINT = 133,
  OP_SPECIAL_TEXT = 134,
  OP_Insert = 255,
}

// Main Opcode interface
export interface Opcode {
  type: OpcodeType;
  data: SingleByteOpcode
  | DirectJumpOpcode
  | LongJumpOpcode
  | SwitchOpcode
  | StringOpcode
  | String47Opcode
  | JumpOpcode2
  | JumpOpcode4
  | Op44Opcode
  | ChoiceOpcode
  | Custom77
  | InsertOpcode
  | BasicOpcode2
  | BasicOpcode3
  | BasicOpcode4
  | BasicOpcode6
  | BasicOpcode8
  | BasicOpcode10
  | BasicOpcode12
  | BasicOpcode16;
}

export class OP_RESET implements Opcode {
  type: OpcodeType.OP_RESET = OpcodeType.OP_RESET;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_DIRECT_JUMP implements Opcode {
  type: OpcodeType.OP_DIRECT_JUMP = OpcodeType.OP_DIRECT_JUMP;
  data: DirectJumpOpcode;

  constructor(data: DirectJumpOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_JUMP_TO_SCRIPT implements Opcode {
  type: OpcodeType.OP_JUMP_TO_SCRIPT = OpcodeType.OP_JUMP_TO_SCRIPT;
  data: LongJumpOpcode;

  constructor(data: LongJumpOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_03 implements Opcode {
  type: OpcodeType.OP_03 = OpcodeType.OP_03;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_04 implements Opcode {
  type: OpcodeType.OP_04 = OpcodeType.OP_04;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_SCRIPT_RETURN implements Opcode {
  type: OpcodeType.OP_SCRIPT_RETURN = OpcodeType.OP_SCRIPT_RETURN;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JE implements Opcode {
  type: OpcodeType.JE = OpcodeType.JE;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JNE implements Opcode {
  type: OpcodeType.JNE = OpcodeType.JNE;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JG implements Opcode {
  type: OpcodeType.JG = OpcodeType.JG;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JGE implements Opcode {
  type: OpcodeType.JGE = OpcodeType.JGE;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JL implements Opcode {
  type: OpcodeType.JL = OpcodeType.JL;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JLE implements Opcode {
  type: OpcodeType.JLE = OpcodeType.JLE;
  data: JumpOpcode4;

  constructor(data: JumpOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JZ implements Opcode {
  type: OpcodeType.JZ = OpcodeType.JZ;
  data: JumpOpcode2;

  constructor(data: JumpOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class JNZ implements Opcode {
  type: OpcodeType.JNZ = OpcodeType.JNZ;
  data: JumpOpcode2;

  constructor(data: JumpOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class Switch implements Opcode {
  type: OpcodeType.Switch = OpcodeType.Switch;
  data: SwitchOpcode;

  constructor(data: SwitchOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_10 implements Opcode {
  type: OpcodeType.OP_10 = OpcodeType.OP_10;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_11 implements Opcode {
  type: OpcodeType.OP_11 = OpcodeType.OP_11;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_12 implements Opcode {
  type: OpcodeType.OP_12 = OpcodeType.OP_12;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_13 implements Opcode {
  type: OpcodeType.OP_13 = OpcodeType.OP_13;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_14 implements Opcode {
  type: OpcodeType.OP_14 = OpcodeType.OP_14;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_15 implements Opcode {
  type: OpcodeType.OP_15 = OpcodeType.OP_15;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_16 implements Opcode {
  type: OpcodeType.OP_16 = OpcodeType.OP_16;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_17 implements Opcode {
  type: OpcodeType.OP_17 = OpcodeType.OP_17;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1A implements Opcode {
  type: OpcodeType.OP_1A = OpcodeType.OP_1A;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1B implements Opcode {
  type: OpcodeType.OP_1B = OpcodeType.OP_1B;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1C implements Opcode {
  type: OpcodeType.OP_1C = OpcodeType.OP_1C;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1D implements Opcode {
  type: OpcodeType.OP_1D = OpcodeType.OP_1D;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1E implements Opcode {
  type: OpcodeType.OP_1E = OpcodeType.OP_1E;
  data: BasicOpcode10;

  constructor(data: BasicOpcode10) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_1F implements Opcode {
  type: OpcodeType.OP_1F = OpcodeType.OP_1F;
  data: BasicOpcode12;

  constructor(data: BasicOpcode12) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_20 implements Opcode {
  type: OpcodeType.OP_20 = OpcodeType.OP_20;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_21 implements Opcode {
  type: OpcodeType.OP_21 = OpcodeType.OP_21;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_22 implements Opcode {
  type: OpcodeType.OP_22 = OpcodeType.OP_22;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_23 implements Opcode {
  type: OpcodeType.OP_23 = OpcodeType.OP_23;
  data: BasicOpcode8;

  constructor(data: BasicOpcode8) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_24 implements Opcode {
  type: OpcodeType.OP_24 = OpcodeType.OP_24;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_25 implements Opcode {
  type: OpcodeType.OP_25 = OpcodeType.OP_25;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_2D implements Opcode {
  type: OpcodeType.OP_2D = OpcodeType.OP_2D;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_2E implements Opcode {
  type: OpcodeType.OP_2E = OpcodeType.OP_2E;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_2F implements Opcode {
  type: OpcodeType.OP_2F = OpcodeType.OP_2F;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_30 implements Opcode {
  type: OpcodeType.OP_30 = OpcodeType.OP_30;
  data: BasicOpcode10;

  constructor(data: BasicOpcode10) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_CHOICE implements Opcode {
  type: OpcodeType.OP_CHOICE = OpcodeType.OP_CHOICE;
  data: ChoiceOpcode;

  constructor(data: ChoiceOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_MENU_CHOICE implements Opcode {
  type: OpcodeType.OP_MENU_CHOICE = OpcodeType.OP_MENU_CHOICE;
  data: ChoiceOpcode;

  constructor(data: ChoiceOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_33 implements Opcode {
  type: OpcodeType.OP_33 = OpcodeType.OP_33;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_34 implements Opcode {
  type: OpcodeType.OP_34 = OpcodeType.OP_34;
  data: BasicOpcode10;

  constructor(data: BasicOpcode10) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_36 implements Opcode {
  type: OpcodeType.OP_36 = OpcodeType.OP_36;
  data: BasicOpcode3;

  constructor(data: BasicOpcode3) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_39 implements Opcode {
  type: OpcodeType.OP_39 = OpcodeType.OP_39;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_3A implements Opcode {
  type: OpcodeType.OP_3A = OpcodeType.OP_3A;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_3B implements Opcode {
  type: OpcodeType.OP_3B = OpcodeType.OP_3B;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_3C implements Opcode {
  type: OpcodeType.OP_3C = OpcodeType.OP_3C;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_42 implements Opcode {
  type: OpcodeType.OP_42 = OpcodeType.OP_42;
  data: BasicOpcode8;

  constructor(data: BasicOpcode8) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_43 implements Opcode {
  type: OpcodeType.OP_43 = OpcodeType.OP_43;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_PLAY_VOICE implements Opcode {
  type: OpcodeType.OP_PLAY_VOICE = OpcodeType.OP_PLAY_VOICE;
  data: Op44Opcode;

  constructor(data: Op44Opcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_TEXTBOX_DISPLAY implements Opcode {
  type: OpcodeType.OP_TEXTBOX_DISPLAY = OpcodeType.OP_TEXTBOX_DISPLAY;
  data: StringOpcode;

  constructor(data: StringOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_FREE_TEXT_OR_CHARNAME implements Opcode {
  type: OpcodeType.OP_FREE_TEXT_OR_CHARNAME = OpcodeType.OP_FREE_TEXT_OR_CHARNAME;
  data: String47Opcode;

  constructor(data: String47Opcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_48 implements Opcode {
  type: OpcodeType.OP_48 = OpcodeType.OP_48;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_CLEAR_SCREEN implements Opcode {
  type: OpcodeType.OP_CLEAR_SCREEN = OpcodeType.OP_CLEAR_SCREEN;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_WAIT implements Opcode {
  type: OpcodeType.OP_WAIT = OpcodeType.OP_WAIT;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_4B implements Opcode {
  type: OpcodeType.OP_4B = OpcodeType.OP_4B;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_4C implements Opcode {
  type: OpcodeType.OP_4C = OpcodeType.OP_4C;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_4F implements Opcode {
  type: OpcodeType.OP_4F = OpcodeType.OP_4F;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_51 implements Opcode {
  type: OpcodeType.OP_51 = OpcodeType.OP_51;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_59 implements Opcode {
  type: OpcodeType.OP_59 = OpcodeType.OP_59;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_5A implements Opcode {
  type: OpcodeType.OP_5A = OpcodeType.OP_5A;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_5F implements Opcode {
  type: OpcodeType.OP_5F = OpcodeType.OP_5F;
  data: SingleByteOpcode;

  constructor(data: SingleByteOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_68 implements Opcode {
  type: OpcodeType.OP_68 = OpcodeType.OP_68;
  data: BasicOpcode10;

  constructor(data: BasicOpcode10) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_69 implements Opcode {
  type: OpcodeType.OP_69 = OpcodeType.OP_69;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_6A implements Opcode {
  type: OpcodeType.OP_6A = OpcodeType.OP_6A;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_6C implements Opcode {
  type: OpcodeType.OP_6C = OpcodeType.OP_6C;
  data: BasicOpcode16;

  constructor(data: BasicOpcode16) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_6E implements Opcode {
  type: OpcodeType.OP_6E = OpcodeType.OP_6E;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_6F implements Opcode {
  type: OpcodeType.OP_6F = OpcodeType.OP_6F;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_71 implements Opcode {
  type: OpcodeType.OP_71 = OpcodeType.OP_71;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_72 implements Opcode {
  type: OpcodeType.OP_72 = OpcodeType.OP_72;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_74 implements Opcode {
  type: OpcodeType.OP_74 = OpcodeType.OP_74;
  data: BasicOpcode6;

  constructor(data: BasicOpcode6) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_75 implements Opcode {
  type: OpcodeType.OP_75 = OpcodeType.OP_75;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_CUSTOM_TIP_77 implements Opcode {
  type: OpcodeType.OP_CUSTOM_TIP_77 = OpcodeType.OP_CUSTOM_TIP_77;
  data: Custom77;

  constructor(data: Custom77) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_7B implements Opcode {
  type: OpcodeType.OP_7B = OpcodeType.OP_7B;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_82 implements Opcode {
  type: OpcodeType.OP_82 = OpcodeType.OP_82;
  data: BasicOpcode2;

  constructor(data: BasicOpcode2) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_83 implements Opcode {
  type: OpcodeType.OP_83 = OpcodeType.OP_83;
  data: BasicOpcode4;

  constructor(data: BasicOpcode4) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_DEBUG_PRINT implements Opcode {
  type: OpcodeType.OP_DEBUG_PRINT = OpcodeType.OP_DEBUG_PRINT;
  data: StringOpcode;

  constructor(data: StringOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_SPECIAL_TEXT implements Opcode {
  type: OpcodeType.OP_SPECIAL_TEXT = OpcodeType.OP_SPECIAL_TEXT;
  data: StringOpcode;

  constructor(data: StringOpcode) {
    this.data = data;
    assert(this.data.opcode === this.type, `expected ${this.type}, got ${this.data.opcode}`);
  }
}


export class OP_Insert implements Opcode {
  type: OpcodeType.OP_Insert = OpcodeType.OP_Insert;
  data: InsertOpcode;

  constructor(data: InsertOpcode) {
    this.data = data;
  }
}