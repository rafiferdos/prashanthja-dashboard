'use client'

import {
  BlockquotePlugin,
  BoldPlugin,
  CodePlugin,
  H1Plugin,
  H2Plugin,
  H3Plugin,
  HighlightPlugin,
  HorizontalRulePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin
} from '@platejs/basic-nodes/react'
import {
  IconBlockquote,
  IconBold,
  IconCode,
  IconH1,
  IconH2,
  IconH3,
  IconHighlight,
  IconItalic,
  IconLineDashed,
  IconStrikethrough,
  IconSubscript,
  IconSuperscript,
  IconUnderline
} from '@tabler/icons-react'
import { normalizeNodeId } from 'platejs'
import { Plate, useEditorRef, usePlateEditor } from 'platejs/react'
import { useCallback } from 'react'

import { BasicNodesKit } from '@/components/basic-nodes-kit'
import { Editor, EditorContainer } from '@/components/ui/editor'
import { MarkToolbarButton } from '@/components/ui/mark-toolbar-button'
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator
} from '@/components/ui/toolbar'

// ─── Block toolbar button ────────────────────────────────────────────────────
function BlockToolbarButton({
  type,
  children,
  tooltip
}: {
  type: string
  children: React.ReactNode
  tooltip?: string
}) {
  const editor = useEditorRef()

  const handleClick = useCallback(() => {
    editor.tf.toggleBlock(type)
    editor.tf.focus()
  }, [editor, type])

  return (
    <button
      type='button'
      title={tooltip}
      onMouseDown={(e) => {
        e.preventDefault()
        handleClick()
      }}
      className='inline-flex h-8 min-w-8 cursor-pointer items-center justify-center gap-2 rounded-md px-1.5 text-sm font-medium outline-none transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4'
    >
      {children}
    </button>
  )
}

// ─── Editor toolbar ──────────────────────────────────────────────────────────
function EditorToolbar() {
  return (
    <Toolbar className='flex w-full flex-wrap gap-0.5 border-b px-2 py-1.5 bg-muted/40'>
      {/* Headings */}
      <ToolbarGroup>
        <BlockToolbarButton
          type={H1Plugin.key}
          tooltip='Heading 1 (Ctrl+Alt+1)'
        >
          <IconH1 />
        </BlockToolbarButton>
        <BlockToolbarButton
          type={H2Plugin.key}
          tooltip='Heading 2 (Ctrl+Alt+2)'
        >
          <IconH2 />
        </BlockToolbarButton>
        <BlockToolbarButton
          type={H3Plugin.key}
          tooltip='Heading 3 (Ctrl+Alt+3)'
        >
          <IconH3 />
        </BlockToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Basic marks */}
      <ToolbarGroup>
        <MarkToolbarButton nodeType={BoldPlugin.key} tooltip='Bold (Ctrl+B)'>
          <IconBold />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={ItalicPlugin.key}
          tooltip='Italic (Ctrl+I)'
        >
          <IconItalic />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={UnderlinePlugin.key}
          tooltip='Underline (Ctrl+U)'
        >
          <IconUnderline />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={StrikethroughPlugin.key}
          tooltip='Strikethrough (Ctrl+Shift+X)'
        >
          <IconStrikethrough />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Script / highlight / code */}
      <ToolbarGroup>
        <MarkToolbarButton
          nodeType={SubscriptPlugin.key}
          clear={[SuperscriptPlugin.key]}
          tooltip='Subscript (Ctrl+,)'
        >
          <IconSubscript />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={SuperscriptPlugin.key}
          clear={[SubscriptPlugin.key]}
          tooltip='Superscript (Ctrl+.)'
        >
          <IconSuperscript />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={HighlightPlugin.key}
          tooltip='Highlight (Ctrl+Shift+H)'
        >
          <IconHighlight />
        </MarkToolbarButton>
        <MarkToolbarButton
          nodeType={CodePlugin.key}
          tooltip='Inline code (Ctrl+E)'
        >
          <IconCode />
        </MarkToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Block elements */}
      <ToolbarGroup>
        <BlockToolbarButton type={BlockquotePlugin.key} tooltip='Blockquote'>
          <IconBlockquote />
        </BlockToolbarButton>
        <BlockToolbarButton type={HorizontalRulePlugin.key} tooltip='Divider'>
          <IconLineDashed />
        </BlockToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  )
}

// ─── Main editor ─────────────────────────────────────────────────────────────
export interface RichTextEditorProps {
  initialContent?: object[]
  placeholder?: string
  onChange?: (value: object[]) => void
  minHeight?: string
}

const DEFAULT_VALUE = normalizeNodeId([{ type: 'p', children: [{ text: '' }] }])

export function RichTextEditor({
  initialContent,
  placeholder = 'Start writing…',
  onChange,
  minHeight = '420px'
}: RichTextEditorProps) {
  const editor = usePlateEditor({
    plugins: BasicNodesKit,
    value:
      initialContent?.length ?
        normalizeNodeId(initialContent as Parameters<typeof normalizeNodeId>[0])
      : DEFAULT_VALUE
  })

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => onChange?.(value as object[])}
    >
      {/* Sticky toolbar */}
      <div className='flex flex-col overflow-hidden rounded-2xl border ring-1 ring-foreground/5 bg-background focus-within:ring-ring/30 transition-shadow'>
        <EditorToolbar />
        <EditorContainer>
          <Editor
            placeholder={placeholder}
            style={{ minHeight }}
            className='px-8 py-5 text-base'
          />
        </EditorContainer>
      </div>
    </Plate>
  )
}
