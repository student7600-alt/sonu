// Turbo C++ DOS Console Simulator
class TurboTerminal {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.outputEl = null;
        this.inputEl = null;
        this.promptEl = null;
        this.currentProgram = null;
        this.simState = null;
        this.history = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        this.container.innerHTML = `
            <div class="dos-window">
                <div class="dos-header">
                    <div class="dos-dots">
                        <span class="dot red"></span>
                        <span class="dot yellow"></span>
                        <span class="dot green"></span>
                    </div>
                    <div class="dos-title">TURBO C++ IDE - CONSOLE RUNNER (DOSBox 0.74 Sim)</div>
                    <button class="dos-clear-btn" id="dosClearBtn" title="Clear Screen (clrscr)">clrscr()</button>
                </div>
                <div class="dos-body" id="dosOutput"></div>
                <div class="dos-input-line">
                    <span class="dos-prompt" id="dosPrompt">&gt;&gt;</span>
                    <input type="text" id="dosInput" class="dos-input" placeholder="Type choice/value and press Enter..." autocomplete="off" spellcheck="false" />
                    <button class="dos-send-btn" id="dosSendBtn">Send</button>
                </div>
            </div>
        `;

        this.outputEl = document.getElementById('dosOutput');
        this.inputEl = document.getElementById('dosInput');
        this.promptEl = document.getElementById('dosPrompt');

