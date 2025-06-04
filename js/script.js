// Global variables
let questions = [];
let currentQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let incorrectQuestions = []; // Track questions that were answered incorrectly
let repeatQuestionsQueue = []; // Queue for questions to repeat
let timer;
let startTime;
let elapsedTime = 0;
let chapters = {};
let showingFeedback = false; // Flag to indicate if we're showing feedback
let navigationPanelVisible = true; // Flag to track navigation panel visibility
let originalQuestionCount = 0; // Track the original number of questions before adding repeats
let currentQuestionFile = '../documents/ktct.txt'; // Default file to load
let questionFileTitles = {
    '../documents/ktct.txt': 'Kinh tế Chính trị',
    '../documents/nlmkt.txt': 'Nguyên lý Marketing'
};
let previousScreen = 'modes'; // Track which screen to return to when going back from file selection
let selectedQuestionCount = 40; // Default question count for random mode

// Variables for random chapter mode
let randomChapterQuestionCount = 20;

// DOM Elements
const ktctFileBtn = document.getElementById('ktct-file');
const nlmktFileBtn = document.getElementById('nlmkt-file');
const backFromFileBtn = document.getElementById('back-from-file-selection');
const changeFileBtn = document.getElementById('change-file-btn');
const nlmktOptions = document.getElementById('nlmkt-options');
const nlmkt40Btn = document.getElementById('nlmkt-40');
const nlmkt50Btn = document.getElementById('nlmkt-50');
const chapterModeBtn = document.getElementById('chapter-mode');
const randomModeBtn = document.getElementById('random-mode');
const chapterSelection = document.getElementById('chapter-selection');
const chapterButtons = document.querySelectorAll('.chapter-btn');
const quizContainer = document.getElementById('quiz-container');
const quizTitle = document.getElementById('quiz-title');
const questionCountElement = document.getElementById('question-count');
const timerElement = document.getElementById('timer');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const resultsContainer = document.getElementById('results-container');
const scoreElement = document.getElementById('score');
const timeTakenElement = document.getElementById('time-taken');
const resultsDetails = document.getElementById('results-details');
const reviewBtn = document.getElementById('review-btn');
const restartBtn = document.getElementById('restart-btn');
const reviewContainer = document.getElementById('review-container');
const reviewQuestions = document.getElementById('review-questions');
const backToResultsBtn = document.getElementById('back-to-results');
const backToMainBtn = document.getElementById('back-to-main-btn');
const questionNavigationPanel = document.getElementById('question-navigation-panel');
const questionNavigationGrid = document.getElementById('question-navigation-grid');
const toggleNavigationBtn = document.getElementById('toggle-navigation-btn');
const appTitle = document.getElementById('app-title');
// DOM Element for current file indicator
const currentFileIndicator = document.getElementById('current-file-indicator');
const currentFileName = document.getElementById('current-file-name');
const randomFromChapterModeBtn = document.getElementById('random-from-chapter-mode');
const randomChapterSelection = document.getElementById('random-chapter-selection');
const randomChapterQuestionCountSelect = document.getElementById('random-chapter-question-count');

// Function to hide all sections
function hideAllSections() {
    document.querySelector('.file-selection').classList.add('hidden');
    document.querySelector('.modes').classList.add('hidden');
    chapterSelection.classList.add('hidden');
    randomChapterSelection.classList.add('hidden');
    quizContainer.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    reviewContainer.classList.add('hidden');
}

// Event listeners
document.addEventListener('DOMContentLoaded', initialize);
ktctFileBtn.addEventListener('click', () => selectQuestionFile('../documents/ktct.txt'));
nlmktFileBtn.addEventListener('click', () => selectQuestionFile('../documents/nlmkt.txt'));
backFromFileBtn.addEventListener('click', goBackFromFileSelection);
changeFileBtn.addEventListener('click', changeQuestionFile);
nlmkt40Btn.addEventListener('click', () => selectQuestionCount(40));
nlmkt50Btn.addEventListener('click', () => selectQuestionCount(50));
chapterModeBtn.addEventListener('click', showChapterSelection);
randomModeBtn.addEventListener('click', startRandomMode);
chapterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const chapter = button.getAttribute('data-chapter');
        startChapterMode(chapter);
    });
});

// Add event listeners for navigation with improved click handling
prevBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!this.disabled) {
        showPreviousQuestion();
    }
});

nextBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (!this.disabled) {
        showNextQuestion();
    }
});

// Add keyboard navigation with arrow keys and A, B, C, D keys for answering
document.addEventListener('keydown', function(e) {    // Only respond to keys if we're in quiz mode (quiz container is visible)
    if (!quizContainer.classList.contains('hidden')) {
        // Navigation with arrow keys - only if we're not showing feedback
        if (!showingFeedback) {
            if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
                e.preventDefault(); // Prevent scrolling
                showPreviousQuestion();
                return; // Exit early to prevent processing as an answer key
            } else if (e.key === 'ArrowRight' && !nextBtn.disabled) {
                e.preventDefault(); // Prevent scrolling
                showNextQuestion();
                return; // Exit early to prevent processing as an answer key
            }
        }
          
        // Answer with A, B, C, D keys
        if (!showingFeedback && currentQuestions.length > 0) {
            // Check if we're showing a repeated question
            const isRepeatedQuestion = repeatQuestionsQueue.length > 0 && currentQuestionIndex >= currentQuestions.length - 1;
            // Get the correct question object (either from regular questions or repeat queue)
            const currentQuestion = isRepeatedQuestion && repeatQuestionsQueue.length > 0 
                ? repeatQuestionsQueue[0].question 
                : currentQuestions[currentQuestionIndex];
            
            const optionsCount = currentQuestion.options.length;
              // Check for A, B, C, D keys (both lowercase and uppercase)
            const key = e.key.toUpperCase();
            
            // Check if key is A, B, C, D or number keys 1, 2, 3, 4
            let optionIndex = -1;
            
            if (key == 'A' || key == 'B' || key == 'C' || key == 'D') {
                // Convert A, B, C, D to index 0, 1, 2, 3
                optionIndex = key.charCodeAt(0) - 'A'.charCodeAt(0);
            } else if (key == '1' || key == '2' || key == '3' || key == '4') {
                // Convert number keys 1, 2, 3, 4 to index 0, 1, 2, 3
                optionIndex = parseInt(key) - 1;
            }
              // Only proceed if we have a valid option index
            if (optionIndex >= 0 && optionIndex < optionsCount) {
                e.preventDefault(); // Prevent default action
                
                // If it's a repeated question, pass the question object to selectOption
                if (isRepeatedQuestion && repeatQuestionsQueue.length > 0) {
                    selectOption(optionIndex, repeatQuestionsQueue[0].question);
                } else {
                    selectOption(optionIndex);
                }
                
                // Highlight the selected option visually
                const options = optionsContainer.querySelectorAll('.option');
                if (options[optionIndex]) {                    options[optionIndex].classList.add('keyboard-selected');
                    
                    // Remove the highlight after a short delay
                    setTimeout(() => {
                        options[optionIndex].classList.remove('keyboard-selected');
                    }, 300);
                }
            }
        }
    }
});

