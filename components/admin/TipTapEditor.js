"use client";

/**
 * PLACEHOLDER editor — reconstructed for Learnbee because the install bundle
 * shipped without `components/admin/TipTapEditor`. It is a functional TipTap
 * editor (bold/italic/headings/lists/links/images with upload) so authoring
 * works today. Replace with Bsharp's full editor (which adds the CTA-block
 * extension wired to `rehype-learnbee-cta`) when that file is provided.
 *
 * Contract used by app/blog/blog-admin/page.js:
 *   <TipTapEditor content={html} onChange={(html)=>...} onImageUpload={(file)=>Promise<path>} />
 */

import { useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  ImageUp,
  Undo2,
  Redo2,
} from "lucide-react";

function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`flex h-8 w-8 items-center justify-center rounded-md text-slate-600 transition hover:bg-slate-100 disabled:opacity-40 ${
        active ? "bg-violet-100 text-violet-700" : ""
      }`}
    >
      {children}
    </button>
  );
}

export default function TipTapEditor({ content = "", onChange, onImageUpload }) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Image.configure({ inline: false, allowBase64: false }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content: content || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[60vh] px-6 py-5 focus:outline-none blog-reading-prose",
      },
      handlePaste: (view, event) => insertDroppedImages(event.clipboardData),
      handleDrop: (view, event) => insertDroppedImages(event.dataTransfer, event),
    },
    onUpdate: ({ editor }) => onChangeRef.current?.(editor.getHTML()),
  });

  // Keep external content in sync (e.g. when Edit loads an existing post).
  useEffect(() => {
    if (!editor) return;
    if (content !== editor.getHTML()) {
      editor.commands.setContent(content || "", false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, editor]);

  function insertDroppedImages(dataTransfer, event) {
    if (!dataTransfer || !onImageUpload) return false;
    const files = Array.from(dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return false;
    if (event) event.preventDefault();
    files.forEach(async (file) => {
      const path = await onImageUpload(file);
      if (path) editor?.chain().focus().setImage({ src: path }).run();
    });
    return true;
  }

  async function pickAndUploadImage() {
    if (!onImageUpload) return;
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const path = await onImageUpload(file);
      if (path) editor?.chain().focus().setImage({ src: path }).run();
    };
    input.click();
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  if (!editor) return null;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 px-2 py-1.5">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><Bold size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><Italic size={16} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2"><Heading2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3"><Heading3 size={16} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><List size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered list"><ListOrdered size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Quote"><Quote size={16} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton onClick={setLink} active={editor.isActive("link")} title="Link"><LinkIcon size={16} /></ToolbarButton>
        <ToolbarButton onClick={pickAndUploadImage} title="Insert image"><ImageUp size={16} /></ToolbarButton>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo2 size={16} /></ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo2 size={16} /></ToolbarButton>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
