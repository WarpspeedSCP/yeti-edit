/* eslint-disable eqeqeq */
/* eslint-disable curly */
import * as util from './util';

/**
 * Render the document in the webview.
 */
export function calculateStats(path: string, data: string) {

  let text = data.split("\n");
  let n_lines = 0;
  let n_tl = 0;
  let linedata: util.YetiFileInfo = {n_lines, n_tl};
  for (var i = 0; i < text.length - 1; i++) {
    let line = text[i];
		if (line.startsWith("[choice translation]:")) {
      if (line.replace("[choice translation]:", "").trim().length > 0) {
        linedata.n_tl += 1;
      }
      linedata.n_lines += 1;
    } else if (line.startsWith("[translation]:")) {
      if (line.replace("[translation]:", "").trim().length > 0) {
        linedata.n_tl += 1;
      }
      linedata.n_lines += 1;
		}
  }
  return linedata;
}

export function aggregateStats(data: { [key: string]: util.YetiFileInfo }) {
  let aggregate: util.YetiFileInfo = {
    n_tl: 0,
    n_lines: 0
  };

  for (let i in data) {
    aggregate.n_lines += data[i].n_lines;
    aggregate.n_tl += data[i].n_tl;
  }
  
  return aggregate;
}