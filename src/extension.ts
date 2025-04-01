/* eslint-disable eqeqeq */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as yaml from 'yaml';
import { YetiYamlEditorProvider } from './YetiYamlEditor';
import * as calc from './calc';
import { yamlOpts, YetiContext } from './util';
import { readFile } from 'fs/promises';

import exec, { spawn } from 'child_process';
import path from 'path';
import { exists, existsSync } from 'fs';

export const EXTENSION_VERSION = "0.0.6";

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
			"Use the saved scenario location?",
			"Select the folder containing script files"
		);

		if (!input_folder) {
			vscode.window.showErrorMessage("No scenario folder specified!");
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
				"recomp",
				"--input",
				input_folder,
				"--output",
				output_file
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
				output_dir: output_folder,
			};
			await context.workspaceState.update('projectStats', t);
			vscode.window.showInformationMessage("Project stats are out of date; Please wait...");
			vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
		}
	});


	let repopCommand = vscode.commands.registerCommand("yeti-edit.yetiRepopDb", async () => {
		let files =  await vscode.workspace.findFiles("**/[0-9][0-9][0-9][0-9].yaml");
		let newstats: YetiContext = {
			files: {},
			aggregate: {
				n_lines: 0,
				n_tl: 0,
			},
			version: EXTENSION_VERSION,
			script_dir: null,
			output_dir: null,
			yeti_location: null,
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

	context.subscriptions.push(YetiYamlEditorProvider.register(context));
	context.subscriptions.push(repopCommand);
	context.subscriptions.push(yamlIntelSBItem);
	context.subscriptions.push(buildCommand);

	let existingData = context.workspaceState.get('projectStats') as YetiContext | null | undefined;
	if (!existingData) {
		vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
	} else if (!existingData.version || existingData.version != EXTENSION_VERSION) {
		vscode.window.showInformationMessage('Yeti Edit has been updated. Please restart VSCode after project stats are refreshed.');
		vscode.commands.executeCommand("yeti-edit.yetiRepopDb");
	}
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