        document.getElementById('dosClearBtn').addEventListener('click', () => this.clearScreen());
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleInput(this.inputEl.value);
                this.inputEl.value = '';
            }
        });
        document.getElementById('dosSendBtn').addEventListener('click', () => {
            this.handleInput(this.inputEl.value);
            this.inputEl.value = '';
        });
    }

    clearScreen() {
        if (this.outputEl) {
            this.outputEl.innerHTML = '';
            this.printLine('Turbo C++ Version 3.0 Copyright (c) 1990, 1992 Borland International', 'dos-system');
            this.printLine('Program output screen initialized. [clrscr() executed]', 'dos-dim');
            this.printLine('------------------------------------------------------------', 'dos-dim');
        }
    }

    print(text, className = '') {
        if (!this.outputEl) return;
        const span = document.createElement('span');
        if (className) span.className = className;
        span.textContent = text;
        this.outputEl.appendChild(span);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    printLine(text, className = '') {
        if (!this.outputEl) return;
        const div = document.createElement('div');
        if (className) div.className = className;
        div.textContent = text;
        this.outputEl.appendChild(div);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    loadProgram(program) {
        this.currentProgram = program;
        this.clearScreen();
        this.printLine(`Executing: ${program.title} (Turbo C++)`, 'dos-bright');
        this.setupProgramSim(program.id);
    }

    setupProgramSim(pid) {
        // Initialize state machine for the active program
        switch (pid) {
            case 1: // Stack
                this.simState = {
                    type: 'menu_stack',
                    stack: [],
                    max: 20,
                    waitingFor: 'choice'
                };
                this.printStackMenu();
                break;
            case 3: // Queue
                this.simState = {
                    type: 'menu_queue',
                    q: [],
                    max: 20,
                    front: -1,
                    rear: -1,
                    waitingFor: 'choice'
                };
                this.printQueueMenu();
                break;
            case 15: // Circular Queue
                this.simState = {
                    type: 'menu_cqueue',
                    q: new Array(10).fill(null),
                    max: 10,
                    front: -1,
                    rear: -1,
                    waitingFor: 'choice'
                };
                this.printCQueueMenu();
                break;
            case 17: // Singly Linked List
                this.simState = {
                    type: 'menu_sll',
                    list: [],
                    waitingFor: 'choice'
                };
                this.printSLLMenu();
                break;
            case 18: // Doubly Linked List
                this.simState = {
                    type: 'menu_dll',
                    list: [],
                    waitingFor: 'choice'
                };
                this.printDLLMenu();
                break;
            case 19: // BST Create/Delete/Show
                this.simState = {
                    type: 'menu_bst',
                    values: [],
                    waitingFor: 'choice'
                };
                this.printBSTMenu();
                break;
            case 21: // Array Insert/Delete/Display
                this.simState = {
                    type: 'menu_array',
                    arr: [10, 20, 30, 40, 50],
                    waitingFor: 'choice'
                };
                this.printArrayMenu();
                break;
            default:
                this.simState = {
                    type: 'standalone',
                    waitingFor: 'input'
                };
                this.printLine(`Interactive Console Mode ready.`);
                this.printLine(`Use the "Interactive Visualizer & Runner" tab for full animated step-by-step visualization!`);
                this.printLine(`Or enter sample inputs here to run algorithm:`);
                if (this.currentProgram && this.currentProgram.sampleInput) {
                    this.printLine(`Default sample input: ${this.currentProgram.sampleInput}`, 'dos-info');
                }
                break;
        }
    }

    printStackMenu() {
        this.printLine('\n1.Push 2.Pop 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printQueueMenu() {
        this.printLine('\n1.Insert 2.Delete 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printCQueueMenu() {
        this.printLine('\n1.Insert 2.Delete 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printSLLMenu() {
        this.printLine('\n1.Insert 2.Delete 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printDLLMenu() {
        this.printLine('\n1.Insert 2.Delete 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printBSTMenu() {
        this.printLine('\n1.Create/Insert 2.Delete 3.Show 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    printArrayMenu() {
        this.printLine(`\nCurrent Array: [ ${this.simState.arr.join(', ')} ] (n=${this.simState.arr.length})`, 'dos-info');
        this.printLine('1.Insert 2.Delete 3.Display 4.Exit', 'dos-cyan');
        this.print('Enter choice: ', 'dos-white');
    }

    handleInput(val) {
        val = val.trim();
        if (!val) return;
        this.printLine(val, 'dos-yellow');

        if (!this.simState) return;

        if (this.simState.type === 'menu_stack') {
            this.handleStackInput(val);
        } else if (this.simState.type === 'menu_queue') {
            this.handleQueueInput(val);
        } else if (this.simState.type === 'menu_cqueue') {
            this.handleCQueueInput(val);
        } else if (this.simState.type === 'menu_sll') {
            this.handleSLLInput(val);
        } else if (this.simState.type === 'menu_dll') {
            this.handleDLLInput(val);
        } else if (this.simState.type === 'menu_bst') {
            this.handleBSTInput(val);
        } else if (this.simState.type === 'menu_array') {
            this.handleArrayInput(val);
        } else {
            // General standalone runner
            this.runStandalone(val);
        }
    }

    handleStackInput(val) {
        if (this.simState.waitingFor === 'push_val') {
            const num = parseInt(val, 10);
            if (isNaN(num)) {
                this.printLine('Invalid integer element!');
            } else {
                this.simState.stack.push(num);
                this.printLine(`Element ${num} pushed successfully. (top=${this.simState.stack.length - 1})`, 'dos-green');
            }
            this.simState.waitingFor = 'choice';
            this.printStackMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                if (this.simState.stack.length >= this.simState.max) {
                    this.printLine('Stack Overflow', 'dos-red');
                    this.printStackMenu();
                } else {
                    this.print('Enter element: ', 'dos-white');
                    this.simState.waitingFor = 'push_val';
                }
                break;
            case 2:
                if (this.simState.stack.length === 0) {
                    this.printLine('Stack Underflow', 'dos-red');
                } else {
                    const popVal = this.simState.stack.pop();
                    this.printLine(`Deleted element: ${popVal}`, 'dos-green');
                }
                this.printStackMenu();
                break;
            case 3:
                if (this.simState.stack.length === 0) {
                    this.printLine('Stack is empty', 'dos-red');
                } else {
                    const rev = [...this.simState.stack].reverse();
                    this.printLine(`Stack: ${rev.join(' ')}`, 'dos-green');
                }
                this.printStackMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printStackMenu();
                break;
        }
    }

    handleQueueInput(val) {
        if (this.simState.waitingFor === 'insert_val') {
            const num = parseInt(val, 10);
            if (isNaN(num)) {
                this.printLine('Invalid element!');
            } else {
                if (this.simState.front === -1) this.simState.front = 0;
                this.simState.rear++;
                this.simState.q.push(num);
                this.printLine(`Element ${num} inserted into queue.`, 'dos-green');
            }
            this.simState.waitingFor = 'choice';
            this.printQueueMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                if (this.simState.q.length >= this.simState.max) {
                    this.printLine('Queue Overflow', 'dos-red');
                    this.printQueueMenu();
                } else {
                    this.print('Enter element: ', 'dos-white');
                    this.simState.waitingFor = 'insert_val';
                }
                break;
            case 2:
                if (this.simState.q.length === 0) {
                    this.printLine('Queue Underflow', 'dos-red');
                } else {
                    const delVal = this.simState.q.shift();
                    this.printLine(`Deleted element: ${delVal}`, 'dos-green');
                }
                this.printQueueMenu();
                break;
            case 3:
                if (this.simState.q.length === 0) {
                    this.printLine('Queue is empty', 'dos-red');
                } else {
                    this.printLine(`Queue: ${this.simState.q.join(' ')}`, 'dos-green');
                }
                this.printQueueMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printQueueMenu();
                break;
        }
    }

    handleCQueueInput(val) {
        const MAX = this.simState.max;
        if (this.simState.waitingFor === 'insert_val') {
            const num = parseInt(val, 10);
            if (this.simState.front === -1) {
                this.simState.front = 0;
                this.simState.rear = 0;
            } else {
                this.simState.rear = (this.simState.rear + 1) % MAX;
            }
            this.simState.q[this.simState.rear] = num;
            this.printLine(`Element ${num} inserted at rear index ${this.simState.rear}.`, 'dos-green');
            this.simState.waitingFor = 'choice';
            this.printCQueueMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                if ((this.simState.rear + 1) % MAX === this.simState.front) {
                    this.printLine('Circular Queue Overflow', 'dos-red');
                    this.printCQueueMenu();
                } else {
                    this.print('Enter element: ', 'dos-white');
                    this.simState.waitingFor = 'insert_val';
                }
                break;
            case 2:
                if (this.simState.front === -1) {
                    this.printLine('Circular Queue Underflow', 'dos-red');
                } else {
                    const delVal = this.simState.q[this.simState.front];
                    this.simState.q[this.simState.front] = null;
                    this.printLine(`Deleted element: ${delVal}`, 'dos-green');
                    if (this.simState.front === this.simState.rear) {
                        this.simState.front = -1;
                        this.simState.rear = -1;
                    } else {
                        this.simState.front = (this.simState.front + 1) % MAX;
                    }
                }
                this.printCQueueMenu();
                break;
            case 3:
                if (this.simState.front === -1) {
                    this.printLine('Queue is empty', 'dos-red');
                } else {
                    let items = [];
                    let i = this.simState.front;
                    while (true) {
                        items.push(this.simState.q[i]);
                        if (i === this.simState.rear) break;
                        i = (i + 1) % MAX;
                    }
                    this.printLine(`Queue: ${items.join(' ')}`, 'dos-green');
                }
                this.printCQueueMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printCQueueMenu();
                break;
        }
    }

    handleSLLInput(val) {
        if (this.simState.waitingFor === 'insert_data') {
            const num = parseInt(val, 10);
            this.simState.list.push(num);
            this.printLine(`Data ${num} inserted into singly linked list.`, 'dos-green');
            this.simState.waitingFor = 'choice';
            this.printSLLMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                this.print('Enter data: ', 'dos-white');
                this.simState.waitingFor = 'insert_data';
                break;
            case 2:
                if (this.simState.list.length === 0) {
                    this.printLine('List is empty', 'dos-red');
                } else {
                    const del = this.simState.list.shift();
                    this.printLine(`Deleted: ${del}`, 'dos-green');
                }
                this.printSLLMenu();
                break;
            case 3:
                if (this.simState.list.length === 0) {
                    this.printLine('List is empty', 'dos-red');
                } else {
                    this.printLine(`List: ${this.simState.list.join(' ')}`, 'dos-green');
                }
                this.printSLLMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printSLLMenu();
                break;
        }
    }

    handleDLLInput(val) {
        if (this.simState.waitingFor === 'insert_data') {
            const num = parseInt(val, 10);
            this.simState.list.push(num);
            this.printLine(`Data ${num} inserted into doubly linked list.`, 'dos-green');
            this.simState.waitingFor = 'choice';
            this.printDLLMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                this.print('Enter data: ', 'dos-white');
                this.simState.waitingFor = 'insert_data';
                break;
            case 2:
                if (this.simState.list.length === 0) {
                    this.printLine('List is empty', 'dos-red');
                } else {
                    const del = this.simState.list.shift();
                    this.printLine(`Deleted: ${del}`, 'dos-green');
                }
                this.printDLLMenu();
                break;
            case 3:
                if (this.simState.list.length === 0) {
                    this.printLine('List is empty', 'dos-red');
                } else {
                    this.printLine(`List: ${this.simState.list.join(' ')}`, 'dos-green');
                }
                this.printDLLMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printDLLMenu();
                break;
        }
    }

    handleBSTInput(val) {
        if (this.simState.waitingFor === 'insert_val') {
            const num = parseInt(val, 10);
            if (!this.simState.values.includes(num)) {
                this.simState.values.push(num);
                this.simState.values.sort((a, b) => a - b);
            }
            this.printLine(`Inserted ${num} into BST.`, 'dos-green');
            this.simState.waitingFor = 'choice';
            this.printBSTMenu();
            return;
        }
        if (this.simState.waitingFor === 'delete_val') {
            const num = parseInt(val, 10);
            const idx = this.simState.values.indexOf(num);
            if (idx !== -1) {
                this.simState.values.splice(idx, 1);
                this.printLine(`Deleted ${num} from BST.`, 'dos-green');
            } else {
                this.printLine(`Value ${num} not found in BST.`, 'dos-red');
            }
            this.simState.waitingFor = 'choice';
            this.printBSTMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                this.print('Enter value: ', 'dos-white');
                this.simState.waitingFor = 'insert_val';
                break;
            case 2:
                this.print('Enter value: ', 'dos-white');
                this.simState.waitingFor = 'delete_val';
                break;
            case 3:
                if (this.simState.values.length === 0) {
                    this.printLine('BST is empty', 'dos-red');
                } else {
                    this.printLine(`BST (Inorder): ${this.simState.values.join(' ')}`, 'dos-green');
                }
                this.printBSTMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printBSTMenu();
                break;
        }
    }

    handleArrayInput(val) {
        if (this.simState.waitingFor === 'insert_pos') {
            const pos = parseInt(val, 10);
            const n = this.simState.arr.length;
            if (pos < 1 || pos > n + 1) {
                this.printLine(`Invalid position! Must be 1 to ${n + 1}`, 'dos-red');
                this.simState.waitingFor = 'choice';
                this.printArrayMenu();
            } else {
                this.simState.pendingPos = pos;
                this.print('Enter item: ', 'dos-white');
                this.simState.waitingFor = 'insert_item';
            }
            return;
        }
        if (this.simState.waitingFor === 'insert_item') {
            const item = parseInt(val, 10);
            const pos = this.simState.pendingPos;
            this.simState.arr.splice(pos - 1, 0, item);
            this.printLine(`Item ${item} inserted at position ${pos}.`, 'dos-green');
            this.simState.waitingFor = 'choice';
            this.printArrayMenu();
            return;
        }
        if (this.simState.waitingFor === 'delete_pos') {
            const pos = parseInt(val, 10);
            const n = this.simState.arr.length;
            if (pos >= 1 && pos <= n) {
                const removed = this.simState.arr.splice(pos - 1, 1)[0];
                this.printLine(`Deleted element ${removed} from position ${pos}.`, 'dos-green');
            } else {
                this.printLine('Invalid position for deletion.', 'dos-red');
            }
            this.simState.waitingFor = 'choice';
            this.printArrayMenu();
            return;
        }

        const ch = parseInt(val, 10);
        switch (ch) {
            case 1:
                this.print(`Enter position (1 to ${this.simState.arr.length + 1}): `, 'dos-white');
                this.simState.waitingFor = 'insert_pos';
                break;
            case 2:
                this.print(`Enter position (1 to ${this.simState.arr.length}): `, 'dos-white');
                this.simState.waitingFor = 'delete_pos';
                break;
            case 3:
                this.printLine(`Array: ${this.simState.arr.join(' ')}`, 'dos-green');
                this.printArrayMenu();
                break;
            case 4:
                this.printLine('Program terminated with exit code 0.', 'dos-system');
                break;
            default:
                this.printLine('Invalid choice', 'dos-red');
                this.printArrayMenu();
                break;
        }
    }

    runStandalone(val) {
        this.printLine(`Running execution with input: "${val}"`, 'dos-cyan');
        // Trigger execution on main engine if available
        if (window.appEngine && window.appEngine.runCurrentWithInput) {
            window.appEngine.runCurrentWithInput(val, (msg, type) => {
                this.printLine(msg, type === 'error' ? 'dos-red' : 'dos-green');
            });
        }
    }
}

window.TurboTerminal = TurboTerminal;
