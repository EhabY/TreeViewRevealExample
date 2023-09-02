import * as vscode from 'vscode';

export class TestView {
	private promiseQueue = Promise.resolve();

	constructor(context: vscode.ExtensionContext) {
		const provider = new NodeWithIdTreeDataProvider();
		const view = vscode.window.createTreeView('testView', { treeDataProvider: provider, showCollapseAll: true });
		context.subscriptions.push(view);
		vscode.commands.registerCommand('testView.reveal', async () => {
			// refresh the parent
			provider.refresh();

			// Reveal the child which will load the parent
			this.promiseQueue = this.promiseQueue.then(async () => view.reveal({ key: "aa" }, { focus: true, select: false }));
			return this.promiseQueue;
		});
	}
}

const tree: any = {
	'a': {
		'aa': {
			'aaa': {}
		},
		'ab': {}
	},
	'b': {
		'ba': {},
		'bb': {}
	}
};
const nodes: any = {};

class NodeWithIdTreeDataProvider implements vscode.TreeDataProvider<{ key: string }> {

    private readonly _onDidChangeTreeData = new vscode.EventEmitter<{ key: string; } | undefined>();
	onDidChangeTreeData: vscode.Event<{ key: string; } | undefined> = this._onDidChangeTreeData.event;

	getTreeItem(element: { key: string; }): vscode.TreeItem | Thenable<vscode.TreeItem> {
		const treeItem = getTreeItem(element.key);
		treeItem.id = element.key;
		return treeItem;
	}

	async getChildren(element?: { key: string; } | undefined): Promise<{ key: string; }[]> {
		await new Promise(resolve => setTimeout(resolve, 1000));
		return getChildren(element ? element.key : undefined).map(key => getNode(key));
	}

	getParent?(element: { key: string; }): vscode.ProviderResult<{ key: string; }> {
		const parentKey = element.key.substring(0, element.key.length - 1);
		return parentKey ? new Key(parentKey) : undefined;
	}

	refresh(element?: { key: string; }) {
		this._onDidChangeTreeData.fire(element);
	}
	
}

function getChildren(key: string | undefined): string[] {
	if (!key) {
		return Object.keys(tree);
	}
	const treeElement = getTreeElement(key);
	if (treeElement) {
		return Object.keys(treeElement);
	}
	return [];
}

function getTreeItem(key: string): vscode.TreeItem {
	const treeElement = getTreeElement(key);
	// An example of how to use codicons in a MarkdownString in a tree item tooltip.
	const tooltip = new vscode.MarkdownString(`$(zap) Tooltip for ${key}`, true);
	return {
		label: /**vscode.TreeItemLabel**/<any>{ label: key, highlights: key.length > 1 ? [[key.length - 2, key.length - 1]] : void 0 },
		tooltip,
		collapsibleState: treeElement && Object.keys(treeElement).length ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None
	};
}

function getTreeElement(element: string): any {
	let parent = tree;
	for (let i = 0; i < element.length; i++) {
		parent = parent[element.substring(0, i + 1)];
		if (!parent) {
			return null;
		}
	}
	return parent;
}

function getNode(key: string): { key: string } {
	if (!nodes[key]) {
		nodes[key] = new Key(key);
	}
	return nodes[key];
}

class Key {
	constructor(readonly key: string) { }
}