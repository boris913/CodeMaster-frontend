'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play,
  RotateCcw,
  Download,
  Copy,
  Eye,
  EyeOff,
  Check,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java';
  defaultValue: string;
  onRun?: (code: string) => Promise<any>;
  readOnly?: boolean;
  height?: string;
  showConsole?: boolean;
}

export function CodeEditor({ 
  language, 
  defaultValue, 
  onRun,
  readOnly = false,
  height = '400px',
  showConsole = true
}: CodeEditorProps) {
  const [code, setCode] = useState(defaultValue);
  const [output, setOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    if (!onRun) return;
    
    setIsRunning(true);
    setOutput('Exécution en cours...');
    
    try {
      const result = await onRun(code);
      setOutput(typeof result === 'string' ? result : JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(defaultValue);
    setOutput('');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLanguageLabel = () => {
    const labels: Record<string, string> = {
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      python: 'Python',
      html: 'HTML',
      css: 'CSS',
      java: 'Java'
    };
    return labels[language] || language;
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${
              language === 'javascript' ? 'bg-yellow-500' :
              language === 'typescript' ? 'bg-blue-500' :
              language === 'python' ? 'bg-green-500' :
              language === 'html' ? 'bg-orange-500' :
              language === 'css' ? 'bg-pink-500' : 'bg-purple-500'
            }`} />
            <span className="text-sm font-medium">{getLanguageLabel()}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {code.length} caractères
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
              >
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? 'Exécution...' : 'Exécuter'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Réinitialiser
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden" style={{ height }}>
        <Editor
          language={language}
          value={code}
          onChange={(value) => setCode(value || '')}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            readOnly,
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            formatOnPaste: true,
            formatOnType: true,
            suggest: {
              showWords: false,
              showSnippets: false
            }
          }}
        />
      </div>

      {/* Console Output */}
      {showConsole && (
        <div className={cn(
          'border-t transition-all duration-300',
          showOutput ? 'h-48' : 'h-10'
        )}>
          <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="text-sm font-medium">Console</span>
              {output && (
                <span className="text-xs text-muted-foreground">
                  {output.split('\n').length} lignes
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutput(!showOutput)}
            >
              {showOutput ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {showOutput && (
            <div className="h-40 overflow-auto p-4 font-mono text-sm bg-black/50">
              {output ? (
                <pre className="whitespace-pre-wrap break-words">{output}</pre>
              ) : (
                <div className="text-muted-foreground italic">
                  Exécutez votre code pour voir le résultat ici...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Editor Footer */}
      <div className="px-4 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>Ligne: 1, Colonne: 1</div>
          <div>UTF-8</div>
          <div>Espaces: 2</div>
        </div>
        <div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs"
                onClick={() => {
                  editorRef.current?.trigger('keyboard', 'editor.action.formatDocument');
                }}
              >
                Formater
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}