submitBtn.addEventListener('click', submitQuiz);
reviewBtn.addEventListener('click', showReview);
restartBtn.addEventListener('click', restartQuiz);
backToResultsBtn.addEventListener('click', showResults);
backToMainBtn.addEventListener('click', backToMainScreen);
toggleNavigationBtn.addEventListener('click', toggleNavigationPanel);
randomFromChapterModeBtn.addEventListener('click', showRandomChapterSelection);
randomChapterQuestionCountSelect.addEventListener('change', function() {
    randomChapterQuestionCount = parseInt(this.value);
});

// Functions
async function initialize() {
    // Show file selection section by default
    hideAllSections();
    document.querySelector('.file-selection').classList.remove('hidden');
    
    // Initially hide the back button on first load
    backFromFileBtn.style.display = 'none';
}

// Function to handle going back from file selection
function goBackFromFileSelection() {
    hideAllSections();
    
    // Handle navigation based on the previous screen
    if (previousScreen === 'modes') {
        document.querySelector('.modes').classList.remove('hidden');
    } else if (previousScreen === 'chapterSelection') {
        chapterSelection.classList.remove('hidden');
    } else if (previousScreen === 'quiz') {
        quizContainer.classList.remove('hidden');
        // Restore the navigation panel if it was visible
        if (navigationPanelVisible) {
            questionNavigationPanel.classList.remove('hidden');
        }
    } else if (previousScreen === 'results') {
        resultsContainer.classList.remove('hidden');
    } else if (previousScreen === 'review') {
        reviewContainer.classList.remove('hidden');
    } else {
        // Default to modes screen if we have questions loaded
        if (questions.length > 0) {
            document.querySelector('.modes').classList.remove('hidden');
        } else {
            // If no questions are loaded, stay on file selection
            document.querySelector('.file-selection').classList.remove('hidden');
            // Hide the back button since there's nowhere to go back to
            backFromFileBtn.style.display = 'none';
        }
    }
    
    // Update UI to reflect current question file
    if (questions.length > 0) {
        updateUIWithSelectedFile(currentQuestionFile);
    }
}

// Function to change question file from the modes screen
function changeQuestionFile() {
    // Set the previous screen to return to
    previousScreen = 'modes';
    // Show the back button
    backFromFileBtn.style.display = 'inline-flex';
    
    hideAllSections();
    document.querySelector('.file-selection').classList.remove('hidden');
}

// Function to handle selecting a question file
async function selectQuestionFile(fileName) {
    try {
        currentQuestionFile = fileName;
        
        // Update the active file button visually
        updateActiveFileButton(fileName);
        
        // Update the app title to reflect the selected question set
        appTitle.textContent = `Ôn luyện ${questionFileTitles[fileName]}`;
        
        // Clear previous questions and show loading state
        questions = [];
        document.querySelector('.file-selection').classList.add('hidden');
        
        // Create and show a loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        loadingIndicator.innerHTML = `<p>Đang tải câu hỏi từ ${fileName}...</p>`;
        document.querySelector('.container').appendChild(loadingIndicator);
        
        // Load the questions from the selected file
        await loadQuestions(fileName);
        
        // Remove loading indicator
        document.querySelector('.loading-indicator').remove();
        
        if (questions.length === 0) {
            // If no questions were loaded, show an error and return to file selection
            alert(`Không thể tải câu hỏi từ file ${fileName}. Vui lòng thử lại.`);
            document.querySelector('.file-selection').classList.remove('hidden');
            return;
        }
        
        // Organize questions by chapter
        organizeQuestionsByChapter();
          // Update UI elements with the selected file info
        updateUIWithSelectedFile(fileName);
          // Show current file indicator
        currentFileIndicator.classList.remove('hidden');
        
        // Update chapter buttons with question counts
        updateChapterButtonsWithCount();
        
        // Show the mode selection screen
        document.querySelector('.modes').classList.remove('hidden');
    } catch (error) {
        console.error('Error initializing quiz:', error);
        alert('Có lỗi nghiêm trọng trong quá trình tải câu hỏi. Vui lòng thử lại sau.');
        document.querySelector('.file-selection').classList.remove('hidden');
    }
}

// Function to update UI elements with selected file information
function updateUIWithSelectedFile(fileName) {
    // Update the change file button to show current file
    changeFileBtn.innerHTML = `<i class="fas fa-exchange-alt"></i> Đổi bộ câu hỏi (Hiện tại: ${questionFileTitles[fileName]})`;
    
    // Update any other UI elements that should reflect the current file
    document.querySelector('.modes h2').textContent = `Chọn chế độ ôn tập - ${questionFileTitles[fileName]}`;
    
    // Update the current file indicator
    currentFileName.textContent = questionFileTitles[fileName];
    
    // Show/hide NLMKT options based on selected file
    toggleNLMKTOptions();
    
    // Update the random mode button text
    updateRandomModeButton();
}

