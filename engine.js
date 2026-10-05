// Data Structures Interactive Execution & Visualization Engine
// Supports all 22 practicals from the Turbo C++ DS Lab Manual

class DSEngine {
    constructor(canvasContainerId, logContainerId) {
        this.canvas = document.getElementById(canvasContainerId);
        this.logEl = document.getElementById(logContainerId);
        this.currentProgramId = 1;
        this.animSpeed = 500; // ms
        this.isPaused = false;
        this.isRunning = false;
        this.stepMode = false;
        this.stepResolve = null;
        this.hanoiTimer = null;
        
        // Internal data states for stateful structures
        this.states = {
            stack: [10, 25, 42, 7],
            queue: [15, 30, 45, 60],
            cqueue: { arr: [10, 20, 30, 40, null, null, null, null, null, null], front: 0, rear: 3, max: 10 },
            sll: [12, 99, 37, 5],
            dll: [101, 202, 303, 404],
            bst: [50, 30, 70, 20, 40, 60, 80],
            arrayOps: [10, 20, 30, 40, 50],
            hanoi: { n: 3, pegs: [[], [], []], moves: [], moveIndex: 0 }
        };
    }

    log(msg, type = 'info') {
        if (!this.logEl) return;
        const entry = document.createElement('div');
        entry.className = `log-entry log-${type}`;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span class="log-time">[${time}]</span> <span class="log-msg">${msg}</span>`;
        this.logEl.appendChild(entry);
        this.logEl.scrollTop = this.logEl.scrollHeight;
    }

    clearLog() {
        if (this.logEl) this.logEl.innerHTML = '';
    }

    sleep(ms = this.animSpeed) {
        return new Promise(resolve => {
            if (this.stepMode) {
                this.stepResolve = resolve;
            } else {
                setTimeout(resolve, ms);
            }
        });
    }

    nextStep() {
        if (this.stepResolve) {
            const res = this.stepResolve;
            this.stepResolve = null;
            res();
        }
    }

    setSpeed(speedMs) {
        this.animSpeed = speedMs;
    }

    // Mount specific program visualizer & controls
    loadProgram(pid) {
        this.currentProgramId = pid;
        this.clearLog();
        this.stopAnimations();
        this.renderProgramUI(pid);
    }

    stopAnimations() {
        this.isRunning = false;
        this.stepMode = false;
        if (this.hanoiTimer) {
            clearInterval(this.hanoiTimer);
            this.hanoiTimer = null;
        }
        if (this.stepResolve) {
            this.stepResolve();
            this.stepResolve = null;
        }
    }

    renderProgramUI(pid) {
        if (!this.canvas) return;
        switch (pid) {
            case 1: this.renderStackUI(); break;
            case 2: this.renderSortingUI('Quick Sort', [35, 12, 89, 44, 2, 78, 23], 'quicksort'); break;
            case 3: this.renderQueueUI(); break;
            case 4: this.renderSortingUI('Merge Sort', [45, 18, 72, 30, 9, 56, 33], 'mergesort'); break;
            case 5: this.renderInfixPostfixUI(); break;
            case 6: this.renderSortingUI('Bubble Sort', [64, 34, 25, 12, 22, 11, 90], 'bubblesort'); break;
            case 7: this.renderPrefixEvalUI(); break;
            case 8: this.renderSortingUI('Insertion Sort', [12, 11, 13, 5, 6, 7], 'insertionsort'); break;
            case 9: this.renderHanoiUI(); break;
            case 10: this.renderSortingUI('Selection Sort', [29, 10, 14, 37, 13], 'selectionsort'); break;
            case 11: this.renderLinearSearchUI(); break;
            case 12: this.renderGraphUI('DFS'); break;
            case 13: this.renderBinarySearchUI(); break;
            case 14: this.renderGraphUI('BFS'); break;
            case 15: this.renderCircularQueueUI(); break;
            case 16: this.renderPrimsUI(); break;
            case 17: this.renderSLLUI(); break;
            case 18: this.renderDLLUI(); break;
            case 19: this.renderBSTOpsUI(); break;
            case 20: this.renderBSTTraversalUI(); break;
            case 21: this.renderArrayOpsUI(); break;
            case 22: this.renderRadixSortUI(); break;
            default:
                this.canvas.innerHTML = `<div class="empty-state">Select a practical from the sidebar to begin live execution.</div>`;
                break;
        }
    }

    // -------------------------------------------------------------
    // PROGRAM 1: STACK (Push, Pop, Show)
    // -------------------------------------------------------------
    renderStackUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Value to Push:</label>
                        <input type="number" id="stackInputVal" value="55" class="app-input" placeholder="e.g. 55" />
                    </div>
                    <button class="action-btn btn-primary" id="btnStackPush">
                        <span class="btn-icon">⬆️</span> Push Element
                    </button>
                    <button class="action-btn btn-danger" id="btnStackPop">
                        <span class="btn-icon">⬇️</span> Pop Element
                    </button>
                    <button class="action-btn btn-secondary" id="btnStackShow">
                        <span class="btn-icon">👁️</span> Show Stack
                    </button>
                    <button class="action-btn btn-outline" id="btnStackClear">
                        <span class="btn-icon">🧹</span> Clear Stack
                    </button>
                </div>

                <div class="visualizer-stage stack-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Capacity: <strong>MAX 20</strong></div>
                        <div class="meta-pill">Current Size: <strong id="stackSizeLabel">${this.states.stack.length}</strong></div>
                        <div class="meta-pill">TOP Index: <strong id="stackTopLabel">${this.states.stack.length - 1}</strong></div>
                    </div>
                    <div class="stack-cylinder-wrap">
                        <div class="stack-cylinder" id="stackCylinder"></div>
                        <div class="stack-base">STACK BASE [Index 0]</div>
                    </div>
                </div>
            </div>
        `;

        this.updateStackDisplay();

        document.getElementById('btnStackPush').onclick = () => {
            const val = parseInt(document.getElementById('stackInputVal').value, 10);
            if (isNaN(val)) return this.log('Please enter a valid integer to push.', 'warn');
            if (this.states.stack.length >= 20) {
                this.log('Stack Overflow! Maximum capacity of 20 reached.', 'error');
                return;
            }
            this.states.stack.push(val);
            this.log(`Pushed element: ${val} onto stack. TOP is now ${this.states.stack.length - 1}`, 'success');
            document.getElementById('stackInputVal').value = Math.floor(Math.random() * 90 + 10);
            this.updateStackDisplay(true);
        };

        document.getElementById('btnStackPop').onclick = () => {
            if (this.states.stack.length === 0) {
                this.log('Stack Underflow! Cannot pop from empty stack.', 'error');
                return;
            }
            const popped = this.states.stack.pop();
            this.log(`Popped element: ${popped} from stack. New TOP is ${this.states.stack.length - 1}`, 'success');
            this.updateStackDisplay(false);
        };

        document.getElementById('btnStackShow').onclick = () => {
            if (this.states.stack.length === 0) {
                this.log('Stack is empty (top == -1).', 'info');
            } else {
                const rev = [...this.states.stack].reverse();
                this.log(`Stack elements (Top down to Base): [ ${rev.join(', ')} ]`, 'info');
            }
        };

        document.getElementById('btnStackClear').onclick = () => {
            this.states.stack = [];
            this.log('Stack cleared. (top = -1)', 'info');
            this.updateStackDisplay();
        };
    }

    updateStackDisplay(highlightTop = false) {
        const cyl = document.getElementById('stackCylinder');
        const sizeLbl = document.getElementById('stackSizeLabel');
        const topLbl = document.getElementById('stackTopLabel');
        if (!cyl) return;

        const n = this.states.stack.length;
        if (sizeLbl) sizeLbl.textContent = n;
        if (topLbl) topLbl.textContent = n - 1;

        if (n === 0) {
            cyl.innerHTML = `<div class="empty-stack-placeholder">Stack is Empty (top = -1)</div>`;
            return;
        }

        cyl.innerHTML = '';
        for (let i = n - 1; i >= 0; i--) {
            const item = document.createElement('div');
            item.className = 'stack-item';
            if (i === n - 1) {
                item.classList.add('is-top');
                if (highlightTop) item.classList.add('pop-in');
            }
            item.innerHTML = `
                <span class="stack-idx">[${i}]</span>
                <span class="stack-val">${this.states.stack[i]}</span>
                ${i === n - 1 ? '<span class="top-pointer-badge">👈 TOP</span>' : ''}
            `;
            cyl.appendChild(item);
        }
    }

    // -------------------------------------------------------------
    // PROGRAM 3: SIMPLE QUEUE (Insert, Delete, Show)
    // -------------------------------------------------------------
    renderQueueUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Value to Insert:</label>
                        <input type="number" id="queueInputVal" value="75" class="app-input" placeholder="e.g. 75" />
                    </div>
                    <button class="action-btn btn-primary" id="btnQueueInsert">
                        <span class="btn-icon">➡️</span> Insert (Enqueue)
                    </button>
                    <button class="action-btn btn-danger" id="btnQueueDelete">
                        <span class="btn-icon">⬅️</span> Delete (Dequeue)
                    </button>
                    <button class="action-btn btn-secondary" id="btnQueueShow">
                        <span class="btn-icon">👁️</span> Show Queue
                    </button>
                    <button class="action-btn btn-outline" id="btnQueueClear">
                        <span class="btn-icon">🧹</span> Clear Queue
                    </button>
                </div>

