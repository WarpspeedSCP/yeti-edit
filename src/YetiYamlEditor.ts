import * as vscode from 'vscode';
import { getNonce, yamlOpts } from './util';
import * as yaml from 'yaml';
import lineColumn from 'line-column';

export class YetiYamlEditorProvider implements vscode.CustomTextEditorProvider {
	public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new YetiYamlEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(YetiYamlEditorProvider.viewType, provider);
		return providerRegistration;
	}

	private static readonly viewType = 'yeti-edit.yetiYamlEdit';

	constructor(
		private readonly context: vscode.ExtensionContext
	) { }

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
		var yml = yaml.parseDocument(document.getText(), yamlOpts);

		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview);

		function updateWebview() {
			webviewPanel.webview.postMessage({
				type: 'update',
				data: yml,
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
			yml = yaml.parseDocument(document.getText(), yamlOpts);
			if (e.document.uri.toString() === document.uri.toString()) {
				updateWebview();
			}
		});

		// Make sure we get rid of the listener when our editor is closed.
		webviewPanel.onDidDispose(() => {
			changeDocumentSubscription.dispose();
		});

		// Receive message from the webview.
		webviewPanel.webview.onDidReceiveMessage(async e => {
			switch (e.type) {
				case 'edit_translation':
				case 'edit_translation_choice':
				case 'edit_translation_insert':
					await this.editTranslation(
						document,
						yml,
						e.idx,
						e.choice_idx ? e.choice_idx : 0,
						e.insert_idx ? e.insert_idx : 0,
						e.address,
						e.new_text
					);
					break;
				case 'edit_notes':
					await this.editNotes(
						document,
						yml,
						e.idx,
						e.choice_idx ? e.choice_idx : 0,
						e.insert_idx ? e.insert_idx : 0,
						e.address,
						e.new_text
					);
			}
		});

		updateWebview();
	}

	/**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview): string {
		// Local path to script and css for the webview
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'edit.js'));

		const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'media', 'vscode.css'));

		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

				<link href="${styleVSCodeUri}" rel="stylesheet" />

				<title>Cat Scratch</title>
			</head>
			<body>
				<div class="notes">

				</div>
				
				<script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
	}

	private editTranslation(document: vscode.TextDocument, yml: yaml.Document, idx: number, choice_idx: number, insert_idx: number, address: number, new_text: string) {
		return this.editThing(document, yml, "translation", idx, choice_idx, insert_idx, address, new_text);
	}

	private editNotes(document: vscode.TextDocument, yml: yaml.Document, idx: number, choice_idx: number, insert_idx: number, address: number, new_text: string) {
		return this.editThing(document, yml, "notes", idx, choice_idx, insert_idx, address, new_text);
	}

	private DoThing(document: vscode.TextDocument, yml: any, note: yaml.YAMLMap, type: string, new_text: string, ) {
		let fix = `${type}: ${new_text}\n`;

		if (note.has(type)) {
			let offset: yaml.Pair<any, any> = note.items.find((it: yaml.Pair<any, any>) => it.key.value === type)!;
			// we store the original range to replace, because this will probably be invalidated when we run set.
			let prev_offsets: [number, number] = [offset!.key!.range![0], offset!.value!.range![2]];
			note.set(type, new_text);
			return this.updateTextDocument(document, prev_offsets, fix);
		} else {
			vscode.window.showErrorMessage("Couldn't get correct position info for node, updating the whole document.");
			note.set(type, new_text);
			let str = yaml.stringify(yml);
			return this.updateWithError(document, str);				
		}
	}

	/**
	 * Edit a translation.
	 */
	private editThing(
		document: vscode.TextDocument,
		yml: any,
		type: string,
		idx: number,
		choice_idx: number,
		insert_idx: number,
		address: number,
		new_text: string
	) {
		if (yml.get('opcodes').get(idx).get('address') === address || 
			(yml.get('opcodes').get(idx).has('contents') && yml.get('opcodes').get(idx - 1).get('address') === address)) {
			var op: yaml.YAMLMap = yml.get('opcodes').get(idx);

			if (op.has('contents')) {
				let contents: yaml.YAMLSeq = op.get("contents") as any;

				let note = contents.get(insert_idx) as any;

				return this.DoThing(document, yml, note, type, new_text);
			} else if ([0x31, 0x32].includes(op.get("opcode") as number)) {
				let choices: yaml.YAMLSeq = op.get("choices") as any;

				let choice = choices.get(choice_idx) as any;

				return this.DoThing(document, yml, choice, type, new_text);
			} else {
				this.DoThing(document, yml, op, type, new_text);
			}
		}
	}

	private updateWithError(document: vscode.TextDocument, text: string) {
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
	}

	/**
	 * Write out the json to a given document.
	 */
	private updateTextDocument(document: vscode.TextDocument, prev_offsets: [number, number], replacement: string) {
		const edit = new vscode.WorkspaceEdit();

		const lcol = lineColumn(document.getText(), { origin: 0 });

		const startLineCol = lcol.fromIndex(prev_offsets[0])!;
		const endLineCol = lcol.fromIndex(prev_offsets[1])!;

		// Do a minimal edit.
		edit.replace(
			document.uri,
			new vscode.Range(startLineCol.line, startLineCol.col, endLineCol.line, endLineCol.col),
			replacement,
		);

		return vscode.workspace.applyEdit(edit);
	}
}