import * as XLSX from 'xlsx'; 

class StudentManager {
    constructor() {
        this.classes = []; 
        this.currentClassId = null; 
        this.selectedStudent = null; 
        this.predefinedBehaviors = [ 
            '主動協助同學',
            '積極發言',
            '作業準時繳交',
            '熱心助人',
            '分組表現優異',
            '上課不專心',
            '與同學爭吵',
            '遲交作業',
            '未帶文具',
            '影響他人'
        ];

        this.drawingModal = document.getElementById('drawing-modal');
        this.drawingModalCloseBtn = document.getElementById('drawing-modal-close');
        this.drawingClassNameSpan = document.getElementById('drawing-class-name');
        this.drawingAvailableCountSpan = document.getElementById('drawing-available-count');
        this.numToDrawInput = document.getElementById('num-to-draw');
        this.startDrawBtn = document.getElementById('start-draw-btn');
        this.resetDrawBtn = document.getElementById('reset-draw-btn');
        this.drawnStudentDisplay = document.getElementById('drawn-student-display');
        this.drawnStudentsList = document.getElementById('drawn-students-list');

        this.availableForDraw = []; 
        this.overallDrawnStudents = []; 

        this.countdownModal = document.getElementById('countdown-modal');
        this.countdownModalCloseBtn = document.getElementById('countdown-modal-close');
        this.countdownMinutesInput = document.getElementById('countdown-minutes-input');
        this.countdownSecondsInput = document.getElementById('countdown-seconds-input');
        this.countdownDisplay = document.getElementById('countdown-display');
        this.startCountdownBtn = document.getElementById('start-countdown-btn');
        this.pauseCountdownBtn = document.getElementById('pause-countdown-btn');
        this.resetCountdownBtn = document.getElementById('reset-countdown-btn');
        this.countdownControlBtns = document.querySelectorAll('.countdown-control-btn'); 
        this.countdownInterval = null; // Initialize countdown interval

        this.classStudentCountSpan = document.getElementById('class-student-count'); // NEW: student count display

        this.contactBookModal = document.getElementById('contact-book-modal');
        this.contactBookModalContent = this.contactBookModal.querySelector('.modal-content');
        this.contactBookModalCloseBtn = document.getElementById('contact-book-modal-close');
        this.prevDayBtn = document.getElementById('prev-day-btn');
        this.nextDayBtn = document.getElementById('next-day-btn');
        this.contactBookDateDisplay = document.getElementById('contact-book-date-display');
        this.importantInfoTextarea = document.getElementById('important-info-textarea');
        this.homeworkTextarea = document.getElementById('homework-textarea');
        this.saveContactBookBtn = document.getElementById('save-contact-book-btn');
        this.predefinedInfoSelect = document.getElementById('predefined-info-select'); 
        this.predefinedHomeworkSelect = document.getElementById('predefined-homework-select'); 
        this.showBlackboardBtn = document.getElementById('show-blackboard-btn'); 

        this.blackboardModal = document.getElementById('blackboard-modal');
        this.blackboardModalCloseBtn = document.getElementById('blackboard-modal-close');
        this.blackboardDateDisplay = document.getElementById('blackboard-date-display');
        this.blackboardImportantInfoDisplay = document.getElementById('blackboard-important-info-display');
        this.blackboardHomeworkDisplay = document.getElementById('blackboard-homework-display');

        this.currentContactBookDate = new Date(); 
        this.predefinedImportantInfos = [ 
            '明天帶美術用具',
            '下週一體育課請穿體育服',
            '繳交綜合活動學習單',
            '校外教學活動通知單已發放',
            '班級旅遊費用請於本週內繳交',
            '明天有數學小考',
            '參加語文競賽',
            '校園環境打掃活動'
        ];
        this.predefinedHomeworks = [ 
            '國語第1課生字',
            '圈詞',
            '查生字',
            '國語習作第1課',
            '數學課本第1頁',
            '數學習作P3~P5'
        ];

        this.homeworkCheckModal = document.getElementById('homework-check-modal');
        this.homeworkCheckModalCloseBtn = document.getElementById('homework-check-modal-close');
        this.homeworkCheckPrevDayBtn = document.getElementById('homework-check-prev-day-btn');
        this.homeworkCheckNextDayBtn = document.getElementById('homework-check-next-day-btn');
        this.homeworkCheckDateDisplay = document.getElementById('homework-check-date-display');
        this.homeworkCheckStudentsContainer = document.getElementById('homework-check-students-container');
        this.saveHomeworkCheckBtn = document.getElementById('save-homework-check-btn');
        this.homeworkToCheckSelect = document.getElementById('homework-to-check-select');

        this.currentHomeworkCheckDate = new Date();
        this.homeworkStatusCycle = ['submitted', 'not-submitted', 'to-be-corrected'];
        this.homeworkStatusDisplayText = {
            'submitted': '已繳交',
            'not-submitted': '未繳交',
            'to-be-corrected': '待訂正'
        };
        this.homeworkStatusReverseMap = {
            '已繳交': 'submitted',
            '未繳交': 'not-submitted',
            '待訂正': 'to-be-corrected'
        };
        this.selectedHomeworkItem = null;

        this.studentsPerRow = localStorage.getItem('studentsPerRow') ? 
                              parseInt(localStorage.getItem('studentsPerRow'), 10) : 4; 

        this.settingsModal = document.getElementById('settings-modal');
        this.settingsModalCloseBtn = document.getElementById('settings-modal-close');
        this.predefinedBehaviorsInput = document.getElementById('predefined-behaviors-input');
        this.predefinedInfoInput = document.getElementById('predefined-info-input');
        this.predefinedHomeworkInput = document.getElementById('predefined-homework-input');
        this.saveSettingsBtn = document.getElementById('save-settings-btn');

        this.importExcelBtn = document.getElementById('import-excel-btn');
        this.excelFileInput = document.getElementById('excel-file-input');

        this.addStudentsTextBtn = document.getElementById('add-students-text-btn');
        this.addStudentsTextWrapper = document.getElementById('add-students-text-wrapper');
        this.addStudentsTextarea = document.getElementById('add-students-textarea');
        this.confirmAddStudentsBtn = document.getElementById('confirm-add-students-btn');
        this.cancelAddStudentsBtn = document.getElementById('cancel-add-students-btn');

        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.drawSoundBuffer = null;
        this.countdownSoundBuffer = null; 
        this.loadSound('draw_sound.mp3', 'draw');
        this.loadSound('countdown_end_sound.mp3', 'countdown'); 

        this.init();
    }

    generateDefaultStudents() {
        const names = [
            '王小明', '李小華', '陳小美', '張志強', '林雅婷',
            '黃建宏', '吳佳穎', '劉俊傑', '蔡雅文', '鄭志豪',
            '謝美玲', '洪子軒', '葉淑芬', '沈家豪', '戴佳玲',
            '范志明', '曾雅雯', '呂建華', '蘇小芬', '許志偉'
        ];

        return names.map((name, index) => ({
            id: index + 1,
            name: name,
            score: 0,
            actions: [],
            avatar: name.charAt(0),
            notes: '', 
            onLeave: false 
        }));
    }

    generateDemoStudents() {
        const names = [
            '王小明', '李小華', '陳小美', '張志強', '林雅婷'
        ];
        return names.map((name, index) => ({
            id: Date.now() + index, 
            name: name,
            score: 0,
            actions: [],
            avatar: name.charAt(0),
            notes: '',
            onLeave: false
        }));
    }

