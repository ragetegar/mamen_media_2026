"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";
import { useEffect, useCallback, useState } from "react";
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Link as LinkIcon,
    Undo,
    Redo,
    Minus,
    Image as ImageIcon,
    Video,
    Code,
    X
} from "lucide-react";
import MediaSelector from "./MediaSelector";

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
}

const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onMouseDown={(e) => {
            e.preventDefault();
            onClick();
        }}
        title={title}
        className={`p-1.5 rounded text-sm transition-colors cursor-pointer ${active
            ? "bg-mamen-purple text-white"
            : "text-mamen-gray-200 hover:text-mamen-white hover:bg-mamen-gray-700"
            }`}
    >
        {children}
    </button>
);

export default function RichTextEditor({ value, onChange, placeholder = "Write your article content here..." }: RichTextEditorProps) {
    const [isHtmlMode, setIsHtmlMode] = useState(false);
    const [htmlContent, setHtmlContent] = useState(value);
    const [showMediaModal, setShowMediaModal] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
            }),
            Underline,
            Image.configure({
                HTMLAttributes: {
                    class: "max-w-full h-auto rounded-sm border-2 border-mamen-gray-700 object-cover my-4",
                }
            }),
            Youtube.configure({
                HTMLAttributes: {
                    class: "w-full aspect-video my-4 rounded-sm border-2 border-mamen-gray-700",
                },
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: "text-mamen-purple underline hover:text-mamen-magenta",
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            if (!isHtmlMode) {
                const html = editor.getHTML();
                setHtmlContent(html);
                onChange(html);
            }
        },
        editorProps: {
            attributes: {
                class: "outline-none min-h-[280px] prose prose-invert prose-sm max-w-none text-mamen-gray-100 [&_h2]:font-headline [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-mamen-lime [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:mt-6 [&_h2]:mb-2 [&_h3]:font-headline [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-mamen-white [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:leading-relaxed [&_p]:mb-3 [&_strong]:text-mamen-white [&_a]:text-mamen-purple [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1 [&_img.ProseMirror-selectednode]:border-mamen-purple",
            },
        },
        immediatelyRender: false,
    });

    // Sync external value changes if not produced by us to keep controlled component pattern accurate
    useEffect(() => {
        if (editor && value !== htmlContent) {
            editor.commands.setContent(value);
            setHtmlContent(value);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, editor]);

    const addLink = useCallback(() => {
        if (!editor) return;
        const prev = editor.getAttributes("link").href as string | undefined;
        const url = window.prompt("Enter URL", prev || "https://");
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    }, [editor]);

    const addYoutube = useCallback(() => {
        if (!editor) return;
        const url = window.prompt("Enter YouTube URL");
        if (url) {
            editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }
    }, [editor]);

    // Handle HTML text area change
    const onHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newHtml = e.target.value;
        setHtmlContent(newHtml);
        onChange(newHtml);
    };

    // Toggle mode
    const toggleHtmlMode = () => {
        if (isHtmlMode) {
            // Switching back to visual
            editor?.commands.setContent(htmlContent);
        }
        setIsHtmlMode(!isHtmlMode);
    };

    if (!editor) return null;

    return (
        <div className="border-2 border-mamen-gray-700 focus-within:border-mamen-purple transition-colors bg-mamen-gray-800 relative">
            {/* Toolbar */}
            <div className={`flex flex-wrap items-center gap-0.5 px-3 py-2 border-b-2 border-mamen-gray-700 bg-mamen-gray-900 ${isHtmlMode ? 'opacity-50 pointer-events-none' : ''}`}>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">
                    <Bold size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic">
                    <Italic size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline">
                    <UnderlineIcon size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Heading 2">
                    <Heading2 size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Heading 3">
                    <Heading3 size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
                    <List size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered List">
                    <ListOrdered size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={addLink} active={editor.isActive("link")} title="Add Link">
                    <LinkIcon size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={() => setShowMediaModal(true)} active={false} title="Insert Image">
                    <ImageIcon size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={addYoutube} active={editor.isActive("youtube")} title="Insert YouTube Video">
                    <Video size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Horizontal Rule">
                    <Minus size={14} />
                </ToolbarBtn>

                <div className="w-px h-5 bg-mamen-gray-700 mx-1" />

                <ToolbarBtn onClick={() => editor.chain().focus().undo().run()} active={false} title="Undo">
                    <Undo size={14} />
                </ToolbarBtn>
                <ToolbarBtn onClick={() => editor.chain().focus().redo().run()} active={false} title="Redo">
                    <Redo size={14} />
                </ToolbarBtn>
            </div>

            {/* HTML Mode Toggle (Absolute Top Right of Toolbar) */}
            <button
                type="button"
                onClick={toggleHtmlMode}
                className={`absolute top-2 right-3 p-1.5 flex items-center gap-1.5 text-xs font-headline font-bold uppercase tracking-wider rounded transition-colors ${isHtmlMode ? 'bg-mamen-lime text-mamen-black' : 'text-mamen-lime hover:bg-mamen-gray-700'}`}
            >
                <Code size={14} /> {isHtmlMode ? 'Visual Mode' : 'HTML Mode'}
            </button>

            {/* Editor area */}
            <div className="px-5 py-4 relative">
                {isHtmlMode ? (
                    <textarea
                        value={htmlContent}
                        onChange={onHtmlChange}
                        className="w-full min-h-[280px] bg-mamen-gray-900 text-mamen-green font-mono text-sm border-0 focus:outline-none resize-y"
                        placeholder="<!-- Type raw HTML here -->"
                        spellCheck={false}
                    />
                ) : (
                    <>
                        {editor.isEmpty && (
                            <p className="absolute top-4 left-5 text-mamen-gray-700 text-sm pointer-events-none select-none">
                                {placeholder}
                            </p>
                        )}
                        <EditorContent editor={editor} />
                    </>
                )}
            </div>

            {/* Media Selector Modal */}
            {showMediaModal && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
                    <div className="bg-mamen-gray-900 border-2 border-mamen-purple w-full max-w-2xl shadow-hard-purple relative">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-mamen-gray-800">
                            <h3 className="text-white font-headline uppercase font-bold text-sm tracking-widest">
                                Insert Media
                            </h3>
                            <button
                                type="button"
                                onClick={() => setShowMediaModal(false)}
                                className="text-mamen-gray-400 hover:text-white cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-4">
                            <MediaSelector
                                onChange={(url) => {
                                    if (url) {
                                        editor.chain().focus().setImage({ src: url }).run();
                                    }
                                    setShowMediaModal(false);
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
