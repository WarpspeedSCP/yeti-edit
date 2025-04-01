/* eslint-disable eqeqeq */
/* eslint-disable curly */
import * as vscode from 'vscode';
import * as util from './util';
import * as yaml from 'yaml';
import lineColumn from 'line-column';
import semaphore from 'semaphore';
import { EXTENSION_VERSION } from './extension';

export class YetiYamlEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new YetiYamlEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(YetiYamlEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'yeti-edit.yetiYamlEdit';

	constructor(
		private readonly context: vscode.ExtensionContext,
	) { }

	public applyMigrations(text: string) {
		return text
			.replaceAll("|_|", "<dquote/>")
			.replaceAll("|~|", "<bslash/>")
			.replaceAll("\\\"", "<dquote/>");
	}

	/**
	 * Called when our custom editor is opened.
	 * 
	 * 
	 */
	public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		let doc_text = document.getText();

		var doc_stats = this.context.workspaceState.get('projectStats') as util.YetiContext;
		if (!doc_stats || doc_stats.version != EXTENSION_VERSION) {
			doc_text = this.applyMigrations(doc_text);
			doc_stats = {
				files: {},
				aggregate: {
					n_lines: 0,
					n_tl: 0
				},
				version: EXTENSION_VERSION,
				script_dir: null,
				output_dir: null,
				yeti_location: null,
			};
			await vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
		}
		var yml = yaml.parseDocument(doc_text, util.yamlOpts);
		var internal = false;
		var internalGuard = semaphore(1);

		const editTranslation = (
			document: vscode.TextDocument,
			yml: yaml.Document,
			doc_stats: util.YetiContext,
			idx: number,
			choice_idx: number,
			insert_idx: number,
			address: number,
			new_text: string
		) => {
			return editThing(document, yml, doc_stats, "translation", idx, choice_idx, insert_idx, address, new_text);
		};

		const editNotes = (
			document: vscode.TextDocument,
			yml: yaml.Document,
			doc_stats: util.YetiContext,
			idx: number,
			choice_idx: number,
			insert_idx: number,
			address: number,
			new_text: string
		) => {
			return editThing(document, yml, doc_stats, "notes", idx, choice_idx, insert_idx, address, new_text);
		};

		const doEditInner = (
			document: vscode.TextDocument,
			yml: any,
			doc_stats: util.YetiContext,
			note: yaml.YAMLMap,
			type: string,
			new_text: string
		) => {
			let fix = `${type}: "${new_text}"\n`;

			if (type == 'translation') {
				let changed = false;
				if (util.isBlankOrNull(note.get(type) as string) && !util.isBlankOrNull(new_text)) {
					doc_stats.files[document.uri.fsPath].n_tl += 1;
					doc_stats.aggregate.n_tl += 1;
					changed = true;
				} else if (!util.isBlankOrNull(note.get(type) as string) && util.isBlankOrNull(new_text)) {
					doc_stats.files[document.uri.fsPath].n_tl -= 1;
					doc_stats.aggregate.n_tl -= 1;
					changed = true;
				}

				if (changed) {
					this.context.workspaceState.update('projectStats', doc_stats);
					updateWebview('statupdate');
				}
			}

			if (note.has(type)) {
				let offset: yaml.Pair<any, any> = note.items.find((it: yaml.Pair<any, any>) => it.key.value === type)!;
				// we store the original range to replace, because this will probably be invalidated when we run set.
				let prev_offsets: [number, number] = [offset!.key!.range![0], offset!.value!.range![2]];
				note.set(type, new_text);
				return updateTextDocument(document, prev_offsets, fix);
			} else {
				vscode.window.showErrorMessage("Couldn't get correct position info for node, updating the whole document.");
				note.set(type, new_text);
				let str = yaml.stringify(yml);
				return updateWithError(document, str);
			}
		};

		/**
		 * Edit a translation.
		 */
		const editThing = (
			document: vscode.TextDocument,
			yml: any,
			doc_stats: util.YetiContext,
			type: string,
			idx: number,
			choice_idx: number,
			insert_idx: number,
			address: number,
			new_text: string
		) => {
			if (yml.get('opcodes').get(idx).get('address') === address ||
				(yml.get('opcodes').get(idx).has('contents') && yml.get('opcodes').get(idx - 1).get('address') === address)) {
				var op: yaml.YAMLMap = yml.get('opcodes').get(idx);

				if (op.has('contents')) {
					let contents: yaml.YAMLSeq = op.get("contents") as any;

					let note = contents.get(insert_idx) as any;

					return doEditInner(document, yml, doc_stats, note, type, new_text);
				} else if ([0x31, 0x32].includes(op.get("opcode") as number)) {
					let choices: yaml.YAMLSeq = op.get("choices") as any;

					let choice = choices.get(choice_idx) as any;

					return doEditInner(document, yml, doc_stats, choice, type, new_text);
				} else {
					doEditInner(document, yml, doc_stats, op, type, new_text);
				}
			}
		};

		const updateWithError = (document: vscode.TextDocument, text: string) => {
			vscode.window.showErrorMessage("Couldn't get correct position info for node, updating the whole document.");

			const edit = new vscode.WorkspaceEdit();

			// Just replace the entire document every time for this example extension.
			// A more complete extension should compute minimal edits instead.
			edit.replace(
				document.uri,
				new vscode.Range(0, 0, document.lineCount, 0),
				text,
			);

			return vscode.workspace.applyEdit(edit);
		};

		/**
		 * Write out the json to a given document.
		 */
		const updateTextDocument = (document: vscode.TextDocument, prev_offsets: [number, number], replacement: string) => {
			const edit = new vscode.WorkspaceEdit();

			const lcol = lineColumn(document.getText(), { origin: 0 });

			const startLineCol = lcol.fromIndex(prev_offsets[0])!;
			const endLineCol = lcol.fromIndex(prev_offsets[1] - 1)!;

			// Do a minimal edit.
			edit.replace(
				document.uri,
				new vscode.Range(startLineCol.line, startLineCol.col, endLineCol.line, endLineCol.col),
				replacement.substring(0, replacement.length - 1),
			);

			return vscode.workspace.applyEdit(edit);
		};

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		
		webviewPanel.webview.html = this.getHtmlForWebview(
			webviewPanel.webview,
			document.fileName.split('/').reverse()[0]
		);

		function updateWebview(type: string) {
			webviewPanel.webview.postMessage({
				type,
				data: yml,
				stats: doc_stats.aggregate,
				this_doc_stats: doc_stats.files[document.uri.fsPath],
			});
		}

		// Hook up event handlers so that we can synchronize the webview with the text document.
		//
		// The text document acts as our model, so we have to sync change in the document to our
		// editor and sync changes in the editor back to the document.
		// 
		// Remember that a single text document can also be shared between multiple custom
		// editors (this happens for example when you split a custom editor)

		const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(e => {
			if (e.contentChanges.length === 0) return;

			yml = yaml.parseDocument(document.getText(), util.yamlOpts);
			if (e.document.uri.toString() === document.uri.toString()) {

				internalGuard.take(function () {
					if (!internal) {
						updateWebview('update');
					} else {
						internal = false;
					}
					internalGuard.leave();
				});

			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(async e => {
			internalGuard.take(async () => {
				internal = true;
				switch (e.type) {
					case 'refresh':
						internal = false;
						internalGuard.leave();
						updateWebview('update');
						return;
					case 'edit_translation':
					case 'edit_translation_choice':
					case 'edit_translation_insert':
						await editTranslation(
							document,
							yml,
							doc_stats,
							e.idx,
							e.choice_idx ? e.choice_idx : 0,
							e.insert_idx ? e.insert_idx : 0,
							e.address,
							e.new_text,
						);
						break;
					case 'edit_notes':
						await editNotes(
							document,
							yml,
							doc_stats,
							e.idx,
							e.choice_idx ? e.choice_idx : 0,
							e.insert_idx ? e.insert_idx : 0,
							e.address,
							e.new_text,
						);
				}
				internalGuard.leave();
			});
		});

		updateWebview('update');
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview, title: string): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'edit.js'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = util.getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVSCodeUri}" rel="stylesheet" />

				<title>${title}</title>
			</head>
			<body>

				<div class="navbar">
					<div class="parent1">
						<div class="div1"><span>Lines (including choices): </span><span id="n_lines"></span></div>
						<div class="div2"><span>Translated: </span><span  id="n_tl"></span></div>
						<div class="div3"><span>Percentage done: </span><span  id="r_tl"></span></div>
						<div class="div4"><span>Total lines (including choices): </span><span  id="n_total_lines"></span></div>
						<div class="div5"><span>Total translated: </span><span  id="n_total_tl"></span></div>
						<div class="div6"><span>Total percentage done: </span><span  id="r_total_tl"></span></div>
					</div>
					<div class="parent2">
						<div class="div8"><span></span></div>
						<div class="div7">
							<input class="search-input" type="text" id="search-input"></input>
							<button class="search-button" id="search">Search</button>
						</div>
					</div>
				</div>

				<div class="notes">

				</div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}
}