    formatDateForStorage(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatDateForDisplay(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
    }

    formatDateFromDisplayToStorage(displayDateString) {
        if (!displayDateString) return null;
        const parts = displayDateString.split('/');
        if (parts.length === 3) {
            const year = parts[0];
            const month = parts[1].padStart(2, '0');
            const day = parts[2].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return null;
    }

    init() {
        console.log('StudentManager init started.');
        const grid = document.getElementById('students-grid');
        if (!grid) {
            console.error('Error: #students-grid element not found!');
            return;
        }
        console.log('#students-grid element found.');

        this.loadData();
        
        let shouldRenderStudentsExplicitly = true;

        if (this.classes.length === 0) {
            console.log('No classes found on first run — starting with no classes. Use 「新增班級」建立新班級。');
            // Keep currentClassId as null and allow user to add classes manually.
            this.currentClassId = null;
            shouldRenderStudentsExplicitly = true;
        } else {
            if (this.currentClassId === null || !this.classes.some(cls => cls.id === this.currentClassId)) {
                console.warn('currentClassId is invalid or not set, defaulting to first available class.');
                this.currentClassId = this.classes[0].id; 
                this.saveData(); 
            }

            this.classes.forEach(cls => {
                if (!cls.contactBookEntries) cls.contactBookEntries = {};
                if (!cls.homeworkCheckEntries) {
                    cls.homeworkCheckEntries = {};
                }
                cls.students.forEach(student => {
                    if (typeof student.notes === 'undefined') student.notes = '';
                    if (typeof student.onLeave === 'undefined') student.onLeave = false;
                });
                for (const dateKey in cls.homeworkCheckEntries) {
                    if (Object.hasOwnProperty.call(cls.homeworkCheckEntries, dateKey)) {
                        const dateEntry = cls.homeworkCheckEntries[dateKey];
                        const firstKey = Object.keys(dateEntry)[0];
                        if (firstKey && dateEntry[firstKey] && typeof dateEntry[firstKey].status !== 'undefined' && typeof dateEntry[firstKey].status === 'string') {
                             const migratedEntry = { '預設作業': {} };
                             for (const studentId in dateEntry) {
                                if (Object.hasOwnProperty.call(dateEntry, studentId)) {
                                    migratedEntry['預設作業'][studentId] = dateEntry[studentId];
                                }
                             }
                             cls.homeworkCheckEntries[dateKey] = migratedEntry;
                        }

                        for (const homeworkItem in cls.homeworkCheckEntries[dateKey]) {
                            if (Object.hasOwnProperty.call(cls.homeworkCheckEntries[dateKey], homeworkItem)) {
                                cls.students.forEach(student => {
                                    if (!cls.homeworkCheckEntries[dateKey][homeworkItem][student.id]) {
                                        cls.homeworkCheckEntries[dateKey][homeworkItem][student.id] = { status: 'submitted' }; 
                                    }
                                });
                            }
                        }
                    }
                }
            });
        }

        this.renderClassSelector();
        if (shouldRenderStudentsExplicitly) {
            this.renderStudents(); 
        }
        this.bindEvents();
        this.updateCurrentDate();
        this.updateTotalClassScore(); 
        this.updateCountdownDisplay(); 
        this.renderContactBook(); 
        this.initializeStudentsPerRowSelect(); 
        console.log('StudentManager init finished.');
    }

    addFirstTimeDemoClass(name) {
        const newClass = {
            id: Date.now(), 
            name: name,
            students: this.generateDemoStudents(), 
            contactBookEntries: {}, 
            homeworkCheckEntries: {} 
        };
        this.classes.push(newClass);
        this.currentClassId = newClass.id; 
        this.saveData(); 
        this.renderStudents(); 
        this.renderClassSelector(); 
        this.showToast(`已新增「${name}」班級，並載入示範學生`);
    }

    renderStudents() {
        const grid = document.getElementById('students-grid');
        grid.innerHTML = '';

        grid.setAttribute('data-cols', this.studentsPerRow);

        const currentClass = this.getCurrentClass();
        if (!currentClass) {
            grid.innerHTML = '<p class="no-students-message">請選擇或新增一個班級。</p>';
            this.updateTotalClassScore();
            this.updateClassInfoDisplay(); 
            return;
        }

        if (currentClass.students.length === 0) {
            grid.innerHTML = '<p class="no-students-message">班級中沒有學生，請點擊「匯入學生名單」新增學生。</p>';
            this.updateTotalClassScore(); 
            this.updateClassInfoDisplay(); 
            return;
        }

        const todayDateKey = this.formatDateForStorage(new Date()); // Get today's date for summary

        currentClass.students.forEach(student => {
            const homeworkSummary = this.getStudentHomeworkSummaryForDate(student.id, todayDateKey); // Calculate summary
            const card = this.createStudentCard(student, homeworkSummary); // Pass summary to create card
            grid.appendChild(card);
        });

        if (this.selectedStudent && this.selectedStudent.classId === currentClass.id) {
             this.selectStudent(this.selectedStudent.id);
        } else {
             this.selectedStudent = null; 
        }

        this.overallDrawnStudents.forEach(studentId => {
            const card = document.querySelector(`[data-student-id="${studentId}"]`);
            if (card) {
                card.classList.add('drawn');
            }
        });

        this.updateTotalClassScore(); 
        this.updateClassInfoDisplay();
    }

    createStudentCard(student, homeworkSummary) {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.dataset.studentId = student.id;

        const isDisabled = student.onLeave ? 'disabled' : '';

        // Determine score class based on score value
        let scoreClass = 'neutral';
        if (student.score > 0) {
            scoreClass = 'positive';
        } else if (student.score < 0) {
            scoreClass = 'negative';
        }

        // Default homeworkSummary if not provided (e.g., if a student card is created directly, though usually it comes from renderStudents)
        homeworkSummary = homeworkSummary || { notSubmitted: 0, toBeCorrected: 0 };

        card.innerHTML = `
            <button class="student-action-btn delete-student" title="刪除學生">🗑️</button>
            <div class="student-avatar">${student.avatar}</div>
            <div class="student-name">${student.name}</div>
            <div class="student-score ${scoreClass}">${student.score}</div>
            
            <div class="homework-summary">
                ${homeworkSummary.notSubmitted > 0 ? `<span class="homework-not-submitted">未繳交: ${homeworkSummary.notSubmitted}</span>` : ''}
                ${homeworkSummary.toBeCorrected > 0 ? `<span class="homework-to-be-corrected">待訂正: ${homeworkSummary.toBeCorrected}</span>` : ''}
            </div>

            <div class="student-actions">
                <button class="student-action-btn positive" data-points="1" data-type="positive" ${isDisabled}>+1</button>
                <button class="student-action-btn negative" data-points="1" data-type="negative" ${isDisabled}>-1</button>
                <button class="student-action-btn leave-toggle ${student.onLeave ? 'return' : ''}">${student.onLeave ? '返校' : '請假'}</button>
            </div>
            <div class="student-notes-section">
                <div class="notes-header">
                    <h4>特殊表現記錄</h4>
                    <label class="toggle-notes-label">
                        <input type="checkbox" class="toggle-notes-checkbox"> 顯示
                    </label>
                </div>
                <div class="notes-content-wrapper hidden">
                    <div class="notes-input-group">
                        <select class="predefined-notes-select" ${isDisabled}>
                            <option value="">請選擇常用表現</option>
                            ${this.predefinedBehaviors.map(behavior => `<option value="${behavior}">${behavior}</option>`).join('')}
                        </select>
                        <textarea class="student-notes-input" placeholder="記錄學生的特殊表現..." ${isDisabled}>${student.notes}</textarea>
                    </div>
                </div>
            </div>
        `;

        card.addEventListener('click', (event) => {
            if (!event.target.closest('.student-action-btn') && 
                !event.target.closest('.student-notes-input') && 
                !event.target.closest('.predefined-notes-select') &&
                !event.target.closest('.toggle-notes-label')) { 
                this.selectStudent(student.id);
            }
        });

        card.querySelector('.student-action-btn.positive').addEventListener('click', () => {
            if (!student.onLeave) {
                this.updateStudentScore(student.id, 1, '表現良好 (+1)');
            } else {
                this.showToast(`${student.name} 請假中，無法加分`);
            }
        });
        card.querySelector('.student-action-btn.negative').addEventListener('click', () => {
            if (!student.onLeave) {
                this.updateStudentScore(student.id, -1, '需要提醒 (-1)');
            } else {
                this.showToast(`${student.name} 請假中，無法扣分`);
            }
        });

        card.querySelector('.student-action-btn.leave-toggle').addEventListener('click', () => {
            this.toggleStudentLeave(student.id);
        });

        // NEW: delete student button
        card.querySelector('.student-action-btn.delete-student').addEventListener('click', (ev) => {
            ev.stopPropagation(); // prevent selecting the card
            this.deleteStudent(student.id);
        });

        const predefinedNotesSelect = card.querySelector('.predefined-notes-select');
        predefinedNotesSelect.addEventListener('change', (event) => {
            if (student.onLeave) {
                this.showToast(`${student.name} 請假中，無法記錄特殊表現`);
                event.target.value = ''; 
                return;
            }

            const selectedBehavior = event.target.value;
            if (selectedBehavior) { 
                const now = new Date();
                const formattedDate = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/'); 
                const newNoteEntry = `${formattedDate} ${selectedBehavior}`;

                if (student.notes.trim() === '') {
                    student.notes = newNoteEntry;
                } else {
                    student.notes += `\n${newNoteEntry}`;
                }
                
                card.querySelector('.student-notes-input').value = student.notes;
                this.saveData();
                this.showToast(`${student.name} 的特殊表現已更新：${selectedBehavior}`);
            }
            event.target.value = ''; 
        });

        const notesInput = card.querySelector('.student-notes-input');
        notesInput.addEventListener('change', (event) => { 
            if (!student.onLeave) {
                student.notes = event.target.value;
                this.saveData();
                this.showToast(`${student.name} 的特殊表現已更新`);
            } else {
                this.showToast(`${student.name} 請假中，無法記錄特殊表現`);
                event.target.value = student.notes; 
            }
        });

        const toggleNotesCheckbox = card.querySelector('.toggle-notes-checkbox');
        const notesContentWrapper = card.querySelector('.notes-content-wrapper');
        toggleNotesCheckbox.addEventListener('change', () => {
            if (toggleNotesCheckbox.checked) {
                notesContentWrapper.classList.remove('hidden');
            } else {
                notesContentWrapper.classList.add('hidden');
            }
        });

        return card;
    }

    loadData() {
        try {
            const data = localStorage.getItem('studentManagerData');
            if (data) {
                const parsedData = JSON.parse(data);
                this.classes = parsedData.classes || [];
                this.currentClassId = parsedData.currentClassId || null;
                this.predefinedBehaviors = parsedData.predefinedBehaviors || this.predefinedBehaviors;
                this.predefinedImportantInfos = parsedData.predefinedImportantInfos || this.predefinedImportantInfos;
                this.predefinedHomeworks = parsedData.predefinedHomeworks || this.predefinedHomeworks;
                this.studentsPerRow = parsedData.studentsPerRow || this.studentsPerRow;
                this.selectedHomeworkItem = parsedData.selectedHomeworkItem || null;
            }
        } catch (e) {
            console.error("Error loading data from localStorage:", e);
        }
    }

    saveData() {
        const dataToSave = {
            classes: this.classes,
            currentClassId: this.currentClassId,
            predefinedBehaviors: this.predefinedBehaviors,
            predefinedImportantInfos: this.predefinedImportantInfos,
            predefinedHomeworks: this.predefinedHomeworks,
            studentsPerRow: this.studentsPerRow,
            selectedHomeworkItem: this.selectedHomeworkItem,
        };
        try {
            localStorage.setItem('studentManagerData', JSON.stringify(dataToSave));
            console.log('Data saved successfully.');
        } catch (e) {
            console.error("Error saving data to localStorage:", e);
        }
    }

    // --- Utility Methods ---

    showToast(message, duration = 3000) {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('current-date');
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        dateElement.textContent = today.toLocaleDateString('zh-TW', options);
    }

    updateTotalClassScore() {
        const totalScoreElement = document.getElementById('total-class-score');
        const currentClass = this.getCurrentClass();
        if (currentClass) {
            const totalScore = currentClass.students.reduce((sum, student) => sum + student.score, 0);
            totalScoreElement.textContent = totalScore;
        } else {
            totalScoreElement.textContent = '0';
        }
    }

    updateClassInfoDisplay() {
        const classDisplayName = document.getElementById('class-display-name');
        const currentClass = this.getCurrentClass();
        if (currentClass) {
            classDisplayName.textContent = `班級：${currentClass.name}`;
            this.drawingClassNameSpan.textContent = currentClass.name; // Update drawing modal class name
            this.classStudentCountSpan.textContent = currentClass.students.length; // Update student count display
        } else {
            classDisplayName.textContent = '班級：未選擇';
            this.drawingClassNameSpan.textContent = '未選擇';
            this.classStudentCountSpan.textContent = '0'; // Update student count display
        }
    }

    getCurrentClass() {
        return this.classes.find(cls => cls.id === this.currentClassId);
    }

    getStudentHomeworkSummaryForDate(studentId, dateKey) {
        const currentClass = this.getCurrentClass();
        if (!currentClass || !currentClass.homeworkCheckEntries[dateKey]) {
            return { notSubmitted: 0, toBeCorrected: 0 };
        }

        const dateEntry = currentClass.homeworkCheckEntries[dateKey];
        let notSubmitted = 0;
        let toBeCorrected = 0;

        for (const homeworkItem in dateEntry) {
            if (Object.hasOwnProperty.call(dateEntry, homeworkItem)) {
                const studentStatusEntry = dateEntry[homeworkItem][studentId];
                if (studentStatusEntry) {
                    if (studentStatusEntry.status === 'not-submitted') {
                        notSubmitted++;
                    } else if (studentStatusEntry.status === 'to-be-corrected') {
                        toBeCorrected++;
                    }
                }
            }
        }
        return { notSubmitted, toBeCorrected };
    }

    // --- Class Management ---

    renderClassSelector() {
        const classSelect = document.getElementById('class-select');
        classSelect.innerHTML = ''; // Clear existing options

        if (this.classes.length === 0) {
            classSelect.innerHTML = '<option value="">無班級</option>';
            classSelect.disabled = true;
            document.getElementById('delete-class-btn').disabled = true;
            return;
        }

        classSelect.disabled = false;
        document.getElementById('delete-class-btn').disabled = false;

        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });

        // Set the current class as selected in the dropdown
        if (this.currentClassId) {
            classSelect.value = this.currentClassId;
        } else if (this.classes.length > 0) {
            this.currentClassId = this.classes[0].id; // Default to the first class if none selected
            classSelect.value = this.currentClassId;
            this.saveData();
        }
        this.updateClassInfoDisplay();
    }

