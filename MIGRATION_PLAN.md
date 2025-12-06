# DaisyUI → shadcn/ui + AI Elements + Streamdown Migration Plan

**Date**: December 5, 2025
**Branch**: `shadcn-ai-elements`
**Estimated Effort**: 16-24 hours (2-3 working days)

---

## Key Principles

1. **Native Styling First**: Use shadcn/ui and AI Elements default styles - don't replicate DaisyUI look
2. **Native Functionality First**: Leverage built-in AI Elements features instead of custom implementations
3. **Icon Migration**: Replace FontAwesome with Lucide React (already included with shadcn/ui)
4. **Simplification**: Remove duplicate functionality that AI Elements provides
5. **Light/Dark Only**: Replace 38-theme system with simple toggle

---

## Component Analysis

### Components to DELETE (AI Elements provides better alternatives)

1. ❌ **CopyToClipboard.tsx** → AI Elements has built-in `<MessageAction>` with copy
2. ❌ **DeleteMessage.tsx** → AI Elements has built-in message actions
3. ❌ **RegenerateResponse.tsx** → AI Elements has built-in regenerate with `useChat`
4. ❌ **ChatMeta.tsx** → AI Elements `<Message>` handles metadata display
5. ❌ **Messages.tsx** → AI Elements `<Conversation>` + `<ConversationContent>`
6. ❌ **ChatBubble.tsx** → AI Elements `<Message>` + `<MessageContent>`
7. ❌ **ThemeChanger.tsx** → Replaced with simple ThemeToggle

### Components to REFACTOR (keep but simplify)

1. ✅ **Footer.tsx** → Use AI Elements `<PromptInput>` (handles file uploads, auto-resize, etc.)
2. ✅ **Header.tsx** → Keep custom, but use shadcn components (DropdownMenu, Sheet, Button)
3. ✅ **Parameters.tsx** → Keep functionality, use shadcn DropdownMenu + Slider
4. ✅ **ParameterSlider.tsx** → Use shadcn Slider + Tooltip
5. ✅ **ParameterModelSelect.tsx** → Consider using AI Elements `<ModelSelector>` or shadcn Select
6. ✅ **SystemMessage.tsx** → Keep, use shadcn Dialog + Textarea
7. ✅ **UserAvatar.tsx** → Use shadcn Avatar + DropdownMenu
8. ✅ **ClearChatButton.tsx** → Simple shadcn Button
9. ✅ **ExportChatButton.tsx** → Simple shadcn Button
10. ✅ **UpdateCheck.tsx** → Use shadcn Badge
11. ✅ **TokenCount.tsx** → Keep, simple display component
12. ✅ **SessionModal.tsx** → Use shadcn Alert or Dialog

### Components to CREATE

1. ✨ **ThemeToggle.tsx** → Simple light/dark toggle (replaces ThemeChanger)

---

## Icon Migration Map: FontAwesome → Lucide

| FontAwesome | Lucide React | Usage |
|-------------|--------------|-------|
| `faUser` | `User` | User messages |
| `faRobot` | `Bot` | Assistant messages |
| `faSpinner` | `Loader2` | Loading state |
| `faStop` | `StopCircle` | Stop generation |
| `faFile` | `File` | File attachments |
| `faCopy` | `Copy` | Copy action |
| `faCheck` | `Check` | Success state |
| `faTrash` | `Trash2` | Delete |
| `faDownload` | `Download` | Export |
| `faEraser` | `Eraser` | Clear chat |
| `faBars` | `Menu` | Mobile menu |
| `faPalette` | `Moon` / `Sun` | Theme toggle |
| `faMicrochip` | `Cpu` | Model indicator |
| `faFloppyDisk` | `Save` | Save |
| `faRectangleXmark` | `X` | Close |
| `faRotateLeft` | `RotateCcw` | Regenerate |
| `faCircleArrowUp` | `ChevronUp` | Scroll up |
| `faCircleUser` | `User` | User avatar |
| `faRightFromBracket` | `LogOut` | Logout |
| `faArrowRotateForward` | `RefreshCw` | Refresh |
| `faSliders` | `Sliders` | Parameters |

---

## Phase 1: Foundation Setup (2-3 hours)

### 1.1 Initialize shadcn/ui

```bash
npx shadcn@latest init
```

**Select**:

- **Style**: "New York" (cleaner, more modern)
- **Base color**: "Slate" or "Zinc"
- **CSS variables**: Yes
- **React Server Components**: Yes
- **TypeScript**: Yes

This creates:

