const getTodayDate = () => new Date().toLocaleDateString('en-CA'); // صيغة YYYY-MM-DD

// تحميل البيانات من الذاكرة أو إنشاء بيانات جديدة
let state = JSON.parse(localStorage.getItem('ramadanSmartApp')) || {
    tasks: [],
    history: {},
    lastCheckDate: getTodayDate()
};

// وظيفة التحقق من تغير اليوم (تصفير تلقائي)
function checkDayReset() {
    const today = getTodayDate();
    if (state.lastCheckDate !== today) {
        const total = state.tasks.length;
        const done = state.tasks.filter(t => t.completed).length;
        const percent = total > 0 ? Math.round((done / total) * 100) : 0;
        
        // حفظ إنجاز اليوم الفائت في السجل
        state.history[state.lastCheckDate] = percent;
        
        // إعادة المهام لوضع "غير مكتمل" لليوم الجديد
        state.tasks = state.tasks.map(t => ({...t, completed: false}));
        state.lastCheckDate = today;
        saveData();
    }
}

function saveData() {
    localStorage.setItem('ramadanSmartApp', JSON.stringify(state));
    renderUI();
}

function addTask() {
    const input = document.getElementById('taskInput');
    if (!input.value.trim()) return;
    state.tasks.push({ id: Date.now(), text: input.value, completed: false });
    input.value = "";
    saveData();
}

function toggleTask(id) {
    state.tasks = state.tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
    saveData();
}

function deleteTask(id) {
    state.tasks = state.tasks.filter(t => t.id !== id);
    saveData();
}

function renderUI() {
    const pendingList = document.getElementById('pendingList');
    const completedList = document.getElementById('completedList');
    const historyList = document.getElementById('historyList');
    
    pendingList.innerHTML = "";
    completedList.innerHTML = "";
    historyList.innerHTML = "";

    const doneTasks = state.tasks.filter(t => t.completed);
    
    // توزيع المهام على القوائم
    state.tasks.forEach(t => {
        const li = document.createElement('li');
        if(t.completed) li.className = 'done-item';
        li.innerHTML = `
            <span style="cursor:pointer flex-grow:1" onclick="toggleTask(${t.id})">
                ${t.completed ? '✔️' : '⬜'} ${t.text}
            </span>
            <button class="delete-btn" onclick="deleteTask(${t.id})">حذف</button>
        `;
        if(t.completed) completedList.appendChild(li);
        else pendingList.appendChild(li);
    });

    // تحديث شريط التقدم
    const percent = state.tasks.length > 0 ? Math.round((doneTasks.length / state.tasks.length) * 100) : 0;
    document.getElementById('progressFill').style.width = percent + "%";

    // تحديث السجل التاريخي
    Object.keys(state.history).sort().reverse().forEach(date => {
        historyList.innerHTML += `
            <div class="history-item">
                <span>📅 التاريخ: ${date}</span>
                <span>الإنجاز: <b>${state.history[date]}%</b></span>
            </div>`;
    });

    document.getElementById('todayDate').innerText = "تاريخ اليوم: " + state.lastCheckDate;
}

// البدء عند فتح الصفحة
checkDayReset();
renderUI();
