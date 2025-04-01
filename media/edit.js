/* eslint-disable eqeqeq */
/* eslint-disable curly */
// @ts-check

// Script run within the webview itself.
(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const searchInput = /** @type {HTMLInputElement} */ (document.getElementById("search-input"));
  const searchButton = document.getElementById("search");
  const notesContainer = /** @type {HTMLElement} */ (
    document.querySelector(".notes")
  );
  var insertContainer = null;
  var prev_address = -1;

  function scrollToTargetAdjusted(targetElem){
    var headerOffset = 112;
    var elementPosition = targetElem.getBoundingClientRect().top;
    var offsetPosition = elementPosition + window.scrollY - headerOffset;
    
    window.scrollTo({
         top: offsetPosition,
         behavior: "smooth"
    });

    window.addEventListener(
      "scrollend",
      function () {
        targetElem.classList.add("highlight");
        setTimeout(() => {
          targetElem.classList.remove("highlight");
        }, 1000);        
      },
      {once: true}
    );
  }

  function isBlankOrNull(str) {
    return str === null || str === undefined || str.length === 0 || str.replaceAll(' ', '').length === 0;
  }
  

  function replace_newlines(/** @type {string} */ input) {
    if (input !== null && input !== undefined) {
      return input.replaceAll('"', "<dquote/>").replaceAll('\\', '<bslash/>').replaceAll("\n", "%N");
    } else {
      return "";
    }
  }

  function unreplace_newlines(input) {
    if (input !== null && input !== undefined) {
      return input.replaceAll("%N", "\n").replaceAll('<bslash/>', '\\').replaceAll("<dquote/>", '"');
    } else {
      return "";
    }
  }

  searchButton?.addEventListener("click", (e) => {
    let needle = searchInput.value;
    if (!isBlankOrNull(needle)) {
      let texts = notesContainer.querySelectorAll("div > span.note-text");
      let texts1 = notesContainer.querySelectorAll("div > textarea.note-input");
      for (const i of texts) {
        let text = i.textContent;
        if (!text) continue;
        if (text.search(needle) > -1) {
          let tgt = i.parentElement?.parentElement;
          scrollToTargetAdjusted(tgt);
        }
      }

      for (const i of texts1) {
        let text = i.textContent;
        if (!text) continue;
        if (text.search(needle) > -1) {
          let tgt = i.parentElement?.parentElement;
          scrollToTargetAdjusted(tgt);
        }
      }
    }

  });

  searchInput?.addEventListener("keypress", (e) => {
    if (e.code == "Enter") searchButton?.click();
  });

  document.addEventListener("scroll", (e) => {
    let state = vscode.getState();
    if (state && state.position !== document.documentElement.scrollTop) {
      state.position = document.documentElement.scrollTop;
      vscode.setState(state);
    }
  });

  function update_inner(
    idx,
    note,
    curr_speaker,
    curr_text_idx,
    n_insert,
    linedata,
    curr_speaker_orig,
  ) {
    let mainContainer = notesContainer;

    if (insertContainer !== null) {
      mainContainer = insertContainer;
    }

    if (
      ![0x45, 0x47, 0x86, 0x31, 0x32].includes(note.opcode) &&
      !("contents" in note)
    ) {
      return { ok: false, new_curr_speaker: curr_speaker, new_curr_speaker_orig: curr_speaker_orig };
    }

    if (note.opcode === 0x47 && note.opt_arg2 === null) {
      return { ok: false, new_curr_speaker: note.translation, new_curr_speaker_orig: note.unicode };
    }

    if ("contents" in note) {
      let contents = note.contents;

      insertContainer = document.createElement("div");

      for (let j = 0; j < contents.length; j++) {
        let inner_note = contents[j];
        let { ok, new_curr_speaker, new_curr_speaker_orig } = update_inner(
          idx,
          inner_note,
          curr_speaker,
          curr_text_idx,
          j,
          linedata,
        );
        curr_speaker = new_curr_speaker;
        curr_speaker_orig = new_curr_speaker_orig;
      }

      let temp = insertContainer;
      let wrapper = document.createElement("div");
      wrapper.className = "choice-list";
      wrapper.innerHTML = `<span class="note-title">[${curr_text_idx} + X] Inserted text:</span>`;
      wrapper.appendChild(temp);
      notesContainer.appendChild(wrapper);
      insertContainer = null;
      mainContainer = notesContainer;

      return { ok: false, new_curr_speaker: curr_speaker, new_curr_speaker_orig: curr_speaker_orig };
    } else if (note.opcode === 0x31 || note.opcode === 0x32) {
      let choices = note.choices;

      let choices_outer_container = document.createElement("div");
      choices_outer_container.innerHTML = `<span class="note-title">[${
        curr_text_idx + 1
      }] Choices</span>`;

      mainContainer.appendChild(choices_outer_container);

      let choices_element = document.createElement("div");
      choices_outer_container.appendChild(choices_element);
      choices_element.className = "choice-list";

      let choice_divs = [];

      for (let j = 0; j < choices.length; j++) {
        let choice = choices[j];
        linedata.n_lines += 1;
        if (!isBlankOrNull(choice.translation)) linedata.n_tl += 1;

        let single_choice_div = document.createElement("div");
        single_choice_div.className = "note";

        single_choice_div.innerHTML = `
          <span class="note-title">Choice ${j + 1}:</span>
          <div><span class="note-text" id="${idx}-${j}-unicode">${choice.unicode}</span></div>
          <span class="note-title">Translation:</span>
          <div><textarea class="note-input" id="${idx}-${j}-tl">${
          choice.translation ? unreplace_newlines(choice.translation) : ""
        }</textarea></div>
          <span class="note-title">Notes:</span>
          <div><textarea class="note-input" id="${idx}-${j}-notes">${
          choice.notes ? unreplace_newlines(choice.notes) : ""
        }</textarea></div>
          `;

        add_handlers(
          single_choice_div,
          "_choice",
          n_insert >= 0 ? prev_address : note.address,
          idx,
          j,
          n_insert
        );

        choice_divs.push(single_choice_div);
      }

      choice_divs.forEach((it) => choices_element.appendChild(it));
    } else {
      let speaker_text = "";
      if (curr_speaker != null) {
        speaker_text += curr_speaker + ":";
        curr_speaker = null;
      } else if (curr_speaker_orig != null) {
        speaker_text = "Untranslated Speaker: " + curr_speaker_orig;
      }

      let note_html = `
        <span class="note-title">[${
          n_insert >= 0
            ? "" + curr_text_idx + " : " + (n_insert + 1)
            : curr_text_idx + 1
        }] ${speaker_text}</span>
        <div><span class="note-text" id="${idx}-unicode">${note.unicode}</span></div>
        <span class="note-title">Translation:</span>
        <div><textarea class="note-input" id="${idx}-tl">${
        note.translation ? unreplace_newlines(note.translation) : ""
      }</textarea></div>
        <span class="note-title">Notes:</span>
        <div><textarea class="note-input" id="${idx}-notes">${
        note.notes ? unreplace_newlines(note.notes) : ""
      }</textarea></div>
        `;

      linedata.n_lines += 1;
      if (!isBlankOrNull(note.translation)) linedata.n_tl += 1;

      const element = document.createElement("div");
      element.className = "note";
      mainContainer.appendChild(element);
      element.innerHTML = note_html;
      add_handlers(
        element,
        insertContainer !== null ? "_insert" : "",
        n_insert >= 0 ? prev_address : note.address,
        idx,
        0,
        n_insert
      );
    }

    return { ok: true, new_curr_speaker: null, new_curr_speaker_orig: null };
  }

  function updateStats(data) {
    let linedata = data.this_doc_stats;
    document.getElementById("n_lines").innerText = linedata.n_lines;
    document.getElementById("n_tl").innerText = linedata.n_tl;
    document.getElementById("r_tl").innerText = `${(
      (linedata.n_tl / linedata.n_lines) *
      100
    ).toFixed(2)}%`;

    document.getElementById("n_total_lines").innerText = data.stats.n_lines;
    document.getElementById("n_total_tl").innerText = data.stats.n_tl;
    document.getElementById("r_total_tl").innerText = `${(
      (data.stats.n_tl / data.stats.n_lines) *
      100
    ).toFixed(2)}%`;
  }

  /**
   * Render the document in the webview.
   */
  function updateContent(/** @type {Object} */ data) {
    let text = data.text;

    notesContainer.innerHTML = "";
    let curr_text_idx = 0;
    let curr_speaker = null;
    let curr_speaker_orig = null;

    let n_lines = 0;
    let n_tl = 0;
    let linedata = { n_lines, n_tl };

    for (let i = 0; i < text.opcodes.length; i++) {
      const idx = i;
      let note = text.opcodes[i];

      let res = update_inner(
        idx,
        note,
        curr_speaker,
        curr_text_idx,
        -1,
        linedata,
        curr_speaker_orig,
      );
      prev_address = note.address;
      if (!res.ok) {
        curr_speaker = res.new_curr_speaker;
        curr_speaker_orig = res.new_curr_speaker_orig;
        continue;
      }
      curr_text_idx += 1;
      curr_speaker = res.new_curr_speaker;
      curr_speaker_orig = res.new_curr_speaker_orig;
    }

    document.getElementById("n_lines").innerText = linedata.n_lines;
    document.getElementById("n_tl").innerText = linedata.n_tl;
    document.getElementById("r_tl").innerText = `${(
      (linedata.n_tl / linedata.n_lines) *
      100
    ).toFixed(2)}%`;

    document.getElementById("n_total_lines").innerText = data.stats.n_lines;
    document.getElementById("n_total_tl").innerText = data.stats.n_tl;
    document.getElementById("r_total_tl").innerText = `${(
      (data.stats.n_tl / data.stats.n_lines) *
      100
    ).toFixed(2)}%`;

    let oldstate = vscode.getState();
    oldstate.this_doc_stats = linedata;
    vscode.setState(oldstate);

    if (data.position !== null) {
      document.documentElement.scrollTop = data.position;
    }

    if (data.last_edit !== null) {
      let elem = document.getElementById(data.last_edit);

      elem?.focus();
      if (elem !== null && data.last_edit_text !== null) {
        elem.value = unreplace_newlines(data.last_edit_text);
        elem.setSelectionRange(data.last_cursor_pos, data.last_cursor_pos);
      }
    }
  }

  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    let prevState = vscode.getState();
    if (!prevState) {
      prevState = {
        position: null,
        text: message.data,
        last_edit: null,
        last_edit_text: null,
        last_cursor_pos: null,
        stats: message.stats,
        this_doc_stats: message.this_doc_stats,
      };
    }
    
    if (
      prevState.text == message.data &&
      prevState.stats == message.stats &&
      prevState.this_doc_stats == message.this_doc_stats &&
      document.querySelectorAll("input.note-input").length > 0
    )
      return;

    switch (message.type) {
      case "statupdate": {
        if (prevState.stats == message.stats && prevState.this_doc_stats == message.this_doc_stats) return;
        prevState.stats = message.stats;
        prevState.this_doc_stats = message.this_doc_stats;
        updateStats(prevState);
        return;
      }
      case "inupdate": {
        let newState = {
          position: prevState.position,
          text: message.data,
          last_edit: prevState.last_edit,
          last_edit_text: prevState.last_edit_text,
          last_cursor_pos: prevState.last_cursor_pos,
          stats: prevState.stats,
          this_doc_stats: prevState.this_doc_stats,
        };

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState(newState);

        // Update our webview's content
        updateContent(newState);
        return;
      }
      case "update": {
        let newState = {
          position: prevState.position,
          text: message.data,
          last_edit: prevState.last_edit,
          last_edit_text: null,
          last_cursor_pos: prevState.last_cursor_pos,
          stats: message.stats,
          this_doc_stats: message.this_doc_stats,
        };

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState(newState);

        // Update our webview's content
        updateContent(newState);
        return;
      }
    }
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state);
    vscode.postMessage({ type: "refresh" });
  }

  /**
   * @param {HTMLDivElement} div
   * @param {string} type
   * @param {number} address
   * @param {number} idx
   * @param {number} choice_idx
   * @param {number} insert_idx
   */
  function add_handlers(div, type, address, idx, choice_idx, insert_idx) {
    let textareas = div.querySelectorAll("div > textarea");
    let tl_textarea = textareas[0];
    let notes_textarea = textareas[1];
    let prevInput = tl_textarea.value;

    if (tl_textarea !== null) {
      tl_textarea.addEventListener("beforeinput", (e) => {
        prevInput = e.target.value;
      });
      tl_textarea.addEventListener("input", (e) => {
        let newlined_text = replace_newlines(e.target.value);
        let state = vscode.getState();

        state.last_edit = e.target.id;
        state.last_edit_text = newlined_text;
        state.last_cursor_pos = e.target.selectionStart;
        if (isBlankOrNull(prevInput) && !isBlankOrNull(newlined_text)) {
          state.stats.n_tl += 1;
          state.this_doc_stats.n_tl += 1;
        } else if (!isBlankOrNull(prevInput) && isBlankOrNull(newlined_text)) {
          state.stats.n_tl -= 1;
          state.this_doc_stats.n_tl -= 1;
        }
        vscode.setState(state);
        updateStats(state);
        
        vscode.postMessage({
          type: "edit_translation" + type,
          idx: idx,
          choice_idx: choice_idx,
          insert_idx: insert_idx,
          address: address,
          new_text: newlined_text,
        });
      });
    }

    if (notes_textarea !== null) {
      notes_textarea.addEventListener("input", (e) => {
        let newlined_text = replace_newlines(e.target.value);
        let state = vscode.getState();
        state.last_edit = e.target.id;
        state.last_edit_text = newlined_text;
        state.last_cursor_pos = e.target.selectionStart;
        vscode.setState(state);
        vscode.postMessage({
          type: "edit_notes" + type,
          idx: idx,
          choice_idx: choice_idx,
          insert_idx: insert_idx,
          address: address,
          new_text: newlined_text,
        });
      });
    }
  }
})();
