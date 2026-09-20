// Safe, educational Python simulator for browser execution
// Designed specifically for high-school Python curriculum concepts

// Polyfill Array.prototype.remove for Python list.remove emulation
if (typeof Array !== 'undefined' && !(Array.prototype as unknown as { remove?: unknown }).remove) {
  Object.defineProperty(Array.prototype, 'remove', {
    value: function (val: unknown) {
      const idx = this.indexOf(val);
      if (idx !== -1) this.splice(idx, 1);
      return this;
    },
    writable: true,
    configurable: true,
  });
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  lines: string[];
  error?: string;
  errorLine?: number;
  returnedValue?: unknown;
  scope?: Record<string, unknown>;
}

export function runPythonCode(
  code: string,
  context?: Record<string, unknown>
): ExecutionResult {
  const outputLines: string[] = [];
  const lines = code.split('\n');

  // Syntax checks before running
  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    // Check for common Python syntax errors
    if ((trimmed.startsWith('if ') || trimmed.startsWith('elif ') || trimmed.startsWith('else') || 
         trimmed.startsWith('for ') || trimmed.startsWith('while ') || trimmed.startsWith('def ')) && !trimmed.endsWith(':')) {
      return {
        success: false,
        output: '',
        lines: [],
        error: `SyntaxError: Falta ':' al final de la línea ${i + 1} ("${trimmed}")`,
        errorLine: i + 1,
      };
    }

    // Unmatched quotes check
    const singleQuotes = (trimmed.match(/'/g) || []).length;
    const doubleQuotes = (trimmed.match(/"/g) || []).length;
    if (singleQuotes % 2 !== 0 || doubleQuotes % 2 !== 0) {
      return {
        success: false,
        output: '',
        lines: [],
        error: `SyntaxError: Comillas sin cerrar en la línea ${i + 1}`,
        errorLine: i + 1,
      };
    }

    // Unmatched parentheses
    const openParen = (trimmed.match(/\(/g) || []).length;
    const closeParen = (trimmed.match(/\)/g) || []).length;
    if (openParen !== closeParen) {
      return {
        success: false,
        output: '',
        lines: [],
        error: `SyntaxError: Paréntesis desbalanceados en la línea ${i + 1}`,
        errorLine: i + 1,
      };
    }
  }

  // Pre-process code into safe JS executable
  try {
    const ctx = context || {};
    const contextKeys = Object.keys(ctx);
    const transformedJs = transpilePythonToJs(code, contextKeys);
    
    // Create a sandboxed execution scope
    const sandboxConsole = {
      log: (...args: unknown[]) => {
        const text = args.map(arg => {
          if (typeof arg === 'boolean') return arg ? 'True' : 'False';
          if (arg === null || arg === undefined) return 'None';
          if (Array.isArray(arg)) {
            return '[' + arg.map(x => typeof x === 'string' ? `'${x}'` : String(x)).join(', ') + ']';
          }
          if (typeof arg === 'object') {
            return JSON.stringify(arg);
          }
          return String(arg);
        }).join(' ');
        outputLines.push(text);
      },
    };

    // Standard Python builtins
    const pyLen = (obj: unknown) => {
      if (Array.isArray(obj) || typeof obj === 'string') return obj.length;
      if (typeof obj === 'object' && obj !== null) return Object.keys(obj).length;
      return 0;
    };
    
    const pyRange = (...args: number[]) => {
      let start = 0, stop = 0, step = 1;
      if (args.length === 1) {
        stop = args[0];
      } else if (args.length === 2) {
        start = args[0];
        stop = args[1];
      } else if (args.length >= 3) {
        start = args[0];
        stop = args[1];
        step = args[2];
      }
      const res: number[] = [];
      if (step > 0) {
        for (let i = start; i < stop; i += step) res.push(i);
      } else if (step < 0) {
        for (let i = start; i > stop; i += step) res.push(i);
      }
      return res;
    };

    const pyStr = (v: unknown) => String(v);
    const pyInt = (v: unknown) => parseInt(String(v), 10) || 0;
    const pyFloat = (v: unknown) => parseFloat(String(v)) || 0.0;
    const pyBool = (v: unknown) => Boolean(v);
    const pyList = (v: unknown) => Array.isArray(v) ? [...v] : [];
    const pySum = (arr: unknown[]) => Array.isArray(arr) ? arr.reduce((a, b) => Number(a) + Number(b), 0) : 0;
    const pyMin = (...args: unknown[]) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.min(...flat.map(Number));
    };
    const pyMax = (...args: unknown[]) => {
      const flat = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
      return Math.max(...flat.map(Number));
    };
    const pyAbs = (v: unknown) => Math.abs(Number(v) || 0);
    const pyRound = (v: unknown, dec: number = 0) => {
      const factor = Math.pow(10, dec);
      return Math.round(Number(v) * factor) / factor;
    };

    const contextValues = contextKeys.map(k => ctx[k]);

    // Build runner function
    const paramNames = [
      'print', 
      'len', 
      'pyLen',
      'range', 
      'pyRange',
      'str', 
      'int', 
      'float', 
      'bool', 
      'list', 
      'sum', 
      'min', 
      'max', 
      'abs', 
      'round',
      ...contextKeys
    ];

    const runner = new Function(...paramNames, transformedJs);
    
    const runnerResult = runner(
      sandboxConsole.log, 
      pyLen, 
      pyLen,
      pyRange, 
      pyRange,
      pyStr, 
      pyInt, 
      pyFloat, 
      pyBool, 
      pyList,
      pySum,
      pyMin,
      pyMax,
      pyAbs,
      pyRound,
      ...contextValues
    );

    let returnedValue: unknown = runnerResult;
    let scope: Record<string, unknown> = {};

    if (runnerResult && typeof runnerResult === 'object' && ('__scope' in runnerResult || '__returnedValue' in runnerResult)) {
      returnedValue = (runnerResult as { __returnedValue?: unknown }).__returnedValue;
      scope = (runnerResult as { __scope?: Record<string, unknown> }).__scope || {};
    }

    // Synchronize modifications back into provided context
    if (context && scope) {
      for (const k of Object.keys(context)) {
        if (k in scope) {
          if (Array.isArray(context[k]) && Array.isArray(scope[k]) && context[k] !== scope[k]) {
            (context[k] as unknown[]).length = 0;
            (context[k] as unknown[]).push(...(scope[k] as unknown[]));
          } else {
            context[k] = scope[k];
          }
        }
      }
    }

    return {
      success: true,
      output: outputLines.join('\n'),
      lines: outputLines,
      returnedValue,
      scope,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      output: outputLines.join('\n'),
      lines: outputLines,
      error: `RuntimeError: ${errorMsg}`,
    };
  }
}

// Helper to transform Python expression to safe JavaScript expression
function transformExpr(expr: string): string {
  let res = expr.trim();

  // Convert boolean and None constants
  res = res.replace(/\bTrue\b/g, 'true');
  res = res.replace(/\bFalse\b/g, 'false');
  res = res.replace(/\bNone\b/g, 'null');

  // Convert logical operators
  res = res.replace(/\band\b/g, '&&');
  res = res.replace(/\bor\b/g, '||');
  res = res.replace(/\bnot\s+/g, '!');

  // Identity checks
  res = res.replace(/\bis\s+not\b/g, '!==');
  res = res.replace(/\bis\b/g, '===');

  // Convert f-strings: f"Hello {name}" -> `Hello ${name}`
  res = res.replace(/f"([^"]*)"/g, (_, p1) => {
    const replaced = p1.replace(/\{([^}]+)\}/g, '${$1}');
    return '`' + replaced + '`';
  });
  res = res.replace(/f'([^']*)'/g, (_, p1) => {
    const replaced = p1.replace(/\{([^}]+)\}/g, '${$1}');
    return '`' + replaced + '`';
  });

  // Convert ternary expressions: a if cond else b -> (cond ? a : b)
  const ternaryMatch = res.match(/^(.+?)\s+if\s+(.+?)\s+else\s+(.+)$/);
  if (ternaryMatch) {
    res = `(${transformExpr(ternaryMatch[2])} ? ${transformExpr(ternaryMatch[1])} : ${transformExpr(ternaryMatch[3])})`;
  }

  // Convert list methods
  res = res.replace(/\.append\s*\(/g, '.push(');
  res = res.replace(/\.remove\s*\(/g, '.remove(');

  // Handle "item not in list" and "item in list" (supporting strings with spaces or identifiers)
  res = res.replace(/(?:"([^"]*)"|'([^']*)'|([a-zA-Z0-9_.]+))\s+not\s+in\s+([a-zA-Z0-9_.]+)/g, (_, dQ, sQ, tok, list) => {
    const item = dQ !== undefined ? `"${dQ}"` : sQ !== undefined ? `'${sQ}'` : tok;
    return `!${list}.includes(${item})`;
  });
  res = res.replace(/(?:"([^"]*)"|'([^']*)'|([a-zA-Z0-9_.]+))\s+in\s+([a-zA-Z0-9_.]+)/g, (_, dQ, sQ, tok, list) => {
    const item = dQ !== undefined ? `"${dQ}"` : sQ !== undefined ? `'${sQ}'` : tok;
    return `${list}.includes(${item})`;
  });

  // Negative indexing: arr[-1] -> arr[arr.length - 1]
  res = res.replace(/([a-zA-Z0-9_.]+ memorized)\[-([0-9]+)\]/g, '$1[$1.length - $2]');
  res = res.replace(/([a-zA-Z0-9_.]+)\[-([0-9]+)\]/g, '$1[$1.length - $2]');

  // Slicing: arr[1:3] -> arr.slice(1, 3)
  res = res.replace(/([a-zA-Z0-9_.]+)\[([0-9]+):([0-9]+)\]/g, '$1.slice($2, $3)');
  res = res.replace(/([a-zA-Z0-9_.]+)\[([0-9]+):\]/g, '$1.slice($2)');
  res = res.replace(/([a-zA-Z0-9_.]+)\[:([0-9]+)\]/g, '$1.slice(0, $2)');

  // Range helper mapping
  if (res.startsWith('range(') || res.includes(' range(') || res.includes('(range(')) {
    res = res.replace(/\brange\(/g, 'pyRange(');
  }

  return res;
}