function loadQuestions(fileName = 'ktct.txt') {
    return new Promise(async (resolve, reject) => {
        try {
            // Try to fetch the file using fetch API
            const response = await fetch(fileName);
            if (!response.ok) {
                console.warn(`Fetch failed with status ${response.status}: ${response.statusText}. Trying XMLHttpRequest.`);
                // Don't throw yet, fall through to XHR attempt
            } else {
                const data = await response.text();
                parseQuestions(data, fileName); // Modifies global 'questions'
                if (questions.length > 0) {
                    resolve();
                } else {
                    // parseQuestions should alert if it found content but parsed no questions.
                    // If data was empty, parseQuestions might not alert.
                    console.error('Fetched data but no questions were parsed.');
                    // Alert is likely handled by parseQuestions if content was present but unparseable.
                    reject(new Error('No questions parsed from fetched data.'));
                }
                return; // Exit if fetch was successful
            }
        } catch (fetchError) {
            console.warn('Fetch API error:', fetchError, 'Trying XMLHttpRequest...');
        }

        // If fetch was not ok or threw an error, try XMLHttpRequest
        const xhr = new XMLHttpRequest();
        xhr.open('GET', fileName, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText)) { // status 0 for local file access
                    parseQuestions(xhr.responseText, fileName); // Modifies global 'questions'
                    if (questions.length > 0) {
                        resolve();
                    } else {
                        console.error('XHR succeeded but no questions were parsed.');
                        // Alert is likely handled by parseQuestions.
                        reject(new Error('No questions parsed from XHR data.'));
                    }
                } else {
                    console.error(`Failed to fetch file using XMLHttpRequest: Status ${xhr.status}, ${xhr.statusText}`);
                    alert(`Có lỗi khi tải câu hỏi (XHR). Vui lòng kiểm tra file ${fileName} và tải lại trang.`);
                    questions = []; // Ensure questions is empty on error
                    reject(new Error(`XHR failed with status: ${xhr.statusText || xhr.status}`));
                }
            }
        };
        xhr.onerror = function() { // Handle network errors for XHR
            console.error('XMLHttpRequest network error.');
            alert(`Lỗi mạng khi tải câu hỏi từ ${fileName} (XHR). Vui lòng kiểm tra kết nối và tải lại trang.`);
            questions = []; // Ensure questions is empty on error
            reject(new Error('XHR network error.'));
        };
        xhr.send();
    });
}

function parseQuestions(data, fileName = 'ktct.txt') {
    questions = []; // Reset global questions array before parsing
    try {
        if (!data || data.trim() === '') {
            console.warn('Provided data for parsing is empty.');
            alert(`File câu hỏi (${fileName}) rỗng hoặc không có nội dung. Vui lòng kiểm tra lại.`);
            return;
        }

        const chapterBlocks = data.split(/Chương\s+(?=\d)/i);
        if (!data.toLowerCase().startsWith('chương')) {
            chapterBlocks.shift(); // Remove content before the first "Chương" if any
        }

        if (chapterBlocks.length === 0) {
            console.warn('No "Chương n" delimiters found in the data.');
            alert(`Không tìm thấy định dạng chương (Chương n) trong file câu hỏi. Vui lòng kiểm tra lại file ${fileName}.`);
            return;
        }

        chapterBlocks.forEach((block, index) => {
            if (!block.trim()) return;

            const lines = block.trim().split(/\r?\n/).map(line => line.trim()).filter(line => line);
            if (lines.length === 0) {
                console.warn(`Chapter block for index ${index} is empty after trimming and splitting.`);
                return;
            }

            const chapterHeaderLine = lines.shift();
            const chapterMatch = chapterHeaderLine.match(/^(\d+)/);
            const chapterIdentifier = chapterMatch ? chapterMatch[1] : `UnknownChapter${index + 1}`;
            console.log(`Processing Chapter: ${chapterIdentifier}, Header: "${chapterHeaderLine}".`);

            let currentQuestionText = '';
            let currentOptions = []; // Stores option texts
            let currentOptionLetters = []; // Stores 'A', 'B', 'C', 'D' for parsed options
            let correctAnswerInfo = null; // Stores { letter: 'A', text: '...' } from the '•' line

            for (const line of lines) {
                const correctAnswerMatch = line.match(/^•\s*([A-D])\.\s*(.*);$/i);
                const optionMatch = line.match(/^([A-D])\.\s*(.*)$/i);

                if (correctAnswerMatch) {
                    correctAnswerInfo = { letter: correctAnswerMatch[1].toUpperCase(), text: correctAnswerMatch[2].trim() };

                    // This line marks the end of a question block. Assemble and push.
                    if (currentQuestionText.trim() && currentOptions.length > 0 && correctAnswerInfo) {
                        const correctIndex = currentOptionLetters.indexOf(correctAnswerInfo.letter);

                        if (correctIndex !== -1) {
                            questions.push({
                                text: currentQuestionText.trim(),
                                options: currentOptions,
                                correctAnswer: correctIndex,
                                chapter: chapterIdentifier,
                                sourceFile: fileName // Add source file information
                            });
                        } else {
                            console.warn(`Skipped question in chapter ${chapterIdentifier}: Correct answer letter '${correctAnswerInfo.letter}' from '•' line not found in parsed option letters [${currentOptionLetters.join(', ')}].\nText: "${currentQuestionText.trim()}"\nOptions: ${JSON.stringify(currentOptions)}\nCorrect Answer Line: "${line}"`);
                        }
                    } else {
                        console.warn(`Skipped incomplete question block in Chapter ${chapterIdentifier} when '•' line encountered:\nText: "${currentQuestionText.trim()}"\nOptions: ${JSON.stringify(currentOptions)} (Letters: ${JSON.stringify(currentOptionLetters)})\nCorrect Answer Info: ${JSON.stringify(correctAnswerInfo)}`);
                    }
                    // Reset for the next question
                    currentQuestionText = '';
                    currentOptions = [];
                    currentOptionLetters = [];
                    correctAnswerInfo = null;

                } else if (optionMatch) {
                    // This is an option line like "A. Some text"
                    currentOptionLetters.push(optionMatch[1].toUpperCase());
                    currentOptions.push(optionMatch[2].trim());
                } else if (line.endsWith(';') && !line.startsWith('•')) { // End of a question text line (and not a correct answer line)
                    currentQuestionText += (currentQuestionText ? ' ' : '') + line.slice(0, -1).trim();
                } else if (line.trim() !== '') {
                    // Part of a (potentially multi-line) question text, not an option, not ending with ';'
                    currentQuestionText += (currentQuestionText ? ' ' : '') + line.trim();
                }
            }
        });

        console.log(`Successfully parsed questions from ${fileName}. Total questions loaded:`, questions.length);
        if (questions.length === 0 && data.trim() !== '') {
            alert(`Không tìm thấy câu hỏi nào hợp lệ trong file ${fileName}. Vui lòng kiểm tra định dạng của các câu hỏi và đáp án.`);
        }

    } catch (parseError) {
        console.error('Critical error during parsing questions:', parseError);
        questions = [];
        alert(`Có lỗi nghiêm trọng khi xử lý nội dung file câu hỏi ${fileName}. Vui lòng kiểm tra định dạng file và thử tải lại trang.`);
    }
}