- `components.json` configuration
- `app/lib/utils.ts` with cn() utility
- `app/components/ui/` directory
- CSS variables in `app/globals.css`

### 1.2 Install AI Elements

```bash
# Check latest installation method from ai-elements docs
npx shadcn@latest add https://ui.shadcn.com/r/ai-elements/conversation
npx shadcn@latest add https://ui.shadcn.com/r/ai-elements/message
npx shadcn@latest add https://ui.shadcn.com/r/ai-elements/prompt-input
npx shadcn@latest add https://ui.shadcn.com/r/ai-elements/model-selector
npx shadcn@latest add https://ui.shadcn.com/r/ai-elements/code-block
```

### 1.3 Install Core shadcn Components

```bash
npx shadcn@latest add button dialog dropdown-menu avatar alert \
  slider skeleton tooltip badge textarea sheet separator \
  scroll-area label select
```

### 1.4 Install Streamdown

```bash
npm install streamdown remend
```

### 1.5 Remove Dependencies

```bash
# Remove DaisyUI
npm uninstall daisyui

# Remove markdown stack
npm uninstall react-markdown remark-gfm remark-math \
  rehype-katex rehype-sanitize rehype-stringify remark-parse \
  remark-rehype react-syntax-highlighter markdown-to-txt \
  @types/react-syntax-highlighter

# Remove FontAwesome
npm uninstall @fortawesome/fontawesome-svg-core \
  @fortawesome/free-brands-svg-icons \
  @fortawesome/free-solid-svg-icons \
  @fortawesome/react-fontawesome
```

**Note**: lucide-react is included with shadcn/ui components

### 1.6 Update Tailwind/CSS

**FILE**: `app/globals.css`

**Remove**:

```css
/* DELETE all @plugin "daisyui" directives */
@plugin "daisyui" {
  themes: --prefersdark --default dark, autumn, light, dark, abyss, acid,
    aqua, black, bumblebee, business, caramellatte, cmyk, coffee, corporate,
    cupcake, cyberpunk, dim, dracula, emerald, fantasy, forest, garden,
    halloween, lemonade, lofi, luxury, night, nord, pastel, retro, silk,
    sunset, synthwave, valentine, winter, wireframe;
};

@plugin "daisyui/theme" {
  name: cyberpunk;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

@plugin "daisyui/theme" {
  name: wireframe;
  font-family: Chalkboard, "comic sans ms", sans-serif;
}
```

**Keep**:

- Tailwind directives
- shadcn CSS variables (auto-generated by init)
- Minimal custom styles if absolutely necessary

---

## Phase 2: Theme System (1 hour)

### 2.1 Create ThemeToggle Component

**NEW FILE**: `app/components/ThemeToggle.tsx`

```tsx
'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
```

### 2.2 Simplify Theme State

**UPDATE**: `app/page.tsx`

**Remove**:

```tsx
// DELETE
export const editorThemeAtom = atomWithStorage(
  'editorTheme',
  getEditorTheme('dark')
);
const editorTheme = useAtomValue(editorThemeAtom);
```

**Keep**:

```tsx
// Simplified - only for localStorage persistence
export const themeAtom = atomWithStorage('theme', 'dark');
```

**Rationale**: Streamdown handles syntax highlighting themes automatically based on system theme.

### 2.3 Delete Obsolete Files

```bash
rm app/components/ThemeChanger.tsx
rm app/utils/themes.ts
```

### 2.4 Clean globals.css

**FILE**: `app/globals.css`

Remove ALL DaisyUI-specific CSS:

- Chat bubble custom styles (AI Elements provides this)
- Menu hover styles
- DaisyUI color token overrides
- Custom theme styles

**Result**: Clean file with only:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn CSS variables (auto-generated) */
  }

  .dark {
    /* dark mode variables */
  }
}
```

---

## Phase 3: Core Chat UI with AI Elements (4-5 hours)

### 3.1 Create New Chat Layout

**MAJOR REFACTOR**: `app/page.tsx`

**Current structure**:

```tsx
<Header />
<Messages />
<Footer />
```

**New structure** (AI Elements pattern):

```tsx
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
  MessageActions,
  MessageAction,
} from '@/components/ai-elements/message';
import { Streamdown } from 'streamdown';
import { Copy, RotateCcw, Trash2 } from 'lucide-react';

