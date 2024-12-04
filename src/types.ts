// Basic types
type u8 = number;
type u16 = number;
type u32 = number;
type usize = number;
type VecU8 = number[];
type OptionU16 = number | undefined;

// SingleByteOpcode
interface SingleByteOpcode {
  address: u32;

  opcode: u8;
}

// BasicOpcode2
interface BasicOpcode2 {
  address: u32;

  opcode: u8;
  arg1: u16;
}

// BasicOpcode3
interface BasicOpcode3 {
  address: u32;

  opcode: u8;
  arg1: u16;
  padding: u8;
}

// BasicOpcode4
interface BasicOpcode4 {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
}

// BasicOpcode6
interface BasicOpcode6 {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
}

// BasicOpcode8
interface BasicOpcode8 {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
}

// BasicOpcode10
interface BasicOpcode10 {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
  arg3: u16;
  arg4: u16;
  arg5: u16;
}

// BasicOpcode12
interface BasicOpcode12 {
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
interface BasicOpcode16 {
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
interface Op44Opcode {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
  padding_end: OptionU16;
  size: usize;
}

// SwitchArm
interface SwitchArm {
  index: u16;
  jump_address: u32;
}

// SwitchOpcode
interface SwitchOpcode {
  address: u32;

  opcode: u8;
  comparison_value: u16;
  count: u16;
  arms: SwitchArm[];
  size: usize;
}

// StringOpcode
interface StringOpcode {
  address: u32;

  opcode: u8;
  header: [u8, u8, u8, u8];
  sjis_bytes: VecU8;
  size: usize;
  unicode: string;
}

// String47Opcode
interface String47Opcode {
  address: u32;
  opcode: u8;
  arg1: u16;
  opt_arg2: OptionU16;
  sjis_bytes: VecU8;
  size: usize;
  unicode: string;
}

// JumpOpcode2
interface JumpOpcode2 {
  address: u32;

  opcode: u8;
  arg1: u16;
  jump_address: u32;
}

// JumpOpcode4
interface JumpOpcode4 {
  address: u32;

  opcode: u8;
  arg1: u16;
  arg2: u16;
  jump_address: u32;
}

// LongJumpOpcode
interface LongJumpOpcode {
  address: u32;

  opcode: u8;
  target_script: u16;
  jump_address: u16;
}

// DirectJumpOpcode
interface DirectJumpOpcode {
  address: u32;

  opcode: u8;
  jump_address: u32;
}

// Choice
interface Choice {
  address: u32;
  header: [u8, u8, u8, u8, u8, u8, u8, u8, u8, u8];
  sjis_bytes: VecU8;
  unicode: string;
}

// ChoiceOpcode
interface ChoiceOpcode {
  address: u32;
  opcode: u8;
  pre_header: [u8, u8];
  n_choices: u8;
  header: [u8, u8, u8];
  choices: Choice[];
  size: usize;
}

// Custom77
interface Custom77 {
  address: u32;

  opcode: u8;
  condition: u8;
  skip: u16;
  skip_bytes: u16;
}

// InsertOpcode
interface InsertOpcode {
  contents: Opcode[];
}

// Enum for Opcode types
enum OpcodeType {
  OP_RESET = 0x00,
  OP_DIRECT_JUMP,
  OP_JUMP_TO_SCRIPT,
  OP_03,
  OP_04,
  OP_SCRIPT_RETURN,
  JE,
  JNE,
  JG,
  JGE,
  JL,
  JLE,
  JZ,
  JNZ,
  Switch,
  OP_10,
  OP_11,
  OP_12,
  OP_13,
  OP_14,
  OP_15,
  OP_16,
  OP_17,
  OP_1A,
  OP_1B,
  OP_1C,
  OP_1D,
  OP_1E,
  OP_1F,
  OP_20,
  OP_21,
  OP_22,
  OP_23,
  OP_24,
  OP_25,
  OP_2D,
  OP_2E,
  OP_2F,
  OP_30,
  OP_CHOICE,
  OP_MENU_CHOICE,
  OP_33,
  OP_34,
  OP_36,
  OP_39,
  OP_3A,
  OP_3B,
  OP_3C,
  OP_42,
  OP_43,
  OP_PLAY_VOICE,
  OP_TEXTBOX_DISPLAY,
  OP_FREE_TEXT_OR_CHARNAME,
  OP_48,
  OP_CLEAR_SCREEN,
  OP_WAIT,
  OP_4B,
  OP_4C,
  OP_4F,
  OP_51,
  OP_59,
  OP_5A,
  OP_5F,
  OP_68,
  OP_69,
  OP_6A,
  OP_6C,
  OP_6E,
  OP_6F,
  OP_71,
  OP_72,
  OP_74,
  OP_75,
  OP_CUSTOM_TIP_77,
  OP_7B,
  OP_82,
  OP_83,
  OP_DEBUG_PRINT,
  OP_SPECIAL_TEXT,
  OP_Insert,
}

// Main Opcode interface
interface Opcode {
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

// SingleByteOpcode implementation
class OP_Reset implements Opcode {
  type: OpcodeType.OP_RESET = OpcodeType.OP_RESET;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// DirectJumpOpcode implementation
class OP_DIRECT_JUMP implements Opcode {
  type: OpcodeType.OP_DIRECT_JUMP = OpcodeType.OP_DIRECT_JUMP;
  data: DirectJumpOpcode;

