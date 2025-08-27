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
            console.log('No classes found, adding first-time demo class.');
            this.addFirstTimeDemoClass('五年三班'); 
            shouldRenderStudentsExplicitly = false;
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

    loadData() {
        try {
            const data = localStorage.getItem('studentManagerData');
            if (data) {
                const parsedData = JSON.parse(data);
                this.classes = parsedData.classes || [];
                this.currentClassId = parsedData.currentClassId || null;

                const savedBehaviors = parsedData.predefinedBehaviors;
                const savedInfos = parsedData.predefinedImportantInfos;
                const savedHomework = parsedData.predefinedHomeworks;
                if (savedBehaviors) this.predefinedBehaviors = savedBehaviors;
                if (savedInfos) this.predefinedImportantInfos = savedInfos;
                if (savedHomework) this.predefinedHomeworks = savedHomework;
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    saveData() {
        try {
            const data = {
                classes: this.classes,
                currentClassId: this.currentClassId,
                predefinedBehaviors: this.predefinedBehaviors,
                predefinedImportantInfos: this.predefinedImportantInfos,
                predefinedHomeworks: this.predefinedHomeworks
            };
            localStorage.setItem('studentManagerData', JSON.stringify(data));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    getCurrentClass() {
        return this.classes.find(cls => cls.id === this.currentClassId);
    }

    updateCurrentDate() {
        const now = new Date();
        const dateString = now.toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            weekday: 'long'
        });
        document.getElementById('current-date').textContent = dateString;
    }

    updateTotalClassScore() {
        const currentClass = this.getCurrentClass();
        const totalScore = currentClass ? 
            currentClass.students.reduce((total, student) => total + student.score, 0) : 0;
        document.getElementById('total-class-score').textContent = totalScore;
    }

    updateClassInfoDisplay() {
        const currentClass = this.getCurrentClass();
        const className = currentClass ? currentClass.name : '無班級';
        const studentCount = currentClass ? currentClass.students.length : 0;
        
        document.getElementById('class-display-name').textContent = `班級：${className}`;
        this.classStudentCountSpan.textContent = studentCount;
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

        this.attachStudentCardEvents(card, student);
        return card;
    }

    attachStudentCardEvents(card, student) {
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
        const notesInput = card.querySelector('.student-notes-input');
        const toggleCheckbox = card.querySelector('.toggle-notes-checkbox');
        const notesContentWrapper = card.querySelector('.notes-content-wrapper');

        // Toggle notes visibility
        toggleCheckbox.addEventListener('change', (event) => {
            if (event.target.checked) {
                notesContentWrapper.classList.remove('hidden');
            } else {
                notesContentWrapper.classList.add('hidden');
            }
        });

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

                const currentNotes = notesInput.value.trim();
                const updatedNotes = currentNotes ? `${currentNotes}\n${newNoteEntry}` : newNoteEntry;
                
                notesInput.value = updatedNotes;
                this.updateStudentNotes(student.id, updatedNotes);
                event.target.value = ''; 
                this.showToast(`已記錄 ${student.name} 的表現：${selectedBehavior}`);
            }
        });

        notesInput.addEventListener('blur', () => {
            if (!student.onLeave) {
                this.updateStudentNotes(student.id, notesInput.value);
            }
        });
    }

    selectStudent(studentId) {
        document.querySelectorAll('.student-card').forEach(card => {
            card.classList.remove('selected');
        });

        const selectedCard = document.querySelector(`[data-student-id="${studentId}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            this.selectedStudent = { id: studentId, classId: this.currentClassId };
        }
    }

    updateStudentScore(studentId, points, reason) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const student = currentClass.students.find(s => s.id === studentId);
        if (!student) return;

        student.score += points;
        
        const action = {
            id: Date.now(),
            points: points,
            reason: reason,
            timestamp: new Date().toLocaleString('zh-TW')
        };
        
        student.actions.unshift(action);
        if (student.actions.length > 10) {
            student.actions = student.actions.slice(0, 10);
        }

        this.saveData();
        this.renderStudents();
        this.showToast(`${student.name} ${reason}`);
    }

    toggleStudentLeave(studentId) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const student = currentClass.students.find(s => s.id === studentId);
        if (!student) return;

        student.onLeave = !student.onLeave;
        this.saveData();
        this.renderStudents();
        
        const status = student.onLeave ? '請假' : '返校';
        this.showToast(`${student.name} 已標記為 ${status}`);
    }

    updateStudentNotes(studentId, notes) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const student = currentClass.students.find(s => s.id === studentId);
        if (!student) return;

        student.notes = notes;
        this.saveData();
    }

    deleteStudent(studentId) {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const studentIndex = currentClass.students.findIndex(s => s.id === studentId);
        if (studentIndex === -1) return;

        const student = currentClass.students[studentIndex];
        if (confirm(`確定要刪除學生 "${student.name}" 嗎？`)) {
            currentClass.students.splice(studentIndex, 1);
            this.saveData();
            this.renderStudents();
            this.showToast(`已刪除學生 ${student.name}`);
        }
    }

    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    bindEvents() {
        // Class management
        document.getElementById('add-class-btn').addEventListener('click', () => this.addClass());
        document.getElementById('delete-class-btn').addEventListener('click', () => this.deleteClass());
        document.getElementById('class-select').addEventListener('change', (e) => this.switchClass(parseInt(e.target.value)));

        // Modal events
        document.getElementById('draw-students-btn').addEventListener('click', () => this.openDrawingModal());
        document.getElementById('countdown-btn').addEventListener('click', () => this.openCountdownModal());
        document.getElementById('contact-book-btn').addEventListener('click', () => this.openContactBookModal());
        document.getElementById('homework-check-btn').addEventListener('click', () => this.openHomeworkCheckModal());
        document.getElementById('open-settings-btn').addEventListener('click', () => this.openSettingsModal());

        // Add students text functionality
        this.addStudentsTextBtn.addEventListener('click', () => {
            this.addStudentsTextWrapper.style.display = this.addStudentsTextWrapper.style.display === 'none' ? 'block' : 'none';
        });
        
        this.confirmAddStudentsBtn.addEventListener('click', () => this.addStudentsFromText());
        this.cancelAddStudentsBtn.addEventListener('click', () => {
            this.addStudentsTextWrapper.style.display = 'none';
            this.addStudentsTextarea.value = '';
        });

        // Export/Import
        document.getElementById('export-btn').addEventListener('click', () => this.exportData());
        document.getElementById('import-data-btn').addEventListener('click', () => document.getElementById('data-file-input').click());
        document.getElementById('data-file-input').addEventListener('change', (e) => this.importData(e));
        
        // Excel import/export
        document.getElementById('export-excel-btn').addEventListener('click', () => this.exportToExcel());
        this.importExcelBtn.addEventListener('click', () => this.excelFileInput.click());
        this.excelFileInput.addEventListener('change', (e) => this.importFromExcel(e));

        // Students per row selector
        document.getElementById('students-per-row-select').addEventListener('change', (e) => {
            this.studentsPerRow = parseInt(e.target.value, 10);
            localStorage.setItem('studentsPerRow', this.studentsPerRow);
            this.renderStudents();
        });

        // Drawing modal events
        this.bindDrawingModalEvents();
        this.bindCountdownModalEvents();
        this.bindContactBookModalEvents();
        this.bindHomeworkCheckModalEvents();
        this.bindSettingsModalEvents();
    }

    bindDrawingModalEvents() {
        this.drawingModalCloseBtn.addEventListener('click', () => this.closeModal(this.drawingModal));
        this.startDrawBtn.addEventListener('click', () => this.performDraw());
        this.resetDrawBtn.addEventListener('click', () => this.resetDraw());
        
        window.addEventListener('click', (event) => {
            if (event.target === this.drawingModal) {
                this.closeModal(this.drawingModal);
            }
        });
    }

    bindCountdownModalEvents() {
        this.countdownModalCloseBtn.addEventListener('click', () => this.closeModal(this.countdownModal));
        this.startCountdownBtn.addEventListener('click', () => this.startCountdown());
        this.pauseCountdownBtn.addEventListener('click', () => this.pauseCountdown());
        this.resetCountdownBtn.addEventListener('click', () => this.resetCountdown());

        // Bind countdown control buttons
        this.countdownControlBtns.forEach(btn => {
            btn.addEventListener('click', (event) => {
                const action = event.currentTarget.dataset.action;
                const target = event.currentTarget.dataset.target;
                this.adjustCountdownTime(action, target);
            });
        });

        // Input validation
        this.countdownMinutesInput.addEventListener('change', () => this.validateCountdownInput('minutes'));
        this.countdownSecondsInput.addEventListener('change', () => this.validateCountdownInput('seconds'));

        window.addEventListener('click', (event) => {
            if (event.target === this.countdownModal) {
                this.closeModal(this.countdownModal);
            }
        });
    }

    bindContactBookModalEvents() {
        this.contactBookModalCloseBtn.addEventListener('click', () => this.closeModal(this.contactBookModal));
        this.prevDayBtn.addEventListener('click', () => this.navigateContactBookDate(-1));
        this.nextDayBtn.addEventListener('click', () => this.navigateContactBookDate(1));
        this.saveContactBookBtn.addEventListener('click', () => this.saveContactBookEntry());
        this.showBlackboardBtn.addEventListener('click', () => this.showBlackboard());

        // Predefined selects
        this.predefinedInfoSelect.addEventListener('change', (event) => {
            if (event.target.value) {
                const currentText = this.importantInfoTextarea.value;
                const newText = currentText ? `${currentText}\n${event.target.value}` : event.target.value;
                this.importantInfoTextarea.value = newText;
                event.target.value = '';
            }
        });

        this.predefinedHomeworkSelect.addEventListener('change', (event) => {
            if (event.target.value) {
                const currentText = this.homeworkTextarea.value;
                const newText = currentText ? `${currentText}\n${event.target.value}` : event.target.value;
                this.homeworkTextarea.value = newText;
                event.target.value = '';
            }
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.contactBookModal) {
                this.closeModal(this.contactBookModal);
            }
        });
    }

    bindHomeworkCheckModalEvents() {
        this.homeworkCheckModalCloseBtn.addEventListener('click', () => this.closeModal(this.homeworkCheckModal));
        this.homeworkCheckPrevDayBtn.addEventListener('click', () => this.navigateHomeworkCheckDate(-1));
        this.homeworkCheckNextDayBtn.addEventListener('click', () => this.navigateHomeworkCheckDate(1));
        this.saveHomeworkCheckBtn.addEventListener('click', () => this.saveHomeworkCheckData());

        this.homeworkToCheckSelect.addEventListener('change', (event) => {
            this.selectedHomeworkItem = event.target.value;
            this.renderHomeworkCheckStudents();
        });

        window.addEventListener('click', (event) => {
            if (event.target === this.homeworkCheckModal) {
                this.closeModal(this.homeworkCheckModal);
            }
        });
    }

    bindSettingsModalEvents() {
        this.settingsModalCloseBtn.addEventListener('click', () => this.closeModal(this.settingsModal));
        this.saveSettingsBtn.addEventListener('click', () => this.saveSettings());

        window.addEventListener('click', (event) => {
            if (event.target === this.settingsModal) {
                this.closeModal(this.settingsModal);
            }
        });
    }

    renderClassSelector() {
        const select = document.getElementById('class-select');
        select.innerHTML = '';

        if (this.classes.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.textContent = '請新增班級';
            select.appendChild(option);
            return;
        }

        this.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            if (cls.id === this.currentClassId) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        
        this.updateClassInfoDisplay();
    }

    addClass() {
        const className = prompt('請輸入班級名稱:');
        if (!className) return;

        const newClass = {
            id: Date.now(),
            name: className,
            students: this.generateDefaultStudents(),
            contactBookEntries: {},
            homeworkCheckEntries: {}
        };

        this.classes.push(newClass);
        this.currentClassId = newClass.id;
        this.saveData();
        this.renderClassSelector();
        this.renderStudents();
        this.showToast(`已新增班級「${className}」`);
    }

    deleteClass() {
        if (this.classes.length === 0) {
            this.showToast('沒有可刪除的班級');
            return;
        }

        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        if (confirm(`確定要刪除班級「${currentClass.name}」嗎？此操作無法復原。`)) {
            this.classes = this.classes.filter(cls => cls.id !== this.currentClassId);
            
            if (this.classes.length > 0) {
                this.currentClassId = this.classes[0].id;
            } else {
                this.currentClassId = null;
            }
            
            this.saveData();
            this.renderClassSelector();
            this.renderStudents();
            this.showToast(`已刪除班級「${currentClass.name}」`);
        }
    }

    switchClass(classId) {
        this.currentClassId = classId;
        this.selectedStudent = null;
        this.overallDrawnStudents = [];
        this.saveData();
        this.renderStudents();
    }

    addStudentsFromText() {
        const text = this.addStudentsTextarea.value.trim();
        if (!text) return;

        const currentClass = this.getCurrentClass();
        if (!currentClass) {
            this.showToast('請先選擇或新增班級');
            return;
        }

        const names = text.split('\n').map(name => name.trim()).filter(name => name);
        let addedCount = 0;

        names.forEach(name => {
            // Check if student with this name already exists
            const exists = currentClass.students.some(student => student.name === name);
            if (!exists) {
                const newStudent = {
                    id: Date.now() + Math.random(),
                    name: name,
                    score: 0,
                    actions: [],
                    avatar: name.charAt(0),
                    notes: '',
                    onLeave: false
                };
                currentClass.students.push(newStudent);
                addedCount++;
            }
        });

        this.saveData();
        this.renderStudents();
        this.addStudentsTextWrapper.style.display = 'none';
        this.addStudentsTextarea.value = '';
        
        if (addedCount > 0) {
            this.showToast(`已新增 ${addedCount} 位學生`);
        } else {
            this.showToast('沒有新增任何學生（可能已存在）');
        }
    }

    // Drawing modal methods
    openDrawingModal() {
        const currentClass = this.getCurrentClass();
        if (!currentClass || currentClass.students.length === 0) {
            this.showToast('班級中沒有學生可以抽籤');
            return;
        }

        this.updateDrawingModalContent();
        this.showModal(this.drawingModal);
    }

    updateDrawingModalContent() {
        const currentClass = this.getCurrentClass();
        this.drawingClassNameSpan.textContent = currentClass.name;
        
        this.availableForDraw = currentClass.students
            .filter(student => !student.onLeave && !this.overallDrawnStudents.includes(student.id))
            .map(student => student.id);
            
        this.drawingAvailableCountSpan.textContent = this.availableForDraw.length;
        this.numToDrawInput.max = this.availableForDraw.length;
        this.numToDrawInput.value = Math.min(1, this.availableForDraw.length);

        this.startDrawBtn.disabled = this.availableForDraw.length === 0;
        if (this.availableForDraw.length === 0) {
            this.drawnStudentDisplay.innerHTML = '<p class="placeholder-text">所有學生都已被抽中或請假</p>';
        }
    }

    performDraw() {
        if (this.availableForDraw.length === 0) {
            this.showToast('沒有可抽取的學生');
            return;
        }

        const numToDraw = Math.min(parseInt(this.numToDrawInput.value) || 1, this.availableForDraw.length);
        const drawnIds = [];

        for (let i = 0; i < numToDraw; i++) {
            const randomIndex = Math.floor(Math.random() * this.availableForDraw.length);
            const drawnId = this.availableForDraw.splice(randomIndex, 1)[0];
            drawnIds.push(drawnId);
            this.overallDrawnStudents.push(drawnId);
        }

        this.displayDrawnStudents(drawnIds);
        this.updateDrawnStudentsList();
        this.updateDrawingModalContent();
        this.renderStudents();
        this.playSound('draw');
    }

    displayDrawnStudents(drawnIds) {
        const currentClass = this.getCurrentClass();
        const drawnNames = drawnIds.map(id => {
            const student = currentClass.students.find(s => s.id === id);
            return student ? student.name : '';
        }).filter(name => name);

        this.drawnStudentDisplay.innerHTML = drawnNames
            .map(name => `<span class="drawn-name">${name}</span>`)
            .join(' ');
    }

    updateDrawnStudentsList() {
        const currentClass = this.getCurrentClass();
        this.drawnStudentsList.innerHTML = '';

        this.overallDrawnStudents.forEach(studentId => {
            const student = currentClass.students.find(s => s.id === studentId);
            if (student) {
                const li = document.createElement('li');
                li.textContent = student.name;
                this.drawnStudentsList.appendChild(li);
            }
        });
    }

    resetDraw() {
        this.overallDrawnStudents = [];
        this.drawnStudentDisplay.innerHTML = '<p class="placeholder-text">點擊「開始抽籤」</p>';
        this.drawnStudentsList.innerHTML = '';
        this.updateDrawingModalContent();
        this.renderStudents();
        this.showToast('抽籤已重置');
    }

    // Countdown modal methods
    openCountdownModal() {
        this.showModal(this.countdownModal);
    }

    startCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        const minutes = parseInt(this.countdownMinutesInput.value) || 0;
        const seconds = parseInt(this.countdownSecondsInput.value) || 0;
        let totalSeconds = minutes * 60 + seconds;

        if (totalSeconds <= 0) {
            this.showToast('請設定有效的倒數時間');
            return;
        }

        this.startCountdownBtn.disabled = true;
        this.pauseCountdownBtn.disabled = false;
        this.resetCountdownBtn.disabled = true;

        this.countdownInterval = setInterval(() => {
            if (totalSeconds <= 0) {
                clearInterval(this.countdownInterval);
                this.onCountdownEnd();
                return;
            }

            totalSeconds--;
            this.updateCountdownDisplay(totalSeconds);
        }, 1000);
    }

    pauseCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
        
        this.startCountdownBtn.disabled = false;
        this.pauseCountdownBtn.disabled = true;
        this.resetCountdownBtn.disabled = false;
    }

    resetCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        this.startCountdownBtn.disabled = false;
        this.pauseCountdownBtn.disabled = true;
        this.resetCountdownBtn.disabled = false;

        this.updateCountdownDisplay();
    }

    onCountdownEnd() {
        this.startCountdownBtn.disabled = false;
        this.pauseCountdownBtn.disabled = true;
        this.resetCountdownBtn.disabled = false;
        
        this.playSound('countdown');
        this.showToast('倒數計時結束！');
        
        // Flash the display
        this.countdownDisplay.style.backgroundColor = '#ff6b6b';
        setTimeout(() => {
            this.countdownDisplay.style.backgroundColor = '#e0e7ff';
        }, 500);
    }

    updateCountdownDisplay(totalSeconds = null) {
        if (totalSeconds === null) {
            const minutes = parseInt(this.countdownMinutesInput.value) || 0;
            const seconds = parseInt(this.countdownSecondsInput.value) || 0;
            totalSeconds = minutes * 60 + seconds;
        }

        const displayMinutes = Math.floor(totalSeconds / 60);
        const displaySeconds = totalSeconds % 60;
        
        this.countdownDisplay.textContent = 
            `${displayMinutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
    }

    adjustCountdownTime(action, target) {
        const input = target === 'minutes' ? this.countdownMinutesInput : this.countdownSecondsInput;
        let value = parseInt(input.value) || 0;
        
        if (action === 'increment') {
            if (target === 'minutes') {
                value = Math.min(value + 1, 99);
            } else {
                value = Math.min(value + 1, 59);
            }
        } else if (action === 'decrement') {
            value = Math.max(value - 1, 0);
        }
        
        input.value = value;
        this.updateCountdownDisplay();
    }

    validateCountdownInput(type) {
        const input = type === 'minutes' ? this.countdownMinutesInput : this.countdownSecondsInput;
        let value = parseInt(input.value) || 0;
        
        if (type === 'minutes') {
            value = Math.max(0, Math.min(value, 99));
        } else {
            value = Math.max(0, Math.min(value, 59));
        }
        
        input.value = value;
        this.updateCountdownDisplay();
    }

    // Contact book methods
    openContactBookModal() {
        this.currentContactBookDate = new Date();
        this.renderContactBook();
        this.showModal(this.contactBookModal);
    }

    renderContactBook() {
        this.updateContactBookDateDisplay();
        this.populatePredefinedSelects();
        this.loadContactBookEntry();
    }

    updateContactBookDateDisplay() {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        this.contactBookDateDisplay.textContent = 
            this.currentContactBookDate.toLocaleDateString('zh-TW', options);
    }

    populatePredefinedSelects() {
        // Populate important info select
        this.predefinedInfoSelect.innerHTML = '<option value="">請選擇重要資訊</option>';
        this.predefinedImportantInfos.forEach(info => {
            const option = document.createElement('option');
            option.value = info;
            option.textContent = info;
            this.predefinedInfoSelect.appendChild(option);
        });

        // Populate homework select
        this.predefinedHomeworkSelect.innerHTML = '<option value="">請選擇回家作業</option>';
        this.predefinedHomeworks.forEach(homework => {
            const option = document.createElement('option');
            option.value = homework;
            option.textContent = homework;
            this.predefinedHomeworkSelect.appendChild(option);
        });
    }

    loadContactBookEntry() {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const dateKey = this.formatDateForStorage(this.currentContactBookDate);
        const entry = currentClass.contactBookEntries[dateKey];

        if (entry) {
            this.importantInfoTextarea.value = entry.importantInfo || '';
            this.homeworkTextarea.value = entry.homework || '';
        } else {
            this.importantInfoTextarea.value = '';
            this.homeworkTextarea.value = '';
        }
    }

    navigateContactBookDate(direction) {
        const newDate = new Date(this.currentContactBookDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentContactBookDate = newDate;
        this.renderContactBook();
    }

    saveContactBookEntry() {
        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        const dateKey = this.formatDateForStorage(this.currentContactBookDate);
        const entry = {
            importantInfo: this.importantInfoTextarea.value.trim(),
            homework: this.homeworkTextarea.value.trim()
        };

        if (!currentClass.contactBookEntries) {
            currentClass.contactBookEntries = {};
        }

        currentClass.contactBookEntries[dateKey] = entry;
        this.saveData();
        this.showToast('連絡簿已儲存');
    }

    showBlackboard() {
        this.blackboardDateDisplay.textContent = 
            this.currentContactBookDate.toLocaleDateString('zh-TW', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                weekday: 'long' 
            });

        this.blackboardImportantInfoDisplay.textContent = 
            this.importantInfoTextarea.value.trim() || '無';
        this.blackboardHomeworkDisplay.textContent = 
            this.homeworkTextarea.value.trim() || '無';

        this.showModal(this.blackboardModal);
    }

    // Homework check methods
    openHomeworkCheckModal() {
        this.currentHomeworkCheckDate = new Date();
        this.renderHomeworkCheck();
        this.showModal(this.homeworkCheckModal);
    }

    renderHomeworkCheck() {
        this.updateHomeworkCheckDateDisplay();
        this.populateHomeworkToCheckSelect();
        this.renderHomeworkCheckStudents();
    }

    updateHomeworkCheckDateDisplay() {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
        };
        this.homeworkCheckDateDisplay.textContent = 
            this.currentHomeworkCheckDate.toLocaleDateString('zh-TW', options);
    }

    populateHomeworkToCheckSelect() {
        this.homeworkToCheckSelect.innerHTML = '<option value="">請選擇或查看前一天聯絡簿</option>';

        const currentClass = this.getCurrentClass();
        if (!currentClass) return;

        // Get previous day's contact book entry
        const prevDate = new Date(this.currentHomeworkCheckDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevDateKey = this.formatDateForStorage(prevDate);
        
        const prevEntry = currentClass.contactBookEntries[prevDateKey];
        if (prevEntry && prevEntry.homework) {
            const homeworkLines = prevEntry.homework.split('\n').filter(line => line.trim());
            homeworkLines.forEach(homework => {
                const option = document.createElement('option');
                option.value = `前一天聯絡簿:${homework.trim()}`;
                option.textContent = `前一天聯絡簿:${homework.trim()}`;
                this.homeworkToCheckSelect.appendChild(option);
            });
        }
    }

    renderHomeworkCheckStudents() {
        this.homeworkCheckStudentsContainer.innerHTML = '';
        
        const currentClass = this.getCurrentClass();
        if (!currentClass || currentClass.students.length === 0) {
            this.homeworkCheckStudentsContainer.innerHTML = 
                '<p class="no-students-message">班級中沒有學生。</p>';
            return;
        }

        currentClass.students.forEach(student => {
            const cell = this.createHomeworkStudentCell(student);
            this.homeworkCheckStudentsContainer.appendChild(cell);
        });
    }

    createHomeworkStudentCell(student) {
        const cell = document.createElement('div');
        cell.className = 'homework-student-cell';
        cell.dataset.studentId = student.id;
        cell.textContent = student.name;

        if (!this.selectedHomeworkItem) {
            cell.classList.add('disabled-for-homework');
            return cell;
        }

        const currentClass = this.getCurrentClass();
        const dateKey = this.formatDateForStorage(this.currentHomeworkCheckDate);
        
        if (!currentClass.homeworkCheckEntries[dateKey]) {
            currentClass.homeworkCheckEntries[dateKey] = {};
        }
        
        if (!currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem]) {
            currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem] = {};
        }

        const studentEntry = currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem][student.id];
        const status = studentEntry ? studentEntry.status : 'submitted';
        
        cell.classList.add(`status-${status}`);

        cell.addEventListener('click', () => {
            if (!this.selectedHomeworkItem) return;
            this.cycleHomeworkStatus(student.id, cell);
        });

        return cell;
    }

    cycleHomeworkStatus(studentId, cell) {
        const currentClass = this.getCurrentClass();
        const dateKey = this.formatDateForStorage(this.currentHomeworkCheckDate);
        
        if (!currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem][studentId]) {
            currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem][studentId] = { status: 'submitted' };
        }

        const currentStatus = currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem][studentId].status;
        const currentIndex = this.homeworkStatusCycle.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % this.homeworkStatusCycle.length;
        const newStatus = this.homeworkStatusCycle[nextIndex];

        currentClass.homeworkCheckEntries[dateKey][this.selectedHomeworkItem][studentId].status = newStatus;

        // Update cell appearance
        this.homeworkStatusCycle.forEach(status => {
            cell.classList.remove(`status-${status}`);
        });
        cell.classList.add(`status-${newStatus}`);

        this.saveData();
        this.renderStudents(); // Update main view to show homework summary
    }

    navigateHomeworkCheckDate(direction) {
        const newDate = new Date(this.currentHomeworkCheckDate);
        newDate.setDate(newDate.getDate() + direction);
        this.currentHomeworkCheckDate = newDate;
        this.renderHomeworkCheck();
    }

    saveHomeworkCheckData() {
        this.saveData();
        this.showToast('作業檢查資料已儲存');
    }

    getStudentHomeworkSummaryForDate(studentId, dateKey) {
        const currentClass = this.getCurrentClass();
        if (!currentClass || !currentClass.homeworkCheckEntries[dateKey]) {
            return { notSubmitted: 0, toBeCorrected: 0 };
        }

        let notSubmitted = 0;
        let toBeCorrected = 0;

        for (const homeworkItem in currentClass.homeworkCheckEntries[dateKey]) {
            const studentEntry = currentClass.homeworkCheckEntries[dateKey][homeworkItem][studentId];
            if (studentEntry) {
                if (studentEntry.status === 'not-submitted') {
                    notSubmitted++;
                } else if (studentEntry.status === 'to-be-corrected') {
                    toBeCorrected++;
                }
            }
        }

        return { notSubmitted, toBeCorrected };
    }

    // Settings methods
    openSettingsModal() {
        this.predefinedBehaviorsInput.value = this.predefinedBehaviors.join('\n');
        this.predefinedInfoInput.value = this.predefinedImportantInfos.join('\n');
        this.predefinedHomeworkInput.value = this.predefinedHomeworks.join('\n');
        this.showModal(this.settingsModal);
    }

    saveSettings() {
        this.predefinedBehaviors = this.predefinedBehaviorsInput.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item);

        this.predefinedImportantInfos = this.predefinedInfoInput.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item);

        this.predefinedHomeworks = this.predefinedHomeworkInput.value
            .split('\n')
            .map(item => item.trim())
            .filter(item => item);

        this.saveData();
        this.closeModal(this.settingsModal);
        this.renderStudents();
        this.showToast('設定已儲存');
    }

    initializeStudentsPerRowSelect() {
        const select = document.getElementById('students-per-row-select');
        select.value = this.studentsPerRow.toString();
    }

    // Modal utilities
    showModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('show'), 10);
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    // Sound utilities
    loadSound(filename, type) {
        fetch(filename)
            .then(response => response.arrayBuffer())
            .then(data => this.audioContext.decodeAudioData(data))
            .then(buffer => {
                if (type === 'draw') {
                    this.drawSoundBuffer = buffer;
                } else if (type === 'countdown') {
                    this.countdownSoundBuffer = buffer;
                }
            })
            .catch(error => console.log('Sound loading failed:', error));
    }

    playSound(type) {
        if (!this.audioContext) return;

        let buffer;
        if (type === 'draw' && this.drawSoundBuffer) {
            buffer = this.drawSoundBuffer;
        } else if (type === 'countdown' && this.countdownSoundBuffer) {
            buffer = this.countdownSoundBuffer;
        }

        if (buffer) {
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            source.connect(this.audioContext.destination);
            source.start();
        }
    }

    // Data import/export
    exportData() {
        const data = {
            classes: this.classes,
            currentClassId: this.currentClassId,
            predefinedBehaviors: this.predefinedBehaviors,
            predefinedImportantInfos: this.predefinedImportantInfos,
            predefinedHomeworks: this.predefinedHomeworks,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student_data_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('資料已匯出');
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.classes && Array.isArray(data.classes)) {
                    if (confirm('匯入資料將覆蓋現有資料，確定要繼續嗎？')) {
                        this.classes = data.classes;
                        this.currentClassId = data.currentClassId;
                        if (data.predefinedBehaviors) this.predefinedBehaviors = data.predefinedBehaviors;
                        if (data.predefinedImportantInfos) this.predefinedImportantInfos = data.predefinedImportantInfos;
                        if (data.predefinedHomeworks) this.predefinedHomeworks = data.predefinedHomeworks;
                        
                        this.saveData();
                        this.renderClassSelector();
                        this.renderStudents();
                        this.showToast('資料匯入成功');
                    }
                } else {
                    throw new Error('無效的資料格式');
                }
            } catch (error) {
                this.showToast('資料匯入失敗：' + error.message);
            }
        };
        reader.readAsText(file);
        event.target.value = '';
    }

    exportToExcel() {
        const currentClass = this.getCurrentClass();
        if (!currentClass) {
            this.showToast('請先選擇班級');
            return;
        }

        const wb = XLSX.utils.book_new();
        
        // Student data sheet
        const studentData = currentClass.students.map(student => ({
            '學生姓名': student.name,
            '分數': student.score,
            '請假狀態': student.onLeave ? '請假' : '正常',
            '特殊表現記錄': student.notes
        }));
        
        const ws = XLSX.utils.json_to_sheet(studentData);
        XLSX.utils.book_append_sheet(wb, ws, '學生資料');

        // Contact book data
        const contactData = [];
        for (const [date, entry] of Object.entries(currentClass.contactBookEntries || {})) {
            contactData.push({
                '日期': this.formatDateForDisplay(date),
                '重要資訊': entry.importantInfo || '',
                '回家作業': entry.homework || ''
            });
        }
        
        if (contactData.length > 0) {
            const contactWs = XLSX.utils.json_to_sheet(contactData);
            XLSX.utils.book_append_sheet(wb, contactWs, '連絡簿');
        }

        const fileName = `${currentClass.name}_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        this.showToast('Excel文件已匯出');
    }

    importFromExcel(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                const currentClass = this.getCurrentClass();
                if (!currentClass) {
                    this.showToast('請先選擇班級');
                    return;
                }

                // Read student data
                const studentSheetName = workbook.SheetNames.find(name => 
                    name.includes('學生') || name.toLowerCase().includes('student')
                );
                
                if (studentSheetName) {
                    const studentSheet = workbook.Sheets[studentSheetName];
                    const studentData = XLSX.utils.sheet_to_json(studentSheet);
                    
                    studentData.forEach(row => {
                        const name = row['學生姓名'] || row['姓名'] || row['Name'];
                        if (name) {
                            const existingStudent = currentClass.students.find(s => s.name === name);
                            if (!existingStudent) {
                                currentClass.students.push({
                                    id: Date.now() + Math.random(),
                                    name: name,
                                    score: parseInt(row['分數']) || 0,
                                    actions: [],
                                    avatar: name.charAt(0),
                                    notes: row['特殊表現記錄'] || row['備註'] || '',
                                    onLeave: false
                                });
                            }
                        }
                    });
                }

                this.saveData();
                this.renderStudents();
                this.showToast('Excel資料匯入成功');
            } catch (error) {
                this.showToast('Excel匯入失敗：' + error.message);
            }
        };
        reader.readAsArrayBuffer(file);
        event.target.value = '';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new StudentManager();
});