/* eslint-disable eqeqeq */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as calc from './calc';
import { YetiContext } from './util';
import { readFile } from 'fs/promises';

import { spawn } from 'child_process';
import path from 'path';

export const EXTENSION_VERSION = "0.1.0";
const yeti_file_regex = /[0-9]{4}\.txt$/;

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

	let outputchannel = vscode.window.createOutputChannel("yeti");

	let buildCommand = vscode.commands.registerCommand("yeti-edit.yetiBuildSnBin", async () => {
		let curr_folder = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;
		let existingData = context.workspaceState.get('projectStats') as YetiContext | null | undefined;

		let input_folder = await doFolderSelectDialog(
			existingData?.script_dir,
			"Use the saved yaml file location?",
			"Select the folder containing script yaml files"
		);

		if (!input_folder) {
			vscode.window.showErrorMessage("No yaml folder specified!");
			return;
		}

		let text_script_folder = await doFolderSelectDialog(
			existingData?.script_dir,
			"Use the saved text script location?",
			"Select the folder containing script text files"
		);

		if (!text_script_folder) {
			vscode.window.showErrorMessage("No text folder specified!");
			return;
		}

		let output_folder = await doFolderSelectDialog(
			existingData?.output_dir,
			"Use the saved sn.bin location?",
			"Select where to put sn.bin"
		);

		if (!output_folder) {
			vscode.window.showErrorMessage("sn.bin output folder not specified!");
			return;
		}

		let yeti_cmd_str = null;
		if (!existingData || !existingData.yeti_location) {
			yeti_cmd_str = await doFolderSelectDialog(
				null, 
				"Select the yeti exe file.",
				`Select yeti${process.platform == "win32" ? ".exe" : ""}`,
				true
			);
		} else {
			yeti_cmd_str = existingData?.yeti_location;
		}

		if (!yeti_cmd_str) {
			vscode.window.showErrorMessage("yeti exe location not specified!");
			return;
		}

		let output_file = path.join(output_folder, "sn.bin");
		
		let yeti_cmd = spawn(
			yeti_cmd_str, 
			[
				"pack",
				"--input",
				input_folder,
				"--output",
				output_file,
				"--textdir",
				text_script_folder
			], 
			{
				cwd: curr_folder,
				env: process.env
			}
		);

		yeti_cmd.stdout.on("data", (data) => {
			outputchannel.appendLine(data);
		});

		yeti_cmd.on("close", (code) => {
			if (code == 0) {
				vscode.window.showInformationMessage("sn.bin has been placed at: " + output_file);
			} else {
				vscode.window.showInformationMessage("yeti experienced an error and couldn't create the sn.bin file! Check logs in the output tab at the bottom for details.");
			}
		});

		if (existingData) {
			let new_data: YetiContext = {
				...existingData,
				yeti_location: yeti_cmd_str,
				script_dir: input_folder,
				script_text_dir: text_script_folder,
				output_dir: output_folder,
			};
			context.workspaceState.update('projectStats', new_data);
		} else {
			let t: YetiContext = {
				files: {},
				aggregate: {
					n_lines: 0,
					n_tl: 0,
				},
				version: EXTENSION_VERSION,
				yeti_location: yeti_cmd_str,
				script_dir: input_folder,
				script_text_dir: text_script_folder,
				output_dir: output_folder,
			};
			await context.workspaceState.update('projectStats', t);
			vscode.window.showInformationMessage("Project stats are out of date, updating...");
			vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
		}
	});

	let docChange = vscode.window.onDidChangeActiveTextEditor((e) => {
		if (!e || !yeti_file_regex.test(e.document.fileName)) {
			return;
		}
		let stats = context.workspaceState.get('projectStats') as YetiContext;
		updateStatusDisplay(stats.files[e.document.uri.fsPath], stats.aggregate);

	});

	let textOpen = vscode.workspace.onDidOpenTextDocument(async (e) => {
		if (!e || !yeti_file_regex.test(e.fileName)) {
			return;
		}
		let stats = context.workspaceState.get('projectStats') as YetiContext;
		updateStatusDisplay(stats.files[e.uri.fsPath], stats.aggregate);
	});

	let textChange = vscode.workspace.onDidChangeTextDocument(async (edit) => {
		if (!edit || !yeti_file_regex.test(edit.document.fileName)) {
			return;
		}
		let foundNoUsefulChanges = true;
		for (let change of edit.contentChanges) {
			let line = edit.document.lineAt(change.range.start.line).text;
			if (line.startsWith('[choice translation') || line.startsWith('[translation')) {
				foundNoUsefulChanges = false;
			}
		}

		if (foundNoUsefulChanges) { return; }

		let stats = context.workspaceState.get('projectStats') as YetiContext;
		let new_stats = calc.calculateStats(edit.document.uri.fsPath, edit.document.getText());
		
		let new_agg = stats.aggregate;
		let old_this_file_stats = stats.files[edit.document.uri.fsPath];
		
		new_agg.n_tl -= old_this_file_stats.n_tl;
		new_agg.n_tl += new_stats.n_tl;

		stats.files[edit.document.uri.fsPath] = new_stats;
		stats.aggregate = new_agg;

		await context.workspaceState.update('projectStats', stats);
		updateStatusDisplay(new_stats, stats.aggregate);
	});

	let repopCommand = vscode.commands.registerCommand("yeti-edit.yetiRepopDb", async () => {
		let files =  await vscode.workspace.findFiles("**/[0-9][0-9][0-9][0-9].txt");
		let old_stats = context.workspaceState.get('projectStats') as YetiContext | null | undefined;
		let newstats: YetiContext;
		
		if (old_stats) {
			newstats = {
				...old_stats,
				files: {},
				aggregate: {
					n_lines: 0,
					n_tl: 0,
				},
				version: EXTENSION_VERSION,
			};
		} else {
			newstats = {
				files: {},
				aggregate: {
					n_lines: 0,
					n_tl: 0,
				},
				version: EXTENSION_VERSION,
				script_dir: null,
				script_text_dir: null,
				yeti_location: null,
				output_dir: null,
			};
		}

		let total = files.length;
		let c = 0;

		for (let file of files.sort()) {
			await updateStatusItemCmd(`Updating TL stats (${c}/${total})`);
			let data = await readFile(file.fsPath, { encoding: 'utf8' });
			let linedata = calc.calculateStats(file.fsPath, data);
			newstats.files[file.fsPath] = linedata;
			newstats.aggregate.n_lines += linedata.n_lines;
			newstats.aggregate.n_tl += linedata.n_tl;
			c++;
		}

		await context.workspaceState.update('projectStats', newstats);
		vscode.window.showInformationMessage('Project stats updated.');

		if (vscode.window.activeTextEditor) {
			updateStatusDisplay(newstats.files[vscode.window.activeTextEditor.document.uri.fsPath], newstats.aggregate);
		}
	});

	// context.subscriptions.push(YetiYamlEditorProvider.register(context));
	context.subscriptions.push(repopCommand);
	context.subscriptions.push(yamlIntelSBItem);
	context.subscriptions.push(buildCommand);
	context.subscriptions.push(textChange);
	context.subscriptions.push(docChange);
	context.subscriptions.push(textOpen);

	let existingData = context.workspaceState.get('projectStats') as YetiContext | null | undefined;
	if (!existingData) {
		vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
	} else if (!existingData.version || existingData.version != EXTENSION_VERSION) {
		vscode.window.showInformationMessage('Yeti Edit has been updated.');
		vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
	}
	if (vscode.window.activeTextEditor) {
		updateStatusDisplay(existingData?.files[vscode.window.activeTextEditor.document.uri.fsPath], existingData?.aggregate);
	}

	yamlIntelSBItem.command = "yeti-edit.yetiBuildSnBin";
}