function organizeQuestionsByChapter() {
    chapters = {};
    
    questions.forEach(question => {
        if (!chapters[question.chapter]) {
            chapters[question.chapter] = [];
        }
        chapters[question.chapter].push(question);
    });
    
    // Enhanced logging for debugging
    console.log(`Organized questions into ${Object.keys(chapters).length} chapters`);
    
    // Print detailed chapter statistics
    let chapterStats = "Chapter statistics:\n";
    Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b)).forEach(chNum => {
        chapterStats += `Chapter ${chNum}: ${chapters[chNum].length} questions\n`;
    });
    console.log(chapterStats);
    
    // Update chapter buttons with question counts
    updateChapterButtonsWithCount();
    
    // Analyze for potential issues (large differences between chapters)
    const chapterSizes = Object.keys(chapters).map(ch => ({
        chapter: ch,
        count: chapters[ch].length
    })).sort((a, b) => parseInt(a.chapter) - parseInt(b.chapter));
    
    // Check for missing chapters or very small chapters
    let potentialIssues = false;
    for (let i = 0; i < chapterSizes.length - 1; i++) {
        const current = chapterSizes[i];
        const next = chapterSizes[i + 1];
        
        // Check for missing chapters in sequence
        if (parseInt(next.chapter) - parseInt(current.chapter) > 1) {
            console.warn(`Potential issue: Missing chapters between ${current.chapter} and ${next.chapter}`);
            potentialIssues = true;
        }
        
        // Check for very small chapters (might indicate parsing issues)
        if (current.count < 5) {
            console.warn(`Potential issue: Chapter ${current.chapter} has only ${current.count} questions`);
            potentialIssues = true;
        }
        
        // Check for large discrepancies in chapter sizes
        if (next.count > current.count * 3 || current.count > next.count * 3) {
            console.warn(`Potential issue: Large size difference between Chapter ${current.chapter} (${current.count} questions) and Chapter ${next.chapter} (${next.count} questions)`);
            potentialIssues = true;
        }
    }
    
    // If we found potential issues, add a marker to the UI
    if (potentialIssues) {
        console.warn("Potential chapter organization issues detected. Check the console for details.");
        setTimeout(() => {
            const modeContainer = document.querySelector('.modes');
            if (modeContainer) {
                const warningElement = document.createElement('div');
                modeContainer.appendChild(warningElement);
            }
        }, 1000);
    }
}

function showChapterSelection() {
    hideAllSections();
    chapterSelection.classList.remove('hidden');
    
    // Update chapter buttons with question counts
    updateChapterButtonsWithCount();
}

function startChapterMode(chapterNumber) {
    console.log("Starting chapter mode for chapter:", chapterNumber);
    console.log("Available chapters:", Object.keys(chapters));
    
    // Ensure chapters are properly loaded
    if (!chapters || Object.keys(chapters).length === 0) {
        alert('Không có dữ liệu câu hỏi. Vui lòng kiểm tra file câu hỏi và tải lại trang.');
        return;
    }    // Check if the requested chapter exists
    currentQuestions = chapters[chapterNumber] || [];
    console.log(`Chapter ${chapterNumber} has ${currentQuestions.length} questions`);
    
    if (currentQuestions.length === 0) {
        alert(`Không có câu hỏi cho Chương ${chapterNumber}. Vui lòng kiểm tra lại nội dung file câu hỏi.`);
        return;
    }
    
    // Initialize quiz state
    originalQuestionCount = currentQuestions.length; // Store the original count
    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    incorrectQuestions = [];
    repeatQuestionsQueue = [];

    // Update quiz title with chapter number and question count
    updateQuizTitleWithCount(chapterNumber);
    startQuiz();
}

function startRandomMode() {
    // Use selectedQuestionCount for question count logic
    const questionCount = (currentQuestionFile === '../documents/nlmkt.txt') ? selectedQuestionCount : 40;
    
    if (questions.length < questionCount) {
        alert(`Không đủ câu hỏi để tạo đề ngẫu nhiên. Cần ít nhất ${questionCount} câu hỏi.`);
        return;
    }
      
    // Get random questions based on selected count
    currentQuestions = getRandomQuestions(questions, questionCount);
    originalQuestionCount = currentQuestions.length; // Store the original count
    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    incorrectQuestions = [];
    repeatQuestionsQueue = [];
    
    // Update quiz title based on current file and question count
    const fileTitle = questionFileTitles[currentQuestionFile];
    quizTitle.textContent = `Đề thi ngẫu nhiên - ${fileTitle} (${questionCount} câu)`;
    startQuiz();
}

function getRandomQuestions(allQuestions, count) {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// Function to show random chapter selection
function showRandomChapterSelection() {
    // Only allow this feature for KTCT (not for NLMKT)
    if (currentQuestionFile !== '../documents/ktct.txt') {
        alert('Chức năng này chỉ áp dụng cho bộ câu hỏi Kinh tế Chính trị.');
        return;
    }
    
    hideAllSections();
    randomChapterSelection.classList.remove('hidden');
    
    // Generate chapter buttons dynamically
    const chapterButtonsContainer = randomChapterSelection.querySelector('.random-chapter-buttons');
    chapterButtonsContainer.innerHTML = ''; // Clear existing buttons
    
    const chapterNumbers = Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b));
    
    chapterNumbers.forEach(chapter => {
        const questionCount = chapters[chapter].length;
        const button = document.createElement('button');
        button.className = 'chapter-btn';
        button.setAttribute('data-chapter', chapter);
        button.innerHTML = `Chương ${chapter} <span class="question-count">(${questionCount} câu)</span>`;
        
        button.addEventListener('click', () => startRandomChapterMode(chapter));
        
        chapterButtonsContainer.appendChild(button);
    });
}

// Function to start random questions from a specific chapter
function startRandomChapterMode(chapterNumber) {
    console.log(`Starting random mode for chapter ${chapterNumber} with ${randomChapterQuestionCount} questions`);
    
    // Get the questions for the selected chapter
    const chapterQuestions = chapters[chapterNumber] || [];
    
    if (chapterQuestions.length === 0) {
        alert(`Không có câu hỏi cho Chương ${chapterNumber}. Vui lòng kiểm tra lại nội dung file câu hỏi.`);
        return;
    }
    
    // Check if we have enough questions
    if (chapterQuestions.length < randomChapterQuestionCount) {
        const confirmContinue = confirm(`Chương ${chapterNumber} chỉ có ${chapterQuestions.length} câu hỏi, ít hơn ${randomChapterQuestionCount} câu đã chọn. Bạn có muốn tiếp tục với tất cả ${chapterQuestions.length} câu không?`);
        if (!confirmContinue) {
            return;
        }
        // If user confirms, use all available questions
        currentQuestions = [...chapterQuestions];
    } else {
        // Get random questions from the chapter
        currentQuestions = getRandomQuestions(chapterQuestions, randomChapterQuestionCount);
    }
    
    // Initialize quiz state
    originalQuestionCount = currentQuestions.length;
    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    incorrectQuestions = [];
    repeatQuestionsQueue = [];
    
    // Update quiz title
    quizTitle.textContent = `Kinh tế Chính trị - Chương ${chapterNumber} (${currentQuestions.length} câu ngẫu nhiên)`;
    
    // Start the quiz
    startQuiz();
}

