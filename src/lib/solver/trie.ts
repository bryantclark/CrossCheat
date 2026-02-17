export class TrieNode {
    children: Record<string, TrieNode> = {};
    isTerminal: boolean = false;
}

export class Trie {
    root: TrieNode = new TrieNode();

    insert(word: string): void {
        let node = this.root;
        for (const char of word.toUpperCase()) {
            if (!node.children[char]) {
                node.children[char] = new TrieNode();
            }
            node = node.children[char];
        }
        node.isTerminal = true;
    }

    contains(word: string): boolean {
        let node = this.root;
        for (const char of word.toUpperCase()) {
            if (!node.children[char]) return false;
            node = node.children[char];
        }
        return node.isTerminal;
    }

    getNode(prefix: string): TrieNode | null {
        let node = this.root;
        for (const char of prefix.toUpperCase()) {
            if (!node.children[char]) return null;
            node = node.children[char];
        }
        return node;
    }
}
