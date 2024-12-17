// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { readFileSync } from 'fs';
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { YetiYamlEditorProvider } from './YetiYamlEditor';
import * as calc from './calc';
import { yamlOpts, YetiContext } from './util';



const yaml_file_regex = /\/[0-9]{4}.yaml$/;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	setTimeout(async () => {
		let existingData = context.workspaceState.get('projectStats');

		if (!existingData) {
			let files = await vscode.workspace.findFiles("**/[0-9][0-9][0-9][0-9].yaml");
			let newstats: YetiContext = {
				files: {},
				aggregate: {
					n_lines: 0,
					n_tl: 0,
				}
			};

			for (let file of files.sort()) {
				let data = yaml.parseDocument(readFileSync(file.fsPath, { encoding: 'utf8' }), yamlOpts);
				let linedata = calc.calculateStats(file.fsPath, data);	
				newstats.files[file.fsPath] = linedata;
				newstats.aggregate.n_lines += linedata.n_lines;
				newstats.aggregate.n_tl += linedata.n_tl;
			}

			await context.workspaceState.update('projectStats', undefined);
			await context.workspaceState.update('projectStats', newstats);
			vscode.window.showInformationMessage('Project stats updated. Reopen any files to see project progress.');
		}

	}, 0);


	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "yeti-edit" is now active!');

	context.subscriptions.push(YetiYamlEditorProvider.register(context));

}

// This method is called when your extension is deactivated
export function deactivate() {}
