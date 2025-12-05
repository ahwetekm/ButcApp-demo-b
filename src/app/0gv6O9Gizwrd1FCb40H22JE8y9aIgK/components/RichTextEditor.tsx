'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog'
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  List,
  ListOrdered,
  Link,
  Image,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  Eye,
  Edit
} from 'lucide-react'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  height?: number
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "İçerik yazın...", 
  height = 400 
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  useEffect(() => {
    if (editorRef.current && !isPreviewMode) {
      // For textarea, just set the value without HTML
      const textValue = value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')
      editorRef.current.value = textValue
      // Force LTR direction
      editorRef.current.style.direction = 'ltr'
      editorRef.current.style.textAlign = 'left'
      editorRef.current.setAttribute('dir', 'ltr')
    }
  }, [value, isPreviewMode])

  const execCommand = (command: string, value?: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart
      const end = editorRef.current.selectionEnd
      const selectedText = editorRef.current.value.substring(start, end)
      
      let newText = ''
      switch (command) {
        case 'bold':
          newText = `**${selectedText}**`
          break
        case 'italic':
          newText = `*${selectedText}*`
          break
        case 'underline':
          newText = `__${selectedText}__`
          break
        default:
          newText = selectedText
      }
      
      const newValue = editorRef.current.value.substring(0, start) + newText + editorRef.current.value.substring(end)
      onChange(newValue)
      
      // Set cursor position after the inserted text
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.selectionStart = start + newText.length
          editorRef.current.selectionEnd = start + newText.length
        }
      }, 0)
    }
  }

  const handleContentChange = () => {
    if (editorRef.current && !isPreviewMode) {
      // Force LTR direction on every change
      editorRef.current.style.direction = 'ltr'
      editorRef.current.style.textAlign = 'left'
      editorRef.current.setAttribute('dir', 'ltr')
      onChange(editorRef.current.value)
    }
  }

  const handleFocus = () => {
    if (editorRef.current && !isPreviewMode) {
      // Force LTR when editor gets focus
      editorRef.current.style.direction = 'ltr'
      editorRef.current.style.textAlign = 'left'
      editorRef.current.setAttribute('dir', 'ltr')
    }
  }

  const insertHeading = (level: 1 | 2 | 3) => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      const text = selection.toString()
      const headingTag = `h${level}`
      const html = `<${headingTag}>${text}</${headingTag}>`
      document.execCommand('insertHTML', false, html)
    } else {
      const headingTag = `h${level}`
      execCommand('formatBlock', headingTag)
    }
    handleContentChange()
  }

  const insertLink = () => {
    const selection = window.getSelection()
    const selectedText = selection ? selection.toString() : ''
    
    setLinkText(selectedText)
    setLinkUrl('')
    setShowLinkDialog(true)
  }

  const confirmInsertLink = () => {
    if (linkUrl) {
      const text = linkText || linkUrl
      const html = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${text}</a>`
      document.execCommand('insertHTML', false, html)
      handleContentChange()
    }
    setShowLinkDialog(false)
    setLinkUrl('')
    setLinkText('')
  }

  const insertImage = () => {
    setImageUrl('')
    setImageAlt('')
    setShowImageDialog(true)
  }

  const confirmInsertImage = () => {
    if (imageUrl) {
      const html = `<img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto rounded-lg shadow-md my-4" />`
      document.execCommand('insertHTML', false, html)
      handleContentChange()
    }
    setShowImageDialog(false)
    setImageUrl('')
    setImageAlt('')
  }

  const transformParagraph = (transform: 'uppercase' | 'lowercase' | 'capitalize') => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      const text = selection.toString()
      let transformedText = ''
      
      switch (transform) {
        case 'uppercase':
          transformedText = text.toUpperCase()
          break
        case 'lowercase':
          transformedText = text.toLowerCase()
          break
        case 'capitalize':
          transformedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
          break
      }
      
      document.execCommand('insertText', false, transformedText)
      handleContentChange()
    }
  }

  const insertList = (ordered: boolean = false) => {
    const command = ordered ? 'insertOrderedList' : 'insertUnorderedList'
    execCommand(command)
  }

  const insertQuote = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      const text = selection.toString()
      const html = `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">${text}</blockquote>`
      document.execCommand('insertHTML', false, html)
    } else {
      const html = `<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4">Alıntı metni</blockquote>`
      document.execCommand('insertHTML', false, html)
    }
    handleContentChange()
  }

  const insertCode = () => {
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      const text = selection.toString()
      const html = `<code class="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono">${text}</code>`
      document.execCommand('insertHTML', false, html)
    }
    handleContentChange()
  }

  const getEditorStyles = () => ({
    minHeight: `${height}px`,
    maxHeight: `${height + 200}px`,
    overflowY: 'auto',
    direction: 'ltr',
    textAlign: 'left',
    unicodeBidi: 'bidi-override',
    writingMode: 'horizontal-tb'
  })

  return (
    <div className="border rounded-lg overflow-hidden bg-white dark:bg-slate-900" style={{ direction: 'ltr' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          [contenteditable="true"] {
            direction: ltr !important;
            unicode-bidi: plaintext !important;
            text-align: left !important;
            writing-mode: horizontal-tb !important;
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
          }
          [contenteditable="true"] * {
            direction: ltr !important;
            unicode-bidi: plaintext !important;
            text-align: left !important;
          }
          [contenteditable="true"]:focus {
            direction: ltr !important;
            unicode-bidi: plaintext !important;
            text-align: left !important;
          }
          [contenteditable="true"]::selection {
            direction: ltr !important;
            unicode-bidi: plaintext !important;
          }
        `
      }} />
      {/* Toolbar */}
      <div className="border-b bg-gray-50 dark:bg-slate-800 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('bold')}
            title="Kalın"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('italic')}
            title="İtalik"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('underline')}
            title="Altı çizili"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(1)}
            title="Başlık 1"
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(2)}
            title="Başlık 2"
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(3)}
            title="Başlık 3"
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        {/* Text Transform */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => transformParagraph('uppercase')}
            title="Büyük harf"
          >
            <Type className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyLeft')}
            title="Sola hizala"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyCenter')}
            title="Ortala"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('justifyRight')}
            title="Sağa hizala"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList(false)}
            title="Sırasız liste"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList(true)}
            title="Sıralı liste"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        {/* Insert Elements */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertLink}
            title="Bağlantı ekle"
          >
            <Link className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertImage}
            title="Resim ekle"
          >
            <Image className="h-4 w-4" alt="Resim ekle" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertQuote}
            title="Alıntı ekle"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertCode}
            title="Kod ekle"
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        {/* History */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('undo')}
            title="Geri al"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => execCommand('redo')}
            title="İleri al"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Preview Mode */}
        <Button
          variant={isPreviewMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          title={isPreviewMode ? "Düzenleme modu" : "Önizleme modu"}
        >
          {isPreviewMode ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>

      {/* Editor Content */}
      <div className="relative">
        {!isPreviewMode ? (
          <textarea
            ref={editorRef}
            className="p-4 focus:outline-none prose prose-slate dark:prose-invert max-w-none w-full min-h-[400px] resize-none border-0 bg-transparent"
            style={{
              ...getEditorStyles(),
              direction: 'ltr',
              textAlign: 'left',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '16px',
              lineHeight: '1.6'
            }}
            value={value.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ')} // Strip HTML for textarea
            onChange={(e) => {
              onChange(e.target.value)
              handleFocus()
            }}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              handleFocus();
              // Prevent RTL keyboard shortcuts
              if (e.ctrlKey && e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
              }
            }}
            dir="ltr"
            spellCheck="true"
            placeholder={placeholder}
          />
        ) : (
          <div 
            className="p-4 prose prose-slate dark:prose-invert max-w-none"
            style={{ ...getEditorStyles(), direction: 'ltr', textAlign: 'left' }}
            dangerouslySetInnerHTML={{ __html: value }}
          />
        )}
      </div>

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bağlantı Ekle</DialogTitle>
            <DialogDescription>
              Metne bir web bağlantısı eklemek için URL ve metin bilgilerini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Bağlantı Metni</label>
              <Input
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Bağlantı metni"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                İptal
              </Button>
              <Button onClick={confirmInsertLink}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resim Ekle</DialogTitle>
            <DialogDescription>
              Metne bir resim eklemek için resim URL'sini girin.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Resim URL</label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text (Açıklama)</label>
              <Input
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Resim açıklaması"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                İptal
              </Button>
              <Button onClick={confirmInsertImage}>
                Ekle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}