// Inside component
<div className="flex flex-col h-screen">
  <Header />

  <Conversation className="flex-1">
    <ConversationContent>
      {messages.length === 0 ? (
        <ConversationEmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="No messages yet"
          description="Start a conversation to begin"
        />
      ) : (
        messages.map((message, index) => {
          const messageText = getMessageText(message);
          const messageFiles = getMessageFiles(message);
          const isLastMessage = index === messages.length - 1;

          return (
            <Message from={message.role} key={message.id}>
              <MessageContent>
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Streamdown
                          key={i}
                          isAnimating={isLoading && isLastMessage}
                          parseIncompleteMarkdown={true}
                        >
                          {part.text}
                        </Streamdown>
                      );
                    case 'file':
                      return (
                        <FileAttachment
                          key={i}
                          file={part}
                          onClick={() => handleFileClick(part)}
                        />
                      );
                    default:
                      return null;
                  }
                })}
              </MessageContent>

              {/* Built-in message actions */}
              {message.role === 'assistant' && isLastMessage && (
                <MessageActions>
                  <MessageAction
                    onClick={() => regenerate(message.id)}
                    label="Regenerate"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </MessageAction>
                  <MessageAction
                    onClick={() => navigator.clipboard.writeText(messageText)}
                    label="Copy"
                  >
                    <Copy className="h-3 w-3" />
                  </MessageAction>
                  <MessageAction
                    onClick={() => handleDelete(message.id)}
                    label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </MessageAction>
                </MessageActions>
              )}
            </Message>
          );
        })
      )}
    </ConversationContent>
    <ConversationScrollButton />
  </Conversation>

  <Footer />
</div>
```

**AI Elements provides**:

- ✅ Auto-scroll to bottom
- ✅ Scroll button when not at bottom
- ✅ Empty state display
- ✅ Message alignment (user vs assistant)
- ✅ Built-in message actions
- ✅ Proper spacing and layout

### 3.2 Delete Custom Chat Components

```bash
rm app/components/Messages.tsx
rm app/components/ChatBubble.tsx
rm app/components/CopyToClipboard.tsx
rm app/components/DeleteMessage.tsx
rm app/components/RegenerateResponse.tsx
rm app/components/ChatMeta.tsx
```

**Rationale**: AI Elements provides all this functionality natively with better UX and accessibility.

### 3.3 Refactor Footer → PromptInput

**MAJOR REFACTOR**: `app/components/Footer.tsx`

Replace custom textarea + file upload with AI Elements `<PromptInput>`:

```tsx
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputFooter,
  PromptInputTools,
  PromptInputBody,
} from '@/components/ai-elements/prompt-input';
import { TokenCount } from './TokenCount';

