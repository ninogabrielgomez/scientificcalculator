import { useState } from 'react';
import './App.css';

function CalcDisplay({ dispValue }) {
  return (
    <div className='Display'>
      {dispValue}
    </div>
  );
}

function CalcButton({ buttonLabel, buttonClassname = 'Button', onClick }) {
  return (
    <button className={buttonClassname} onClick={onClick}>
      {buttonLabel}
    </button>
  );
}

function App() {
  const [disp, setDisp] = useState("0");
  const [operand1, setOperand1] = useState(null);
  const [operand2, setOperand2] = useState(null);
  const [operation, setOperation] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isDegree, setIsDegree] = useState(true);

  // Helper: format a number result (removes floating point noise like 0.1+0.2)
  const formatResult = (num) => {
    if (typeof num !== "number" || isNaN(num) || !isFinite(num)) {
      return "Error";
    }
    return String(parseFloat(num.toPrecision(12)));
  };

  // Helper: compute operand1 (operation) operand2
  const compute = (op1, op2, op) => {
    const a = parseFloat(op1);
    const b = parseFloat(op2);
    let result = 0;

    if (op === "+") {
      result = a + b;
    } else if (op === "-") {
      result = a - b;
    } else if (op === "*") {
      result = a * b;
    } else if (op === "÷") {
      result = b !== 0 ? a / b : NaN;
    } else if (op === "xʸ") {
      result = Math.pow(a, b);
    }

    return formatResult(result);
  };

  // Helper: set the value of whichever operand is currently being typed
  const setCurrentOperand = (value) => {
    if (operation === null) {
      setOperand1(value);
    } else {
      setOperand2(value);
    }
    setDisp(value);
  };

  // Helper: get the value of whichever operand is currently being typed
  const getCurrentOperand = () => {
    return operation === null ? operand1 : operand2;
  };

  // Clear Handler for "C" button
  const clearClickHandler = (e) => {
    e.preventDefault();
    setDisp("0");
    setOperand1(null);
    setOperand2(null);
    setOperation(null);
    setIsFinished(false);
  };

  // Delete Handler for "DEL" button
  const deleteClickHandler = (e) => {
    e.preventDefault();
    const current = getCurrentOperand();

    if (current === null || isFinished) {
      return;
    }

    const newValue = current.length > 1 ? current.slice(0, -1) : null;
    if (operation === null) {
      setOperand1(newValue);
    } else {
      setOperand2(newValue);
    }
    setDisp(newValue === null ? "0" : newValue);
  };

  // Equal Handler for "=" button
  const equalClickHandler = (e) => {
    e.preventDefault();

    if (operand1 !== null && operand2 !== null && operation !== null) {
      const result = compute(operand1, operand2, operation);

      setDisp(result);
      setOperand1(result === "Error" ? null : result);
      setOperand2(null);
      setOperation(null);
      setIsFinished(true);
    }
  };

  // Operation Handler for +, -, *, ÷, xʸ
  const operationClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    // Chain operations: 2 + 3 + ... computes 2 + 3 first
    if (operand1 !== null && operand2 !== null && operation !== null) {
      const result = compute(operand1, operand2, operation);
      setOperand1(result === "Error" ? null : result);
      setOperand2(null);
    } else if (operand1 === null) {
      setOperand1("0");
    }

    setOperation(value);
    setDisp(value === "xʸ" ? "^" : value);
    setIsFinished(false);
  };

  // Scientific Handler for sin, cos, tan, log, ln, √, x², 1/x, %, ±
  const scientificClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    const current = getCurrentOperand();

    if (current === null) {
      return;
    }

    const num = parseFloat(current);
    const angle = isDegree ? (num * Math.PI) / 180 : num;
    let result = 0;

    if (value === "sin") {
      result = Math.sin(angle);
    } else if (value === "cos") {
      result = Math.cos(angle);
    } else if (value === "tan") {
      result = Math.tan(angle);
    } else if (value === "log") {
      result = num > 0 ? Math.log10(num) : NaN;
    } else if (value === "ln") {
      result = num > 0 ? Math.log(num) : NaN;
    } else if (value === "√") {
      result = num >= 0 ? Math.sqrt(num) : NaN;
    } else if (value === "x²") {
      result = num * num;
    } else if (value === "1/x") {
      result = num !== 0 ? 1 / num : NaN;
    } else if (value === "%") {
      result = num / 100;
    } else if (value === "±") {
      result = -num;
    }

    const formatted = formatResult(result);

    if (formatted === "Error") {
      setDisp("Error");
      setOperand1(null);
      setOperand2(null);
      setOperation(null);
      setIsFinished(true);
      return;
    }

    setCurrentOperand(formatted);
    if (operation === null) {
      setIsFinished(true);
    }
  };

  // Constant Handler for π and e
  const constantClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;
    const constant = value === "π" ? formatResult(Math.PI) : formatResult(Math.E);

    setCurrentOperand(constant);
    if (operation === null) {
      setIsFinished(true);
    }
  };

  // Mode Handler for DEG / RAD toggle
  const modeClickHandler = (e) => {
    e.preventDefault();
    setIsDegree(!isDegree);
  };

  // Decimal Handler for "." button
  const decimalClickHandler = (e) => {
    e.preventDefault();

    if (isFinished) {
      setDisp("0.");
      setOperand1("0.");
      setIsFinished(false);
      return;
    }

    const current = getCurrentOperand();

    if (current === null) {
      setCurrentOperand("0.");
    } else if (!current.includes(".")) {
      setCurrentOperand(current + ".");
    }
  };

  // Number Handler for 0-9
  const numbuttonClickHandler = (e) => {
    e.preventDefault();
    const value = e.target.innerHTML;

    console.log(value + "|" + operand1 + "|" + operand2 + "|" + operation);

    if (isFinished) {
      setDisp(value);
      setOperand1(value);
      setIsFinished(false);
      return;
    }

    if (operation === null) {
      if (operand1 === null || operand1 === "0") {
        setDisp(value);
        setOperand1(value);
      } else {
        setDisp(operand1 + value);
        setOperand1(operand1 + value);
      }
    } else {
      if (operand2 === null || operand2 === "0") {
        setDisp(value);
        setOperand2(value);
      } else {
        setDisp(operand2 + value);
        setOperand2(operand2 + value);
      }
    }
  };

  // Handler for "GOMEZ" button
  const gomezClickHandler = (e) => {
    e.preventDefault();
    setDisp("Niño Gabriel T. Gomez");
  };

  return (
    <div className='App'>
      <div className='Header'> Scientific Calculator of Niño Gabriel T. Gomez - WMD3A</div>
      <div className='Calculator'>
        <CalcDisplay dispValue={disp}/>
        <div className='Keypad'>
          <CalcButton buttonLabel={"sin"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"cos"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"tan"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={isDegree ? "DEG" : "RAD"} buttonClassname="Button Button-mode" onClick={modeClickHandler}/>
          <CalcButton buttonLabel={"log"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"ln"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"√"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"x²"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"xʸ"} buttonClassname="Button Button-operator" onClick={operationClickHandler}/>
          <CalcButton buttonLabel={"π"} buttonClassname="Button Button-sci" onClick={constantClickHandler}/>
          <CalcButton buttonLabel={"e"} buttonClassname="Button Button-sci" onClick={constantClickHandler}/>
          <CalcButton buttonLabel={"%"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"±"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"1/x"} buttonClassname="Button Button-sci" onClick={scientificClickHandler}/>
          <CalcButton buttonLabel={"."} onClick={decimalClickHandler}/>
          <CalcButton buttonLabel={"DEL"} buttonClassname="Button Button-clear" onClick={deleteClickHandler}/>
          <CalcButton buttonLabel={7} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={8} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={9} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={"+"} buttonClassname="Button Button-operator" onClick={operationClickHandler}/>
          <CalcButton buttonLabel={4} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={5} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={6} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={"*"} buttonClassname="Button Button-operator" onClick={operationClickHandler}/>
          <CalcButton buttonLabel={1} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={2} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={3} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={"-"} buttonClassname="Button Button-operator" onClick={operationClickHandler}/>
          <CalcButton buttonLabel={"C"} buttonClassname="Button Button-clear" onClick={clearClickHandler}/>
          <CalcButton buttonLabel={0} onClick={numbuttonClickHandler}/>
          <CalcButton buttonLabel={"="} buttonClassname="Button Button-equals" onClick={equalClickHandler}/>
          <CalcButton buttonLabel={"÷"} buttonClassname="Button Button-operator" onClick={operationClickHandler}/>
          <CalcButton buttonLabel={"GOMEZ"} buttonClassname="Button Button-name" onClick={gomezClickHandler}/>
        </div>
      </div>
    </div>
  );
}

export default App;