  constructor(address: number, jumpAddress: number) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for direct jump
      address,
      jump_address: jumpAddress
    };
  }
}

// LongJumpOpcode implementation
class OP_JUMP_TO_SCRIPT implements Opcode {
  type: OpcodeType.OP_JUMP_TO_SCRIPT = OpcodeType.OP_JUMP_TO_SCRIPT;
  data: LongJumpOpcode;

  constructor(address: number, target_script: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for jump to script
      address,
      target_script,
      jump_address
    };
  }
}

// BasicOpcode2 implementation
class OP_03 implements Opcode {
  type: OpcodeType.OP_03 = OpcodeType.OP_03;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,
      arg1
    };
  }
}

// BasicOpcode2 implementation
class OP_04 implements Opcode {
  type: OpcodeType.OP_04 = OpcodeType.OP_04;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// SingleByteOpcode implementation
class OP_SCRIPT_RETURN implements Opcode {
  type: OpcodeType.OP_SCRIPT_RETURN = OpcodeType.OP_SCRIPT_RETURN;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// JumpOpcode4 implementation
class JE implements Opcode {
  type: OpcodeType.JE = OpcodeType.JE;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JE
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode4 implementation
class JNE implements Opcode {
  type: OpcodeType.JNE = OpcodeType.JNE;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JNE
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode4 implementation
class JG implements Opcode {
  type: OpcodeType.JG = OpcodeType.JG;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JG
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode4 implementation
class JGE implements Opcode {
  type: OpcodeType.JGE = OpcodeType.JGE;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JGE
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode4 implementation
class JL implements Opcode {
  type: OpcodeType.JL = OpcodeType.JL;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JL
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode4 implementation
class JLE implements Opcode {
  type: OpcodeType.JLE = OpcodeType.JLE;
  data: JumpOpcode4;

  constructor(address: number, arg1: number, arg2: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JLE
      address,

      arg1,
      arg2,
      jump_address
    };
  }
}

// JumpOpcode2 implementation
class JZ implements Opcode {
  type: OpcodeType.JZ = OpcodeType.JZ;
  data: JumpOpcode2;

  constructor(address: number, arg1: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JZ
      address,

      arg1,
      jump_address
    };
  }
}

// JumpOpcode2 implementation
class JNZ implements Opcode {
  type: OpcodeType.JNZ = OpcodeType.JNZ;
  data: JumpOpcode2;

  constructor(address: number, arg1: number, jump_address: number) {
    this.data = { 
      opcode: this.type, // Opcode for JNZ
      address,

      arg1,
      jump_address
    };
  }
}

// SwitchOpcode implementation
class Switch implements Opcode {
  type: OpcodeType.Switch = OpcodeType.Switch;
  data: SwitchOpcode;

  constructor(address: number, comparisonValue: number, count: number, arms: SwitchArm[]) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for Switch
      address,