export const Footer = memo(({
  onSubmit,
  isLoading,
  systemMessageRef,
}: FooterProps) => {
  return (
    <div className="border-t bg-background p-4">
      <PromptInput
        onSubmit={onSubmit}
        accept="image/*,application/pdf,text/*"
        multiple
        maxFiles={3}
        maxFileSize={25 * 1024 * 1024}
        onError={(error) => console.error(error.message)}
        className="max-w-4xl mx-auto"
      >
        <PromptInputAttachments>
          {(attachment) => <PromptInputAttachment data={attachment} />}
        </PromptInputAttachments>

        <PromptInputBody>
          <PromptInputTextarea
            placeholder={isLoading ? 'Loading...' : 'Type a message...'}
            disabled={isLoading}
          />
        </PromptInputBody>

        <PromptInputFooter>
          <PromptInputTools>
            <TokenCount systemMessageRef={systemMessageRef} />
          </PromptInputTools>
          <PromptInputSubmit status={isLoading ? 'streaming' : 'ready'} />
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
});
```

**AI Elements PromptInput provides**:

- ✅ Auto-resize textarea
- ✅ File upload with drag-and-drop
- ✅ File previews
- ✅ Submit button with loading states
- ✅ Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- ✅ Accessibility
- ✅ Max file size/count validation

**Remove from implementation**:

- ❌ `useFileUpload` hook (replaced by PromptInput)
- ❌ Manual textarea resize logic
- ❌ Manual keyboard handlers
- ❌ Manual attachment display
- ❌ Manual file validation

---

## Phase 4: Streamdown Integration (1-2 hours)

### 4.1 Replace react-markdown with Streamdown

**Already done in Phase 3.1** - Streamdown is integrated in the Message rendering.

### 4.2 Update Text File Modal

**FILE**: `app/page.tsx`

Replace SyntaxHighlighter with Streamdown:

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Streamdown } from 'streamdown';

// Text file modal
{modalTextFile && (
  <Dialog open={!!modalTextFile} onOpenChange={() => setModalTextFile(null)}>
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>{modalTextFile.filename}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-full">
        <Streamdown mode="static" className="p-4">
          {modalTextFile.content}
        </Streamdown>
      </ScrollArea>
    </DialogContent>
  </Dialog>
)}
```

**Benefits**:

- Streamdown handles code syntax highlighting automatically
- Built-in copy buttons on code blocks
- Automatic theme detection (light/dark)
- No manual language detection needed

### 4.3 Remove Markdown Dependencies

**Already done in Phase 1.5**

Verify these imports are removed from all files:

- `react-markdown`
- `remark-gfm`, `remark-math`
- `rehype-katex`, `rehype-sanitize`
- `react-syntax-highlighter`
- `markdown-to-txt`

---

## Phase 5: Navigation & Parameters (2-3 hours)

### 5.1 Refactor Header

**FILE**: `app/components/Header.tsx`

**Replace**: FontAwesome icons, DaisyUI navbar/dropdown/menu → Lucide icons, shadcn Sheet + DropdownMenu + Button

```tsx
import { Menu, Bot, Sliders, Eraser, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { Parameters } from './Parameters';
import { SystemMessage } from './SystemMessage';
import { UserAvatar } from './UserAvatar';

export const Header = memo(({ ... }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <nav className="flex flex-col gap-4">
              {/* Mobile menu items */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="justify-start">
                    <Bot className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <SystemMessage />
                </DropdownMenuContent>
              </DropdownMenu>

              <Parameters />

              <Button
                variant="ghost"
                className="justify-start"
                onClick={handleClear}
                disabled={isLoading}
              >
                <Eraser className="mr-2 h-4 w-4" />
                Clear
              </Button>

              <Button
                variant="ghost"
                className="justify-start"
                onClick={handleExport}
                disabled={isLoading}
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="mr-4 flex">
          <a
            href="https://github.com/cu-cit-cloud-team/azure-openai-gpt4-chat"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2"
          >
            <span className="font-semibold">Cloud Team Chat</span>
            <UpdateCheck />
          </a>
        </div>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-1 items-center space-x-2">
          {/* System Message */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" disabled={isLoading}>
                <Bot className="mr-2 h-4 w-4" />
                System
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96">
              <SystemMessage />
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Parameters */}
          <Parameters />

          {/* Clear */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            disabled={isLoading}
          >
            <Eraser className="mr-2 h-4 w-4" />
            Clear
          </Button>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            disabled={isLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatar />
        </div>
      </div>

      {/* Error alert */}
      {chatError && (
        <Alert variant="destructive" className="rounded-none border-x-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {chatError}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </header>
  );
});
```

### 5.2 Refactor Parameters

**FILE**: `app/components/Parameters.tsx`

```tsx
import { Sliders } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ParameterSlider } from './ParameterSlider';
import { ParameterModelSelect } from './ParameterModelSelect';

export const Parameters = memo(({ onCloseMenu, focusTextarea }: ParametersProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Sliders className="mr-2 h-4 w-4" />
          Parameters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <div className="p-4 space-y-4">
          <ParameterModelSelect
            onCloseMenu={onCloseMenu}
            focusTextarea={focusTextarea}
          />
          <ParameterSlider
            paramName="temperature"
            min={0}
            max={2}
            step={0.1}
          />
          <ParameterSlider
            paramName="top_p"
            min={0}
            max={1}
            step={0.1}
          />
          <ParameterSlider
            paramName="frequency_penalty"
            min={-2}
            max={2}
            step={0.1}
          />
          <ParameterSlider
            paramName="presence_penalty"
            min={-2}
            max={2}
            step={0.1}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
```

### 5.3 Refactor ParameterSlider

**FILE**: `app/components/ParameterSlider.tsx`

```tsx
import { Slider } from '@/components/ui/slider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Label } from '@/components/ui/label';
import { useAtom } from 'jotai';
import { parametersAtom } from '@/app/page';

export const ParameterSlider = memo(({
  paramName,
  displayName = null,
  min = 0,
  max = 1,
  step = 0.1,
}: ParameterSliderProps) => {
  const [parameters, setParameters] = useAtom(parametersAtom);

  const paramDetails = (param: string) => {
    const map = {
      temperature:
        'Controls randomness. Higher values (0.9) are more creative, lower (0) are deterministic. Default: 1',
      top_p:
        'Nucleus sampling. Only tokens with top_p probability mass are considered. Default: 1',
      frequency_penalty:
        "Penalizes new tokens based on their frequency in the text. Increases model's likelihood to talk about new topics. Default: 0",
      presence_penalty:
        "Penalizes new tokens based on whether they appear in the text. Decreases model's likelihood to repeat verbatim. Default: 0",
    };
    return map[param] || '';
  };

  return (
    <div className="space-y-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium cursor-help">
                {displayName || paramName}
              </Label>
              <span className="text-sm text-muted-foreground font-mono">
                {parameters[paramName]}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">{paramDetails(paramName)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Slider
        value={[parseFloat(parameters[paramName])]}
        onValueChange={([value]) => {
          setParameters({
            ...parameters,
            [paramName]: value.toString(),
          });
        }}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
});
```

### 5.4 Refactor ParameterModelSelect

**FILE**: `app/components/ParameterModelSelect.tsx`

**Option 1: Use shadcn Select**

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Cpu } from 'lucide-react';
import { useAtom } from 'jotai';
import { parametersAtom } from '@/app/page';
import { models } from '@/app/utils/models';