async function updateStatusDisplay(linedata: { n_lines: number; n_tl: number; } | null | undefined, aggregate: { n_lines: number; n_tl: number; } | null | undefined) {
	if (!aggregate) {
		await vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
		return;
	}
	
	let aggFilePercent = ((aggregate.n_tl / aggregate.n_lines) * 100).toFixed(2); 

	if (!linedata) {
		yamlIntelSBItem.text = `Total: ${aggFilePercent}% (${aggregate.n_tl}/${aggregate.n_lines})`;
	} else {
		let currFilePercent = ((linedata.n_tl / linedata.n_lines) * 100).toFixed(2);
		yamlIntelSBItem.text = `Current script: ${currFilePercent}% (${linedata.n_tl}/${linedata.n_lines})`;
	}
		
	yamlIntelSBItem.tooltip = `Total: ${aggFilePercent}% (${aggregate.n_tl}/${aggregate.n_lines})`;
	yamlIntelSBItem.show();	
}

async function doFolderSelectDialog(
	existingData: string | null | undefined,
	input_select_question: string,
	select_title: string,
	select_files: boolean = false
) {
	let input_folder = null;
	if (existingData) {
		let temp = (await vscode.window.showInformationMessage(
			input_select_question,
			"Yes",
			"No"
		).then((choice) => {
			if (choice == "No") {
				return vscode.window.showOpenDialog({
					canSelectMany: false,
					canSelectFiles: select_files,
					canSelectFolders: !select_files,
					title: select_title
				});
			} else {
				return null;
			}
		}))?.[0].fsPath;

		if (temp) {
			input_folder = temp;
		} else {
			input_folder = existingData;
		}
	} else {
		let temp = (await vscode.window.showOpenDialog({
			canSelectMany: false,
			canSelectFiles: select_files,
			canSelectFolders: !select_files,
			title: select_title,
		}))?.[0].fsPath;

		if (temp) {
			input_folder = temp;
		}
	}
	return input_folder;
}

// This method is called when your extension is deactivated
export function deactivate() {}
