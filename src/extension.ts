/* eslint-disable eqeqeq */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { YetiYamlEditorProvider } from './YetiYamlEditor';
import * as calc from './calc';
import { yamlOpts, YetiContext } from './util';
import { readFile } from 'fs/promises';



const yaml_file_regex = /\/[0-9]{4}.yaml$/;
var yamlIntelSBItem: vscode.StatusBarItem;

const updateStatusItemCmd = async (text: string) => {
	yamlIntelSBItem.text = text;
	yamlIntelSBItem.show();
};

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	yamlIntelSBItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1);
	yamlIntelSBItem.color = "#FFFFFF";
	yamlIntelSBItem.text = "Updating TL stats (0/0)";

	let repopCommand = vscode.commands.registerCommand("yeti-edit.yetiRepopDb", async () => {
		let files =  await vscode.workspace.findFiles("**/[0-9][0-9][0-9][0-9].yaml");
		let newstats: YetiContext = {
			files: {},
			aggregate: {
				n_lines: 0,
				n_tl: 0,
			}
		};
		let total = files.length;
		let c = 0;

		for (let file of files.sort()) {
			await updateStatusItemCmd(`Updating TL stats (${c}/${total})`);
			let data = yaml.parseDocument(await readFile(file.fsPath, { encoding: 'utf8' }), yamlOpts);
			let linedata = calc.calculateStats(file.fsPath, data);	
			newstats.files[file.fsPath] = linedata;
			newstats.aggregate.n_lines += linedata.n_lines;
			newstats.aggregate.n_tl += linedata.n_tl;
			c++;
		}

		await context.workspaceState.update('projectStats', newstats);
		vscode.window.showInformationMessage('Project stats updated. Restart vscode to see correct project progress.');
		yamlIntelSBItem.hide();
	});

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "yeti-edit" is now active!');

	context.subscriptions.push(YetiYamlEditorProvider.register(context));
	context.subscriptions.push(repopCommand);
	context.subscriptions.push(yamlIntelSBItem);

	let existingData = context.workspaceState.get('projectStats');
	if (existingData == null) {
		vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
	}

}

// This method is called when your extension is deactivated
export function deactivate() {}