function startQuiz() {
    hideAllSections();
    quizContainer.classList.remove('hidden');
    
    // Reset feedback state
    showingFeedback = false;
    
    // Reset and start timer
    startTime = new Date();
    elapsedTime = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(updateTimer, 1000);
    
    // Generate navigation grid
    generateNavigationGrid();
    
    displayQuestion();
    
    // Initially hide the submit button until we reach the end
    submitBtn.classList.add('hidden');
      // Show a tip about keyboard shortcuts
    const keyboardTip = document.createElement('div');
    keyboardTip.className = 'keyboard-tip';
    keyboardTip.innerHTML = `
        <p><i class="fas fa-keyboard"></i> Mẹo: Bạn có thể sử dụng phím <strong>A, B, C, D</strong> hoặc <strong>1, 2, 3, 4</strong> để chọn đáp án và phím <strong>← →</strong> để di chuyển giữa các câu hỏi.</p>
    `;
    quizContainer.insertBefore(keyboardTip, document.getElementById('controls'));
    
    // Auto-hide the tip after 8 seconds
    setTimeout(() => {
        keyboardTip.style.opacity = '0';
        setTimeout(() => keyboardTip.remove(), 500);
    }, 3000);
}

function displayQuestion() {
    console.log("Displaying question: " + (currentQuestionIndex + 1));
    
    // Clear any previous feedback
    showingFeedback = false;
    
    // Remove any previous feedback messages
    const oldFeedback = document.querySelectorAll('.feedback-message');
    oldFeedback.forEach(el => el.remove());
    
    // If we have questions to repeat from the repeat queue, prioritize them
    if (repeatQuestionsQueue.length > 0 && currentQuestionIndex >= currentQuestions.length - repeatQuestionsQueue.length) {
        // If we're at the repeat section, start showing repeat questions
        const repeatQuestionInfo = repeatQuestionsQueue.shift();
        const repeatQuestion = repeatQuestionInfo.question;
        
        // Create a feedback element at the top to indicate this is a repeated question
        const feedbackElement = document.createElement('div');
        feedbackElement.className = 'feedback-message';
        feedbackElement.innerHTML = `
            <p>Đây là câu hỏi bạn đã trả lời sai trước đó. Hãy thử lại.</p>
            <p><small>Còn ${repeatQuestionsQueue.length} câu cần ôn tập lại</small></p>
        `;
        questionText.parentNode.insertBefore(feedbackElement, questionText);
        
        // Display the repeated question
        questionText.textContent = `${currentQuestionIndex + 1}. ${repeatQuestion.text}`;
        
        // Clear options container
        optionsContainer.innerHTML = '';
          // Add options for the repeated question
        repeatQuestion.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            
            // Add key hint for keyboard shortcuts
            const keyHint = document.createElement('span');
            keyHint.className = 'key-hint';
            keyHint.textContent = String.fromCharCode(65 + index);
            
            // Create text span
            const optionText = document.createElement('span');
            optionText.className = 'option-text';
            optionText.textContent = option;
            
            // Combine key hint and text
            optionElement.appendChild(keyHint);
            optionElement.appendChild(optionText);
            
            optionElement.addEventListener('click', () => selectOption(index, repeatQuestion));
            optionsContainer.appendChild(optionElement);
        });
        
        // Update question count
        questionCountElement.textContent = `Câu hỏi: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
        
        // Update submit button visibility
        if (repeatQuestionsQueue.length === 0) {
            submitBtn.classList.remove('hidden');
        } else {
            submitBtn.classList.add('hidden');
        }
        
        // Update navigation grid to show current question
        updateNavigationGrid();
        
        return;
    }
      const question = currentQuestions[currentQuestionIndex];
    
    // Update question count
    questionCountElement.textContent = `Câu hỏi: ${currentQuestionIndex + 1}/${currentQuestions.length}`;
    
    // Display question text
    questionText.textContent = `${currentQuestionIndex + 1}. ${question.text}`;
    
    // Clear options container
    optionsContainer.innerHTML = '';
      // Add options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        
        // Add key hint for keyboard shortcuts
        const keyHint = document.createElement('span');
        keyHint.className = 'key-hint';
        keyHint.textContent = String.fromCharCode(65 + index);
        
        // Create text span
        const optionText = document.createElement('span');
        optionText.className = 'option-text';
        optionText.textContent = option;
        
        // Combine key hint and text
        optionElement.appendChild(keyHint);
        optionElement.appendChild(optionText);
        
        // Mark selected option if user has answered this question
        if (userAnswers[currentQuestionIndex] === index) {
            optionElement.classList.add('selected');
        }
        
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Update navigation grid to highlight current question
    updateNavigationGrid();
}

function selectOption(optionIndex, repeatQuestion = null) {
    // Get the current question (either regular or repeated)
    const question = repeatQuestion || currentQuestions[currentQuestionIndex];
    
    // Remove any previous feedback messages
    const oldFeedback = document.querySelectorAll('.feedback-message');
    oldFeedback.forEach(el => el.remove());
    
    // Save user's answer
    if (!repeatQuestion) {
        userAnswers[currentQuestionIndex] = optionIndex;
    }
    
    // Mark this as a feedback state
    showingFeedback = true;
    
    // Update UI to reflect selection
    const options = optionsContainer.querySelectorAll('.option');
    options.forEach((option, index) => {
        // First, clear any previous feedback classes
        option.classList.remove('selected', 'correct', 'incorrect');
        
        if (index === optionIndex) {
            option.classList.add('selected');
            
            // Check if answer is correct and apply appropriate class
            if (index === question.correctAnswer) {
                option.classList.add('correct');
            } else {
                option.classList.add('incorrect');
                  // For wrong answers, schedule to repeat the question
                if (!repeatQuestion) { // Only add to repeat queue if this is not already a repeat
                    // Add to incorrect questions tracking
                    incorrectQuestions.push({
                        questionIndex: currentQuestionIndex,
                        question: question
                    });
                    
                    // Schedule to repeat immediately
                    repeatQuestionsQueue.push({
                        question: question,
                        repeatCount: 1
                    });
                    
                    // Add the question to the end of currentQuestions array
                    currentQuestions.push(question);
                    
                    // Extend userAnswers array to match the new length
                    userAnswers.push(null);
                    
                    // Update the navigation grid to reflect the new total
                    generateNavigationGrid();
                }
            }
        } else if (index === question.correctAnswer) {
            // Always highlight the correct answer
            option.classList.add('correct');
        }
    });
    
    // Create and show feedback message
    const feedbackElement = document.createElement('div');
    feedbackElement.className = 'feedback-message';
    
    if (optionIndex === question.correctAnswer) {
        feedbackElement.innerHTML = `
            <p class="correct-feedback">Chính xác! Đáp án đúng là ${String.fromCharCode(65 + question.correctAnswer)}.</p>
        `;    } else {
        feedbackElement.innerHTML = `
            <p class="incorrect-feedback">Sai rồi! Đáp án đúng là ${String.fromCharCode(65 + question.correctAnswer)}.</p>
            <p>Câu hỏi này sẽ được thêm vào cuối bài kiểm tra để bạn ôn tập lại.</p>
        `;
    }
    
    // Add the feedback below the options
    optionsContainer.parentNode.insertBefore(feedbackElement, optionsContainer.nextSibling);
      // Enable navigation buttons after showing feedback
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.disabled = currentQuestionIndex === currentQuestions.length - 1;
    
    // Update navigation grid to show answered status
    updateNavigationGrid();
    
    // Allow navigation after showing feedback
    showingFeedback = false;
}

function showPreviousQuestion() {
    // If we're showing feedback, ignore navigation
    if (showingFeedback) {
        console.log("Navigation blocked - feedback is showing");
        return;
    }
    
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function showNextQuestion() {
    // If we're showing feedback, ignore navigation
    if (showingFeedback) {
        console.log("Navigation blocked - feedback is showing");
        return;
    }
    
    // Check if we're at the end of all questions
    if (currentQuestionIndex >= currentQuestions.length - 1) {
        // No more questions, submit or stay at last question
        if (confirm('Bạn đã hoàn thành tất cả các câu hỏi. Bạn có muốn nộp bài?')) {
            submitQuiz();
        }
    } else {
        // Still have questions, go to next
        console.log("Moving to next question: " + (currentQuestionIndex + 1));
        currentQuestionIndex++;
        displayQuestion();
    }
}

function updateTimer() {
    const now = new Date();
    elapsedTime = Math.floor((now - startTime) / 1000);
    
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    timerElement.textContent = `Thời gian: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function submitQuiz() {
    // Stop the timer
    clearInterval(timer);
    
    // Check if there are still questions to repeat
    if (repeatQuestionsQueue.length > 0) {
        const confirmSubmit = confirm(`Bạn vẫn còn ${repeatQuestionsQueue.length} câu hỏi cần ôn tập lại. Bạn có chắc muốn nộp bài?`);
        if (!confirmSubmit) {
            // Restart the timer and return
            timer = setInterval(updateTimer, 1000);
            return;
        }
    }
    
    // Check if all questions are answered
    const unansweredCount = userAnswers.filter(answer => answer === null).length;
    if (unansweredCount > 0) {
        const confirmSubmit = confirm(`Bạn còn ${unansweredCount} câu hỏi chưa trả lời. Bạn có chắc muốn nộp bài?`);
        if (!confirmSubmit) {
            // Restart the timer and return
            timer = setInterval(updateTimer, 1000);
            return;
        }
    }
    
    // Calculate score
    const score = calculateScore();
    
    // Display results
    showResults(score);
}