    switchClass(classId) {
        this.currentClassId = parseInt(classId, 10);
        this.saveData();
        this.renderStudents();
        this.updateClassInfoDisplay();
        this.showToast(`已切換至班級：${this.getCurrentClass().name}`);

        // Reset drawing state when switching class
        this.resetDrawing();
    }

    addClass() {
        const className = prompt('請輸入新班級名稱：');
        if (className && className.trim() !== '') {
            if (this.classes.some(cls => cls.name === className.trim())) {
                this.showToast('班級名稱已存在，請使用不同名稱。', 3000);
                return;
            }
            const newClass = {
                id: Date.now(),
                name: className.trim(),
                students: [], // New classes start with no students
                contactBookEntries: {},
                homeworkCheckEntries: {}
            };
            this.classes.push(newClass);
            this.currentClassId = newClass.id;
            this.saveData();
            this.renderClassSelector();
            this.renderStudents(); // Re-render to show empty grid or new students
            this.showToast(`已新增班級：${className}`);
        }
    }

    deleteClass() {
        if (this.classes.length <= 1) {
            this.showToast('至少需要保留一個班級。', 3000);
            return;
        }

        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        if (confirm(`確定要刪除班級「${currentClass.name}」嗎？所有學生資料也將被刪除！`)) {
            this.classes = this.classes.filter(cls => cls.id !== currentClass.id);

            // After deletion, set currentClassId to the first available class
            if (this.classes.length > 0) {
                this.currentClassId = this.classes[0].id;
            } else {
                this.currentClassId = null; // No classes left
            }

            this.saveData();
            this.renderClassSelector();
            this.renderStudents();
            this.showToast(`班級「${currentClass.name}」已刪除。`);
        }
    }