interface BlockFrame {
  indent: number;
  type: 'if' | 'elif' | 'else' | 'for' | 'while' | 'def';
}

// Convert elementary Python construct to JS for safe in-browser education
function transpilePythonToJs(pyCode: string, contextKeys: string[] = []): string {
  const lines = pyCode.split('\n');
  const jsLines: string[] = [];
  const blockStack: BlockFrame[] = [];
  const trackedVars = new Set<string>(contextKeys);

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const matchIndent = raw.match(/^[ ]*/);
    const lineIndent = matchIndent ? matchIndent[0].length : 0;
    let trimmed = raw.trim();

    // Skip empty lines
    if (!trimmed) {
      jsLines.push('');
      continue;
    }

    // Full comments
    if (trimmed.startsWith('#')) {
      jsLines.push(`// ${trimmed.slice(1)}`);
      continue;
    }

    // Remove inline comment if any
    const commentIdx = trimmed.indexOf(' #');
    if (commentIdx !== -1) {
      trimmed = trimmed.substring(0, commentIdx).trim();
    }

    const isElif = trimmed.startsWith('elif ') && trimmed.endsWith(':');
    const isElse = trimmed === 'else:' || trimmed.startsWith('else:');

    // 1. Indentation & scope management
    if (isElif || isElse) {
      // Close any nested blocks that were deeper than this if/elif/else header
      while (blockStack.length > 0 && blockStack[blockStack.length - 1].indent > lineIndent) {
        blockStack.pop();
        jsLines.push('}');
      }

      // If top block matches our indent level, it is the preceding if/elif branch
      if (blockStack.length > 0 && blockStack[blockStack.length - 1].indent === lineIndent) {
        if (isElif) {
          blockStack[blockStack.length - 1].type = 'elif';
          const rawCond = trimmed.slice(5, -1).trim();
          const cond = transformExpr(rawCond);
          jsLines.push(`} else if (${cond}) {`);
          continue;
        } else {
          blockStack[blockStack.length - 1].type = 'else';
          jsLines.push('} else {');
          continue;
        }
      } else {
        // Fallback for standalone elif/else without matching block
        if (isElif) {
          const rawCond = trimmed.slice(5, -1).trim();
          const cond = transformExpr(rawCond);
          jsLines.push(`if (${cond}) {`);
          blockStack.push({ indent: lineIndent, type: 'if' });
          continue;
        } else {
          jsLines.push('if (false) {');
          blockStack.push({ indent: lineIndent, type: 'else' });
          continue;
        }
      }
    } else {
      // For any normal statement or new block opener, close all blocks that are at or deeper than current line indent
      while (blockStack.length > 0 && blockStack[blockStack.length - 1].indent >= lineIndent) {
        blockStack.pop();
        jsLines.push('}');
      }
    }

    // 2. Block openers (ends with ':')
    if (trimmed.startsWith('if ') && trimmed.endsWith(':')) {
      const rawCond = trimmed.slice(3, -1).trim();
      const cond = transformExpr(rawCond);
      jsLines.push(`if (${cond}) {`);
      blockStack.push({ indent: lineIndent, type: 'if' });
      continue;
    }

    if (trimmed.startsWith('for ') && trimmed.endsWith(':')) {
      const forMatch = trimmed.match(/^for\s+([a-zA-Z0-9_,\s]+)\s+in\s+(.+):$/);
      if (forMatch) {
        const item = forMatch[1].trim();
        for (const it of item.split(',')) {
          const trimmedIt = it.trim();
          if (trimmedIt) trackedVars.add(trimmedIt);
        }
        const iterable = transformExpr(forMatch[2].trim());
        jsLines.push(`for (let ${item} of ${iterable}) {`);
        blockStack.push({ indent: lineIndent, type: 'for' });
        continue;
      }
    }

    if (trimmed.startsWith('while ') && trimmed.endsWith(':')) {
      const rawCond = trimmed.slice(6, -1).trim();
      const cond = transformExpr(rawCond);
      jsLines.push(`let _loopCount_${i} = 0; while (${cond}) { if (++_loopCount_${i} > 2500) throw new Error("Bucle infinito detectado (más de 2500 iteraciones)");`);
      blockStack.push({ indent: lineIndent, type: 'while' });
      continue;
    }

    if (trimmed.startsWith('def ') && trimmed.endsWith(':')) {
      const fnHeader = trimmed.slice(4, -1).trim();
      const fnNameMatch = fnHeader.match(/^([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (fnNameMatch) trackedVars.add(fnNameMatch[1]);
      jsLines.push(`function ${fnHeader} {`);
      blockStack.push({ indent: lineIndent, type: 'def' });
      continue;
    }

    // 3. Statements & Keywords
    if (trimmed === 'pass' || trimmed.startsWith('pass ') || trimmed.startsWith('pass;')) {
      jsLines.push('/* pass */');
      continue;
    }

    if (trimmed === 'break' || trimmed === 'break;') {
      jsLines.push('break;');
      continue;
    }

    if (trimmed === 'continue' || trimmed === 'continue;') {
      jsLines.push('continue;');
      continue;
    }

    if (trimmed === 'return' || trimmed === 'return;') {
      if (blockStack.some(b => b.type === 'def')) {
        jsLines.push('return;');
      } else {
        jsLines.push('return { __returnedValue: undefined, __scope: __captureScope() };');
      }
      continue;
    }

    if (trimmed.startsWith('return ')) {
      const expr = transformExpr(trimmed.slice(7).trim());
      if (blockStack.some(b => b.type === 'def')) {
        jsLines.push(`return ${expr};`);
      } else {
        jsLines.push(`return { __returnedValue: ${expr}, __scope: __captureScope() };`);
      }
      continue;
    }

    // Assignments: name = expr
    const assignMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
    if (assignMatch && !trimmed.startsWith('print') && !trimmed.includes('==')) {
      const varName = assignMatch[1];
      trackedVars.add(varName);
      const expr = transformExpr(assignMatch[2].trim());
      jsLines.push(`if (typeof ${varName} === 'undefined') { var ${varName} = ${expr}; } else { ${varName} = ${expr}; }`);
      continue;
    }

    // Compound assignments: name += expr, etc.
    const compoundMatch = trimmed.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*(\+=|-=|\*=|\/=)\s*(.+)$/);
    if (compoundMatch) {
      const varName = compoundMatch[1];
      trackedVars.add(varName);
      const op = compoundMatch[2];
      const expr = transformExpr(compoundMatch[3].trim());
      jsLines.push(`${varName} ${op} ${expr};`);
      continue;
    }

    // General expressions / function calls
    let lineJs = transformExpr(trimmed);
    if (!lineJs.endsWith(';') && !lineJs.endsWith('{') && !lineJs.endsWith('}')) {
      lineJs += ';';
    }
    jsLines.push(lineJs);
  }

  // Close any remaining open blocks at EOF
  while (blockStack.length > 0) {
    blockStack.pop();
    jsLines.push('}');
  }

  const captureScopeCode = `
function __captureScope() {
  var __res = {};
  ${Array.from(trackedVars).map(v => `try { if (typeof ${v} !== 'undefined') __res[${JSON.stringify(v)}] = ${v}; } catch (e) {}`).join('\n  ')}
  return __res;
}
`;

  return captureScopeCode + '\n' + jsLines.join('\n') + '\nreturn { __returnedValue: undefined, __scope: __captureScope() };';
}
