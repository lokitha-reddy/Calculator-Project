/**
 * Scientific Calculator
 * A comprehensive calculator with advanced mathematical functions
 */
class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.shiftIndicator = document.getElementById('shift-indicator');
        this.offOverlay = document.getElementById('offOverlay');
        this.calculator = document.getElementById('calculator');
        
        // Calculator state
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isOn = false;
        this.isShiftMode = false;
        this.memory = 0;
        this.lastAnswer = 0;
        
        // Initialize calculator
        this.turnOff();
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Turn on calculator when clicking overlay
        this.offOverlay.addEventListener('click', () => this.turnOn());
        
        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Prevent context menu on calculator
        this.calculator.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    turnOn() {
        this.isOn = true;
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isShiftMode = false;
        
        this.offOverlay.classList.remove('active');
        this.calculator.classList.remove('shift-mode');
        this.shiftIndicator.classList.add('hidden');
        this.updateDisplay();
        
        // Add turn-on animation
        this.calculator.style.animation = 'none';
        setTimeout(() => {
            this.calculator.style.animation = 'fadeIn 0.3s ease-out';
        }, 10);
    }
    
    turnOff() {
        this.isOn = false;
        this.currentValue = 'Calculator Off';
        this.offOverlay.classList.add('active');
        this.updateDisplay();
    }
    
    updateDisplay() {
        if (!this.display) return;
        
        let displayText = this.currentValue || '0';
        
        // Limit display length for better readability
        if (displayText.length > 12 && !displayText.includes('e')) {
            displayText = parseFloat(displayText).toExponential(6);
        }
        
        this.display.textContent = displayText;
        
        // Add visual feedback for display updates
        this.display.style.transform = 'scale(1.02)';
        setTimeout(() => {
            this.display.style.transform = 'scale(1)';
        }, 100);
    }
    
    inputNumber(num) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.waitingForOperand) {
            this.currentValue = num;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? num : this.currentValue + num;
        }
        
        this.updateDisplay();
    }
    
    inputCharacter(char) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.waitingForOperand) {
            this.currentValue = char;
            this.waitingForOperand = false;
        } else {
            this.currentValue = this.currentValue === '0' ? char : this.currentValue + char;
        }
        
        this.updateDisplay();
    }
    
    inputDecimal() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.waitingForOperand) {
            this.currentValue = '0.';
            this.waitingForOperand = false;
        } else if (this.currentValue.indexOf('.') === -1) {
            this.currentValue += '.';
        }
        
        this.updateDisplay();
    }
    
    performOperation(nextOperation) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = this.parseInput(this.currentValue);
        
        if (this.previousValue === null) {
            this.previousValue = inputValue;
        } else if (this.operation) {
            const currentValue = this.previousValue || 0;
            const result = this.evaluateExpression(currentValue, inputValue, this.operation);
            
            this.currentValue = this.formatNumber(result);
            this.previousValue = result;
            this.lastAnswer = result;
        }
        
        this.waitingForOperand = true;
        this.operation = nextOperation;
        this.updateDisplay();
    }
    
    calculate() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        if (this.previousValue !== null && this.operation) {
            const inputValue = this.parseInput(this.currentValue);
            const result = this.evaluateExpression(this.previousValue, inputValue, this.operation);
            
            this.currentValue = this.formatNumber(result);
            this.previousValue = null;
            this.operation = null;
            this.waitingForOperand = true;
            this.lastAnswer = result;
            this.updateDisplay();
            
            // Visual feedback for calculation
            this.addCalculationFeedback();
        }
    }
    
    evaluateExpression(firstNumber, secondNumber, operation) {
        try {
            switch (operation) {
                case '+':
                    return firstNumber + secondNumber;
                case '-':
                    return firstNumber - secondNumber;
                case '*':
                    return firstNumber * secondNumber;
                case '/':
                    if (secondNumber === 0) {
                        throw new Error('Division by zero');
                    }
                    return firstNumber / secondNumber;
                case '%':
                    if (secondNumber === 0) {
                        throw new Error('Division by zero');
                    }
                    return firstNumber % secondNumber;
                default:
                    return secondNumber;
            }
        } catch (error) {
            this.showError(error.message);
            return 0;
        }
    }
    
    performSquare() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = this.parseInput(this.currentValue);
        const result = inputValue * inputValue;
        
        this.currentValue = this.formatNumber(result);
        this.waitingForOperand = true;
        this.lastAnswer = result;
        this.updateDisplay();
    }
    
    performFunction(func) {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        const inputValue = this.parseInput(this.currentValue);
        let result = inputValue;
        
        try {
            switch (func) {
                case 'sin':
                    result = this.isShiftMode 
                        ? this.toDegrees(Math.asin(inputValue))
                        : Math.sin(this.toRadians(inputValue));
                    break;
                case 'cos':
                    result = this.isShiftMode 
                        ? this.toDegrees(Math.acos(inputValue))
                        : Math.cos(this.toRadians(inputValue));
                    break;
                case 'tan':
                    result = this.isShiftMode 
                        ? this.toDegrees(Math.atan(inputValue))
                        : Math.tan(this.toRadians(inputValue));
                    break;
                case 'log':
                    result = this.isShiftMode ? Math.pow(10, inputValue) : Math.log10(inputValue);
                    break;
                case 'ln':
                    result = this.isShiftMode ? Math.exp(inputValue) : Math.log(inputValue);
                    break;
                case 'sqrt':
                    result = this.isShiftMode ? inputValue * inputValue : Math.sqrt(inputValue);
                    break;
                case 'x-1':
                    result = this.isShiftMode ? this.factorial(inputValue) : 1 / inputValue;
                    break;
                case 'x3':
                    result = this.isShiftMode ? Math.pow(inputValue, 1/3) : Math.pow(inputValue, 3);
                    break;
                case 'xy':
                    result = Math.pow(inputValue, 2);
                    break;
                case 'x10':
                    result = inputValue * Math.pow(10, 1);
                    break;
                case '(-)':
                    result = -inputValue;
                    break;
                case 'ans':
                    result = this.lastAnswer;
                    break;
                case 'sto':
                    this.memory = inputValue;
                    this.showMessage('Memory stored');
                    return;
                case 'rcl':
                    result = this.memory;
                    break;
                default:
                    return;
            }
            
            if (!isFinite(result)) {
                throw new Error('Math Error');
            }
            
            this.currentValue = this.formatNumber(result);
            this.waitingForOperand = true;
            this.lastAnswer = result;
            this.updateDisplay();
            
        } catch (error) {
            this.showError('Math Error');
        }
    }
    
    factorial(n) {
        if (n < 0 || !Number.isInteger(n)) return NaN;
        if (n === 0 || n === 1) return 1;
        if (n > 170) return Infinity;
        
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }
    
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    
    toDegrees(radians) {
        return radians * (180 / Math.PI);
    }
    
    parseInput(value) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    
    formatNumber(value) {
        if (!isFinite(value)) {
            return 'Error';
        }
        
        // Handle very large numbers
        if (Math.abs(value) > 1e10) {
            return value.toExponential(6);
        }
        
        // Handle very small numbers
        if (Math.abs(value) < 1e-10 && value !== 0) {
            return value.toExponential(6);
        }
        
        // Remove trailing zeros for decimals
        if (value % 1 !== 0) {
            const formatted = parseFloat(value.toFixed(10)).toString();
            return formatted;
        }
        
        return value.toString();
    }
    
    toggleShift() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.isShiftMode = !this.isShiftMode;
        
        const shiftBtn = document.querySelector('.shift-btn');
        
        if (this.isShiftMode) {
            this.calculator.classList.add('shift-mode');
            this.shiftIndicator.classList.remove('hidden');
            shiftBtn.classList.add('active');
        } else {
            this.calculator.classList.remove('shift-mode');
            this.shiftIndicator.classList.add('hidden');
            shiftBtn.classList.remove('active');
        }
    }
    
    clearEntry() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.currentValue = '0';
        this.updateDisplay();
    }
    
    allClear() {
        if (!this.isOn) {
            this.turnOn();
            return;
        }
        
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.waitingForOperand = false;
        this.isShiftMode = false;
        
        this.calculator.classList.remove('shift-mode');
        this.shiftIndicator.classList.add('hidden');
        
        const shiftBtn = document.querySelector('.shift-btn');
        if (shiftBtn) shiftBtn.classList.remove('active');
        
        this.updateDisplay();
        this.addClearFeedback();
    }
    
    showError(message) {
        this.currentValue = message;
        this.updateDisplay();
        setTimeout(() => {
            this.currentValue = '0';
            this.updateDisplay();
        }, 2000);
    }
    
    showMessage(message) {
        const originalValue = this.currentValue;
        this.currentValue = message;
        this.updateDisplay();
        setTimeout(() => {
            this.currentValue = originalValue;
            this.updateDisplay();
        }, 1000);
    }
    
    addCalculationFeedback() {
        this.display.style.background = 'rgba(0, 255, 136, 0.1)';
        setTimeout(() => {
            this.display.style.background = 'rgba(0, 0, 0, 0.2)';
        }, 200);
    }
    
    addClearFeedback() {
        this.display.style.background = 'rgba(239, 68, 68, 0.1)';
        setTimeout(() => {
            this.display.style.background = 'rgba(0, 0, 0, 0.2)';
        }, 200);
    }
    
    handleKeyboard(e) {
        if (!this.isOn) return;
        
        const key = e.key;
        
        // Prevent default for calculator keys
        if ('0123456789+-*/.=()'.includes(key) || key === 'Enter' || key === 'Escape' || key === 'Backspace') {
            e.preventDefault();
        }
        
        if (key >= '0' && key <= '9') {
            this.inputNumber(key);
        } else if (key === '.') {
            this.inputDecimal();
        } else if (key === '+') {
            this.performOperation('+');
        } else if (key === '-') {
            this.performOperation('-');
        } else if (key === '*') {
            this.performOperation('*');
        } else if (key === '/') {
            this.performOperation('/');
        } else if (key === '%') {
            this.performOperation('%');
        } else if (key === 'Enter' || key === '=') {
            this.calculate();
        } else if (key === 'Escape') {
            this.allClear();
        } else if (key === 'Backspace') {
            this.clearEntry();
        } else if (key === '(') {
            this.inputCharacter('(');
        } else if (key === ')') {
            this.inputCharacter(')');
        }
    }
}

// Initialize calculator
const calculator = new ScientificCalculator();

// Global functions for HTML onclick events
function inputNumber(num) {
    calculator.inputNumber(num);
}

function inputCharacter(char) {
    calculator.inputCharacter(char);
}

function inputDecimal() {
    calculator.inputDecimal();
}

function performOperation(op) {
    calculator.performOperation(op);
}

function calculate() {
    calculator.calculate();
}

function performSquare() {
    calculator.performSquare();
}

function performFunction(func) {
    calculator.performFunction(func);
}

function toggleShift() {
    calculator.toggleShift();
}

function clearEntry() {
    calculator.clearEntry();
}

function allClear() {
    calculator.allClear();
}

function turnOff() {
    calculator.turnOff();
}