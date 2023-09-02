'use strict';

import * as vscode from 'vscode';
import { TestView } from './testView';

export function activate(context: vscode.ExtensionContext) {
	// Test View
	new TestView(context);
}