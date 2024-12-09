// @ts-check

// Script run within the webview itself.
(function () {
  // Get a reference to the VS Code webview api.
  // We use this API to post messages back to our extension.

  // @ts-ignore
  const vscode = acquireVsCodeApi();

  const notesContainer = /** @type {HTMLElement} */ (
    document.querySelector(".notes")
  );
  var insertContainer = null;
  var prev_address = -1;

  // const addButtonContainer = document.querySelector('.add-button');
  // addButtonContainer.querySelector('button').addEventListener('edit', () => {
  // 	vscode.postMessage({
  // 		type: 'edit',

  // 	});
  // })

  function replace_newlines(/** @type {string} */ input) {
    return input.replaceAll("\n", "%N");
  }

  function unreplace_newlines(input) {
    if (input !== null && input !== undefined) {
      return input.replaceAll("%N", "\n");
    } else {
      return "";
    }
  }

  const errorContainer = document.createElement("div");
  document.body.appendChild(errorContainer);
  errorContainer.className = "error";
  errorContainer.style.display = "none";

  document.addEventListener('scroll', (e) => {
    let state = vscode.getState();
    if (state && state.position !== document.documentElement.scrollTop) {
      state.position = document.documentElement.scrollTop;
      vscode.setState(state);
    }
  });

  function update_inner(idx, note, curr_speaker, curr_text_idx, n_insert) {
    let mainContainer = notesContainer;

    if (insertContainer !== null) {
      mainContainer = insertContainer;
    }

    if (![0x45, 0x47, 0x86, 0x31, 0x32].includes(note.opcode) && !('contents' in note)) {
      return { ok: false, new_curr_speaker: curr_speaker };
    }

    if (note.opcode === 0x47 && note.opt_arg2 === null) {
      return { ok: false, new_curr_speaker: note.translation };
    }

    if ('contents' in note) {
      let contents = note.contents;

      insertContainer = document.createElement('div');

      for (let j = 0; j < contents.length; j++) {
        let inner_note = contents[j];
        curr_speaker = update_inner(idx, inner_note, curr_speaker, curr_text_idx, j).new_curr_speaker;
      }

      let temp = insertContainer;
      let wrapper = document.createElement('div');
      wrapper.className = "choice-list";
      wrapper.innerHTML = `<span class="note-title">[${curr_text_idx} + X] Inserted text:</span>`;
      wrapper.appendChild(temp);
      notesContainer.appendChild(wrapper);
      insertContainer = null;
      mainContainer = notesContainer;

      return { ok: false, new_curr_speaker: curr_speaker };
    } else if (note.opcode === 0x31 || note.opcode === 0x32) {
      let choices = note.choices;

      let choices_outer_container = document.createElement("div");
      choices_outer_container.innerHTML = `<span class="note-title">[${curr_text_idx + 1}] Choices</span>`;

      mainContainer.appendChild(choices_outer_container);

      let choices_element = document.createElement("div");
      choices_outer_container.appendChild(choices_element);
      choices_element.className = "choice-list";

      let choice_divs = [];

      for (let j = 0; j < choices.length; j++) {
        let choice = choices[j];

        let single_choice_div = document.createElement("div");
        single_choice_div.className = "note";

        single_choice_div.innerHTML = `
          <span class="note-title">Choice ${j + 1}:</span>
          <div><span>${choice.unicode}</span></div>
          <span class="note-title">Translation:</span>
          <div><textarea  id="${idx}-${j}-tl">${
            choice.translation ? unreplace_newlines(choice.translation) : ""
        }</textarea></div>
          <span class="note-title">Notes:</span>
          <div><textarea id="${idx}-${j}-notes">${
            choice.notes ? unreplace_newlines(choice.notes) : ""
        }</textarea></div>
          `;

        add_handlers(
            single_choice_div,
            "_choice",
            n_insert >= 0 ? prev_address : note.address,
            choice,
            idx,
            j,
            n_insert,
        );

        choice_divs.push(single_choice_div);
      }

      choice_divs.forEach((it) => choices_element.appendChild(it));
    } else {
      let speaker_text = "";
      if (curr_speaker !== null) {
        speaker_text += curr_speaker + ':';
        curr_speaker = null;
      }

      let note_html = `
        <span class="note-title">[${n_insert >= 0 ? ( '' + (curr_text_idx) + ' : ' + (n_insert + 1) ) : (curr_text_idx + 1)}] ${speaker_text}</span>
        <div><span>${note.unicode}</span></div>
        <span class="note-title">Translation:</span>
        <div><textarea id="${idx}-tl">${
          note.translation ? unreplace_newlines(note.translation) : ""
      }</textarea></div>
        <span class="note-title">Notes:</span>
        <div><textarea id="${idx}-notes">${
          note.notes ? unreplace_newlines(note.notes) : ""
      }</textarea></div>
        `;

      const element = document.createElement("div");
      element.className = "note";
      mainContainer.appendChild(element);
      element.innerHTML = note_html;
      add_handlers(
        element,
        insertContainer !== null ? "_insert" : "",
        n_insert >= 0 ? prev_address : note.address,
        note,
        idx,
        0,
        n_insert
      );
    }

    return { ok: true, new_curr_speaker: null };
  }

  /**
   * Render the document in the webview.
   */
  function updateContent(/** @type {Object} */ data) {
    notesContainer.style.display = "";
    errorContainer.style.display = "none";

    let text = data.text;

    notesContainer.innerHTML = "";
    let curr_text_idx = 0;
    let curr_speaker = null;
    for (let i = 0; i < text.opcodes.length; i++) {
      const idx = i;
      let note = text.opcodes[i];

      let res = update_inner(idx, note, curr_speaker, curr_text_idx, -1);
      prev_address = note.address;
      if (!res.ok) {
        curr_speaker = res.new_curr_speaker;        
        continue;
      }
      curr_text_idx += 1;
      curr_speaker = res.new_curr_speaker;
    }

    if (data.position !== null) {
      document.documentElement.scrollTop = data.position;
    }
  }
  // Handle messages sent from the extension to the webview
  window.addEventListener("message", (event) => {
    const message = event.data; // The json data that the extension sent
    let prevState = vscode.getState();
    if (!prevState) {
      prevState = { position: null, text: message.data };
    }
    switch (message.type) {
      case "update":
        // Update our webview's content
        updateContent({ position: prevState.position, text: message.data });

        // Then persist state information.
        // This state is returned in the call to `vscode.getState` below when a webview is reloaded.
        vscode.setState({ position: prevState.position, text: message.data });

        return;
    }
  });

  // Webviews are normally torn down when not visible and re-created when they become visible again.
  // State lets us save information across these re-loads
  const state = vscode.getState();
  if (state) {
    updateContent(state);
  }

  /**
   * @param {HTMLDivElement} div
   * @param {string} type
   * @param {number} address
   * @param {{ translation: string; notes: string; }} note
   * @param {number} idx
   * @param {number} choice_idx
   * @param {number} insert_idx
   */
  function add_handlers(div, type, address, note, idx, choice_idx, insert_idx) {
    let textareas = div.querySelectorAll("div > textarea");
    let tl_textarea = textareas[0];
    let notes_textarea = textareas[1];

    if (tl_textarea !== null) {
      tl_textarea.addEventListener("change", (e) => {
        let newlined_text = replace_newlines(e.target.value);
        note.translation = newlined_text;
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
      notes_textarea.addEventListener("change", (e) => {
        let newlined_text = replace_newlines(e.target.value);
        note.notes = newlined_text;
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
