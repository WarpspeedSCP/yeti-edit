/* eslint-disable eqeqeq */
/* eslint-disable curly */
import * as util from './util';
import * as yaml from 'yaml';

function calculate_inner(note: yaml.YAMLMap, linedata: { n_lines: number, n_tl: number }) {
    if (![0x45, 0x47, 0x86, 0x31, 0x32].includes(note.get('opcode') as number) && !note.has('contents')) {
      return;
    }

    if (note.get('opcode') === 0x47 && note.get('opt_arg2') == null) {
      return;
    }

    if (note.has('contents')) {
      let contents = note.get('contents') as yaml.YAMLSeq;

      for (let j = 0; j < contents.items.length; j++) {
        let inner_note = contents.get(j) as yaml.YAMLMap;
        calculate_inner(inner_note, linedata);
      }

      return;
    } else if (note.get('opcode') === 0x31 || note.get('opcode') === 0x32) {
      let choices = note.get('choices') as yaml.YAMLSeq;

      for (let j = 0; j < choices.items.length; j++) {
        let choice = choices.get(j) as yaml.YAMLMap;
        linedata.n_lines += 1;
        if (!util.isBlankOrNull(choice.get('translation') as string)) linedata.n_tl += 1;
      }
    } else {
      linedata.n_lines += 1;
      if (!util.isBlankOrNull(note.get('translation') as string)) linedata.n_tl += 1;
    }

    return;
  }

  /**
   * Render the document in the webview.
   */
export function calculateStats(path: string, data: yaml.Document) {

    let text = data;
    let n_lines = 0;
    let n_tl = 0;
    let linedata: util.YetiFileInfo = {n_lines, n_tl};

    let opcodes = text.get('opcodes') as yaml.YAMLSeq;
    for (let i = 0; i < opcodes.items.length; i++) {
      let note = opcodes.get(i) as yaml.YAMLMap;

      calculate_inner(note, linedata);
    }

    return linedata;
  }