function calculateScore() {
    let correctCount = 0;
    
    userAnswers.forEach((answer, index) => {
        if (answer === currentQuestions[index].correctAnswer) {
            correctCount++;
        }
    });
    
    return correctCount;
}

// New function to calculate the number of correct answers for original questions only
function calculateOriginalCorrectAnswers() {
    let correctCount = 0;
    
    // Only count the original questions (not the repeated ones that were added later)
    for (let i = 0; i < originalQuestionCount; i++) {
        if (userAnswers[i] === currentQuestions[i].correctAnswer) {
            correctCount++;
        }
    }
    
    return correctCount;
}

function showResults(score) {
    if (score === undefined) {
        score = calculateScore();
    }
    
    hideAllSections();
    resultsContainer.classList.remove('hidden');
    
    // Update results title to include question set name
    const resultsTitle = resultsContainer.querySelector('h2');
    if (resultsTitle) {
        resultsTitle.textContent = `Kết quả - ${questionFileTitles[currentQuestionFile]}`;
    }
    
    // Calculate how many original questions were answered correctly
    const originalCorrectCount = calculateOriginalCorrectAnswers();
    
    // Display score - only show correct answers out of original chapter questions
    scoreElement.textContent = `${originalCorrectCount}/${originalQuestionCount}`;
    
    // Display time taken
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    timeTakenElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Clear previous results
    resultsDetails.innerHTML = '';
    
    // Add summary of correct/incorrect answers
    const summaryElement = document.createElement('div');
      // Include information about incorrect questions that were repeated
    const uniqueIncorrectCount = new Set(incorrectQuestions.map(q => q.questionIndex)).size;
    
    summaryElement.innerHTML = `
        <p>Số câu đúng: ${originalCorrectCount}</p>
        <p>Số câu sai: ${originalQuestionCount - originalCorrectCount}</p>
        <p>Số câu bạn đã làm sai và được ôn tập lại: ${uniqueIncorrectCount}</p>
        <p>Tỷ lệ đúng: ${Math.round((originalCorrectCount / originalQuestionCount) * 100)}%</p>
    `;
    
    // Add specific info about which questions were repeated
    if (uniqueIncorrectCount > 0) {
        const repeatedQuestionsElement = document.createElement('div');
        repeatedQuestionsElement.className = 'repeated-questions-summary';
        repeatedQuestionsElement.innerHTML = `<h4>Các câu hỏi đã được ôn tập lại:</h4>`;
        
        const repeatedList = document.createElement('ul');
        
        // Get unique repeated questions
        const uniqueRepeated = Array.from(new Set(incorrectQuestions.map(q => q.questionIndex)))
            .map(index => ({
                index: index + 1,
                text: currentQuestions[index].text
            }));
        
        uniqueRepeated.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `Câu ${item.index}: ${item.text.substring(0, 100)}${item.text.length > 100 ? '...' : ''}`;
            repeatedList.appendChild(listItem);
        });
        
        repeatedQuestionsElement.appendChild(repeatedList);
        summaryElement.appendChild(repeatedQuestionsElement);
    }
    
    resultsDetails.appendChild(summaryElement);
}