export const ParameterModelSelect = memo(({
  onCloseMenu,
  focusTextarea,
}: ParameterModelSelectProps) => {
  const [parameters, setParameters] = useAtom(parametersAtom);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center">
        <Cpu className="mr-2 h-4 w-4" />
        Model
      </Label>
      <Select
        value={parameters.model}
        onValueChange={(value) => {
          setParameters({ ...parameters, model: value });
          onCloseMenu?.();
          focusTextarea?.();
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.name} value={model.name}>
              {model.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});
```

**Option 2: Use AI Elements ModelSelector** (if it provides the features you need)

Check AI Elements documentation for `<ModelSelector>` component capabilities.

---

## Phase 6: Modals & Alerts (1-2 hours)

### 6.1 Convert to shadcn Dialog

**FILE**: `app/page.tsx`

Replace all native `<dialog>` with shadcn `<Dialog>`:

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Streamdown } from 'streamdown';

// Remove all useRef for modals
// Remove all useEffect for modal.showModal()

// Image modal
{modalImageUrl && (
  <Dialog open={!!modalImageUrl} onOpenChange={() => setModalImageUrl(null)}>
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>{modalImageUrl.filename}</DialogTitle>
      </DialogHeader>
      <img
        src={modalImageUrl.url}
        alt={modalImageUrl.filename}
        className="w-full h-auto max-h-[80vh] object-contain rounded"
      />
    </DialogContent>
  </Dialog>
)}

// Text file modal
{modalTextFile && (
  <Dialog open={!!modalTextFile} onOpenChange={() => setModalTextFile(null)}>
    <DialogContent className="max-w-4xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle>{modalTextFile.filename}</DialogTitle>
      </DialogHeader>
      <ScrollArea className="h-full">
        <Streamdown mode="static" className="p-4">
          {modalTextFile.content}
        </Streamdown>
      </ScrollArea>
    </DialogContent>
  </Dialog>
)}

// PDF modal
{modalPdfFile && (
  <Dialog open={!!modalPdfFile} onOpenChange={() => setModalPdfFile(null)}>
    <DialogContent className="max-w-5xl h-[90vh]">
      <DialogHeader>
        <DialogTitle>{modalPdfFile.filename}</DialogTitle>
      </DialogHeader>
      <iframe
        src={modalPdfFile.url}
        title={modalPdfFile.filename}
        className="w-full h-full rounded"
      />
    </DialogContent>
  </Dialog>
)}
```

**Benefits**:

- Declarative open/close state (no imperative `.showModal()`)
- Better accessibility (focus trap, ESC key handling)
- Backdrop click to close
- Scroll lock when open
- Consistent styling

### 6.2 Update Error Handling

**FILE**: `app/components/Header.tsx` (already done in Phase 5.1)

**FILE**: `app/page.tsx` - ErrorBoundary fallback

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ErrorFallback = memo(({ error, resetErrorBoundary }) => {
  return (
    <div className="flex items-center justify-center h-screen p-4">
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-4">
          <p className="font-semibold">An error occurred</p>
          <p className="text-sm">{error?.message}</p>
          <Button
            onClick={() => {
              resetErrorBoundary();
              window.location.reload();
            }}
            variant="outline"
          >
            Reload and try again
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
});
```

---

## Phase 7: Remaining Components (1-2 hours)

### 7.1 UserAvatar

**FILE**: `app/components/UserAvatar.tsx`

```tsx
import { User, LogOut } from 'lucide-react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAtomValue } from 'jotai';
import { userMetaAtom } from '@/app/page';

export const UserAvatar = memo(() => {
  const userMeta = useAtomValue(userMetaAtom);

  const handleLogout = () => {
    // Logout logic
    window.location.href = '/api/auth/logout';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={userMeta?.picture} alt={userMeta?.name} />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {userMeta?.name || 'User'}
        </DropdownMenuLabel>
        {userMeta?.email && (
          <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">
            {userMeta.email}
          </DropdownMenuLabel>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});
```

### 7.2 ClearChatButton

**FILE**: `app/components/ClearChatButton.tsx`

```tsx
import { Eraser } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClearMessages } from '@/app/hooks/useClearMessages';

export const ClearChatButton = memo(({
  isLoading,
  setMessages,
  focusTextarea,
}: ClearChatButtonProps) => {
  const clearMessages = useClearMessages(setMessages);

  const handleClear = async () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      await clearMessages();
      focusTextarea?.();
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClear}
      disabled={isLoading}
    >
      <Eraser className="mr-2 h-4 w-4" />
      Clear
    </Button>
  );
});
```

### 7.3 ExportChatButton

**FILE**: `app/components/ExportChatButton.tsx`

```tsx
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const ExportChatButton = memo(({ isLoading }: ExportChatButtonProps) => {
  const handleExport = async () => {
    // Export logic
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleExport}
      disabled={isLoading}
    >
      <Download className="mr-2 h-4 w-4" />
      Export
    </Button>
  );
});
```

### 7.4 UpdateCheck

**FILE**: `app/components/UpdateCheck.tsx`

```tsx
import { Badge } from '@/components/ui/badge';
import { RefreshCw } from 'lucide-react';

export const UpdateCheck = memo(() => {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  // Check logic...

  if (!updateAvailable) return null;

  return (
    <Badge variant="secondary" className="ml-2">
      <RefreshCw className="mr-1 h-3 w-3" />
      Update available
    </Badge>
  );
});
```

### 7.5 SystemMessage

**FILE**: `app/components/SystemMessage.tsx`

```tsx
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, RotateCcw, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { systemMessageAtom } from '@/app/page';

export const SystemMessage = memo(({
  systemMessageRef,
  onCloseMenu,
  focusTextarea,
}: SystemMessageProps) => {
  const [systemMessage, setSystemMessage] = useAtom(systemMessageAtom);
  const [localValue, setLocalValue] = useState(systemMessage);

  const handleSave = () => {
    setSystemMessage(localValue);
    onCloseMenu?.();
    focusTextarea?.();
  };

  const handleReset = () => {
    setLocalValue('You are a helpful AI assistant.');
    systemMessageRef.current?.focus();
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="system-message">System Message</Label>
        <Textarea
          id="system-message"
          ref={systemMessageRef}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          rows={6}
          className="resize-none font-mono text-sm"
          placeholder="Enter system message..."
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setLocalValue(systemMessage);
            onCloseMenu?.();
          }}
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button variant="destructive" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button size="sm" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
});
```

### 7.6 TokenCount

**FILE**: `app/components/TokenCount.tsx`

Keep mostly as-is, just update styling to match shadcn:

```tsx
export const TokenCount = memo(({ systemMessageRef }: TokenCountProps) => {
  const tokens = useAtomValue(tokensAtom);

  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-mono">{tokens.remaining.toLocaleString()}</span>
      <span className="mx-1">/</span>
      <span className="font-mono">{tokens.maximum.toLocaleString()}</span>
      <span className="ml-1">tokens remaining</span>
    </div>
  );
});
```

---

## Phase 8: CSS Cleanup (1 hour)

### 8.1 Clean globals.css

**FILE**: `app/globals.css`

**Remove ALL DaisyUI-specific CSS**:

- `@plugin "daisyui"` directives
- `.chat-bubble` custom styles
- `.code-pre` custom styles
- `.menu` hover overrides
- DaisyUI color token classes
- Custom theme definitions

**Final result should be**:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Rationale**: Embrace shadcn/ui and AI Elements native styling. Let components handle their own appearance.

---

## Phase 9: Testing (2-3 hours)

### 9.1 Functional Testing Checklist

- [ ] **Messages**
  - [ ] Send text messages
  - [ ] Messages display correctly (user vs assistant)
  - [ ] Streaming works with Streamdown
  - [ ] Markdown renders (bold, italic, code, lists, tables, links)
  - [ ] Code blocks have syntax highlighting
  - [ ] Code blocks have copy buttons
  - [ ] Math equations render (if needed)

- [ ] **File Uploads**
  - [ ] Upload images (drag-and-drop and click)
  - [ ] Upload PDFs
  - [ ] Upload text files
  - [ ] File previews display
  - [ ] Max file validation works (3 files, 25MB each)
  - [ ] File modals open and display correctly

- [ ] **Message Actions**
  - [ ] Copy message works
  - [ ] Regenerate response works
  - [ ] Delete message works
  - [ ] Stop generation works

- [ ] **Navigation**
  - [ ] Desktop menu displays correctly
  - [ ] Mobile menu (Sheet) works
  - [ ] All dropdowns work (System, Parameters)
  - [ ] Clear chat works
  - [ ] Export chat works

- [ ] **Parameters**
  - [ ] Model selection works
  - [ ] Sliders adjust values
  - [ ] Tooltips show descriptions
  - [ ] Values persist

- [ ] **Theme**
  - [ ] Light theme displays correctly
  - [ ] Dark theme displays correctly
  - [ ] Theme toggle works
  - [ ] Theme persists on reload
  - [ ] Streamdown adapts to theme

- [ ] **System Message**
  - [ ] Edit system message
  - [ ] Save/Cancel/Reset work
  - [ ] System message affects responses

- [ ] **Misc**
  - [ ] Error alerts display
  - [ ] Loading states work
  - [ ] Update check displays
  - [ ] User avatar/logout work
  - [ ] Token count displays

### 9.2 Visual Testing

- [ ] Light theme appearance is clean and consistent
- [ ] Dark theme appearance is clean and consistent
- [ ] Message bubbles align correctly (user right, assistant left)
- [ ] Spacing and padding are appropriate
- [ ] File attachment previews look good
- [ ] Modals are centered and sized correctly
- [ ] Buttons have proper hover/active states
- [ ] Dropdown menus position correctly
- [ ] Icons are properly sized and aligned
- [ ] Mobile layout is responsive

### 9.3 Accessibility Testing

- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Screen reader labels are present (aria-label, sr-only)
- [ ] Color contrast meets WCAG standards
- [ ] Dialogs trap focus
- [ ] Buttons have accessible names

### 9.4 Performance Testing

- [ ] Streaming is smooth and responsive
- [ ] Large messages render without lag
- [ ] File upload is reasonably fast
- [ ] Theme switching is instant
- [ ] No console errors or warnings
- [ ] Bundle size is smaller than before

**Verify bundle size reduction**:

```bash
npm run build
# Check .next/static bundle sizes
```

Expected savings: ~200KB+ from removing DaisyUI and markdown dependencies.

---

## Phase 10: Final Cleanup (30 min)

### 10.1 Remove Old Dependencies

Verify `package.json` has removed:

- `daisyui`
- `react-markdown`, `remark-*`, `rehype-*`
- `react-syntax-highlighter`, `@types/react-syntax-highlighter`
- `markdown-to-txt`
- `@fortawesome/*`

### 10.2 Delete Unused Files

```bash
# Already deleted in earlier phases, verify:
rm -f app/components/ThemeChanger.tsx
rm -f app/components/Messages.tsx
rm -f app/components/ChatBubble.tsx
rm -f app/components/CopyToClipboard.tsx
rm -f app/components/DeleteMessage.tsx
rm -f app/components/RegenerateResponse.tsx
rm -f app/components/ChatMeta.tsx
rm -f app/utils/themes.ts
```

### 10.3 Remove Unused Imports

Search and remove any lingering imports:

- FontAwesome icons
- DaisyUI-related imports
- react-markdown imports
- Old component imports

### 10.4 Update Documentation

**FILE**: `README.md`

Update tech stack section:

```markdown
## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19, React Compiler)
- **AI**: AI SDK v5, Azure OpenAI
- **UI Components**: shadcn/ui, AI Elements
- **Markdown**: Streamdown
- **Styling**: Tailwind CSS, CSS Variables
- **Icons**: Lucide React
- **State**: Jotai
- **Storage**: Dexie (IndexedDB)
- **Theme**: next-themes (light/dark)
```

### 10.5 Final Build Test

```bash
# Clean build
rm -rf .next
npm run build

# Test production build
npm run start

# Verify everything works in production mode
```

### 10.6 Git Commit

```bash
git add .
git commit -m "feat: migrate from DaisyUI to shadcn/ui + AI Elements

- Replace DaisyUI with shadcn/ui components
- Integrate AI Elements for chat UI (Conversation, Message, PromptInput)
- Replace react-markdown stack with Streamdown
- Replace FontAwesome with Lucide React
- Simplify theme system to light/dark only with toggle
- Remove duplicate functionality (copy, delete, regenerate now built-in)
- Reduce bundle size by ~200KB+
- Improve accessibility and native component patterns

BREAKING CHANGES:
- Removed 38-theme system, now light/dark only
- Deleted custom chat components in favor of AI Elements
- Updated all icons from FontAwesome to Lucide
- Embraced native shadcn/ui styling"
```

---

## Summary of Changes

### Deleted Components (7)

- ThemeChanger.tsx
- Messages.tsx
- ChatBubble.tsx
- CopyToClipboard.tsx
- DeleteMessage.tsx
- RegenerateResponse.tsx
- ChatMeta.tsx

### Refactored Components (11)

- Footer.tsx → AI Elements PromptInput
- Header.tsx → shadcn Sheet + DropdownMenu + Button
- Parameters.tsx → shadcn DropdownMenu
- ParameterSlider.tsx → shadcn Slider + Tooltip
- ParameterModelSelect.tsx → shadcn Select
- SystemMessage.tsx → shadcn Dialog + Textarea
- UserAvatar.tsx → shadcn Avatar + DropdownMenu
- ClearChatButton.tsx → shadcn Button
- ExportChatButton.tsx → shadcn Button
- UpdateCheck.tsx → shadcn Badge
- TokenCount.tsx → Minimal styling update

### Created Components (1)

- ThemeToggle.tsx → Simple light/dark toggle

### Main App (app/page.tsx)

- Integrated AI Elements Conversation + Message
- Integrated Streamdown for markdown
- Replaced modals with shadcn Dialog
- Simplified theme state
- Removed duplicate functionality

### Dependencies Removed (12)

- daisyui
- react-markdown
- remark-gfm, remark-math, remark-parse, remark-rehype
- rehype-katex, rehype-sanitize, rehype-stringify
- react-syntax-highlighter, @types/react-syntax-highlighter
- markdown-to-txt
- @fortawesome/* (4 packages)

### Dependencies Added (2)

- streamdown
- remend
- shadcn/ui components (via CLI, ~15 components)
- AI Elements components (via CLI, ~5 components)

### CSS Changes

- Removed all DaisyUI CSS (~150 lines)
- Kept only Tailwind directives + shadcn CSS variables (~50 lines)
- 75% reduction in custom CSS

### Bundle Size

- **Expected reduction**: ~200KB+ (minified)
- Removed DaisyUI (~60KB)
- Removed markdown stack (~100KB+)
- Removed FontAwesome (~40KB)

---

## Migration Execution Order

1. ✅ Phase 1: Foundation Setup (install dependencies)
2. ✅ Phase 2: Theme System (create toggle, simplify state)
3. ✅ Phase 3: Core Chat UI (biggest change - AI Elements integration)
4. ✅ Phase 4: Streamdown (already integrated in Phase 3)
5. ✅ Phase 5: Navigation & Parameters (header, dropdowns, sliders)
6. ✅ Phase 6: Modals & Alerts (convert to Dialog)
7. ✅ Phase 7: Remaining Components (avatar, buttons, badges)
8. ✅ Phase 8: CSS Cleanup (remove DaisyUI styles)
9. ✅ Phase 9: Testing (comprehensive validation)
10. ✅ Phase 10: Final Cleanup (remove files, commit)

---

## Risk Mitigation

- ✅ Created feature branch: `shadcn-ai-elements`
- ✅ Commit frequently after each phase
- ✅ Test incrementally (don't wait until the end)
- ✅ Keep old components temporarily until verified working
- ✅ Take screenshots of current UI for comparison
- ✅ Have rollback plan (git reset --hard if needed)

---

## Next Steps

After migration is complete and tested:

1. **Merge to main**

   ```bash
   git checkout main
   git merge shadcn-ai-elements
   git push
   ```

2. **Deploy to production**
   - Test in staging first
   - Monitor for errors
   - Collect user feedback

3. **Future enhancements**
   - Explore more AI Elements features (branches, suggestions, tools)
   - Add keyboard shortcuts
   - Add search functionality
   - Add conversation history sidebar
   - Add user preferences panel

---

## Support & Resources

- **shadcn/ui docs**: <https://ui.shadcn.com>
- **AI Elements docs**: <https://ai-elements.shadcn.com>
- **Streamdown docs**: <https://streamdown.ai>
- **Lucide icons**: <https://lucide.dev>
- **Radix UI**: <https://radix-ui.com> (underlying primitives)

---