                <div class="visualizer-stage queue-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Capacity: <strong>MAX 20</strong></div>
                        <div class="meta-pill">Count: <strong id="qCountLbl">${this.states.queue.length}</strong></div>
                        <div class="meta-pill">FRONT: <strong id="qFrontLbl">${this.states.queue.length > 0 ? 0 : -1}</strong></div>
                        <div class="meta-pill">REAR: <strong id="qRearLbl">${this.states.queue.length - 1}</strong></div>
                    </div>
                    <div class="queue-track-container">
                        <div class="queue-end-label front-tag">⬅️ FRONT (Delete from here)</div>
                        <div class="queue-track" id="queueTrack"></div>
                        <div class="queue-end-label rear-tag">REAR (Insert here) ➡️</div>
                    </div>
                </div>
            </div>
        `;

        this.updateQueueDisplay();

        document.getElementById('btnQueueInsert').onclick = () => {
            const val = parseInt(document.getElementById('queueInputVal').value, 10);
            if (isNaN(val)) return this.log('Please enter a valid integer to insert.', 'warn');
            if (this.states.queue.length >= 20) {
                this.log('Queue Overflow! Cannot insert more elements.', 'error');
                return;
            }
            this.states.queue.push(val);
            this.log(`Inserted element: ${val} at REAR. Total elements: ${this.states.queue.length}`, 'success');
            document.getElementById('queueInputVal').value = Math.floor(Math.random() * 90 + 10);
            this.updateQueueDisplay();
        };

        document.getElementById('btnQueueDelete').onclick = () => {
            if (this.states.queue.length === 0) {
                this.log('Queue Underflow! Queue is empty.', 'error');
                return;
            }
            const del = this.states.queue.shift();
            this.log(`Deleted element: ${del} from FRONT.`, 'success');
            this.updateQueueDisplay();
        };

        document.getElementById('btnQueueShow').onclick = () => {
            if (this.states.queue.length === 0) {
                this.log('Queue is empty.', 'info');
            } else {
                this.log(`Queue elements (Front to Rear): [ ${this.states.queue.join(', ')} ]`, 'info');
            }
        };

        document.getElementById('btnQueueClear').onclick = () => {
            this.states.queue = [];
            this.log('Queue cleared. (front = rear = -1)', 'info');
            this.updateQueueDisplay();
        };
    }

    updateQueueDisplay() {
        const track = document.getElementById('queueTrack');
        const countLbl = document.getElementById('qCountLbl');
        const frontLbl = document.getElementById('qFrontLbl');
        const rearLbl = document.getElementById('qRearLbl');
        if (!track) return;

        const n = this.states.queue.length;
        if (countLbl) countLbl.textContent = n;
        if (frontLbl) frontLbl.textContent = n > 0 ? 0 : -1;
        if (rearLbl) rearLbl.textContent = n - 1;

        if (n === 0) {
            track.innerHTML = `<div class="empty-queue-placeholder">Queue is Empty (front = -1, rear = -1)</div>`;
            return;
        }

        track.innerHTML = '';
        this.states.queue.forEach((val, idx) => {
            const item = document.createElement('div');
            item.className = 'queue-slot';
            if (idx === 0) item.classList.add('is-front');
            if (idx === n - 1) item.classList.add('is-rear');
            item.innerHTML = `
                <div class="q-slot-header">Slot ${idx}</div>
                <div class="q-slot-val">${val}</div>
                <div class="q-slot-labels">
                    ${idx === 0 ? '<span class="q-badge front">FRONT</span>' : ''}
                    ${idx === n - 1 ? '<span class="q-badge rear">REAR</span>' : ''}
                </div>
            `;
            track.appendChild(item);
        });
    }

    // -------------------------------------------------------------
    // PROGRAM 15: CIRCULAR QUEUE
    // -------------------------------------------------------------
    renderCircularQueueUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Value to Insert:</label>
                        <input type="number" id="cqueueVal" value="65" class="app-input" placeholder="e.g. 65" />
                    </div>
                    <button class="action-btn btn-primary" id="btnCQInsert">
                        <span class="btn-icon">📥</span> Insert ((rear+1)%MAX)
                    </button>
                    <button class="action-btn btn-danger" id="btnCQDelete">
                        <span class="btn-icon">📤</span> Delete ((front+1)%MAX)
                    </button>
                    <button class="action-btn btn-secondary" id="btnCQShow">
                        <span class="btn-icon">👁️</span> Show Cyclic Queue
                    </button>
                    <button class="action-btn btn-outline" id="btnCQReset">
                        <span class="btn-icon">🔄</span> Reset
                    </button>
                </div>

                <div class="visualizer-stage cqueue-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">MAX: <strong>10 Slots</strong></div>
                        <div class="meta-pill">FRONT: <strong id="cqFrontVal">${this.states.cqueue.front}</strong></div>
                        <div class="meta-pill">REAR: <strong id="cqRearVal">${this.states.cqueue.rear}</strong></div>
                        <div class="meta-pill">Condition: <strong id="cqConditionVal">Normal</strong></div>
                    </div>
                    
                    <div class="cqueue-visual-container">
                        <div class="cqueue-circle" id="cqueueCircle"></div>
                    </div>
                </div>
            </div>
        `;

        this.updateCircularQueueDisplay();

        document.getElementById('btnCQInsert').onclick = () => {
            const cq = this.states.cqueue;
            const MAX = cq.max;
            const val = parseInt(document.getElementById('cqueueVal').value, 10);
            if (isNaN(val)) return this.log('Enter valid integer.', 'warn');

            if ((cq.rear + 1) % MAX === cq.front) {
                this.log(`Circular Queue Overflow! (rear + 1) % ${MAX} == front (${cq.front})`, 'error');
                return;
            }

            if (cq.front === -1) {
                cq.front = 0;
                cq.rear = 0;
            } else {
                cq.rear = (cq.rear + 1) % MAX;
            }
            cq.arr[cq.rear] = val;
            this.log(`Inserted ${val} at index ${cq.rear}. FRONT=${cq.front}, REAR=${cq.rear}`, 'success');
            document.getElementById('cqueueVal').value = Math.floor(Math.random() * 90 + 10);
            this.updateCircularQueueDisplay();
        };

        document.getElementById('btnCQDelete').onclick = () => {
            const cq = this.states.cqueue;
            const MAX = cq.max;
            if (cq.front === -1) {
                this.log('Circular Queue Underflow! Queue is empty.', 'error');
                return;
            }
            const deleted = cq.arr[cq.front];
            cq.arr[cq.front] = null;
            this.log(`Deleted element: ${deleted} from index ${cq.front}`, 'success');

            if (cq.front === cq.rear) {
                cq.front = -1;
                cq.rear = -1;
                this.log('Queue is now empty after removing last element (front=rear=-1).', 'info');
            } else {
                cq.front = (cq.front + 1) % MAX;
            }
            this.updateCircularQueueDisplay();
        };

        document.getElementById('btnCQShow').onclick = () => {
            const cq = this.states.cqueue;
            if (cq.front === -1) {
                this.log('Circular Queue is empty.', 'info');
                return;
            }
            let res = [];
            let i = cq.front;
            while (true) {
                res.push(cq.arr[i]);
                if (i === cq.rear) break;
                i = (i + 1) % cq.max;
            }
            this.log(`Circular Queue elements (cyclic order): [ ${res.join(', ')} ]`, 'info');
        };

