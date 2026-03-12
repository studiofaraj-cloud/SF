# Admin Components

## RichTextEditor

A fully-featured rich text editor built with Tiptap, supporting various formatting options and image uploads to Firebase Storage.

### Features

- **Text Formatting**: Bold, Italic, Underline
- **Headings**: H1, H2, H3
- **Lists**: Bullet lists and numbered lists
- **Links**: Add hyperlinks with dialog interface
- **Images**: Upload images to Firebase Storage or insert via URL
- **Code Blocks**: Syntax highlighting support
- **Blockquotes**: Quote formatting
- **Undo/Redo**: Full history support
- **JSON Output**: Content is saved as JSON format

### Usage

#### Basic Usage

```tsx
import { RichTextEditor } from '@/components/admin/rich-text-editor';

function MyForm() {
  const [content, setContent] = useState('');

  return (
    <RichTextEditor
      content={content}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

#### With Form Integration

```tsx
import { RichTextEditor } from '@/components/admin/rich-text-editor';

function MyForm() {
  return (
    <form>
      <RichTextEditor
        name="content"
        placeholder="Write your article..."
      />
      <button type="submit">Save</button>
    </form>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | `''` | Initial content (JSON string) |
| `onChange` | `(content: string) => void` | `undefined` | Callback when content changes, receives JSON string |
| `placeholder` | `string` | `'Start writing...'` | Placeholder text when editor is empty |
| `name` | `string` | `undefined` | Hidden input name for form submission |

### Content Format

The editor outputs and accepts content in Tiptap's JSON format:

```json
{
  "type": "doc",
  "content": [
    {
      "type": "heading",
      "attrs": { "level": 1 },
      "content": [{ "type": "text", "text": "Hello World" }]
    },
    {
      "type": "paragraph",
      "content": [
        { "type": "text", "text": "This is " },
        { "type": "text", "marks": [{ "type": "bold" }], "text": "bold" },
        { "type": "text", "text": " text." }
      ]
    }
  ]
}
```

### Image Upload

Images are automatically uploaded to Firebase Storage under the path `editor-images/{timestamp}-{filename}`. Make sure Firebase Storage is properly configured in your Firebase project.

### Styling

The editor uses Tailwind CSS and follows the design system established in the UI components. The editor content area uses the `prose` classes from `@tailwindcss/typography` plugin for proper content styling.

### Dependencies

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-link`
- `@tiptap/extension-image`
- `@tiptap/extension-placeholder`
- `@tiptap/extension-underline`
- `firebase` (for image uploads)

### Installation

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-placeholder @tiptap/extension-underline
```

## RichTextViewer

A read-only component for displaying content created with the RichTextEditor.

### Features

- Read-only display of rich text content
- Supports all formatting options from RichTextEditor
- Proper styling with prose classes
- Clickable links

### Usage

```tsx
import { RichTextViewer } from '@/components/admin/rich-text-viewer';

function ArticleDisplay({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <RichTextViewer 
        content={article.content}
        className="mt-4"
      />
    </div>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `content` | `string` | - | Content in JSON format (from RichTextEditor) |
| `className` | `string` | `''` | Additional CSS classes for the container |