      comparison_value: comparisonValue,
      count,
      arms,
      size: arms.length * 6
    };
  }
}

// BasicOpcode4 implementation
class OP_10 implements Opcode {
  type: OpcodeType.OP_10 = OpcodeType.OP_10;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_11 implements Opcode {
  type: OpcodeType.OP_11 = OpcodeType.OP_11;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_12 implements Opcode {
  type: OpcodeType.OP_12 = OpcodeType.OP_12;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_13 implements Opcode {
  type: OpcodeType.OP_13 = OpcodeType.OP_13;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_14 implements Opcode {
  type: OpcodeType.OP_14 = OpcodeType.OP_14;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_15 implements Opcode {
  type: OpcodeType.OP_15 = OpcodeType.OP_15;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_16 implements Opcode {
  type: OpcodeType.OP_16 = OpcodeType.OP_16;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_17 implements Opcode {
  type: OpcodeType.OP_17 = OpcodeType.OP_17;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode6 implementation
class OP_1A implements Opcode {
  type: OpcodeType.OP_1A = OpcodeType.OP_1A;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// SingleByteOpcode implementation
class OP_1B implements Opcode {
  type: OpcodeType.OP_1B = OpcodeType.OP_1B;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// SingleByteOpcode implementation
class OP_1C implements Opcode {
  type: OpcodeType.OP_1C = OpcodeType.OP_1C;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// BasicOpcode6 implementation
class OP_1D implements Opcode {
  type: OpcodeType.OP_1D = OpcodeType.OP_1D;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode10 implementation
class OP_1E implements Opcode {
  type: OpcodeType.OP_1E = OpcodeType.OP_1E;
  data: BasicOpcode10;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5
    };
  }
}

// BasicOpcode12 implementation
class OP_1F implements Opcode {
  type: OpcodeType.OP_1F = OpcodeType.OP_1F;
  data: BasicOpcode12;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5,
      arg6
    };
  }
}

// BasicOpcode6 implementation
class OP_20 implements Opcode {
  type: OpcodeType.OP_20 = OpcodeType.OP_20;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode6 implementation
class OP_21 implements Opcode {
  type: OpcodeType.OP_21 = OpcodeType.OP_21;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode4 implementation
class OP_22 implements Opcode {
  type: OpcodeType.OP_22 = OpcodeType.OP_22;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode8 implementation
class OP_23 implements Opcode {
  type: OpcodeType.OP_23 = OpcodeType.OP_23;
  data: BasicOpcode8;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4
    };
  }
}

// BasicOpcode6 implementation
class OP_24 implements Opcode {
  type: OpcodeType.OP_24 = OpcodeType.OP_24;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode4 implementation
class OP_25 implements Opcode {
  type: OpcodeType.OP_25 = OpcodeType.OP_25;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_2D implements Opcode {
  type: OpcodeType.OP_2D = OpcodeType.OP_2D;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// SingleByteOpcode implementation
class OP_2E implements Opcode {
  type: OpcodeType.OP_2E = OpcodeType.OP_2E;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// BasicOpcode2 implementation
class OP_2F implements Opcode {
  type: OpcodeType.OP_2F = OpcodeType.OP_2F;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode10 implementation
class OP_30 implements Opcode {
  type: OpcodeType.OP_30 = OpcodeType.OP_30;
  data: BasicOpcode10;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5
    };
  }
}

// ChoiceOpcode implementation
class OP_CHOICE implements Opcode {
  type: OpcodeType.OP_CHOICE = OpcodeType.OP_CHOICE;
  data: ChoiceOpcode;

  constructor(address: number, n_choices: number, choices: Choice[]) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for OP_CHOICE
      address,

      pre_header: [0, 0], // default
      n_choices,
      header: [0, 0, 0], // default
      choices,
      size: choices.reduce((acc, choice) => acc + choice.unicode.length + choice.header.length, 0) // Assuming size calculation
    };
  }
}

// ChoiceOpcode implementation
class OP_MENU_CHOICE implements Opcode {
  type: OpcodeType.OP_MENU_CHOICE = OpcodeType.OP_MENU_CHOICE;
  data: ChoiceOpcode;

  constructor(address: number, n_choices: number, choices: Choice[]) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for OP_MENU_CHOICE
      address,

      pre_header: [0, 0], // default
      n_choices,
      header: [0, 0, 0], // default
      choices,
      size: choices.reduce((acc, choice) => acc + choice.unicode.length + choice.header.length, 0) // Assuming size calculation
    };
  }
}

// SingleByteOpcode implementation
class OP_33 implements Opcode {
  type: OpcodeType.OP_33 = OpcodeType.OP_33;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// BasicOpcode10 implementation
class OP_34 implements Opcode {
  type: OpcodeType.OP_34 = OpcodeType.OP_34;
  data: BasicOpcode10;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5
    };
  }
}

// BasicOpcode3 implementation
class OP_36 implements Opcode {
  type: OpcodeType.OP_36 = OpcodeType.OP_36;
  data: BasicOpcode3;

  constructor(address: number, arg1: number, padding: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      padding
    };
  }
}

// BasicOpcode4 implementation
class OP_39 implements Opcode {
  type: OpcodeType.OP_39 = OpcodeType.OP_39;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode4 implementation
class OP_3A implements Opcode {
  type: OpcodeType.OP_3A = OpcodeType.OP_3A;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode2 implementation
class OP_3B implements Opcode {
  type: OpcodeType.OP_3B = OpcodeType.OP_3B;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode2 implementation
class OP_3C implements Opcode {
  type: OpcodeType.OP_3C = OpcodeType.OP_3C;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode8 implementation
class OP_42 implements Opcode {
  type: OpcodeType.OP_42 = OpcodeType.OP_42;
  data: BasicOpcode8;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4
    };
  }
}

// BasicOpcode4 implementation
class OP_43 implements Opcode {
  type: OpcodeType.OP_43 = OpcodeType.OP_43;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// Op44Opcode implementation
class OP_PLAY_VOICE implements Opcode {
  type: OpcodeType.OP_PLAY_VOICE = OpcodeType.OP_PLAY_VOICE;
  data: Op44Opcode;

  constructor(address: number, arg1: number, arg2: number, padding_end?: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      padding_end,
      size: 6 // Assuming size calculation
    };
  }
}

// StringOpcode implementation
class OP_TEXTBOX_DISPLAY implements Opcode {
  type: OpcodeType.OP_TEXTBOX_DISPLAY = OpcodeType.OP_TEXTBOX_DISPLAY;
  data: StringOpcode;

  constructor(address: number, header: [number, number, number, number], sjis_bytes: number[], unicode: string) {
    this.data = { 
      opcode: this.type,
      address,

      header,
      sjis_bytes,
      size: header.length + sjis_bytes.length + 1, // Assuming size calculation
      unicode
    };
  }
}

// String47Opcode implementation
class OP_FREE_TEXT_OR_CHARNAME implements Opcode {
  type: OpcodeType.OP_FREE_TEXT_OR_CHARNAME = OpcodeType.OP_FREE_TEXT_OR_CHARNAME;
  data: String47Opcode;

  constructor(address: number, arg1: number, opt_arg2: number | undefined = undefined, sjis_bytes: number[], unicode: string) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      opt_arg2,
      sjis_bytes,
      size: 7 + sjis_bytes.length, // Assuming size calculation
      unicode
    };
  }
}

// BasicOpcode2 implementation
class OP_48 implements Opcode {
  type: OpcodeType.OP_48 = OpcodeType.OP_48;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode4 implementation
class OP_CLEAR_SCREEN implements Opcode {
  type: OpcodeType.OP_CLEAR_SCREEN = OpcodeType.OP_CLEAR_SCREEN;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for clear screen
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode2 implementation
class OP_WAIT implements Opcode {
  type: OpcodeType.OP_WAIT = OpcodeType.OP_WAIT;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type, // Assuming opcode value for wait
      address,

      arg1
    };
  }
}

// BasicOpcode4 implementation
class OP_4B implements Opcode {
  type: OpcodeType.OP_4B = OpcodeType.OP_4B;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode6 implementation
class OP_4C implements Opcode {
  type: OpcodeType.OP_4C = OpcodeType.OP_4C;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode4 implementation
class OP_4F implements Opcode {
  type: OpcodeType.OP_4F = OpcodeType.OP_4F;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode6 implementation
class OP_51 implements Opcode {
  type: OpcodeType.OP_51 = OpcodeType.OP_51;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// SingleByteOpcode implementation
class OP_59 implements Opcode {
  type: OpcodeType.OP_59 = OpcodeType.OP_59;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// SingleByteOpcode implementation
class OP_5A implements Opcode {
  type: OpcodeType.OP_5A = OpcodeType.OP_5A;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// SingleByteOpcode implementation
class OP_5F implements Opcode {
  type: OpcodeType.OP_5F = OpcodeType.OP_5F;
  data: SingleByteOpcode;

  constructor(address: number) {
    this.data = { 
      opcode: this.type,
      address,

    };
  }
}

// BasicOpcode10 implementation
class OP_68 implements Opcode {
  type: OpcodeType.OP_68 = OpcodeType.OP_68;
  data: BasicOpcode10;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5
    };
  }
}

// BasicOpcode2 implementation
class OP_69 implements Opcode {
  type: OpcodeType.OP_69 = OpcodeType.OP_69;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode4 implementation
class OP_6A implements Opcode {
  type: OpcodeType.OP_6A = OpcodeType.OP_6A;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode16 implementation
class OP_6C implements Opcode {
  type: OpcodeType.OP_6C = OpcodeType.OP_6C;
  data: BasicOpcode16;

  constructor(address: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number, arg6: number, arg7: number, arg8: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3,
      arg4,
      arg5,
      arg6,
      arg7,
      arg8
    };
  }
}

// BasicOpcode4 implementation
class OP_6E implements Opcode {
  type: OpcodeType.OP_6E = OpcodeType.OP_6E;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode6 implementation
class OP_6F implements Opcode {
  type: OpcodeType.OP_6F = OpcodeType.OP_6F;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode6 implementation
class OP_71 implements Opcode {
  type: OpcodeType.OP_71 = OpcodeType.OP_71;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode4 implementation
class OP_72 implements Opcode {
  type: OpcodeType.OP_72 = OpcodeType.OP_72;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode6 implementation
class OP_74 implements Opcode {
  type: OpcodeType.OP_74 = OpcodeType.OP_74;
  data: BasicOpcode6;

  constructor(address: number, arg1: number, arg2: number, arg3: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2,
      arg3
    };
  }
}

// BasicOpcode4 implementation
class OP_75 implements Opcode {
  type: OpcodeType.OP_75 = OpcodeType.OP_75;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// Custom77 implementation
class OP_CUSTOM_TIP_77 implements Opcode {
  type: OpcodeType.OP_CUSTOM_TIP_77 = OpcodeType.OP_CUSTOM_TIP_77;
  data: Custom77;

  constructor(address: number, condition: number, skip: number, skip_bytes: number) {
    this.data = { 
      opcode: this.type,
      address,

      condition,
      skip,
      skip_bytes
    };
  }
}

// BasicOpcode4 implementation
class OP_7B implements Opcode {
  type: OpcodeType.OP_7B = OpcodeType.OP_7B;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// BasicOpcode2 implementation
class OP_82 implements Opcode {
  type: OpcodeType.OP_82 = OpcodeType.OP_82;
  data: BasicOpcode2;

  constructor(address: number, arg1: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1
    };
  }
}

// BasicOpcode4 implementation
class OP_83 implements Opcode {
  type: OpcodeType.OP_83 = OpcodeType.OP_83;
  data: BasicOpcode4;

  constructor(address: number, arg1: number, arg2: number) {
    this.data = { 
      opcode: this.type,
      address,

      arg1,
      arg2
    };
  }
}

// StringOpcode implementation
class OP_DEBUG_PRINT implements Opcode {
  type: OpcodeType.OP_DEBUG_PRINT = OpcodeType.OP_DEBUG_PRINT;
  data: StringOpcode;

  constructor(address: number, header: [number, number, number, number], sjis_bytes: number[], unicode: string) {
    this.data = { 
      opcode: this.type,
      address,

      header,
      sjis_bytes,
      size: header.length + sjis_bytes.length + 1, // Assuming size calculation
      unicode
    };
  }
}

// StringOpcode implementation
class OP_SPECIAL_TEXT implements Opcode {
  type: OpcodeType.OP_SPECIAL_TEXT = OpcodeType.OP_SPECIAL_TEXT;
  data: StringOpcode;

  constructor(address: number, header: [number, number, number, number], sjis_bytes: number[], unicode: string) {
    this.data = { 
      opcode: this.type,
      address,

      header,
      sjis_bytes,
      size: header.length + sjis_bytes.length + 1, // Assuming size calculation
      unicode
    };
  }
}

// InsertOpcode implementation
class OP_Insert implements Opcode {
  type: OpcodeType.OP_Insert = OpcodeType.OP_Insert;
  data: InsertOpcode;

  constructor(contents: Opcode[]) {
    this.data = { 
      contents
    };
  }
}