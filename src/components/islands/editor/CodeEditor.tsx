/**
 * The editor's text pane: CodeMirror 6 with Markdown highlighting in the site's colours, soft wrap, undo
 * history and search. Loaded only by the editor page. Pasted or dropped image files go to `onFiles`, which
 * answers the Markdown to insert where they landed. Tab is left to the browser so keyboard users can leave
 * the pane; indent with spaces.
 */
import * as React from 'react';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdownLanguage } from '@codemirror/lang-markdown';
import { HighlightStyle, LanguageSupport, syntaxHighlighting } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';

const highlight = HighlightStyle.define([
  { tag: t.heading, fontWeight: '600', color: 'var(--foreground)' },
  { tag: [t.heading1, t.heading2], fontWeight: '650' },
  { tag: t.strong, fontWeight: '650' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: [t.link, t.url], color: 'var(--raft-violet)' },
  { tag: [t.monospace, t.processingInstruction], color: 'var(--raft-ok)' },
  { tag: [t.quote], color: 'var(--muted-foreground)' },
  { tag: [t.meta, t.comment, t.contentSeparator], color: 'var(--muted-foreground)' },
  { tag: [t.list], color: 'var(--raft-bar)' },
]);

const theme = EditorView.theme({
  '&': { height: '100%', backgroundColor: 'var(--raft-code-bg)', color: 'var(--foreground)', fontSize: '0.875rem' },
  '.cm-scroller': { fontFamily: 'var(--font-mono)', lineHeight: '1.6' },
  '.cm-content': { padding: '1rem 0', caretColor: 'var(--foreground)' },
  '.cm-line': { padding: '0 1rem' },
  '&.cm-focused': { outline: 'none' },
  '.cm-cursor': { borderLeftColor: 'var(--foreground)' },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': { backgroundColor: 'color-mix(in oklch, var(--raft-violet) 22%, transparent)' },
  '.cm-placeholder': { color: 'var(--muted-foreground)' },
});

/** Insert a block (an image) at `at` with a blank line before it, so it never continues a list or a quote. */
function insertBlock(v: EditorView, at: number, text: string) {
  const before = v.state.doc.sliceString(Math.max(0, at - 2), at);
  const gap = at === 0 || before === '\n\n' ? '' : before.endsWith('\n') ? '\n' : '\n\n';
  const insert = gap + text;
  v.dispatch({ changes: { from: at, insert }, selection: { anchor: at + insert.length } });
}

export interface CodeEditorHandle {
  /** Insert a block of Markdown at the cursor, on its own paragraph. */
  insert: (text: string) => void;
  focus: () => void;
}

interface Props {
  /** The text to start from; a new `docKey` replaces the content with it. */
  value: string;
  docKey: string;
  onChange: (text: string) => void;
  /** Image files pasted or dropped: answers the Markdown to insert, or null to ignore them. */
  onFiles: (files: File[]) => Promise<string | null>;
  label: string;
}

const CodeEditor = React.forwardRef<CodeEditorHandle, Props>(function CodeEditor({ value, docKey, onChange, onFiles, label }, ref) {
  const host = React.useRef<HTMLDivElement>(null);
  const view = React.useRef<EditorView | null>(null);
  const handlers = React.useRef({ onChange, onFiles });
  handlers.current = { onChange, onFiles };

  React.useImperativeHandle(ref, () => ({
    insert(text: string) {
      const v = view.current;
      if (!v) return;
      insertBlock(v, v.state.selection.main.head, text);
      v.focus();
    },
    focus: () => view.current?.focus(),
  }));

  React.useEffect(() => {
    if (!host.current) return;
    const filesFrom = (list: FileList | null | undefined) => [...(list ?? [])].filter((f) => f.type.startsWith('image/'));
    const take = (files: File[], at: number) => {
      handlers.current.onFiles(files).then((text) => {
        const v = view.current;
        if (!text || !v) return;
        insertBlock(v, at, text);
      });
    };
    const v = new EditorView({
      parent: host.current,
      state: EditorState.create({
        doc: value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          // The bare language: `markdown()` would also load the HTML, CSS and JavaScript grammars for embedded HTML.
          new LanguageSupport(markdownLanguage),
          syntaxHighlighting(highlight),
          EditorView.lineWrapping,
          theme,
          placeholderExt('Write Markdown here…'),
          EditorView.contentAttributes.of({ 'aria-label': label, 'aria-multiline': 'true', spellcheck: 'true', autocapitalize: 'sentences' }),
          EditorView.updateListener.of((u) => {
            if (u.docChanged) handlers.current.onChange(u.state.doc.toString());
          }),
          EditorView.domEventHandlers({
            paste(event, v) {
              const files = filesFrom(event.clipboardData?.files);
              if (!files.length) return false;
              event.preventDefault();
              take(files, v.state.selection.main.head);
              return true;
            },
            drop(event, v) {
              const files = filesFrom(event.dataTransfer?.files);
              if (!files.length) return false;
              event.preventDefault();
              const at = v.posAtCoords({ x: event.clientX, y: event.clientY }) ?? v.state.selection.main.head;
              take(files, at);
              return true;
            },
          }),
        ],
      }),
    });
    view.current = v;
    return () => {
      v.destroy();
      view.current = null;
    };
    // The view is rebuilt only for another entry; typing never resets it.
  }, [docKey]);

  return <div ref={host} className="h-full min-h-[24rem] overflow-hidden" />;
});

export default CodeEditor;