function showReview() {
    hideAllSections();
    reviewContainer.classList.remove('hidden');
    
    // Update review title to include question set name
    const reviewTitle = reviewContainer.querySelector('h2');
    if (reviewTitle) {
        reviewTitle.textContent = `Xem lại bài làm - ${questionFileTitles[currentQuestionFile]}`;
    }
    
    // Clear previous review
    reviewQuestions.innerHTML = '';
    
    // Generate review content for regular questions
    currentQuestions.forEach((question, index) => {
        const userAnswer = userAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const questionElement = document.createElement('div');
        questionElement.className = 'review-question';
        questionElement.textContent = `${index + 1}. ${question.text}`;
        
        // Check if this question was repeated due to incorrect answer
        const wasRepeated = incorrectQuestions.some(q => q.questionIndex === index);
        if (wasRepeated) {
            const repeatBadge = document.createElement('span');
            repeatBadge.className = 'repeat-badge';
            repeatBadge.textContent = ' (Đã ôn tập lại)';
            questionElement.appendChild(repeatBadge);
        }
        
        reviewItem.appendChild(questionElement);
        
        const optionsElement = document.createElement('div');
        optionsElement.className = 'review-options';
        
        // Display each option
        question.options.forEach((option, optIndex) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'review-option';
            
            // Mark user's answer and correct answer
            if (optIndex === userAnswer) {
                optionElement.classList.add('user-answer');
                if (isCorrect) {
                    optionElement.classList.add('correct-answer');
                } else {
                    optionElement.classList.add('wrong-answer');
                }
            } else if (optIndex === question.correctAnswer) {
                optionElement.classList.add('correct-answer');
            }
            
            optionElement.textContent = `${String.fromCharCode(65 + optIndex)}. ${option}`;
            optionsElement.appendChild(optionElement);
        });
        
        reviewItem.appendChild(optionsElement);
        reviewQuestions.appendChild(reviewItem);
    });
}

function restartQuiz() {
    // Ask if the user wants to change the question file
    const changeFile = confirm('Bạn có muốn đổi sang bộ câu hỏi khác không?');
    
    if (changeFile) {
        // Set the previous screen to return to
        previousScreen = 'modes';
        // Show the back button
        backFromFileBtn.style.display = 'inline-flex';
        
        // Go back to file selection
        hideAllSections();
        document.querySelector('.file-selection').classList.remove('hidden');
    } else {
        // Just go back to mode selection for the current file
        hideAllSections();
        document.querySelector('.modes').classList.remove('hidden');
        // Update UI elements to show current file
        updateUIWithSelectedFile(currentQuestionFile);
    }
    
    // Reset navigation panel state
    navigationPanelVisible = true;
}

function backToMainScreen() {
    // Check if the user is in the middle of a quiz and wants to go back
    if (currentQuestionIndex > 0 || (currentQuestionIndex === 0 && userAnswers[0] !== null)) {
        if (confirm('Bạn có chắc muốn quay lại màn hình chính? Tiến trình làm bài sẽ bị mất.')) {
            // Stop the timer if it's running
            if (timer) {
                clearInterval(timer);
            }
            
            // Reset all quiz data
            currentQuestions = [];
            currentQuestionIndex = 0;
            userAnswers = [];
            incorrectQuestions = [];
            repeatQuestionsQueue = [];
            elapsedTime = 0;
            
            // Reset navigation panel state
            navigationPanelVisible = true;
            
            // Ask if they want to change question file
            const changeFile = confirm('Bạn có muốn đổi sang bộ câu hỏi khác không?');
            
            if (changeFile) {
                // Set the previous screen to return to
                previousScreen = 'modes';
                // Show the back button
                backFromFileBtn.style.display = 'inline-flex';
                
                hideAllSections();
                document.querySelector('.file-selection').classList.remove('hidden');
            } else {
                hideAllSections();
                document.querySelector('.modes').classList.remove('hidden');
                // Update UI elements to show current file
                updateUIWithSelectedFile(currentQuestionFile);
            }
        }
    } else {
        // If the user hasn't started answering questions yet, just ask if they want to change file
        const changeFile = confirm('Bạn có muốn đổi sang bộ câu hỏi khác không?');
        
        if (changeFile) {
            // Set the previous screen to return to
            previousScreen = 'modes';
            // Show the back button
            backFromFileBtn.style.display = 'inline-flex';
            
            hideAllSections();
            document.querySelector('.file-selection').classList.remove('hidden');
        } else {
            hideAllSections();
            document.querySelector('.modes').classList.remove('hidden');
            // Update UI elements to show current file
            updateUIWithSelectedFile(currentQuestionFile);
        }
    }
}

function updateNavigationButtons() {
    // Update navigation buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    
    // Next button should be enabled if we're not at the end or if we have repeat questions
    const atEnd = currentQuestionIndex === currentQuestions.length - 1;
    const hasRepeatQuestions = repeatQuestionsQueue.length > 0;
    nextBtn.disabled = atEnd && !hasRepeatQuestions;
    
    // Update submit button visibility
    if (atEnd && !hasRepeatQuestions) {
        submitBtn.classList.remove('hidden');
    } else {
        submitBtn.classList.add('hidden');
    }
}

function generateNavigationGrid() {
    // Clear any existing navigation buttons
    questionNavigationGrid.innerHTML = '';
    
    // Create a button for each question
    currentQuestions.forEach((_, index) => {
        const navButton = document.createElement('button');
        navButton.className = 'nav-question-btn';
        navButton.textContent = index + 1;
        
        // Mark current question
        if (index === currentQuestionIndex) {
            navButton.classList.add('current');
        }
        
        // Mark answered questions
        if (userAnswers[index] !== null) {
            navButton.classList.add('answered');
        }
        
        // Add click event to navigate to the question
        navButton.addEventListener('click', () => {
            // Only navigate if not showing feedback
            if (!showingFeedback) {
                currentQuestionIndex = index;
                displayQuestion();
            }
        });
        
        questionNavigationGrid.appendChild(navButton);
    });
    
    // Show the navigation panel
    questionNavigationPanel.classList.remove('hidden');
}

function updateNavigationGrid() {
    // Update all navigation buttons
    const navButtons = questionNavigationGrid.querySelectorAll('.nav-question-btn');
    
    navButtons.forEach((button, index) => {
        // Clear existing classes
        button.classList.remove('current', 'answered');
        
        // Mark current question
        if (index === currentQuestionIndex) {
            button.classList.add('current');
        }
        
        // Mark answered questions
        if (userAnswers[index] !== null) {
            button.classList.add('answered');
        }
    });
}

