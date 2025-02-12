document.addEventListener("DOMContentLoaded", () => {
    // CREATE THE INPUT BOXES INSIDE EXISTING .BOX ELEMENTS
    let count = 0;
    for (let i = 0; i < 9; i++) {
        count = 9 * i;
        // DYNAMICALLY ADDING 9 INPUT BOXES INSIDE EACH .BOX ELEMENT
        document.getElementsByClassName("BOX")[i].innerHTML = `
        <div class='cell'><input type='text' disabled class='input' id="${count+1}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+2}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+3}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+4}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+5}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+6}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+7}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+8}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>
        <div class='cell'><input type='text' disabled class='input' id="${count+9}" maxlength="1" pattern="[1-9]" inputmode="numeric" oninput="this.value = this.value.replace(/[^1-9]/g, '')"></div>`;    
    }
    // ENSURE ALL INPUTS ONLY ACCEPT NUMBERS 1-9
    document.querySelectorAll(".input").forEach(input => {
        input.addEventListener("input", function () {
            this.value = this.value.replace(/[^1-9]/g, '');
        });
    });
    // SELECTING UI ELEMENTS FOR GAME CONTROL
    const startButton = document.getElementById("START");
    const difficultySelect = document.getElementById("DIFFICULT");
    const timeSelect = document.getElementById("TIMES");
    const newButton = document.getElementById("NEW");
    const answerButton = document.getElementById("ANSWER");
    const hourDisplay = document.getElementById("HOUR");
    const minDisplay = document.getElementById("MIN");
    const secDisplay = document.getElementById("SEC");
    let timer;
    let solutionGrid = null;
    // FUNCTION TO INITIALIZE AND START THE GAME
    function setupGame() {
        if (startButton.disabled) return;
        startButton.disabled = true;
        newButton.disabled = true;
        setTimeout(() => {
            startButton.disabled = false;
            newButton.disabled = false;
        }, 100);
        const difficulty = difficultySelect.value;
        const timeValue = timeSelect.value;
        if (!difficulty) {
            alert("Please select a difficulty level!");
            return;
        }
        if (!timeValue) {
            alert("Please select a time limit!");
            return;
        }
        clearInterval(timer);
        clearBoard();
        // GENERATE A VALID SUDOKU GRID AND CREATE A PUZZLE FORM IT
        const generatedGrid1 = displayGrid();
        const generatedGrid = JSON.parse(JSON.stringify(generatedGrid1));
        solutionGrid = JSON.parse(JSON.stringify(generatedGrid));
        const puzzleGrid = removeNumbers(generatedGrid, difficulty);
        fillBoard(puzzleGrid);
        startTimer(timeValue);
    }
    // CHECKING IF USER ADDING NUMBER IN WRONG PLACE OF THE GRID
    function validateUserInput(event) {
        const inputElement = event.target;
        const cellId = parseInt(inputElement.id);
        const row = Math.floor((cellId - 1) / 9);
        const col = (cellId - 1) % 9;
        if (!solutionGrid) {
            console.error("Solution grid is missing!");
            return;
        }
        const correctValue = solutionGrid[row][col];
        const userValue = parseInt(inputElement.value, 10);
        if (isNaN(userValue) || inputElement.value.trim() === "") {
            return;
        }
        if (userValue === correctValue) {
            inputElement.disabled = true;
            checkWinCondition();
        } else {
            alert("You are adding number in the wrong position.");
            inputElement.value = "";
        }
    }
    // AFTER CREATE THE SUDOKU PROBLEM DISPLAY THE PROBLEM IN BROWSER GRID
    function fillBoard(grid) {
        document.querySelectorAll(".input").forEach(input => {
            input.removeEventListener("input", validateUserInput);
        });
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellId = row * 9 + col + 1;
                const value = grid[row][col];
                const inputElement = document.getElementById(cellId.toString());
                if (inputElement) {
                    inputElement.value = value === 0 ? "" : value;
                    if (value === 0) {
                        inputElement.disabled = false;
                        inputElement.addEventListener("input", validateUserInput);
                    } else {
                        inputElement.disabled = true;
                    }
                }
            }
        }
    }
    // START THE SUDOKU PROBLEM SOLVING LOGIC AND TIMER LOGIC
    function startTimer(time) {
        clearInterval(timer);
        let [hours, minutes, seconds] = time.split(":").map(Number);
        timer = setInterval(() => {
            if (hours === 0 && minutes === 0 && seconds === 0) {
                clearInterval(timer);
                alert("Time is up! Game over.");
                return;
            }
            if (seconds === 0) {
                if (minutes === 0) {
                    hours--;
                    minutes = 59;
                } else {
                    minutes--;
                }
                seconds = 59;
            } else {
                seconds--;
            }
            document.getElementById("HOUR").textContent = String(hours).padStart(2, "0");
            document.getElementById("MIN").textContent = String(minutes).padStart(2, "0");
            document.getElementById("SEC").textContent = String(seconds).padStart(2, "0");
        }, 1000);
    }
    // CREATE THE SUDOKU PROBLEM FOR SOLUTION - START
    const getColumn = (colNumber, lines) => {
        const col = [];
        for (let i = 0; i < lines.length; ++i) {
            const line = lines[i];
            col.push(line[colNumber]);
        }
        return col;
    };
    const getAllowed = (column, picks) => {
        const choosable = [];
        for (let i = 0; i < picks.length; ++i) {
            const pick = picks[i];
            if (!column.includes(pick))
            {
                choosable.push(pick);
            }
        }
        return choosable;
    };
    function getSquare(colNumber, lineNumber, lines) {
        const detected = [];
        if (!lineNumber) {
            return detected;
        }
        let startCol = Math.floor(colNumber / 3) * 3;
        let endCol = startCol + 3;
        let startLine = Math.floor(lineNumber / 3) * 3;
        let endLine = Math.min(startLine + 3, lines.length);
        for (let i = startCol; i < endCol; ++i) {
            for (let j = startLine; j < endLine; ++j) {
                const item = lines[j][i];
                if (item !== undefined)
                {
                    detected.push(item);
                }
            }
        }
        return detected;
    }
    const generateRandomLine = (lines) => {
        const line = [];
        let selectables = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (let i = 0; i < 9; ++i) {
            const column = getColumn(i, lines);
            let allowed;
            allowed = getAllowed(column, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
            allowed = getAllowed(line, allowed);
            const square = getSquare(i, lines.length, lines);
            allowed = getAllowed(square, allowed);
            const random = allowed.length > 1 ? Math.floor(Math.random() * allowed.length) : 0;
            const chosen = allowed[random];
            if (chosen === undefined) {
                return false;
            }
            line.push(chosen);
            selectables.splice(selectables.indexOf(chosen), 1);
        }
        return line;
    };
    const generateGrid = () => {
        let iterations;
        do {
            const grid = [];
            iterations = 0;
            do {
                ++iterations;
                if (iterations > 500) {
                    iterations = -1;
                    break;
                }
                const line = generateRandomLine(grid);
                if (!line) {
                    continue;
                }
                grid.push(line);
            } while (grid.length < 9);
    
            if (iterations !== -1) {
                return grid;
            }
        } while (true);
    
    };
    const displayGrid = () => {
        const grid = generateGrid();
        let gridString = ""; 
        for (let i = 0; i < grid.length; ++i) {
            gridString += `grid ${i}: ${JSON.stringify(grid[i])}\n`;
        }
        return grid;
    };
    // CREATE THE SUDOKU PROBLEM FOR SOLUTION - END
    // LOGIC FOR IS THE SUDOKU SOLUTION IS CORRECT OR NOT - START
    function isValid(grid, row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (grid[row][i] === num) return false;
        }
        for (let i = 0; i < 9; i++) {
            if (grid[i][col] === num) return false;
        }
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[blockRow + i][blockCol + j] === num) return false;
            }
        }
        return true;
    }
    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    // LOGIC FOR IS THE SUDOKU SOLUTION IS CORRECT OR NOT - END
    // REMOVE NUMBERS FORM SUDOKU PROBLEM WHILE CREATING
    function removeNumbers(grid, difficulty) {
        let removalCount;
        switch (difficulty) {
            case "EASY":
                removalCount = 36;
                break;
            case "MEDIUM":
                removalCount = 45;
                break;
            case "HARD":
                removalCount = 54;
                break;
            case "VERYHARD":
                removalCount = 63;
                break;
            case "INHUMAN":
                removalCount = 72;
                break;
            case "IMPOSSIBLE":
                removalCount = 77;
                break;
            default:
                removalCount = 36;
        }
        let puzzle = JSON.parse(JSON.stringify(grid));
        let removed = 0;
        while (removed < removalCount) {
            let row = Math.floor(Math.random() * 9);
            let col = Math.floor(Math.random() * 9);
            if (puzzle[row][col] !== 0) {
                let backup = puzzle[row][col];
                puzzle[row][col] = 0;

                let tempGrid = JSON.parse(JSON.stringify(puzzle));
                if (solve(tempGrid)) {
                    removed++;
                } else {
                    puzzle[row][col] = backup;
                }
            }
        }
        return puzzle;
    }
    // FUNCTION TO CHECK IF THE USER HAS WON
    function checkWinCondition() {
        let isComplete = true;  
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cellId = row * 9 + col + 1;
                const inputElement = document.getElementById(cellId.toString());
                if (!inputElement) continue;
                const userValue = parseInt(inputElement.value, 10);
                const correctValue = solutionGrid[row][col];
                if (isNaN(userValue) || userValue !== correctValue) {
                    isComplete = false;
                    return;
                }
            }
        }
        if (isComplete) {
            setTimeout(() => {
                alert("🎉 Congratulations! You won the game! 🎉");
                resetGame();
            }, 100);
        }
    }
    // EVENT LISTENER FOR GAME BUTTONS
    startButton.addEventListener("click", setupGame);
    newButton.addEventListener("click", setupGame);
    answerButton.addEventListener("click", () => {
        clearInterval(timer);
        hourDisplay.textContent = "00";
        minDisplay.textContent = "00";
        secDisplay.textContent = "00";
        if (!solutionGrid) {
            alert("Solution is not available. Please start a new game.");
            return;
        }
        fillBoard(solutionGrid);
        alert("Solution displayed!");
        difficultySelect.selectedIndex = 0;
        timeSelect.selectedIndex = 0;
        setTimeout(() => { clearBoard(); }, 5000);

    });
    // FUNCTION TO RESET THE SUDOKU GAME
    function resetGame() {
        clearInterval(timer);
        hourDisplay.textContent = "00";
        minDisplay.textContent = "00";
        secDisplay.textContent = "00";
        difficultySelect.selectedIndex = 0;
        timeSelect.selectedIndex = 0;
        setTimeout(() => { clearBoard(); }, 1000);
    }
    // FUNCTION TO CLEAR SUDOKU BOARD
    function clearBoard() {
        document.querySelectorAll(".input").forEach(input => {
            input.value = "";
            input.disabled = true;
            input.removeEventListener("input", validateUserInput);
        });
    }    
});