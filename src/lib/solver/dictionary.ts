import { Trie } from './trie';

const DICTIONARY_URL = 'https://raw.githubusercontent.com/dolph/dictionary/master/enable1.txt';

let trieInstance: Trie | null = null;

export async function loadDictionary(): Promise<Trie> {
    if (trieInstance) return trieInstance;

    const response = await fetch(DICTIONARY_URL);
    const text = await response.text();
    const words = text.split('\n');

    trieInstance = new Trie();
    for (const word of words) {
        const trimmed = word.trim();
        if (trimmed) {
            trieInstance.insert(trimmed);
        }
    }

    // console.log(`Loaded ${words.length} words into Trie`);
    return trieInstance;
}