function toggleNavigationPanel() {
    navigationPanelVisible = !navigationPanelVisible;
    
    if (navigationPanelVisible) {
        questionNavigationPanel.classList.remove('hidden');
    } else {
        questionNavigationPanel.classList.add('hidden');
    }
}

// Alert about how to use the application once it loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're running locally (file://) or on a server
    if (window.location.protocol === 'file:') {
        setTimeout(() => {
            alert('Lưu ý: Ứng dụng đang chạy ở chế độ file cục bộ, một số tính năng có thể không hoạt động. Để có trải nghiệm tốt nhất, vui lòng đặt các file vào máy chủ web.');
        }, 1000);
    }
});

function updateChapterButtonsWithCount() {
    // Get all chapter buttons
    const chapterButtons = document.querySelectorAll('.chapter-btn');
    
    // Update each button with the question count
    chapterButtons.forEach(button => {
        const chapterNumber = button.getAttribute('data-chapter');
        const questionsInChapter = chapters[chapterNumber] ? chapters[chapterNumber].length : 0;
        
        // Update button text to include question count
        button.innerHTML = `Chương ${chapterNumber} <span class="question-count">(${questionsInChapter} câu)</span>`;
    });
}

// Add a function to update chapter title with question count in quiz mode
function updateQuizTitleWithCount(chapterNumber) {
    const questionsInChapter = chapters[chapterNumber] ? chapters[chapterNumber].length : 0;
    quizTitle.textContent = `Ôn luyện Chương ${chapterNumber} (${questionsInChapter} câu)`;
}

// Function to visually indicate which file is currently selected
function updateActiveFileButton(fileName) {
    // First, remove active class from all file buttons
    ktctFileBtn.classList.remove('active-file');
    nlmktFileBtn.classList.remove('active-file');
    
    // Then, add active class to the selected file button
    if (fileName === 'ktct.txt') {
        ktctFileBtn.classList.add('active-file');
    } else if (fileName === 'nlmkt.txt') {
        nlmktFileBtn.classList.add('active-file');
    }
}

// Function to handle question count selection for NLMKT
function selectQuestionCount(count) {
    selectedQuestionCount = count;
    
    // Update the visual selection
    nlmkt40Btn.classList.remove('selected');
    nlmkt50Btn.classList.remove('selected');
    
    if (count === 40) {
        nlmkt40Btn.classList.add('selected');
    } else if (count === 50) {
        nlmkt50Btn.classList.add('selected');
    }
    
    // Update the random mode button text
    updateRandomModeButton();
}

// Function to update the random mode button text based on current file and selected count
function updateRandomModeButton() {
    if (currentQuestionFile === 'nlmkt.txt') {
        randomModeBtn.innerHTML = `Ôn luyện ngẫu nhiên <span class="question-count">(${selectedQuestionCount}/${questions.length} câu)</span>`;
    } else {
        randomModeBtn.innerHTML = `Ôn luyện ngẫu nhiên <span class="question-count">(40/${questions.length} câu)</span>`;
    }
}

// Function to show/hide NLMKT options based on selected file
function toggleNLMKTOptions() {
    if (currentQuestionFile === 'nlmkt.txt') {
        nlmktOptions.classList.remove('hidden');
        // Set default selection if none is selected
        if (!nlmkt40Btn.classList.contains('selected') && !nlmkt50Btn.classList.contains('selected')) {
            selectQuestionCount(40); // Default to 40
        }
    } else {
        nlmktOptions.classList.add('hidden');
        selectedQuestionCount = 40; // Reset to default for KTCT
    }
}

// Function to show random chapter selection
function showRandomChapterSelection() {
    // Only allow this feature for KTCT (not for NLMKT)
    if (currentQuestionFile !== 'ktct.txt') {
        alert('Chức năng này chỉ áp dụng cho bộ câu hỏi Kinh tế Chính trị.');
        return;
    }
    
    hideAllSections();
    randomChapterSelection.classList.remove('hidden');
    
    // Generate chapter buttons dynamically
    const chapterButtonsContainer = randomChapterSelection.querySelector('.random-chapter-buttons');
    chapterButtonsContainer.innerHTML = ''; // Clear existing buttons
    
    const chapterNumbers = Object.keys(chapters).sort((a, b) => parseInt(a) - parseInt(b));
    
    chapterNumbers.forEach(chapter => {
        const questionCount = chapters[chapter].length;
        const button = document.createElement('button');
        button.className = 'chapter-btn';
        button.setAttribute('data-chapter', chapter);
        button.innerHTML = `Chương ${chapter} <span class="question-count">(${questionCount} câu)</span>`;
        
        button.addEventListener('click', () => startRandomChapterMode(chapter));
        
        chapterButtonsContainer.appendChild(button);
    });
}

// Function to start random questions from a specific chapter
function startRandomChapterMode(chapterNumber) {
    console.log(`Starting random mode for chapter ${chapterNumber} with ${randomChapterQuestionCount} questions`);
    
    // Get the questions for the selected chapter
    const chapterQuestions = chapters[chapterNumber] || [];
    
    if (chapterQuestions.length === 0) {
        alert(`Không có câu hỏi cho Chương ${chapterNumber}. Vui lòng kiểm tra lại nội dung file câu hỏi.`);
        return;
    }
    
    // Check if we have enough questions
    if (chapterQuestions.length < randomChapterQuestionCount) {
        const confirmContinue = confirm(`Chương ${chapterNumber} chỉ có ${chapterQuestions.length} câu hỏi, ít hơn ${randomChapterQuestionCount} câu đã chọn. Bạn có muốn tiếp tục với tất cả ${chapterQuestions.length} câu không?`);
        if (!confirmContinue) {
            return;
        }
        // If user confirms, use all available questions
        currentQuestions = [...chapterQuestions];
    } else {
        // Get random questions from the chapter
        currentQuestions = getRandomQuestions(chapterQuestions, randomChapterQuestionCount);
    }
    
    // Initialize quiz state
    originalQuestionCount = currentQuestions.length;
    userAnswers = Array(currentQuestions.length).fill(null);
    currentQuestionIndex = 0;
    incorrectQuestions = [];
    repeatQuestionsQueue = [];
    
    // Update quiz title
    quizTitle.textContent = `Kinh tế Chính trị - Chương ${chapterNumber} (${currentQuestions.length} câu ngẫu nhiên)`;
    
    // Start the quiz
    startQuiz();
}
