'use client';

import { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Play, RotateCcw, Download, Copy, Eye, EyeOff, Check, CheckCircle2, XCircle, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestResult {
  name?: string;
  passed?: boolean;
  error?: string;
}

interface ExecutionResult {
  success: boolean;
  output: string;
  testResults?: TestResult[];
  passedTests?: number;
  totalTests?: number;
  executionTime?: number;
  memoryUsed?: number;
}

interface CodeEditorProps {
  language: 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'java';
  defaultValue: string;
  onRun?: (code: string) => Promise<ExecutionResult>;
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
  const [output, setOutput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [executionStats, setExecutionStats] = useState<{
    passedTests: number;
    totalTests: number;
    executionTime?: number;
    memoryUsed?: number;
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [copied, setCopied] = useState(false);
  const [showOutput, setShowOutput] = useState(true);
  const { theme } = useTheme();
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const handleRun = async () => {
    if (!onRun) return;

    setIsRunning(true);
    setOutput('Exécution en cours...');
    setTestResults([]);
    setExecutionStats(null);
    setIsSuccess(null);

    try {
      const result = await onRun(code);
      
      // CORRECTION: Parser et afficher les résultats des tests
      setIsSuccess(result.success);
      setOutput(result.output || '');
      
      if (result.testResults && result.testResults.length > 0) {
        setTestResults(result.testResults);
      }
      
      if (result.passedTests !== undefined && result.totalTests !== undefined) {
        setExecutionStats({
          passedTests: result.passedTests,
          totalTests: result.totalTests,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
        });
      }
    } catch (error: any) {
      setIsSuccess(false);
      setOutput(`Erreur: ${error.message || 'Une erreur est survenue'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode(defaultValue);
    setOutput('');
    setTestResults([]);
    setExecutionStats(null);
    setIsSuccess(null);
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
    <div className="space-y-4">
      {/* Editor Header */}
      <div className="flex items-center justify-between rounded-t-lg border border-b-0 bg-muted/50 p-3">
        <div className="flex items-center gap-4">
          <Badge variant="secondary">{getLanguageLabel()}</Badge>
          <span className="text-sm text-muted-foreground">
            {code.length} caractères
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <Button
                size="sm"
                onClick={handleRun}
                disabled={isRunning}
                className="gap-2"
              >
                <Play className="h-4 w-4" />
                {isRunning ? 'Exécution...' : 'Exécuter'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
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
      <div className="rounded-b-lg border border-t-0 overflow-hidden">
        <Editor
          height={height}
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
            suggest: { showWords: false, showSnippets: false }
          }}
        />
      </div>

      {/* Console Output */}
      {showConsole && (
        <div className="rounded-lg border">
          <div className="flex items-center justify-between border-b bg-muted/50 p-3">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <span className="font-medium">Console</span>
              {executionStats && (
                <Badge variant={isSuccess ? 'default' : 'destructive'}>
                  {executionStats.passedTests}/{executionStats.totalTests} tests réussis
                </Badge>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
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
            <Tabs defaultValue="output" className="p-4">
              <TabsList>
                <TabsTrigger value="output">Sortie</TabsTrigger>
                {testResults.length > 0 && (
                  <TabsTrigger value="tests">Tests ({testResults.length})</TabsTrigger>
                )}
                {executionStats && (
                  <TabsTrigger value="stats">Statistiques</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="output" className="mt-4">
                {output ? (
                  <pre className="rounded-md bg-muted p-4 overflow-x-auto custom-scrollbar">
                    <code className="text-sm">{output}</code>
                  </pre>
                ) : (
                  <div className="flex items-center justify-center p-8 text-muted-foreground">
                    <Terminal className="mr-2 h-4 w-4" />
                    Exécutez votre code pour voir le résultat ici...
                  </div>
                )}
              </TabsContent>

              {testResults.length > 0 && (
                <TabsContent value="tests" className="mt-4 space-y-2">
                  {testResults.map((test, index) => (
                    <div
                      key={index}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-3',
                        test.passed ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                      )}
                    >
                      {test.passed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">
                          {test.name || `Test ${index + 1}`}
                        </div>
                        {test.error && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            {test.error}
                          </div>
                        )}
                      </div>
                      <Badge variant={test.passed ? 'default' : 'destructive'}>
                        {test.passed ? 'Réussi' : 'Échoué'}
                      </Badge>
                    </div>
                  ))}
                </TabsContent>
              )}

              {executionStats && (
                <TabsContent value="stats" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Tests réussis</div>
                      <div className="text-2xl font-bold">
                        {executionStats.passedTests} / {executionStats.totalTests}
                      </div>
                    </div>
                    {executionStats.executionTime !== undefined && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Temps d'exécution</div>
                        <div className="text-2xl font-bold">
                          {executionStats.executionTime} ms
                        </div>
                      </div>
                    )}
                    {executionStats.memoryUsed !== undefined && (
                      <div className="rounded-lg border p-4">
                        <div className="text-sm text-muted-foreground">Mémoire utilisée</div>
                        <div className="text-2xl font-bold">
                          {(executionStats.memoryUsed / 1024).toFixed(2)} KB
                        </div>
                      </div>
                    )}
                    <div className="rounded-lg border p-4">
                      <div className="text-sm text-muted-foreground">Taux de réussite</div>
                      <div className="text-2xl font-bold">
                        {Math.round((executionStats.passedTests / executionStats.totalTests) * 100)}%
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          )}
        </div>
      )}

      {/* Editor Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>Ligne: 1, Colonne: 1</div>
        <div className="flex items-center gap-4">
          <span>UTF-8</span>
          <span>Espaces: 2</span>
          {!readOnly && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                editorRef.current?.trigger('keyboard', 'editor.action.formatDocument');
              }}
            >
              Formater
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