    // --- Student Actions ---

    selectStudent(studentId) {
        const studentCards = document.querySelectorAll('.student-card');
        studentCards.forEach(card => card.classList.remove('selected'));

        const selectedCard = document.querySelector(`[data-student-id="${studentId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedStudent = {
                id: studentId,
                classId: this.currentClassId
            };
        } else {
            this.selectedStudent = null;
        }
    }

    updateStudentScore(studentId, points, actionDescription) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const student = currentClass.students.find(s => s.id === studentId);
        if (student) {
            student.score += points;
            
            const now = new Date();
            const formattedTime = now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false });
            student.actions.push({
                timestamp: now.toISOString(),
                description: `${formattedTime} ${actionDescription}`
            });

            this.saveData();
            this.renderStudents(); // Re-render to update score and potentially highlight selected card
        }
    }

    toggleStudentLeave(studentId) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const student = currentClass.students.find(s => s.id === studentId);
        if (student) {
            student.onLeave = !student.onLeave;
            
            const now = new Date();
            const formattedDate = now.toLocaleDateString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '/');
            const actionText = student.onLeave ? '請假' : '返校';
            const newNoteEntry = `${formattedDate} ${actionText}`;

            if (student.notes.trim() === '') {
                student.notes = newNoteEntry;
            } else {
                student.notes += `\n${newNoteEntry}`;
            }

            this.saveData();
            this.renderStudents(); 
            this.showToast(`${student.name} 已${actionText}。`);
        }
    }

    // NEW: Delete a student from the current class
    deleteStudent(studentId) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;
        const student = currentClass.students.find(s => s.id === studentId);
        if (!student) return;

        if (!confirm(`確定要刪除學生「${student.name}」嗎？此操作無法復原。`)) return;

        currentClass.students = currentClass.students.filter(s => s.id !== studentId);

        // Clean up drawn lists and homework entries referencing this student
        this.overallDrawnStudents = this.overallDrawnStudents.filter(id => id !== studentId);
        for (const dateKey in currentClass.homeworkCheckEntries) {
            if (Object.hasOwnProperty.call(currentClass.homeworkCheckEntries, dateKey)) {
                for (const homeworkItem in currentClass.homeworkCheckEntries[dateKey]) {
                    if (Object.hasOwnProperty.call(currentClass.homeworkCheckEntries[dateKey], homeworkItem)) {
                        delete currentClass.homeworkCheckEntries[dateKey][homeworkItem][studentId];
                    }
                }
            }
        }

        this.saveData();
        this.renderStudents();
        this.showToast(`學生「${student.name}」已刪除。`);
    }

    // --- File Operations ---

    addStudentsFromText() {
        const text = this.addStudentsTextarea.value || '';
        const lines = text.split('\n').map(l => l.trim()).filter(l => l !== '');
        if (lines.length === 0) {
            this.showToast('請在文字框中輸入至少一位學生姓名。', 2000);
            return;
        }
        const currentClass = this.getCurrentClass();
        if (!currentClass) {
            this.showToast('請先新增或選擇一個班級。', 3000);
            return;
        }
        const newStudents = lines.map((name, index) => ({
            id: Date.now() + Math.random() + index,
            name: name,
            score: 0,
            actions: [],
            avatar: name.charAt(0),
            notes: '',
            onLeave: false
        }));
        currentClass.students = [...currentClass.students, ...newStudents];
        this.saveData();
        this.renderStudents();
        this.addStudentsTextWrapper.style.display = 'none';
        this.addStudentsTextarea.value = '';
        this.showToast(`已加入 ${newStudents.length} 位學生至「${currentClass.name}」。`);
    }

    importAllData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData && importedData.classes) {
                    this.classes = importedData.classes;
                    this.currentClassId = importedData.currentClassId || (this.classes.length > 0 ? this.classes[0].id : null);
                    this.predefinedBehaviors = importedData.predefinedBehaviors || this.predefinedBehaviors;
                    this.predefinedImportantInfos = importedData.predefinedImportantInfos || this.predefinedImportantInfos;
                    this.predefinedHomeworks = importedData.predefinedHomeworks || this.predefinedHomeworks;
                    this.studentsPerRow = importedData.studentsPerRow || this.studentsPerRow;
                    this.selectedHomeworkItem = importedData.selectedHomeworkItem || null;
                    this.saveData();
                    this.renderClassSelector();
                    this.renderStudents();
                    this.showToast('所有資料已成功匯入！');
                } else {
                    this.showToast('匯入的資料格式不正確。', 3000);
                }
            } catch (error) {
                console.error('Error parsing imported data:', error);
                this.showToast('匯入檔案解析失敗，請確認檔案格式。', 3000);
            }
        };
        reader.readAsText(file);
        event.target.value = null; // Clear input for next import
    }

    exportAllData() {
        const data = {
            classes: this.classes,
            currentClassId: this.currentClassId,
            predefinedBehaviors: this.predefinedBehaviors,
            predefinedImportantInfos: this.predefinedImportantInfos,
            predefinedHomeworks: this.predefinedHomeworks,
            studentsPerRow: this.studentsPerRow,
            selectedHomeworkItem: this.selectedHomeworkItem,
        };
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'student_manager_data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.showToast('所有資料已匯出 (JSON)。');
    }

    async exportAllDataToExcel() {
        if (this.classes.length === 0) {
            this.showToast('沒有班級資料可匯出。', 3000);
            return;
        }

        const wb = XLSX.utils.book_new();

        this.classes.forEach(cls => {
            // Prepare student data for the current class
            const studentsData = cls.students.map(student => ({
                '學生ID': student.id,
                '姓名': student.name,
                '分數': student.score,
                '是否請假': student.onLeave ? '是' : '否',
                '特殊表現記錄': student.notes
                // Add more student fields if necessary
            }));

            // Create a worksheet for students
            const wsStudents = XLSX.utils.json_to_sheet(studentsData);
            XLSX.utils.book_append_sheet(wb, wsStudents, `${cls.name} 學生`);

            // Prepare contact book data for the current class
            const contactBookEntries = Object.entries(cls.contactBookEntries).map(([date, entry]) => ({
                '日期': date,
                '重要資訊': entry.importantInfo,
                '回家作業': entry.homework
            }));
            if (contactBookEntries.length > 0) {
                const wsContactBook = XLSX.utils.json_to_sheet(contactBookEntries);
                XLSX.utils.book_append_sheet(wb, wsContactBook, `${cls.name} 連絡簿`);
            }

            // Prepare homework check data for the current class
            const homeworkCheckRows = [];
            for (const dateKey in cls.homeworkCheckEntries) {
                if (Object.hasOwnProperty.call(cls.homeworkCheckEntries, dateKey)) {
                    const dateEntry = cls.homeworkCheckEntries[dateKey];
                    for (const homeworkItem in dateEntry) {
                        if (Object.hasOwnProperty.call(dateEntry, homeworkItem)) {
                            const row = {
                                '日期': dateKey,
                                '作業名稱': homeworkItem
                            };
                            cls.students.forEach(student => {
                                const status = dateEntry[homeworkItem][student.id]?.status;
                                row[student.name] = this.homeworkStatusDisplayText[status] || '';
                            });
                            homeworkCheckRows.push(row);
                        }
                    }
                }
            }
            if (homeworkCheckRows.length > 0) {
                const wsHomeworkCheck = XLSX.utils.json_to_sheet(homeworkCheckRows);
                XLSX.utils.book_append_sheet(wb, wsHomeworkCheck, `${cls.name} 作業檢查`);
            }
        });

        // Add a worksheet for predefined settings and other general app settings
        const settingsData = [
            { '類型': '特殊表現', '選項': this.predefinedBehaviors.join('\n') },
            { '類型': '重要資訊', '選項': this.predefinedImportantInfos.join('\n') },
            { '類型': '回家作業', '選項': this.predefinedHomeworks.join('\n') },
            { '類型': '每列學生數', '選項': this.studentsPerRow.toString() },
            { '類型': '最後選擇作業項目', '選項': this.selectedHomeworkItem || '' }
        ];
        const wsSettings = XLSX.utils.json_to_sheet(settingsData);
        XLSX.utils.book_append_sheet(wb, wsSettings, '系統設定');

        XLSX.writeFile(wb, '學生表現管理系統_所有資料.xlsx');
        this.showToast('所有資料已匯出 (Excel)。');
    }

    async importAllDataFromExcel(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                const importedClasses = [];
                let importedPredefinedBehaviors = [];
                let importedPredefinedImportantInfos = [];
                let importedPredefinedHomeworks = [];
                let importedStudentsPerRow = this.studentsPerRow; // Default to current if not found
                let importedSelectedHomeworkItem = this.selectedHomeworkItem; // Default to current if not found
                let currentClassIdAfterImport = null;

                // Process settings sheet first
                const settingsSheetName = workbook.SheetNames.find(name => name.includes('系統設定'));
                if (settingsSheetName) {
                    const ws = workbook.Sheets[settingsSheetName];
                    const json = XLSX.utils.sheet_to_json(ws);
                    json.forEach(row => {
                        if (row['類型'] === '特殊表現' && row['選項']) {
                            importedPredefinedBehaviors = row['選項'].split('\n').map(s => s.trim()).filter(s => s !== '');
                        } else if (row['類型'] === '重要資訊' && row['選項']) {
                            importedPredefinedImportantInfos = row['選項'].split('\n').map(s => s.trim()).filter(s => s !== '');
                        } else if (row['類型'] === '回家作業' && row['選項']) {
                            importedPredefinedHomeworks = row['選項'].split('\n').map(s => s.trim()).filter(s => s !== '');
                        } else if (row['類型'] === '每列學生數' && row['選項']) {
                            const parsedNum = parseInt(row['選項'], 10);
                            if (!isNaN(parsedNum) && parsedNum >= 2 && parsedNum <= 6) {
                                importedStudentsPerRow = parsedNum;
                            }
                        } else if (row['類型'] === '最後選擇作業項目' && row['選項']) {
                            importedSelectedHomeworkItem = row['選項'];
                        }
                    });
                }

                // Iterate through sheets to find classes and their data
                for (const sheetName of workbook.SheetNames) {
                    if (sheetName.includes('學生')) {
                        const className = sheetName.replace(' 學生', '').trim();
                        const ws = workbook.Sheets[sheetName];
                        const json = XLSX.utils.sheet_to_json(ws);

                        const students = json.map(row => ({
                            id: row['學生ID'] || Date.now() + Math.random(), // Generate ID if not present
                            name: row['姓名'],
                            score: parseInt(row['分數'] || 0, 10),
                            actions: [], // Actions are not typically imported as they are historical
                            avatar: (row['姓名'] ? row['姓名'].charAt(0) : '?'),
                            notes: row['特殊表現記錄'] || '',
                            onLeave: row['是否請假'] === '是'
                        })).filter(s => s.name); // Filter out students without names

                        if (students.length > 0) {
                            const newClass = {
                                id: Date.now() + Math.random(),
                                name: className,
                                students: students,
                                contactBookEntries: {},
                                homeworkCheckEntries: {}
                            };
                            importedClasses.push(newClass);
                        }
                    }
                }

                // Now, re-iterate to add contact book and homework data to the imported classes
                for (const sheetName of workbook.SheetNames) {
                    if (sheetName.includes('連絡簿')) {
                        const className = sheetName.replace(' 連絡簿', '').trim();
                        const targetClass = importedClasses.find(c => c.name === className);
                        if (targetClass) {
                            const ws = workbook.Sheets[sheetName];
                            const json = XLSX.utils.sheet_to_json(ws);
                            json.forEach(row => {
                                if (row['日期'] && (row['重要資訊'] || row['回家作業'])) {
                                    targetClass.contactBookEntries[row['日期']] = {
                                        importantInfo: row['重要資訊'] || '',
                                        homework: row['回家作業'] || ''
                                    };
                                }
                            });
                        }
                    } else if (sheetName.includes('作業檢查')) {
                        const className = sheetName.replace(' 作業檢查', '').trim();
                        const targetClass = importedClasses.find(c => c.name === className);
                        if (targetClass) {
                            const ws = workbook.Sheets[sheetName];
                            const json = XLSX.utils.sheet_to_json(ws);
                            json.forEach(row => {
                                const dateKey = row['日期'];
                                const homeworkItem = row['作業名稱'];
                                if (dateKey && homeworkItem) {
                                    if (!targetClass.homeworkCheckEntries[dateKey]) {
                                        targetClass.homeworkCheckEntries[dateKey] = {};
                                    }
                                    if (!targetClass.homeworkCheckEntries[dateKey][homeworkItem]) {
                                        targetClass.homeworkCheckEntries[dateKey][homeworkItem] = {};
                                    }
                                    targetClass.students.forEach(student => {
                                        const statusText = row[student.name];
                                        const status = this.homeworkStatusReverseMap[statusText] || 'submitted'; // Default to submitted
                                        targetClass.homeworkCheckEntries[dateKey][homeworkItem][student.id] = { status: status };
                                    });
                                }
                            });
                        }
                    }
                }

                if (importedClasses.length > 0) {
                    this.classes = importedClasses;
                    this.currentClassId = importedClasses[0].id; // Set current class to the first imported one
                    currentClassIdAfterImport = importedClasses[0].id; // Store this for later use

                    if (importedPredefinedBehaviors.length > 0) this.predefinedBehaviors = importedPredefinedBehaviors;
                    if (importedPredefinedImportantInfos.length > 0) this.predefinedImportantInfos = importedPredefinedImportantInfos;
                    if (importedPredefinedHomeworks.length > 0) this.predefinedHomeworks = importedPredefinedHomeworks;
                    
                    this.studentsPerRow = importedStudentsPerRow; // Update students per row
                    this.selectedHomeworkItem = importedSelectedHomeworkItem; // Update selected homework item

                    this.saveData();
                    this.renderClassSelector();
                    this.renderStudents();
                    this.initializeStudentsPerRowSelect(); // Re-initialize the select dropdown
                    this.showToast('所有資料已成功從 Excel 匯入！');
                } else {
                    this.showToast('從 Excel 檔案中找不到有效的班級資料。', 3000);
                }

            } catch (error) {
                console.error('Error importing Excel data:', error);
                this.showToast('匯入 Excel 檔案失敗，請確認檔案格式。', 3000);
            } finally {
                event.target.value = null; // Clear input for next import
            }
        };
        reader.readAsArrayBuffer(file);
    }

    // --- Drawing Modal ---

    openDrawingModal() {
        this.drawingModal.classList.add('show');
        this.prepareDrawing();
    }

    closeDrawingModal() {
        this.drawingModal.classList.remove('show');
    }

    prepareDrawing() {
        const currentClass = this.getCurrentClass();
        if (!currentClass || currentClass.students.length === 0) {
            this.drawingClassNameSpan.textContent = '無可用班級';
            this.drawingAvailableCountSpan.textContent = '0';
            this.numToDrawInput.disabled = true;
            this.startDrawBtn.disabled = true;
            this.resetDrawBtn.disabled = true;
            this.drawnStudentDisplay.innerHTML = '<p class="placeholder-text">班級中沒有學生可供抽籤</p>';
            this.drawnStudentsList.innerHTML = '';
            return;
        }

        // Filter out students who are on leave
        this.availableForDraw = currentClass.students.filter(s => !s.onLeave && !this.overallDrawnStudents.includes(s.id));
        this.drawingClassNameSpan.textContent = currentClass.name;
        this.drawingAvailableCountSpan.textContent = this.availableForDraw.length;
        this.numToDrawInput.max = this.availableForDraw.length > 0 ? this.availableForDraw.length : 1;
        this.numToDrawInput.disabled = this.availableForDraw.length === 0;
        this.startDrawBtn.disabled = this.availableForDraw.length === 0;
        this.resetDrawBtn.disabled = this.overallDrawnStudents.length === 0;

        this.renderDrawnStudentsList();
    }

    startDrawing() {
        if (this.availableForDraw.length === 0) {
            this.showToast('沒有學生可供抽籤了！', 2000);
            return;
        }

        const numToDraw = Math.min(parseInt(this.numToDrawInput.value, 10) || 1, this.availableForDraw.length);
        if (numToDraw <= 0) return;

        const drawnStudentsThisRound = [];
        for (let i = 0; i < numToDraw; i++) {
            const randomIndex = Math.floor(Math.random() * this.availableForDraw.length);
            const drawnStudent = this.availableForDraw.splice(randomIndex, 1)[0]; // Remove from available
            drawnStudentsThisRound.push(drawnStudent);
            this.overallDrawnStudents.push(drawnStudent.id); // Add to overall drawn list
        }

        this.drawnStudentDisplay.innerHTML = drawnStudentsThisRound.map(s => `<p class="drawn-name">${s.name}</p>`).join('');
        this.renderStudents(); // Re-render main grid to highlight drawn students
        this.renderDrawnStudentsList();
        this.prepareDrawing(); // Update available count and button states
        this.playSound('draw');
    }

    resetDrawing() {
        this.overallDrawnStudents = [];
        this.drawnStudentDisplay.innerHTML = '<p class="placeholder-text">點擊「開始抽籤」</p>';
        this.renderStudents(); // Remove drawn highlights from main grid
        this.prepareDrawing(); // Reset available students and counts
        this.showToast('抽籤狀態已重置。');
    }

    renderDrawnStudentsList() {
        this.drawnStudentsList.innerHTML = '';
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        this.overallDrawnStudents.forEach(studentId => {
            const student = currentClass.students.find(s => s.id === studentId);
            if (student) {
                const li = document.createElement('li');
                li.textContent = student.name;
                this.drawnStudentsList.appendChild(li);
            }
        });
    }

    // --- Countdown Modal ---

    openCountdownModal() {
        this.countdownModal.classList.add('show');
        this.updateCountdownDisplay();
    }

    closeCountdownModal() {
        this.countdownModal.classList.remove('show');
        this.stopCountdown();
    }

    updateCountdownDisplay() {
        const minutes = parseInt(this.countdownMinutesInput.value, 10);
        const seconds = parseInt(this.countdownSecondsInput.value, 10);
        const formattedMinutes = String(minutes).padStart(2, '0');
        const formattedSeconds = String(seconds).padStart(2, '0');
        this.countdownDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
    }

    startCountdown() {
        if (this.countdownInterval) return;

        let totalSeconds = parseInt(this.countdownMinutesInput.value, 10) * 60 + parseInt(this.countdownSecondsInput.value, 10);
        if (totalSeconds <= 0) {
            this.showToast('請設定有效的倒數時間。', 2000);
            return;
        }

        this.startCountdownBtn.disabled = true;
        this.pauseCountdownBtn.disabled = false;
        this.countdownControlBtns.forEach(btn => btn.disabled = true); // Disable manual input controls

        this.countdownInterval = setInterval(() => {
            totalSeconds--;
            if (totalSeconds < 0) {
                this.stopCountdown();
                this.countdownDisplay.textContent = '00:00';
                this.playSound('countdown');
                this.showToast('倒數計時結束！', 3000);
                return;
            }

            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            this.countdownMinutesInput.value = minutes;
            this.countdownSecondsInput.value = seconds;
            this.updateCountdownDisplay();
        }, 1000);
    }

    pauseCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
            this.startCountdownBtn.disabled = false;
            this.pauseCountdownBtn.disabled = true;
            this.countdownControlBtns.forEach(btn => btn.disabled = false); // Re-enable manual input controls
            this.showToast('倒數計時已暫停。');
        }
    }

    resetCountdown() {
        this.stopCountdown();
        this.countdownMinutesInput.value = 5;
        this.countdownSecondsInput.value = 0;
        this.updateCountdownDisplay();
        this.startCountdownBtn.disabled = false;
        this.pauseCountdownBtn.disabled = true;
        this.countdownControlBtns.forEach(btn => btn.disabled = false); // Re-enable manual input controls
        this.showToast('倒數計時已重置。');
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    // --- Contact Book Modal ---

    openContactBookModal() {
        this.contactBookModal.classList.add('show');
        this.currentContactBookDate = new Date(); // Reset to current date on open
        this.renderContactBook();
        this.populatePredefinedContactBookOptions();
    }

    closeContactBookModal() {
        this.contactBookModal.classList.remove('show');
    }

    renderContactBook() {
        const formattedDateKey = this.formatDateForStorage(this.currentContactBookDate);
        const currentClass = this.getCurrentClass();
        const entry = currentClass?.contactBookEntries?.[formattedDateKey] || { importantInfo: '', homework: '' };

        this.contactBookDateDisplay.textContent = this.currentContactBookDate.toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        });
        this.importantInfoTextarea.value = entry.importantInfo;
        this.homeworkTextarea.value = entry.homework;
    }

    changeContactBookDay(offset) {
        this.currentContactBookDate.setDate(this.currentContactBookDate.getDate() + offset);
        this.renderContactBook();
    }

    saveContactBookEntry() {
        const currentClass = this.getCurrentClass();
        if (!currentClass) {
            this.showToast('請選擇一個班級。', 3000);
            return;
        }

        const formattedDateKey = this.formatDateForStorage(this.currentContactBookDate);
        currentClass.contactBookEntries[formattedDateKey] = {
            importantInfo: this.importantInfoTextarea.value,
            homework: this.homeworkTextarea.value
        };
        this.saveData();
        this.showToast('連絡簿記錄已保存。');
    }

    populatePredefinedContactBookOptions() {
        // Important Info
        this.predefinedInfoSelect.innerHTML = '<option value="">請選擇重要資訊</option>' + 
            this.predefinedImportantInfos.map(info => `<option value="${info}">${info}</option>`).join('');

        // Homework
        this.predefinedHomeworkSelect.innerHTML = '<option value="">請選擇回家作業</option>' + 
            this.predefinedHomeworks.map(homework => `<option value="${homework}">${homework}</option>`).join('');
    }

    // --- Blackboard Modal ---

    openBlackboardModal() {
        this.blackboardModal.classList.add('show');
        this.renderBlackboardContent();
    }

    closeBlackboardModal() {
        this.blackboardModal.classList.remove('show');
    }

    renderBlackboardContent() {
        const formattedDateKey = this.formatDateForStorage(this.currentContactBookDate);
        const currentClass = this.getCurrentClass();
        const entry = currentClass?.contactBookEntries?.[formattedDateKey] || { importantInfo: '無', homework: '無' };

        this.blackboardDateDisplay.textContent = this.currentContactBookDate.toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        });
        this.blackboardImportantInfoDisplay.textContent = entry.importantInfo || '無';
        this.blackboardHomeworkDisplay.textContent = entry.homework || '無';
    }

    // --- Homework Check Modal ---

    openHomeworkCheckModal() {
        this.homeworkCheckModal.classList.add('show');
        this.currentHomeworkCheckDate = new Date(); // Reset to current date on open
        this.renderHomeworkCheck();
        this.populateHomeworkToCheckSelect();
    }

    closeHomeworkCheckModal() {
        this.homeworkCheckModal.classList.remove('show');
    }

    renderHomeworkCheck() {
        const currentClass = this.getCurrentClass();
        if (!currentClass || currentClass.students.length === 0) {
            this.homeworkCheckStudentsContainer.innerHTML = '<p class="no-students-message">班級中沒有學生。</p>';
            this.homeworkCheckDateDisplay.textContent = this.currentHomeworkCheckDate.toLocaleDateString('zh-TW', {
                year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
            });
            this.homeworkToCheckSelect.disabled = true;
            this.saveHomeworkCheckBtn.disabled = true;
            return;
        }

        this.homeworkToCheckSelect.disabled = false;
        this.saveHomeworkCheckBtn.disabled = false;

        this.homeworkCheckDateDisplay.textContent = this.currentHomeworkCheckDate.toLocaleDateString('zh-TW', {
            year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
        });

        this.renderHomeworkCheckStudentGrid();
    }

    changeHomeworkCheckDay(offset) {
        this.currentHomeworkCheckDate.setDate(this.currentHomeworkCheckDate.getDate() + offset);
        this.renderHomeworkCheck();
        this.populateHomeworkToCheckSelect(); // Update homework options for the new date
    }

    populateHomeworkToCheckSelect() {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const yesterday = new Date(this.currentHomeworkCheckDate);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayDateKey = this.formatDateForStorage(yesterday);
        
        const yesterdayContactBookEntry = currentClass.contactBookEntries[yesterdayDateKey];
        const homeworkFromYesterdayFull = yesterdayContactBookEntry ? yesterdayContactBookEntry.homework : '';

        // Clear previous options
        this.homeworkToCheckSelect.innerHTML = '<option value="">請選擇或查看作業項目</option>';

        const addedHomeworkItems = new Set(); // To track unique homework items added to the select

        // Add homework items from yesterday's contact book
        if (homeworkFromYesterdayFull.trim() !== '') {
            const homeworkItems = homeworkFromYesterdayFull.split('\n').map(item => item.trim()).filter(item => item !== '');
            homeworkItems.forEach(item => {
                if (!addedHomeworkItems.has(item)) {
                    this.homeworkToCheckSelect.innerHTML += `<option value="${item}" data-source="contact-book">前一天聯絡簿：${item}</option>`;
                    addedHomeworkItems.add(item);
                }
            });
        }
        
        // If a homework item was previously selected for *this date*, re-select it
        if (this.selectedHomeworkItem && addedHomeworkItems.has(this.selectedHomeworkItem)) {
            this.homeworkToCheckSelect.value = this.selectedHomeworkItem;
        } else {
             // If no homework selected or previous selection is no longer valid, default to nothing selected
             this.homeworkToCheckSelect.value = '';
        }
        // Always re-render grid based on the (potentially new) selected value
        this.renderHomeworkCheckStudentGrid();
    }

    renderHomeworkCheckStudentGrid() {
        const currentClass = this.getCurrentClass();
        this.homeworkCheckStudentsContainer.innerHTML = ''; // Clear previous students

        if (!currentClass || currentClass.students.length === 0) {
            this.homeworkCheckStudentsContainer.innerHTML = '<p class="no-students-message">班級中沒有學生。</p>';
            return;
        }

        const selectedHomeworkValue = this.homeworkToCheckSelect.value;
        this.selectedHomeworkItem = selectedHomeworkValue; // Keep track of the selected homework
        this.saveData();

        if (selectedHomeworkValue === '') {
            currentClass.students.forEach(student => {
                const cell = document.createElement('div');
                cell.className = 'homework-student-cell disabled-for-homework';
                cell.dataset.studentId = student.id;
                cell.textContent = student.name;
                this.homeworkCheckStudentsContainer.appendChild(cell);
            });
            return;
        }

        const formattedDateKey = this.formatDateForStorage(this.currentHomeworkCheckDate);
        
        // Ensure the homework entry exists for the selected item and date
        if (!currentClass.homeworkCheckEntries[formattedDateKey]) {
            currentClass.homeworkCheckEntries[formattedDateKey] = {};
        }
        if (!currentClass.homeworkCheckEntries[formattedDateKey][selectedHomeworkValue]) {
            currentClass.homeworkCheckEntries[formattedDateKey][selectedHomeworkValue] = {};
        }

        currentClass.students.forEach(student => {
            // Get or initialize student's homework status for the selected item
            const studentHomeworkStatus = currentClass.homeworkCheckEntries[formattedDateKey][selectedHomeworkValue][student.id] || { status: 'submitted' };
            const statusClass = `status-${studentHomeworkStatus.status}`;
            const displayText = this.homeworkStatusDisplayText[studentHomeworkStatus.status];

            const cell = document.createElement('div');
            cell.className = `homework-student-cell ${statusClass}`;
            cell.dataset.studentId = student.id;
            cell.dataset.homeworkStatus = studentHomeworkStatus.status;
            cell.title = student.name; // Use title for full name on hover
            cell.innerHTML = `
                <span>${student.name}</span><br>
                <small>${displayText}</small>
            `;
            
            cell.addEventListener('click', () => {
                this.toggleHomeworkStatus(student.id, formattedDateKey, selectedHomeworkValue, cell);
            });
            this.homeworkCheckStudentsContainer.appendChild(cell);
        });
    }

    toggleHomeworkStatus(studentId, dateKey, homeworkItem, cellElement) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const currentStatus = cellElement.dataset.homeworkStatus;
        const currentIndex = this.homeworkStatusCycle.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % this.homeworkStatusCycle.length;
        const newStatus = this.homeworkStatusCycle[nextIndex];

        currentClass.homeworkCheckEntries[dateKey][homeworkItem][studentId] = { status: newStatus };
        this.saveData();

        cellElement.classList.remove(`status-${currentStatus}`);
        cellElement.classList.add(`status-${newStatus}`);
        cellElement.dataset.homeworkStatus = newStatus;
        cellElement.querySelector('small').textContent = this.homeworkStatusDisplayText[newStatus];
        this.showToast(`${currentClass.students.find(s => s.id === studentId).name} 的作業狀態已更新為「${this.homeworkStatusDisplayText[newStatus]}」。`, 1500);
        
        // After changing status, re-render the main student grid to update homework summary on cards
        this.renderStudents();
    }

    saveHomeworkCheckEntries() {
        // Data is already saved on each toggle, so this button mainly serves as a "Done" or explicit save confirmation.
        // Can add a check here if there are unsaved changes, but for now, it's just a confirmation.
        this.showToast('作業檢查記錄已保存。');
        this.closeHomeworkCheckModal();
    }

    // --- Settings Modal ---

    openSettingsModal() {
        this.settingsModal.classList.add('show');
        this.predefinedBehaviorsInput.value = this.predefinedBehaviors.join('\n');
        this.predefinedInfoInput.value = this.predefinedImportantInfos.join('\n');
        this.predefinedHomeworkInput.value = this.predefinedHomeworks.join('\n');
    }

    closeSettingsModal() {
        this.settingsModal.classList.remove('show');
    }

    saveSettings() {
        this.predefinedBehaviors = this.predefinedBehaviorsInput.value.split('\n').map(s => s.trim()).filter(s => s !== '');
        this.predefinedImportantInfos = this.predefinedInfoInput.value.split('\n').map(s => s.trim()).filter(s => s !== '');
        this.predefinedHomeworks = this.predefinedHomeworkInput.value.split('\n').map(s => s.trim()).filter(s => s !== '');
        this.saveData();
        this.renderStudents(); // Re-render to update notes dropdowns
        this.populatePredefinedContactBookOptions(); // Update contact book dropdowns
        this.showToast('設定已保存。');
        this.closeSettingsModal();
    }

    // --- Audio Playback ---
    async loadSound(url, type) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            if (type === 'draw') {
                this.drawSoundBuffer = audioBuffer;
            } else if (type === 'countdown') {
                this.countdownSoundBuffer = audioBuffer;
            }
        } catch (error) {
            console.error(`Error loading sound ${url}:`, error);
        }
    }

    playSound(type) {
        let buffer = null;
        if (type === 'draw' && this.drawSoundBuffer) {
            buffer = this.drawSoundBuffer;
        } else if (type === 'countdown' && this.countdownSoundBuffer) {
            buffer = this.countdownSoundBuffer;
        }

        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start(0);
        }
    }

    // --- Students Per Row ---
    initializeStudentsPerRowSelect() {
        document.getElementById('students-per-row-select').value = this.studentsPerRow;
    }

    setStudentsPerRow(numCols) {
        this.studentsPerRow = numCols;
        localStorage.setItem('studentsPerRow', numCols); // Save preference
        this.renderStudents(); // Re-render the grid with new column count
        this.showToast(`每列顯示 ${numCols} 位學生。`);
    }

    // --- Event Bindings ---

    bindEvents() {
        console.log('Binding events...');
        // Class management
        document.getElementById('class-select').addEventListener('change', (e) => this.switchClass(e.target.value));
        document.getElementById('add-class-btn').addEventListener('click', () => this.addClass());
        document.getElementById('delete-class-btn').addEventListener('click', () => this.deleteClass());

        // Utility buttons
        document.getElementById('draw-students-btn').addEventListener('click', () => this.openDrawingModal());
        document.getElementById('countdown-btn').addEventListener('click', () => this.openCountdownModal());
        document.getElementById('contact-book-btn').addEventListener('click', () => this.openContactBookModal());
        document.getElementById('homework-check-btn').addEventListener('click', () => this.openHomeworkCheckModal());
        document.getElementById('open-settings-btn').addEventListener('click', () => this.openSettingsModal());

        // Display options
        document.getElementById('students-per-row-select').addEventListener('change', (e) => this.setStudentsPerRow(parseInt(e.target.value, 10)));

        // File operations
        this.addStudentsTextBtn.addEventListener('click', () => {
            // Toggle display of the textarea panel
            if (this.addStudentsTextWrapper.style.display === 'none' || this.addStudentsTextWrapper.style.display === '') {
                this.addStudentsTextWrapper.style.display = 'block';
                this.addStudentsTextarea.focus();
            } else {
                this.addStudentsTextWrapper.style.display = 'none';
            }
        });
        this.confirmAddStudentsBtn.addEventListener('click', () => this.addStudentsFromText());
        this.cancelAddStudentsBtn.addEventListener('click', () => { this.addStudentsTextWrapper.style.display = 'none'; this.addStudentsTextarea.value = ''; });
        document.getElementById('excel-file-input').addEventListener('change', (e) => this.importAllDataFromExcel(e));

        // Drawing Modal events
        this.drawingModalCloseBtn.addEventListener('click', () => this.closeDrawingModal());
        this.startDrawBtn.addEventListener('click', () => this.startDrawing());
        this.resetDrawBtn.addEventListener('click', () => this.resetDrawing());
        this.numToDrawInput.addEventListener('change', () => this.prepareDrawing()); // Update max value if changed

        // Countdown Modal events
        this.countdownModalCloseBtn.addEventListener('click', () => this.closeCountdownModal());
        this.startCountdownBtn.addEventListener('click', () => this.startCountdown());
        this.pauseCountdownBtn.addEventListener('click', () => this.pauseCountdown());
        this.resetCountdownBtn.addEventListener('click', () => this.resetCountdown());
        this.countdownMinutesInput.addEventListener('input', () => this.updateCountdownDisplay());
        this.countdownSecondsInput.addEventListener('input', () => this.updateCountdownDisplay());
        this.countdownControlBtns.forEach(button => {
            button.addEventListener('click', (event) => {
                const action = event.currentTarget.dataset.action;
                const target = event.currentTarget.dataset.target;
                if (target === 'minutes') {
                    let minutes = parseInt(this.countdownMinutesInput.value, 10);
                    minutes = action === 'increment' ? Math.min(minutes + 1, 99) : Math.max(minutes - 1, 0);
                    this.countdownMinutesInput.value = minutes;
                } else if (target === 'seconds') {
                    let seconds = parseInt(this.countdownSecondsInput.value, 10);
                    seconds = action === 'increment' ? Math.min(seconds + 1, 59) : Math.max(seconds - 1, 0);
                    this.countdownSecondsInput.value = seconds;
                }
                this.updateCountdownDisplay();
            });
        });

        // Contact Book Modal events
        this.contactBookModalCloseBtn.addEventListener('click', () => this.closeContactBookModal());
        this.prevDayBtn.addEventListener('click', () => this.changeContactBookDay(-1));
        this.nextDayBtn.addEventListener('click', () => this.changeContactBookDay(1));
        this.saveContactBookBtn.addEventListener('click', () => this.saveContactBookEntry());
        this.predefinedInfoSelect.addEventListener('change', (e) => {
            const selectedInfo = e.target.value;
            if (selectedInfo) {
                // Append selected info with a new line if textarea is not empty
                this.importantInfoTextarea.value += (this.importantInfoTextarea.value.trim() !== '' ? '\n' : '') + selectedInfo;
            }
            e.target.value = ''; // Reset select after use
        });
        this.predefinedHomeworkSelect.addEventListener('change', (e) => {
            const selectedHomework = e.target.value;
            if (selectedHomework) {
                // Append selected homework with a new line if textarea is not empty
                this.homeworkTextarea.value += (this.homeworkTextarea.value.trim() !== '' ? '\n' : '') + selectedHomework;
            }
            e.target.value = ''; // Reset select after use
        });
        this.showBlackboardBtn.addEventListener('click', () => this.openBlackboardModal());

        // Blackboard Modal events
        this.blackboardModalCloseBtn.addEventListener('click', () => this.closeBlackboardModal());

        // Homework Check Modal events
        this.homeworkCheckModalCloseBtn.addEventListener('click', () => this.closeHomeworkCheckModal());
        this.homeworkCheckPrevDayBtn.addEventListener('click', () => this.changeHomeworkCheckDay(-1));
        this.homeworkCheckNextDayBtn.addEventListener('click', () => this.changeHomeworkCheckDay(1));
        this.homeworkToCheckSelect.addEventListener('change', () => this.renderHomeworkCheckStudentGrid());
        this.saveHomeworkCheckBtn.addEventListener('click', () => this.saveHomeworkCheckEntries());

        // Settings Modal events
        this.settingsModalCloseBtn.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());
    }
}

// Instantiate the manager when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const manager = new StudentManager();
});