        document.getElementById('btnCQReset').onclick = () => {
            this.states.cqueue = { arr: new Array(10).fill(null), front: -1, rear: -1, max: 10 };
            this.log('Circular Queue reset to empty.', 'info');
            this.updateCircularQueueDisplay();
        };
    }

    updateCircularQueueDisplay() {
        const circle = document.getElementById('cqueueCircle');
        const frontLbl = document.getElementById('cqFrontVal');
        const rearLbl = document.getElementById('cqRearVal');
        const condLbl = document.getElementById('cqConditionVal');
        if (!circle) return;

        const cq = this.states.cqueue;
        if (frontLbl) frontLbl.textContent = cq.front;
        if (rearLbl) rearLbl.textContent = cq.rear;

        if (condLbl) {
            if (cq.front === -1) condLbl.textContent = 'Empty (front = -1)';
            else if ((cq.rear + 1) % cq.max === cq.front) condLbl.textContent = 'Full (Overflow)';
            else condLbl.textContent = 'Normal';
        }

        circle.innerHTML = '';
        const MAX = cq.max;
        const radius = 130;
        const centerX = 160;
        const centerY = 160;

        for (let i = 0; i < MAX; i++) {
            const angle = (i * (360 / MAX) - 90) * (Math.PI / 180);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            const slot = document.createElement('div');
            slot.className = 'cq-slot-node';
            if (cq.arr[i] !== null) slot.classList.add('occupied');
            if (i === cq.front) slot.classList.add('is-cq-front');
            if (i === cq.rear) slot.classList.add('is-cq-rear');

            slot.style.left = `${x}px`;
            slot.style.top = `${y}px`;

            slot.innerHTML = `
                <div class="cq-node-idx">${i}</div>
                <div class="cq-node-val">${cq.arr[i] !== null ? cq.arr[i] : '—'}</div>
                <div class="cq-pointers">
                    ${i === cq.front ? '<span class="cq-badge f">F</span>' : ''}
                    ${i === cq.rear ? '<span class="cq-badge r">R</span>' : ''}
                </div>
            `;
            circle.appendChild(slot);
        }

        // Center hub
        const hub = document.createElement('div');
        hub.className = 'cq-hub';
        hub.innerHTML = `
            <div class="hub-title">CIRCULAR QUEUE</div>
            <div class="hub-sub">(rear + 1) % ${MAX}</div>
        `;
        circle.appendChild(hub);
    }

    // -------------------------------------------------------------
    // PROGRAM 5: INFIX TO POSTFIX CONVERSION
    // -------------------------------------------------------------
    renderInfixPostfixUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group" style="flex: 2;">
                        <label>Infix Expression:</label>
                        <input type="text" id="infixInput" value="(A+B)*(C-D)^E" class="app-input" placeholder="e.g. (A+B)*C" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunInfix">
                        <span class="btn-icon">⚡</span> Convert to Postfix
                    </button>
                    <button class="action-btn btn-secondary" id="btnSampleInfix1">Sample 1: (A+B)*C</button>
                    <button class="action-btn btn-secondary" id="btnSampleInfix2">Sample 2: A+B*C-D/E</button>
                </div>

                <div class="visualizer-stage infix-stage">
                    <div class="infix-result-card" id="infixFinalResult">
                        <span class="result-lbl">Final Postfix Expression:</span>
                        <span class="result-expr" id="postfixOutputText">—</span>
                    </div>

                    <div class="table-container">
                        <table class="algo-table" id="infixStepsTable">
                            <thead>
                                <tr>
                                    <th>Step #</th>
                                    <th>Token</th>
                                    <th>Action / Rule</th>
                                    <th>Operator Stack</th>
                                    <th>Postfix String</th>
                                </tr>
                            </thead>
                            <tbody id="infixStepsBody">
                                <tr><td colspan="5" class="text-center">Click "Convert to Postfix" to view live conversion steps.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnSampleInfix1').onclick = () => {
            document.getElementById('infixInput').value = '(A+B)*C';
            document.getElementById('btnRunInfix').click();
        };

        document.getElementById('btnSampleInfix2').onclick = () => {
            document.getElementById('infixInput').value = 'A+B*C-D/E';
            document.getElementById('btnRunInfix').click();
        };

        document.getElementById('btnRunInfix').onclick = () => {
            const exp = document.getElementById('infixInput').value.trim();
            if (!exp) return this.log('Please enter an infix expression.', 'warn');
            this.executeInfixToPostfix(exp);
        };
    }

    executeInfixToPostfix(infix) {
        this.clearLog();
        this.log(`Converting Infix: "${infix}" to Postfix...`, 'info');

        const priority = (c) => {
            if (c === '+' || c === '-') return 1;
            if (c === '*' || c === '/') return 2;
            if (c === '^') return 3;
            return 0;
        };

        const isAlphanumeric = (c) => /[a-zA-Z0-9]/.test(c);

        let stack = [];
        let postfix = '';
        let steps = [];

        for (let i = 0; i < infix.length; i++) {
            const c = infix[i];
            if (isAlphanumeric(c)) {
                postfix += c;
                steps.push({
                    token: c,
                    action: `Operand: append '${c}' directly to postfix string`,
                    stack: [...stack],
                    postfix: postfix
                });
            } else if (c === '(') {
                stack.push(c);
                steps.push({
                    token: c,
                    action: `Left parenthesis: push '(' to operator stack`,
                    stack: [...stack],
                    postfix: postfix
                });
            } else if (c === ')') {
                while (stack.length > 0 && stack[stack.length - 1] !== '(') {
                    const popOp = stack.pop();
                    postfix += popOp;
                    steps.push({
                        token: c,
                        action: `Right parenthesis: pop '${popOp}' from stack to postfix`,
                        stack: [...stack],
                        postfix: postfix
                    });
                }
                if (stack.length > 0) stack.pop(); // discard '('
                steps.push({
                    token: c,
                    action: `Discard matching '(' from stack`,
                    stack: [...stack],
                    postfix: postfix
                });
            } else {
                // Operator
                while (stack.length > 0 && priority(stack[stack.length - 1]) >= priority(c)) {
                    const popOp = stack.pop();
                    postfix += popOp;
                    steps.push({
                        token: c,
                        action: `Stack top '${popOp}' has >= priority than '${c}': pop to postfix`,
                        stack: [...stack],
                        postfix: postfix
                    });
                }
                stack.push(c);
                steps.push({
                    token: c,
                    action: `Push operator '${c}' to stack`,
                    stack: [...stack],
                    postfix: postfix
                });
            }
        }

        // Empty remaining stack
        while (stack.length > 0) {
            const popOp = stack.pop();
            postfix += popOp;
            steps.push({
                token: 'END',
                action: `End of expression: pop '${popOp}' to postfix`,
                stack: [...stack],
                postfix: postfix
            });
        }

        // Render table
        const tbody = document.getElementById('infixStepsBody');
        const outText = document.getElementById('postfixOutputText');
        if (outText) outText.textContent = postfix;

        tbody.innerHTML = '';
        steps.forEach((step, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><span class="token-badge">${step.token}</span></td>
                <td>${step.action}</td>
                <td><code class="code-pill">${step.stack.length > 0 ? step.stack.join(' ') : 'EMPTY'}</code></td>
                <td><strong class="text-accent">${step.postfix}</strong></td>
            `;
            tbody.appendChild(tr);
        });

        this.log(`Conversion completed! Result: ${postfix}`, 'success');
    }

    // -------------------------------------------------------------
    // PROGRAM 7: PREFIX (POLISH NOTATION) EVALUATION
    // -------------------------------------------------------------
    renderPrefixEvalUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group" style="flex: 2;">
                        <label>Prefix Expression (single digit operands):</label>
                        <input type="text" id="prefixInput" value="+ * 2 3 4" class="app-input" placeholder="e.g. + * 2 3 4 or +*234" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunPrefix">
                        <span class="btn-icon">⚡</span> Evaluate Prefix
                    </button>
                    <button class="action-btn btn-secondary" id="btnSamplePref1">Sample 1: + * 2 3 4 (=10)</button>
                    <button class="action-btn btn-secondary" id="btnSamplePref2">Sample 2: - + 8 / 6 3 2 (=8)</button>
                </div>

                <div class="visualizer-stage prefix-stage">
                    <div class="infix-result-card">
                        <span class="result-lbl">Evaluated Answer:</span>
                        <span class="result-expr" id="prefixResultVal">—</span>
                    </div>

                    <div class="table-container">
                        <table class="algo-table">
                            <thead>
                                <tr>
                                    <th>Step #</th>
                                    <th>Character (Right to Left)</th>
                                    <th>Operation / Action</th>
                                    <th>Operand Stack</th>
                                </tr>
                            </thead>
                            <tbody id="prefixStepsBody">
                                <tr><td colspan="4" class="text-center">Click "Evaluate Prefix" to run right-to-left evaluation.</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnSamplePref1').onclick = () => {
            document.getElementById('prefixInput').value = '+ * 2 3 4';
            document.getElementById('btnRunPrefix').click();
        };

        document.getElementById('btnSamplePref2').onclick = () => {
            document.getElementById('prefixInput').value = '- + 8 / 6 3 2';
            document.getElementById('btnRunPrefix').click();
        };

        document.getElementById('btnRunPrefix').onclick = () => {
            const exp = document.getElementById('prefixInput').value.trim();
            if (!exp) return this.log('Enter prefix expression.', 'warn');
            this.executePrefixEval(exp);
        };
    }

    executePrefixEval(expRaw) {
        this.clearLog();
        // Remove spaces for evaluation
        const exp = expRaw.replace(/\s+/g, '');
        this.log(`Evaluating Prefix expression: "${exp}" right to left...`, 'info');

        let st = [];
        let steps = [];

        const opCalc = (a, b, op) => {
            switch (op) {
                case '+': return a + b;
                case '-': return a - b;
                case '*': return a * b;
                case '/': return Math.floor(a / b);
                case '^': return Math.pow(a, b);
                default: return 0;
            }
        };

        for (let i = exp.length - 1; i >= 0; i--) {
            const c = exp[i];
            if (/\d/.test(c)) {
                const num = parseInt(c, 10);
                st.push(num);
                steps.push({
                    char: c,
                    action: `Operand: push ${num} onto operand stack`,
                    stack: [...st]
                });
            } else if (['+', '-', '*', '/', '^'].includes(c)) {
                if (st.length < 2) {
                    this.log('Invalid prefix expression! Not enough operands.', 'error');
                    return;
                }
                const a = st.pop();
                const b = st.pop();
                const res = opCalc(a, b, c);
                st.push(res);
                steps.push({
                    char: c,
                    action: `Operator '${c}': pop ${a}, pop ${b} -> calculate (${a} ${c} ${b}) = ${res}`,
                    stack: [...st]
                });
            }
        }

        const finalAns = st[st.length - 1];
        document.getElementById('prefixResultVal').textContent = finalAns;

        const tbody = document.getElementById('prefixStepsBody');
        tbody.innerHTML = '';
        steps.forEach((s, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td><span class="token-badge">${s.char}</span></td>
                <td>${s.action}</td>
                <td><code class="code-pill">[ ${s.stack.join(', ')} ]</code></td>
            `;
            tbody.appendChild(tr);
        });

        this.log(`Evaluation complete! Result = ${finalAns}`, 'success');
    }

    // -------------------------------------------------------------
    // PROGRAM 9: TOWER OF HANOI
    // -------------------------------------------------------------
    renderHanoiUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Disks (1 to 6):</label>
                        <input type="number" id="hanoiDisksInput" min="1" max="6" value="3" class="app-input" style="width: 80px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnHanoiAuto">
                        <span class="btn-icon">▶️</span> Auto Play
                    </button>
                    <button class="action-btn btn-secondary" id="btnHanoiStep">
                        <span class="btn-icon">⏭️</span> Next Step
                    </button>
                    <button class="action-btn btn-outline" id="btnHanoiReset">
                        <span class="btn-icon">🔄</span> Reset
                    </button>
                </div>

                <div class="visualizer-stage hanoi-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Disks: <strong id="hanoiNumLbl">3</strong></div>
                        <div class="meta-pill">Total Moves (2ⁿ-1): <strong id="hanoiTotalMovesLbl">7</strong></div>
                        <div class="meta-pill">Move: <strong id="hanoiCurrentMoveLbl">0</strong></div>
                        <div class="meta-pill">Status: <strong id="hanoiStatusLbl">Ready</strong></div>
                    </div>

                    <div class="pegs-container" id="pegsContainer">
                        <div class="peg-box" id="peg0">
                            <div class="peg-pole"></div>
                            <div class="peg-disks" id="disks0"></div>
                            <div class="peg-label">Peg A (Source)</div>
                        </div>
                        <div class="peg-box" id="peg1">
                            <div class="peg-pole"></div>
                            <div class="peg-disks" id="disks1"></div>
                            <div class="peg-label">Peg B (Auxiliary)</div>
                        </div>
                        <div class="peg-box" id="peg2">
                            <div class="peg-pole"></div>
                            <div class="peg-disks" id="disks2"></div>
                            <div class="peg-label">Peg C (Destination)</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.initHanoi(3);

        document.getElementById('hanoiDisksInput').onchange = (e) => {
            let n = parseInt(e.target.value, 10);
            if (isNaN(n) || n < 1) n = 1;
            if (n > 6) n = 6;
            e.target.value = n;
            this.initHanoi(n);
        };

        document.getElementById('btnHanoiAuto').onclick = () => this.toggleHanoiAuto();
        document.getElementById('btnHanoiStep').onclick = () => this.stepHanoi();
        document.getElementById('btnHanoiReset').onclick = () => {
            const n = parseInt(document.getElementById('hanoiDisksInput').value, 10) || 3;
            this.initHanoi(n);
        };
    }

    initHanoi(n) {
        if (this.hanoiTimer) {
            clearInterval(this.hanoiTimer);
            this.hanoiTimer = null;
        }
        const moves = [];
        const generateMoves = (k, from, to, aux) => {
            if (k === 1) {
                moves.push({ disk: 1, from, to });
                return;
            }
            generateMoves(k - 1, from, aux, to);
            moves.push({ disk: k, from, to });
            generateMoves(k - 1, aux, to, from);
        };

        generateMoves(n, 0, 2, 1);

        const pegs = [[], [], []];
        for (let i = n; i >= 1; i--) {
            pegs[0].push(i);
        }

        this.states.hanoi = {
            n: n,
            pegs: pegs,
            moves: moves,
            moveIndex: 0
        };

        document.getElementById('hanoiNumLbl').textContent = n;
        document.getElementById('hanoiTotalMovesLbl').textContent = moves.length;
        document.getElementById('hanoiCurrentMoveLbl').textContent = 0;
        document.getElementById('hanoiStatusLbl').textContent = 'Ready';

        this.renderHanoiDisks();
        this.clearLog();
        this.log(`Tower of Hanoi initialized with ${n} disks. Minimum moves required: ${moves.length}`, 'info');
    }

    renderHanoiDisks() {
        const colors = ['#f43f5e', '#ec4899', '#a855f7', '#6366f1', '#06b6d4', '#10b981'];
        for (let p = 0; p < 3; p++) {
            const diskContainer = document.getElementById(`disks${p}`);
            if (!diskContainer) return;
            diskContainer.innerHTML = '';
            const stack = this.states.hanoi.pegs[p];
            stack.forEach(diskSize => {
                const disk = document.createElement('div');
                disk.className = 'hanoi-disk';
                disk.style.width = `${35 + diskSize * 26}px`;
                disk.style.backgroundColor = colors[(diskSize - 1) % colors.length];
                disk.textContent = diskSize;
                diskContainer.appendChild(disk);
            });
        }
    }

    stepHanoi() {
        const h = this.states.hanoi;
        if (h.moveIndex >= h.moves.length) {
            this.log('Puzzle completed! All disks successfully moved to Peg C.', 'success');
            document.getElementById('hanoiStatusLbl').textContent = 'Completed!';
            if (this.hanoiTimer) {
                clearInterval(this.hanoiTimer);
                this.hanoiTimer = null;
                document.getElementById('btnHanoiAuto').innerHTML = '<span class="btn-icon">▶️</span> Auto Play';
            }
            return false;
        }

        const move = h.moves[h.moveIndex];
        const disk = h.pegs[move.from].pop();
        h.pegs[move.to].push(disk);
        h.moveIndex++;

        const pegNames = ['A', 'B', 'C'];
        this.log(`Move ${h.moveIndex}: Move disk ${disk} from Peg ${pegNames[move.from]} to Peg ${pegNames[move.to]}`, 'info');

        document.getElementById('hanoiCurrentMoveLbl').textContent = h.moveIndex;
        this.renderHanoiDisks();

        if (h.moveIndex === h.moves.length) {
            document.getElementById('hanoiStatusLbl').textContent = 'Completed 🎉';
            this.log('All disks solved successfully!', 'success');
            return false;
        }
        return true;
    }

    toggleHanoiAuto() {
        const btn = document.getElementById('btnHanoiAuto');
        if (this.hanoiTimer) {
            clearInterval(this.hanoiTimer);
            this.hanoiTimer = null;
            btn.innerHTML = '<span class="btn-icon">▶️</span> Resume Auto';
            document.getElementById('hanoiStatusLbl').textContent = 'Paused';
        } else {
            if (this.states.hanoi.moveIndex >= this.states.hanoi.moves.length) {
                this.initHanoi(this.states.hanoi.n);
            }
            btn.innerHTML = '<span class="btn-icon">⏸️</span> Pause Auto';
            document.getElementById('hanoiStatusLbl').textContent = 'Playing...';
            this.hanoiTimer = setInterval(() => {
                const hasMore = this.stepHanoi();
                if (!hasMore) {
                    btn.innerHTML = '<span class="btn-icon">▶️</span> Auto Play';
                }
            }, Math.max(200, this.animSpeed));
        }
    }

    // -------------------------------------------------------------
    // SORTING ALGORITHMS (Quick, Merge, Bubble, Insertion, Selection)
    // -------------------------------------------------------------
    renderSortingUI(title, defaultArr, algoType) {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group" style="flex: 2;">
                        <label>Array Elements (comma separated):</label>
                        <input type="text" id="sortArrayInput" value="${defaultArr.join(', ')}" class="app-input" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunSort">
                        <span class="btn-icon">▶️</span> Sort Array (${title})
                    </button>
                    <button class="action-btn btn-secondary" id="btnRandomSort">
                        <span class="btn-icon">🎲</span> Randomize
                    </button>
                    <button class="action-btn btn-outline" id="btnResetSort">
                        <span class="btn-icon">🔄</span> Reset
                    </button>
                </div>

                <div class="visualizer-stage sort-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Algorithm: <strong>${title}</strong></div>
                        <div class="meta-pill">Comparisons: <strong id="sortCompCount">0</strong></div>
                        <div class="meta-pill">Swaps/Writes: <strong id="sortSwapCount">0</strong></div>
                        <div class="meta-pill">Status: <strong id="sortStatus">Ready</strong></div>
                    </div>
                    
                    <div class="bars-container" id="sortBarsContainer"></div>
                </div>
            </div>
        `;

        this.currentSortArr = [...defaultArr];
        this.renderSortBars(this.currentSortArr);

        document.getElementById('btnRandomSort').onclick = () => {
            const arr = Array.from({ length: 8 }, () => Math.floor(Math.random() * 85 + 10));
            document.getElementById('sortArrayInput').value = arr.join(', ');
            this.currentSortArr = [...arr];
            this.renderSortBars(this.currentSortArr);
            this.clearLog();
            this.log(`Generated new random array: [ ${arr.join(', ')} ]`, 'info');
        };

        document.getElementById('btnResetSort').onclick = () => {
            const arr = this.parseArrayInput('sortArrayInput');
            this.currentSortArr = [...arr];
            this.renderSortBars(this.currentSortArr);
            document.getElementById('sortCompCount').textContent = '0';
            document.getElementById('sortSwapCount').textContent = '0';
            document.getElementById('sortStatus').textContent = 'Reset';
        };

        document.getElementById('btnRunSort').onclick = () => {
            const arr = this.parseArrayInput('sortArrayInput');
            this.executeSorting(arr, algoType);
        };
    }

    parseArrayInput(id) {
        const val = document.getElementById(id).value;
        const nums = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        return nums.length > 0 ? nums : [35, 12, 89, 44, 2, 78, 23];
    }

    renderSortBars(arr, highlights = {}) {
        const container = document.getElementById('sortBarsContainer');
        if (!container) return;
        container.innerHTML = '';
        const maxVal = Math.max(...arr, 1);

        arr.forEach((val, idx) => {
            const barWrap = document.createElement('div');
            barWrap.className = 'bar-wrap';

            const bar = document.createElement('div');
            bar.className = 'sort-bar';
            const heightPercent = Math.max(12, Math.round((val / maxVal) * 100));
            bar.style.height = `${heightPercent}%`;

            if (highlights.pivot === idx) bar.classList.add('bar-pivot');
            if (highlights.comparing && highlights.comparing.includes(idx)) bar.classList.add('bar-comparing');
            if (highlights.sorted && highlights.sorted.includes(idx)) bar.classList.add('bar-sorted');
            if (highlights.min === idx) bar.classList.add('bar-min');

            bar.innerHTML = `<span class="bar-val">${val}</span>`;
            barWrap.appendChild(bar);

            const idxLabel = document.createElement('span');
            idxLabel.className = 'bar-idx';
            idxLabel.textContent = `[${idx}]`;
            barWrap.appendChild(idxLabel);

            container.appendChild(barWrap);
        });
    }

    async executeSorting(arr, algoType) {
        this.clearLog();
        this.isRunning = true;
        let comps = 0;
        let swaps = 0;
        const compEl = document.getElementById('sortCompCount');
        const swapEl = document.getElementById('sortSwapCount');
        const statusEl = document.getElementById('sortStatus');
        if (statusEl) statusEl.textContent = 'Sorting...';

        this.log(`Starting ${algoType.toUpperCase()} on array [ ${arr.join(', ')} ]`, 'info');

        if (algoType === 'bubblesort') {
            const n = arr.length;
            for (let i = 0; i < n - 1; i++) {
                this.log(`--- Pass ${i + 1} ---`, 'info');
                for (let j = 0; j < n - i - 1; j++) {
                    comps++;
                    compEl.textContent = comps;
                    this.renderSortBars(arr, { comparing: [j, j + 1] });
                    await this.sleep();

                    if (arr[j] > arr[j + 1]) {
                        swaps++;
                        swapEl.textContent = swaps;
                        const temp = arr[j];
                        arr[j] = arr[j + 1];
                        arr[j + 1] = temp;
                        this.log(`Swapped ${arr[j + 1]} and ${arr[j]} at indices [${j}, ${j + 1}]`, 'info');
                        this.renderSortBars(arr, { comparing: [j, j + 1] });
                        await this.sleep();
                    }
                }
            }
        } else if (algoType === 'selectionsort') {
            const n = arr.length;
            for (let i = 0; i < n - 1; i++) {
                let min = i;
                this.renderSortBars(arr, { min: min, comparing: [i] });
                await this.sleep();
                for (let j = i + 1; j < n; j++) {
                    comps++;
                    compEl.textContent = comps;
                    this.renderSortBars(arr, { min: min, comparing: [j] });
                    await this.sleep();
                    if (arr[j] < arr[min]) {
                        min = j;
                        this.renderSortBars(arr, { min: min });
                        await this.sleep();
                    }
                }
                if (min !== i) {
                    swaps++;
                    swapEl.textContent = swaps;
                    const temp = arr[i];
                    arr[i] = arr[min];
                    arr[min] = temp;
                    this.log(`Swapped minimum ${arr[i]} into position [${i}]`, 'info');
                }
            }
        } else if (algoType === 'insertionsort') {
            const n = arr.length;
            for (let i = 1; i < n; i++) {
                let key = arr[i];
                let j = i - 1;
                this.log(`Key selected: ${key} at index ${i}`, 'info');
                while (j >= 0 && arr[j] > key) {
                    comps++;
                    swaps++;
                    compEl.textContent = comps;
                    swapEl.textContent = swaps;
                    arr[j + 1] = arr[j];
                    this.renderSortBars(arr, { comparing: [j, j + 1] });
                    await this.sleep();
                    j--;
                }
                arr[j + 1] = key;
                this.renderSortBars(arr, { sorted: Array.from({ length: i + 1 }, (_, k) => k) });
                await this.sleep();
            }
        } else if (algoType === 'quicksort') {
            const qs = async (low, high) => {
                let i = low, j = high;
                let pivot = arr[Math.floor((low + high) / 2)];
                const pivotIdx = Math.floor((low + high) / 2);
                this.log(`Partition [${low}..${high}], Pivot: ${pivot}`, 'info');

                while (i <= j) {
                    while (arr[i] < pivot) {
                        comps++;
                        compEl.textContent = comps;
                        i++;
                    }
                    while (arr[j] > pivot) {
                        comps++;
                        compEl.textContent = comps;
                        j--;
                    }
                    if (i <= j) {
                        swaps++;
                        swapEl.textContent = swaps;
                        const temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                        this.renderSortBars(arr, { pivot: pivotIdx, comparing: [i, j] });
                        await this.sleep();
                        i++;
                        j--;
                    }
                }
                if (low < j) await qs(low, j);
                if (i < high) await qs(i, high);
            };
            await qs(0, arr.length - 1);
        } else if (algoType === 'mergesort') {
            const merge = async (low, mid, high) => {
                let temp = [];
                let i = low, j = mid + 1;
                while (i <= mid && j <= high) {
                    comps++;
                    compEl.textContent = comps;
                    if (arr[i] <= arr[j]) {
                        temp.push(arr[i++]);
                    } else {
                        temp.push(arr[j++]);
                    }
                }
                while (i <= mid) temp.push(arr[i++]);
                while (j <= high) temp.push(arr[j++]);

                for (let k = low; k <= high; k++) {
                    swaps++;
                    swapEl.textContent = swaps;
                    arr[k] = temp[k - low];
                    this.renderSortBars(arr, { comparing: [k] });
                    await this.sleep(this.animSpeed / 2);
                }
            };

            const ms = async (low, high) => {
                if (low < high) {
                    const mid = Math.floor((low + high) / 2);
                    await ms(low, mid);
                    await ms(mid + 1, high);
                    await merge(low, mid, high);
                }
            };
            await ms(0, arr.length - 1);
        }

        // Mark all sorted
        this.renderSortBars(arr, { sorted: arr.map((_, i) => i) });
        if (statusEl) statusEl.textContent = 'Completed 🎉';
        this.log(`Sorted array result: [ ${arr.join(', ')} ]`, 'success');
        this.isRunning = false;
    }

    // -------------------------------------------------------------
    // PROGRAM 11: LINEAR SEARCH
    // -------------------------------------------------------------
    renderLinearSearchUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Array Elements:</label>
                        <input type="text" id="linearArrInput" value="15, 5, 20, 35, 2, 42, 88" class="app-input" />
                    </div>
                    <div class="input-group">
                        <label>Key to Search:</label>
                        <input type="number" id="linearKeyInput" value="35" class="app-input" style="width: 90px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunLinearSearch">
                        <span class="btn-icon">🔍</span> Search Key
                    </button>
                </div>

                <div class="visualizer-stage search-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Search Key: <strong id="searchKeyLbl">35</strong></div>
                        <div class="meta-pill">Current Index: <strong id="searchIdxLbl">—</strong></div>
                        <div class="meta-pill">Status: <strong id="searchStatusLbl">Ready</strong></div>
                    </div>
                    <div class="array-slots-grid" id="searchArrayGrid"></div>
                </div>
            </div>
        `;

        const arr = this.parseArrayInput('linearArrInput');
        this.renderSearchArray(arr);

        document.getElementById('btnRunLinearSearch').onclick = async () => {
            const arr = this.parseArrayInput('linearArrInput');
            const key = parseInt(document.getElementById('linearKeyInput').value, 10);
            document.getElementById('searchKeyLbl').textContent = key;
            this.clearLog();
            this.log(`Starting Linear Search for key: ${key}...`, 'info');

            let found = false;
            for (let i = 0; i < arr.length; i++) {
                document.getElementById('searchIdxLbl').textContent = i;
                this.renderSearchArray(arr, { current: i });
                this.log(`Comparing a[${i}] = ${arr[i]} with key ${key}`, 'info');
                await this.sleep();

                if (arr[i] === key) {
                    found = true;
                    this.renderSearchArray(arr, { found: i });
                    document.getElementById('searchStatusLbl').textContent = `Found at position ${i + 1}`;
                    this.log(`Element ${key} FOUND at index ${i} (Position ${i + 1})!`, 'success');
                    break;
                }
            }

            if (!found) {
                document.getElementById('searchStatusLbl').textContent = 'Not Found';
                this.log(`Element ${key} not found in array.`, 'warn');
            }
        };
    }

    renderSearchArray(arr, state = {}) {
        const grid = document.getElementById('searchArrayGrid');
        if (!grid) return;
        grid.innerHTML = '';

        arr.forEach((val, idx) => {
            const cell = document.createElement('div');
            cell.className = 'array-slot';
            if (state.current === idx) cell.classList.add('is-current');
            if (state.found === idx) cell.classList.add('is-found');
            if (state.low === idx) cell.classList.add('is-low');
            if (state.mid === idx) cell.classList.add('is-mid');
            if (state.high === idx) cell.classList.add('is-high');
            if (state.excluded && state.excluded.includes(idx)) cell.classList.add('is-excluded');

            cell.innerHTML = `
                <div class="slot-idx">Index ${idx}</div>
                <div class="slot-val">${val}</div>
                <div class="slot-pos">Pos ${idx + 1}</div>
            `;
            grid.appendChild(cell);
        });
    }

    // -------------------------------------------------------------
    // PROGRAM 13: BINARY SEARCH
    // -------------------------------------------------------------
    renderBinarySearchUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Sorted Array:</label>
                        <input type="text" id="binArrInput" value="10, 23, 35, 48, 62, 77, 91" class="app-input" />
                    </div>
                    <div class="input-group">
                        <label>Key to Search:</label>
                        <input type="number" id="binKeyInput" value="48" class="app-input" style="width: 90px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunBinSearch">
                        <span class="btn-icon">⚡</span> Binary Search
                    </button>
                </div>

                <div class="visualizer-stage search-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Key: <strong id="binKeyLbl">48</strong></div>
                        <div class="meta-pill">LOW: <strong id="binLowLbl">0</strong></div>
                        <div class="meta-pill">MID: <strong id="binMidLbl">—</strong></div>
                        <div class="meta-pill">HIGH: <strong id="binHighLbl">—</strong></div>
                        <div class="meta-pill">Status: <strong id="binStatusLbl">Ready</strong></div>
                    </div>
                    <div class="array-slots-grid" id="searchArrayGrid"></div>
                </div>
            </div>
        `;

        const arr = this.parseArrayInput('binArrInput').sort((a, b) => a - b);
        document.getElementById('binArrInput').value = arr.join(', ');
        this.renderSearchArray(arr);

        document.getElementById('btnRunBinSearch').onclick = async () => {
            const arr = this.parseArrayInput('binArrInput').sort((a, b) => a - b);
            document.getElementById('binArrInput').value = arr.join(', ');
            const key = parseInt(document.getElementById('binKeyInput').value, 10);
            this.clearLog();
            this.log(`Starting Binary Search on sorted array [ ${arr.join(', ')} ] for key: ${key}`, 'info');

            let low = 0;
            let high = arr.length - 1;
            let found = false;

            while (low <= high) {
                const mid = Math.floor((low + high) / 2);
                document.getElementById('binLowLbl').textContent = low;
                document.getElementById('binMidLbl').textContent = mid;
                document.getElementById('binHighLbl').textContent = high;

                const excluded = [];
                for (let k = 0; k < arr.length; k++) {
                    if (k < low || k > high) excluded.push(k);
                }

                this.renderSearchArray(arr, { low, mid, high, excluded });
                this.log(`Window [${low}..${high}]: mid=${mid}, a[mid]=${arr[mid]}, key=${key}`, 'info');
                await this.sleep();

                if (arr[mid] === key) {
                    found = true;
                    this.renderSearchArray(arr, { found: mid });
                    document.getElementById('binStatusLbl').textContent = `Found at position ${mid + 1}`;
                    this.log(`Element ${key} FOUND at position ${mid + 1} (Index ${mid})!`, 'success');
                    break;
                } else if (arr[mid] < key) {
                    this.log(`a[mid] (${arr[mid]}) < ${key} -> search right half (low = mid + 1)`, 'info');
                    low = mid + 1;
                } else {
                    this.log(`a[mid] (${arr[mid]}) > ${key} -> search left half (high = mid - 1)`, 'info');
                    high = mid - 1;
                }
            }

            if (!found) {
                document.getElementById('binStatusLbl').textContent = 'Not Found';
                this.log(`Key ${key} is not in the array.`, 'warn');
            }
        };
    }

    // -------------------------------------------------------------
    // PROGRAM 12 & 14: DFS & BFS GRAPH TRAVERSALS
    // -------------------------------------------------------------
    renderGraphUI(type) {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Start Vertex (0 to 3):</label>
                        <input type="number" id="graphStartVertex" min="0" max="3" value="0" class="app-input" style="width: 80px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunGraphTraversal">
                        <span class="btn-icon">⚡</span> Run ${type} Traversal
                    </button>
                    <button class="action-btn btn-secondary" id="btnToggleGraphPreset">
                        <span class="btn-icon">🔄</span> Load Graph Preset 2
                    </button>
                </div>

                <div class="visualizer-stage graph-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Algorithm: <strong>${type} Traversal</strong></div>
                        <div class="meta-pill">Visited Order: <strong id="graphVisitedOrder">—</strong></div>
                        <div class="meta-pill">Current: <strong id="graphCurrentVertex">—</strong></div>
                    </div>

                    <div class="graph-layout">
                        <div class="graph-svg-container" id="graphSvgContainer"></div>
                        <div class="graph-matrix-container">
                            <div class="matrix-title">Adjacency Matrix (4x4):</div>
                            <div class="matrix-grid" id="matrixGrid"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.graphData = {
            n: 4,
            adj: [
                [0, 1, 1, 0],
                [1, 0, 0, 1],
                [1, 0, 0, 1],
                [0, 1, 1, 0]
            ],
            nodes: [
                { id: 0, x: 80, y: 70 },
                { id: 1, x: 260, y: 70 },
                { id: 2, x: 80, y: 220 },
                { id: 3, x: 260, y: 220 }
            ]
        };

        this.renderGraphCanvas();
        this.renderMatrixGrid();

        document.getElementById('btnToggleGraphPreset').onclick = () => {
            if (this.graphData.adj[0][3] === 1) {
                this.graphData.adj = [
                    [0, 1, 1, 0],
                    [1, 0, 0, 1],
                    [1, 0, 0, 1],
                    [0, 1, 1, 0]
                ];
                this.log('Loaded Graph Preset 1 (Diamond graph).', 'info');
            } else {
                this.graphData.adj = [
                    [0, 1, 1, 1],
                    [1, 0, 1, 0],
                    [1, 1, 0, 1],
                    [1, 0, 1, 0]
                ];
                this.log('Loaded Graph Preset 2 (Dense graph).', 'info');
            }
            this.renderGraphCanvas();
            this.renderMatrixGrid();
        };

        document.getElementById('btnRunGraphTraversal').onclick = () => {
            const start = parseInt(document.getElementById('graphStartVertex').value, 10) || 0;
            if (type === 'DFS') this.runDFS(start);
            else this.runBFS(start);
        };
    }

    renderGraphCanvas(activeNode = -1, visitedNodes = []) {
        const container = document.getElementById('graphSvgContainer');
        if (!container) return;

        const g = this.graphData;
        let svg = `<svg viewBox="0 0 340 290" class="graph-svg">`;

        // Render edges
        for (let i = 0; i < g.n; i++) {
            for (let j = i + 1; j < g.n; j++) {
                if (g.adj[i][j]) {
                    const n1 = g.nodes[i];
                    const n2 = g.nodes[j];
                    const isEdgeActive = visitedNodes.includes(i) && visitedNodes.includes(j);
                    svg += `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" class="graph-edge ${isEdgeActive ? 'edge-active' : ''}" />`;
                }
            }
        }

        // Render nodes
        g.nodes.forEach(node => {
            let cls = 'graph-node';
            if (node.id === activeNode) cls += ' node-active';
            else if (visitedNodes.includes(node.id)) cls += ' node-visited';

            svg += `
                <g class="${cls}">
                    <circle cx="${node.x}" cy="${node.y}" r="22" />
                    <text x="${node.x}" y="${node.y + 5}" text-anchor="middle" class="node-text">V${node.id}</text>
                </g>
            `;
        });

        svg += `</svg>`;
        container.innerHTML = svg;
    }

    renderMatrixGrid() {
        const grid = document.getElementById('matrixGrid');
        if (!grid) return;
        const g = this.graphData;
        grid.style.gridTemplateColumns = `repeat(${g.n + 1}, 32px)`;
        grid.innerHTML = '';

        // Top header
        grid.appendChild(this.createCell('', 'm-head'));
        for (let j = 0; j < g.n; j++) grid.appendChild(this.createCell(`V${j}`, 'm-head'));

        // Rows
        for (let i = 0; i < g.n; i++) {
            grid.appendChild(this.createCell(`V${i}`, 'm-head'));
            for (let j = 0; j < g.n; j++) {
                grid.appendChild(this.createCell(g.adj[i][j], g.adj[i][j] ? 'm-one' : 'm-zero'));
            }
        }
    }

    createCell(text, className) {
        const div = document.createElement('div');
        div.className = `matrix-cell ${className}`;
        div.textContent = text;
        return div;
    }

    async runDFS(start) {
        this.clearLog();
        this.log(`Starting DFS Traversal from vertex V${start}...`, 'info');
        const g = this.graphData;
        const visited = new Array(g.n).fill(0);
        const order = [];

        const dfs = async (v) => {
            visited[v] = 1;
            order.push(`V${v}`);
            this.log(`Visited vertex V${v}`, 'success');
            document.getElementById('graphVisitedOrder').textContent = order.join(' ➔ ');
            document.getElementById('graphCurrentVertex').textContent = `V${v}`;
            this.renderGraphCanvas(v, order.map(s => parseInt(s.replace('V', ''), 10)));
            await this.sleep();

            for (let i = 0; i < g.n; i++) {
                if (g.adj[v][i] && !visited[i]) {
                    this.log(`Traversing edge V${v} -> V${i}`, 'info');
                    await dfs(i);
                }
            }
        };

        await dfs(start);
        this.renderGraphCanvas(-1, order.map(s => parseInt(s.replace('V', ''), 10)));
        this.log(`DFS Traversal complete! Order: ${order.join(' ')}`, 'success');
    }

    async runBFS(start) {
        this.clearLog();
        this.log(`Starting BFS Traversal from vertex V${start}...`, 'info');
        const g = this.graphData;
        const visited = new Array(g.n).fill(0);
        const queue = [];
        const order = [];

        visited[start] = 1;
        queue.push(start);
        this.log(`Enqueued start vertex V${start}`, 'info');

        while (queue.length > 0) {
            const v = queue.shift();
            order.push(`V${v}`);
            document.getElementById('graphVisitedOrder').textContent = order.join(' ➔ ');
            document.getElementById('graphCurrentVertex').textContent = `V${v}`;
            this.log(`Dequeued vertex V${v}`, 'success');
            this.renderGraphCanvas(v, order.map(s => parseInt(s.replace('V', ''), 10)));
            await this.sleep();

            for (let i = 0; i < g.n; i++) {
                if (g.adj[v][i] && !visited[i]) {
                    visited[i] = 1;
                    queue.push(i);
                    this.log(`Found unvisited neighbor V${i}; enqueued.`, 'info');
                }
            }
        }

        this.renderGraphCanvas(-1, order.map(s => parseInt(s.replace('V', ''), 10)));
        this.log(`BFS Traversal complete! Order: ${order.join(' ')}`, 'success');
    }

    // -------------------------------------------------------------
    // PROGRAM 16: PRIM'S MINIMUM SPANNING TREE (MST)
    // -------------------------------------------------------------
    renderPrimsUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <button class="action-btn btn-primary" id="btnRunPrims">
                        <span class="btn-icon">⚡</span> Find Minimum Spanning Tree (MST)
                    </button>
                </div>

                <div class="visualizer-stage prims-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Vertices: <strong>4</strong></div>
                        <div class="meta-pill">MST Edges: <strong id="primsEdgesCount">0 / 3</strong></div>
                        <div class="meta-pill">Total MST Cost: <strong id="primsTotalCost">0</strong></div>
                    </div>

                    <div class="prims-layout">
                        <div class="table-container" style="flex: 1;">
                            <div class="matrix-title">Cost Adjacency Matrix:</div>
                            <table class="algo-table">
                                <thead>
                                    <tr><th></th><th>V0</th><th>V1</th><th>V2</th><th>V3</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>V0</strong></td><td>0</td><td>2</td><td>3</td><td>0</td></tr>
                                    <tr><td><strong>V1</strong></td><td>2</td><td>0</td><td>1</td><td>4</td></tr>
                                    <tr><td><strong>V2</strong></td><td>3</td><td>1</td><td>0</td><td>5</td></tr>
                                    <tr><td><strong>V3</strong></td><td>0</td><td>4</td><td>5</td><td>0</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="mst-edges-list" style="flex: 1;">
                            <div class="matrix-title">Edges Selected in MST:</div>
                            <ul class="mst-list" id="mstEdgesList">
                                <li>Click "Find Minimum Spanning Tree" to calculate.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnRunPrims').onclick = () => this.runPrims();
    }

    async runPrims() {
        this.clearLog();
        const n = 4;
        const INF = 9999;
        const cost = [
            [INF, 2, 3, INF],
            [2, INF, 1, 4],
            [3, 1, INF, 5],
            [INF, 4, 5, INF]
        ];

        const selected = [1, 0, 0, 0];
        let edges = 0;
        let total = 0;

        const listEl = document.getElementById('mstEdgesList');
        listEl.innerHTML = '';
        this.log("Starting Prim's Algorithm starting from Vertex 0...", 'info');

        while (edges < n - 1) {
            let min = INF;
            let x = 0, y = 0;

            for (let i = 0; i < n; i++) {
                if (selected[i]) {
                    for (let j = 0; j < n; j++) {
                        if (!selected[j] && cost[i][j] < min) {
                            min = cost[i][j];
                            x = i;
                            y = j;
                        }
                    }
                }
            }

            total += min;
            selected[y] = 1;
            edges++;

            this.log(`Selected Edge: V${x} - V${y} with Weight ${min}`, 'success');
            const li = document.createElement('li');
            li.className = 'mst-item';
            li.innerHTML = `<span>Edge: <strong>V${x} &mdash; V${y}</strong></span> <span class="mst-weight">Cost: ${min}</span>`;
            listEl.appendChild(li);

            document.getElementById('primsEdgesCount').textContent = `${edges} / ${n - 1}`;
            document.getElementById('primsTotalCost').textContent = total;
            await this.sleep();
        }

        this.log(`Prim's Algorithm complete! Minimum Spanning Tree Cost = ${total}`, 'success');
    }

    // -------------------------------------------------------------
    // PROGRAM 17: SINGLY LINKED LIST (Insert, Delete, Show)
    // -------------------------------------------------------------
    renderSLLUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Data to Insert:</label>
                        <input type="number" id="sllInputVal" value="88" class="app-input" />
                    </div>
                    <button class="action-btn btn-primary" id="btnSLLInsert">
                        <span class="btn-icon">➕</span> Insert at End
                    </button>
                    <button class="action-btn btn-danger" id="btnSLLDelete">
                        <span class="btn-icon">➖</span> Delete from Beginning
                    </button>
                    <button class="action-btn btn-secondary" id="btnSLLShow">
                        <span class="btn-icon">👁️</span> Show List
                    </button>
                    <button class="action-btn btn-outline" id="btnSLLClear">
                        <span class="btn-icon">🧹</span> Clear List
                    </button>
                </div>

                <div class="visualizer-stage sll-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Structure: <strong>Singly Linked List</strong></div>
                        <div class="meta-pill">Node Count: <strong id="sllCountLbl">${this.states.sll.length}</strong></div>
                        <div class="meta-pill">HEAD: <strong id="sllHeadLbl">${this.states.sll.length > 0 ? this.states.sll[0] : 'NULL'}</strong></div>
                    </div>

                    <div class="linked-list-chain" id="sllChain"></div>
                </div>
            </div>
        `;

        this.updateSLLDisplay();

        document.getElementById('btnSLLInsert').onclick = () => {
            const val = parseInt(document.getElementById('sllInputVal').value, 10);
            if (isNaN(val)) return this.log('Please enter valid data.', 'warn');
            this.states.sll.push(val);
            this.log(`Allocated new node with data: ${val} and linked to end of list.`, 'success');
            document.getElementById('sllInputVal').value = Math.floor(Math.random() * 90 + 10);
            this.updateSLLDisplay();
        };

        document.getElementById('btnSLLDelete').onclick = () => {
            if (this.states.sll.length === 0) {
                this.log('List is empty! (head == NULL)', 'error');
                return;
            }
            const del = this.states.sll.shift();
            this.log(`Deleted head node with data: ${del}`, 'success');
            this.updateSLLDisplay();
        };

        document.getElementById('btnSLLShow').onclick = () => {
            if (this.states.sll.length === 0) {
                this.log('List is empty.', 'info');
            } else {
                this.log(`List: ${this.states.sll.join(' -> ')} -> NULL`, 'info');
            }
        };

        document.getElementById('btnSLLClear').onclick = () => {
            this.states.sll = [];
            this.log('List cleared. head = NULL', 'info');
            this.updateSLLDisplay();
        };
    }

    updateSLLDisplay() {
        const chain = document.getElementById('sllChain');
        const countLbl = document.getElementById('sllCountLbl');
        const headLbl = document.getElementById('sllHeadLbl');
        if (!chain) return;

        const n = this.states.sll.length;
        if (countLbl) countLbl.textContent = n;
        if (headLbl) headLbl.textContent = n > 0 ? this.states.sll[0] : 'NULL';

        if (n === 0) {
            chain.innerHTML = `<div class="empty-list-card">head ➔ <span class="null-pill">NULL</span> (List is Empty)</div>`;
            return;
        }

        chain.innerHTML = `<div class="head-marker">head ➔</div>`;
        this.states.sll.forEach((val, idx) => {
            const node = document.createElement('div');
            node.className = 'll-node';
            node.innerHTML = `
                <div class="node-data">${val}</div>
                <div class="node-next">•</div>
            `;
            chain.appendChild(node);

            const arrow = document.createElement('div');
            arrow.className = 'll-arrow';
            arrow.textContent = '➔';
            chain.appendChild(arrow);
        });

        const nullPill = document.createElement('div');
        nullPill.className = 'null-pill';
        nullPill.textContent = 'NULL';
        chain.appendChild(nullPill);
    }

    // -------------------------------------------------------------
    // PROGRAM 18: DOUBLY LINKED LIST
    // -------------------------------------------------------------
    renderDLLUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Data to Insert:</label>
                        <input type="number" id="dllInputVal" value="505" class="app-input" />
                    </div>
                    <button class="action-btn btn-primary" id="btnDLLInsert">
                        <span class="btn-icon">➕</span> Insert at End
                    </button>
                    <button class="action-btn btn-danger" id="btnDLLDelete">
                        <span class="btn-icon">➖</span> Delete from Beginning
                    </button>
                    <button class="action-btn btn-secondary" id="btnDLLShow">
                        <span class="btn-icon">👁️</span> Show List
                    </button>
                    <button class="action-btn btn-outline" id="btnDLLClear">
                        <span class="btn-icon">🧹</span> Clear List
                    </button>
                </div>

                <div class="visualizer-stage sll-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Structure: <strong>Doubly Linked List</strong></div>
                        <div class="meta-pill">Node Count: <strong id="dllCountLbl">${this.states.dll.length}</strong></div>
                        <div class="meta-pill">HEAD: <strong id="dllHeadLbl">${this.states.dll.length > 0 ? this.states.dll[0] : 'NULL'}</strong></div>
                    </div>

                    <div class="linked-list-chain" id="dllChain"></div>
                </div>
            </div>
        `;

        this.updateDLLDisplay();

        document.getElementById('btnDLLInsert').onclick = () => {
            const val = parseInt(document.getElementById('dllInputVal').value, 10);
            if (isNaN(val)) return this.log('Enter valid integer.', 'warn');
            this.states.dll.push(val);
            this.log(`Inserted ${val} into Doubly Linked List with prev & next pointers.`, 'success');
            document.getElementById('dllInputVal').value = Math.floor(Math.random() * 900 + 100);
            this.updateDLLDisplay();
        };

        document.getElementById('btnDLLDelete').onclick = () => {
            if (this.states.dll.length === 0) {
                this.log('List is empty! (head == NULL)', 'error');
                return;
            }
            const del = this.states.dll.shift();
            this.log(`Deleted head node: ${del}`, 'success');
            this.updateDLLDisplay();
        };

        document.getElementById('btnDLLShow').onclick = () => {
            if (this.states.dll.length === 0) {
                this.log('List is empty.', 'info');
            } else {
                this.log(`List: NULL <-> ${this.states.dll.join(' <-> ')} <-> NULL`, 'info');
            }
        };

        document.getElementById('btnDLLClear').onclick = () => {
            this.states.dll = [];
            this.log('Doubly linked list cleared.', 'info');
            this.updateDLLDisplay();
        };
    }

    updateDLLDisplay() {
        const chain = document.getElementById('dllChain');
        const countLbl = document.getElementById('dllCountLbl');
        const headLbl = document.getElementById('dllHeadLbl');
        if (!chain) return;

        const n = this.states.dll.length;
        if (countLbl) countLbl.textContent = n;
        if (headLbl) headLbl.textContent = n > 0 ? this.states.dll[0] : 'NULL';

        if (n === 0) {
            chain.innerHTML = `<div class="empty-list-card">head ➔ <span class="null-pill">NULL</span> (List is Empty)</div>`;
            return;
        }

        chain.innerHTML = `<span class="null-pill">NULL</span> <span class="ll-arrow">⮂</span>`;
        this.states.dll.forEach((val, idx) => {
            const node = document.createElement('div');
            node.className = 'dll-node';
            node.innerHTML = `
                <div class="node-prev">prev</div>
                <div class="node-data">${val}</div>
                <div class="node-next">next</div>
            `;
            chain.appendChild(node);

            const arrow = document.createElement('div');
            arrow.className = 'll-arrow';
            arrow.textContent = '⇆';
            chain.appendChild(arrow);
        });

        const nullPill = document.createElement('div');
        nullPill.className = 'null-pill';
        nullPill.textContent = 'NULL';
        chain.appendChild(nullPill);
    }

    // -------------------------------------------------------------
    // PROGRAM 19 & 20: BINARY SEARCH TREE & TRAVERSALS
    // -------------------------------------------------------------
    renderBSTOpsUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Value:</label>
                        <input type="number" id="bstValInput" value="65" class="app-input" style="width: 80px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnBSTInsert">
                        <span class="btn-icon">➕</span> Insert Value
                    </button>
                    <button class="action-btn btn-danger" id="btnBSTDelete">
                        <span class="btn-icon">➖</span> Delete Value
                    </button>
                    <button class="action-btn btn-secondary" id="btnBSTInorder">
                        <span class="btn-icon">👁️</span> Show (Inorder)
                    </button>
                    <button class="action-btn btn-outline" id="btnBSTReset">
                        <span class="btn-icon">🔄</span> Reset Tree
                    </button>
                </div>

                <div class="visualizer-stage bst-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Node Count: <strong id="bstCountLbl">${this.states.bst.length}</strong></div>
                        <div class="meta-pill">Inorder (Sorted): <strong id="bstInorderLbl">—</strong></div>
                    </div>

                    <div class="tree-container" id="treeSvgContainer"></div>
                </div>
            </div>
        `;

        this.renderBSTTree();

        document.getElementById('btnBSTInsert').onclick = () => {
            const val = parseInt(document.getElementById('bstValInput').value, 10);
            if (isNaN(val)) return this.log('Enter valid integer.', 'warn');
            if (this.states.bst.includes(val)) {
                this.log(`Value ${val} already exists in BST!`, 'warn');
                return;
            }
            this.states.bst.push(val);
            this.log(`Inserted ${val} into BST.`, 'success');
            document.getElementById('bstValInput').value = Math.floor(Math.random() * 90 + 10);
            this.renderBSTTree();
        };

        document.getElementById('btnBSTDelete').onclick = () => {
            const val = parseInt(document.getElementById('bstValInput').value, 10);
            const idx = this.states.bst.indexOf(val);
            if (idx === -1) {
                this.log(`Value ${val} not found in BST to delete.`, 'warn');
                return;
            }
            this.states.bst.splice(idx, 1);
            this.log(`Deleted ${val} from BST.`, 'success');
            this.renderBSTTree();
        };

        document.getElementById('btnBSTInorder').onclick = () => {
            const sorted = [...this.states.bst].sort((a, b) => a - b);
            this.log(`BST Inorder Traversal (Sorted): [ ${sorted.join(', ')} ]`, 'info');
            document.getElementById('bstInorderLbl').textContent = sorted.join(' -> ');
        };

        document.getElementById('btnBSTReset').onclick = () => {
            this.states.bst = [50, 30, 70, 20, 40, 60, 80];
            this.log('Reset BST to default nodes [50, 30, 70, 20, 40, 60, 80].', 'info');
            this.renderBSTTree();
        };
    }

    renderBSTTraversalUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <button class="action-btn btn-primary" id="btnRunInorder">
                        <span class="btn-icon">⚡</span> Run Inorder (L-N-R)
                    </button>
                    <button class="action-btn btn-secondary" id="btnRunPreorder">
                        <span class="btn-icon">⚡</span> Run Preorder (N-L-R)
                    </button>
                    <button class="action-btn btn-secondary" id="btnRunPostorder">
                        <span class="btn-icon">⚡</span> Run Postorder (L-R-N)
                    </button>
                </div>

                <div class="visualizer-stage bst-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Selected Traversal: <strong id="travTypeLbl">None</strong></div>
                        <div class="meta-pill">Order: <strong id="travOrderLbl">—</strong></div>
                    </div>

                    <div class="tree-container" id="treeSvgContainer"></div>
                </div>
            </div>
        `;

        this.renderBSTTree();

        document.getElementById('btnRunInorder').onclick = () => this.animateTraversal('Inorder');
        document.getElementById('btnRunPreorder').onclick = () => this.animateTraversal('Preorder');
        document.getElementById('btnRunPostorder').onclick = () => this.animateTraversal('Postorder');
    }

    renderBSTTree(highlightNode = null) {
        const container = document.getElementById('treeSvgContainer');
        if (!container) return;

        // Build tree model
        class Node {
            constructor(val) {
                this.val = val;
                this.left = null;
                this.right = null;
            }
        }

        const insert = (root, x) => {
            if (!root) return new Node(x);
            if (x < root.val) root.left = insert(root.left, x);
            else if (x > root.val) root.right = insert(root.right, x);
            return root;
        };

        let root = null;
        this.states.bst.forEach(x => {
            root = insert(root, x);
        });

        // Compute coordinates
        const nodes = [];
        const edges = [];

        const layout = (node, depth, leftBound, rightBound) => {
            if (!node) return null;
            const x = (leftBound + rightBound) / 2;
            const y = 40 + depth * 60;
            const item = { val: node.val, x, y };
            nodes.push(item);

            if (node.left) {
                const childPos = layout(node.left, depth + 1, leftBound, x);
                if (childPos) edges.push({ x1: x, y1: y, x2: childPos.x, y2: childPos.y });
            }
            if (node.right) {
                const childPos = layout(node.right, depth + 1, x, rightBound);
                if (childPos) edges.push({ x1: x, y1: y, x2: childPos.x, y2: childPos.y });
            }
            return item;
        };

        layout(root, 0, 20, 480);

        let svg = `<svg viewBox="0 0 500 280" class="tree-svg">`;
        edges.forEach(e => {
            svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" class="tree-edge" />`;
        });
        nodes.forEach(n => {
            const isHl = highlightNode === n.val;
            svg += `
                <g class="tree-node ${isHl ? 'node-active' : ''}">
                    <circle cx="${n.x}" cy="${n.y}" r="18" />
                    <text x="${n.x}" y="${n.y + 5}" text-anchor="middle" class="node-text">${n.val}</text>
                </g>
            `;
        });
        svg += `</svg>`;
        container.innerHTML = svg;
    }

    async animateTraversal(type) {
        this.clearLog();
        document.getElementById('travTypeLbl').textContent = type;
        this.log(`Running ${type} Traversal on Binary Search Tree...`, 'info');

        class Node {
            constructor(val) {
                this.val = val;
                this.left = null;
                this.right = null;
            }
        }
        const insert = (root, x) => {
            if (!root) return new Node(x);
            if (x < root.val) root.left = insert(root.left, x);
            else if (x > root.val) root.right = insert(root.right, x);
            return root;
        };
        let root = null;
        this.states.bst.forEach(x => { root = insert(root, x); });

        const order = [];
        if (type === 'Inorder') {
            const inorder = (r) => {
                if (r) {
                    inorder(r.left);
                    order.push(r.val);
                    inorder(r.right);
                }
            };
            inorder(root);
        } else if (type === 'Preorder') {
            const preorder = (r) => {
                if (r) {
                    order.push(r.val);
                    preorder(r.left);
                    preorder(r.right);
                }
            };
            preorder(root);
        } else if (type === 'Postorder') {
            const postorder = (r) => {
                if (r) {
                    postorder(r.left);
                    postorder(r.right);
                    order.push(r.val);
                }
            };
            postorder(root);
        }

        const visitedSoFar = [];
        for (const val of order) {
            visitedSoFar.push(val);
            this.renderBSTTree(val);
            document.getElementById('travOrderLbl').textContent = visitedSoFar.join(' ➔ ');
            this.log(`Visited: ${val}`, 'success');
            await this.sleep();
        }

        this.renderBSTTree(null);
        this.log(`${type} Traversal complete! Final Order: [ ${order.join(', ')} ]`, 'success');
    }

    // -------------------------------------------------------------
    // PROGRAM 21: ARRAY (Insert, Delete, Display)
    // -------------------------------------------------------------
    renderArrayOpsUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group">
                        <label>Item:</label>
                        <input type="number" id="arrItemVal" value="99" class="app-input" style="width: 70px;" />
                    </div>
                    <div class="input-group">
                        <label>Position (1 to n+1):</label>
                        <input type="number" id="arrPosVal" value="3" class="app-input" style="width: 70px;" />
                    </div>
                    <button class="action-btn btn-primary" id="btnArrInsert">
                        <span class="btn-icon">➕</span> Insert at Position
                    </button>
                    <button class="action-btn btn-danger" id="btnArrDelete">
                        <span class="btn-icon">➖</span> Delete at Position
                    </button>
                    <button class="action-btn btn-secondary" id="btnArrDisplay">
                        <span class="btn-icon">👁️</span> Display Array
                    </button>
                </div>

                <div class="visualizer-stage array-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Capacity: <strong>MAX 50</strong></div>
                        <div class="meta-pill">Size n: <strong id="arrSizeLbl">${this.states.arrayOps.length}</strong></div>
                    </div>

                    <div class="array-slots-grid" id="arrayOpsGrid"></div>
                </div>
            </div>
        `;

        this.updateArrayOpsDisplay();

        document.getElementById('btnArrInsert').onclick = () => {
            const item = parseInt(document.getElementById('arrItemVal').value, 10);
            const pos = parseInt(document.getElementById('arrPosVal').value, 10);
            const arr = this.states.arrayOps;
            if (isNaN(item) || isNaN(pos)) return this.log('Invalid input values.', 'warn');
            if (pos < 1 || pos > arr.length + 1) {
                this.log(`Invalid position! Must be between 1 and ${arr.length + 1}`, 'error');
                return;
            }
            arr.splice(pos - 1, 0, item);
            this.log(`Shifted elements right and inserted ${item} at position ${pos} (index ${pos - 1}).`, 'success');
            document.getElementById('arrItemVal').value = Math.floor(Math.random() * 90 + 10);
            this.updateArrayOpsDisplay();
        };

        document.getElementById('btnArrDelete').onclick = () => {
            const pos = parseInt(document.getElementById('arrPosVal').value, 10);
            const arr = this.states.arrayOps;
            if (pos < 1 || pos > arr.length) {
                this.log(`Invalid position! Must be between 1 and ${arr.length}`, 'error');
                return;
            }
            const deleted = arr.splice(pos - 1, 1)[0];
            this.log(`Deleted item ${deleted} from position ${pos} and shifted elements left.`, 'success');
            this.updateArrayOpsDisplay();
        };

        document.getElementById('btnArrDisplay').onclick = () => {
            this.log(`Array: [ ${this.states.arrayOps.join(', ')} ] (n = ${this.states.arrayOps.length})`, 'info');
        };
    }

    updateArrayOpsDisplay() {
        const grid = document.getElementById('arrayOpsGrid');
        const sizeLbl = document.getElementById('arrSizeLbl');
        if (!grid) return;

        const arr = this.states.arrayOps;
        if (sizeLbl) sizeLbl.textContent = arr.length;

        grid.innerHTML = '';
        arr.forEach((val, idx) => {
            const slot = document.createElement('div');
            slot.className = 'array-slot';
            slot.innerHTML = `
                <div class="slot-idx">Index ${idx}</div>
                <div class="slot-val">${val}</div>
                <div class="slot-pos">Pos ${idx + 1}</div>
            `;
            grid.appendChild(slot);
        });
    }

    // -------------------------------------------------------------
    // PROGRAM 22: RADIX SORT
    // -------------------------------------------------------------
    renderRadixSortUI() {
        this.canvas.innerHTML = `
            <div class="interactive-panel">
                <div class="controls-ribbon">
                    <div class="input-group" style="flex: 2;">
                        <label>Non-negative Elements:</label>
                        <input type="text" id="radixInput" value="170, 45, 75, 90, 802, 24, 2, 66" class="app-input" />
                    </div>
                    <button class="action-btn btn-primary" id="btnRunRadix">
                        <span class="btn-icon">⚡</span> Run Radix Sort
                    </button>
                </div>

                <div class="visualizer-stage radix-stage">
                    <div class="stack-meta">
                        <div class="meta-pill">Current Exp (Digit): <strong id="radixExpLbl">—</strong></div>
                        <div class="meta-pill">Status: <strong id="radixStatusLbl">Ready</strong></div>
                    </div>

                    <div class="radix-buckets-grid" id="radixBucketsGrid">
                        <!-- Buckets 0 to 9 -->
                    </div>

                    <div class="array-slots-grid" id="radixCurrentArray" style="margin-top: 1.5rem;"></div>
                </div>
            </div>
        `;

        const arr = this.parseArrayInput('radixInput');
        this.renderRadixArray(arr);
        this.renderRadixBuckets({});

        document.getElementById('btnRunRadix').onclick = () => {
            const arr = this.parseArrayInput('radixInput');
            this.executeRadixSort(arr);
        };
    }

    renderRadixBuckets(buckets) {
        const grid = document.getElementById('radixBucketsGrid');
        if (!grid) return;
        grid.innerHTML = '';

        for (let d = 0; d < 10; d++) {
            const bucket = document.createElement('div');
            bucket.className = 'radix-bucket';
            const items = buckets[d] || [];
            bucket.innerHTML = `
                <div class="bucket-header">Digit ${d}</div>
                <div class="bucket-items">${items.map(x => `<span class="b-chip">${x}</span>`).join('') || '<span class="b-empty">—</span>'}</div>
            `;
            grid.appendChild(bucket);
        }
    }

    renderRadixArray(arr) {
        const grid = document.getElementById('radixCurrentArray');
        if (!grid) return;
        grid.innerHTML = '';
        arr.forEach((val, idx) => {
            const slot = document.createElement('div');
            slot.className = 'array-slot';
            slot.innerHTML = `
                <div class="slot-idx">[${idx}]</div>
                <div class="slot-val">${val}</div>
            `;
            grid.appendChild(slot);
        });
    }

    async executeRadixSort(arr) {
        this.clearLog();
        this.log(`Starting Radix Sort on non-negative array: [ ${arr.join(', ')} ]`, 'info');
        const max = Math.max(...arr);
        let exp = 1;

        while (Math.floor(max / exp) > 0) {
            const digitPlace = exp === 1 ? 'Units' : exp === 10 ? 'Tens' : exp === 100 ? 'Hundreds' : `${exp}s`;
            document.getElementById('radixExpLbl').textContent = `${exp} (${digitPlace} place)`;
            this.log(`=== Pass for ${digitPlace} digit (exp = ${exp}) ===`, 'info');

            // Collect into buckets
            const buckets = Array.from({ length: 10 }, () => []);
            for (let i = 0; i < arr.length; i++) {
                const digit = Math.floor(arr[i] / exp) % 10;
                buckets[digit].push(arr[i]);
            }
            this.renderRadixBuckets(buckets);
            await this.sleep(this.animSpeed * 1.5);

            // Reconstruct array
            let idx = 0;
            for (let d = 0; d < 10; d++) {
                for (const val of buckets[d]) {
                    arr[idx++] = val;
                }
            }
            this.renderRadixArray(arr);
            this.log(`Array after ${digitPlace} pass: [ ${arr.join(', ')} ]`, 'success');
            await this.sleep(this.animSpeed);

            exp *= 10;
        }

        document.getElementById('radixStatusLbl').textContent = 'Sorted 🎉';
        this.log(`Radix Sort complete! Fully sorted array: [ ${arr.join(', ')} ]`, 'success');
    }

    // Helper for terminal runner to invoke active engine
    runCurrentWithInput(val, callback) {
        const pid = this.currentProgramId;
        if (pid === 2 || pid === 4 || pid === 6 || pid === 8 || pid === 10) {
            const arr = val.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
            if (arr.length > 0) {
                this.executeSorting(arr, pid === 2 ? 'quicksort' : pid === 4 ? 'mergesort' : pid === 6 ? 'bubblesort' : pid === 8 ? 'insertionsort' : 'selectionsort');
                callback(`Sorted array initiated: [ ${arr.join(', ')} ]`, 'success');
            } else {
                callback('Invalid array input format.', 'error');
            }
        } else if (pid === 5) {
            this.executeInfixToPostfix(val);
            callback('Infix conversion executed.', 'success');
        } else if (pid === 7) {
            this.executePrefixEval(val);
            callback('Prefix evaluation executed.', 'success');
        } else if (pid === 9) {
            const n = parseInt(val, 10);
            if (!isNaN(n) && n >= 1 && n <= 6) {
                this.initHanoi(n);
                callback(`Tower of Hanoi initialized with ${n} disks.`, 'success');
            } else {
                callback('Enter disk count between 1 and 6.', 'error');
            }
        } else {
            callback(`Input received for program ${pid}: ${val}`, 'info');
        }
    }
}

window.DSEngine = DSEngine;
