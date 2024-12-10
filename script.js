// Sabit ve değişken tanımları
const studentModal = document.getElementById('studentModal');
const addStudentBtn = document.getElementById('addStudentBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentForm = document.getElementById('studentForm');
const printBtn = document.getElementById('printBtn');
const studentTableBody = document.getElementById('studentTableBody');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');

// Öğrenci listesi
let students = [];
let editingStudentId = null;

// Başlık bilgilerini güncelleme
function updateHeaderInfo() {
    document.getElementById('headerYear').textContent = document.getElementById('educationYear').value;
    document.getElementById('headerSchool').textContent = document.getElementById('schoolName').value;
    document.getElementById('footerTeacher').textContent = document.getElementById('teacherName').value;
    document.getElementById('footerTitle').textContent = document.getElementById('teacherTitle').value;

    // LocalStorage'a kaydet
    const headerInfo = {
        year: document.getElementById('educationYear').value,
        school: document.getElementById('schoolName').value,
        teacher: document.getElementById('teacherName').value,
        title: document.getElementById('teacherTitle').value
    };
    localStorage.setItem('headerInfo', JSON.stringify(headerInfo));
}

// Modal kontrolü
function toggleModal(show = true, isEditing = false) {
    studentModal.classList.toggle('show', show);
    modalTitle.textContent = isEditing ? 'Öğrenci Düzenle' : 'Yeni Öğrenci Ekle';
    if (show) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
        studentForm.reset();
        editingStudentId = null;
    }
}

// Toplam hesaplama fonksiyonları
function calculateYaziliTotal(yazma, dinleme, konusma) {
    return Math.round((yazma * 0.7) + (dinleme * 0.15) + (konusma * 0.15));
}

function calculatePerformans1Total(tema1Yazma, tema1Konusma, tema2Yazma, tema2Konusma) {
    return Math.round((tema1Yazma * 0.25) + (tema1Konusma * 0.25) + (tema2Yazma * 0.25) + (tema2Konusma * 0.25));
}

function calculatePerformans2Total(kitap1, kitap2) {
    return Math.round((kitap1 * 0.5) + (kitap2 * 0.5));
}

// Öğrenci düzenleme formu doldurma
function editStudent(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    editingStudentId = studentId;
    document.getElementById('studentNo').value = student.no;
    document.getElementById('studentName').value = student.name;
    document.getElementById('yazili1_yazma').value = student.yazili1.yazili;
    document.getElementById('yazili1_dinleme').value = student.yazili1.dinleme;
    document.getElementById('yazili1_konusma').value = student.yazili1.konusma;
    document.getElementById('yazili2_yazma').value = student.yazili2.yazili;
    document.getElementById('yazili2_dinleme').value = student.yazili2.dinleme;
    document.getElementById('yazili2_konusma').value = student.yazili2.konusma;
    document.getElementById('perf1_tema1_yazma').value = student.performans1.tema1.yazma;
    document.getElementById('perf1_tema1_konusma').value = student.performans1.tema1.konusma;
    document.getElementById('perf1_tema2_yazma').value = student.performans1.tema2.yazma;
    document.getElementById('perf1_tema2_konusma').value = student.performans1.tema2.konusma;
    document.getElementById('perf2_kitap1').value = student.performans2.kitap1;
    document.getElementById('perf2_kitap2').value = student.performans2.kitap2;

    toggleModal(true, true);
}

// Not dağıtma fonksiyonu
function distributeGrades(formData) {
    const yazili1Total = calculateYaziliTotal(
        parseFloat(formData.yazili1_yazma),
        parseFloat(formData.yazili1_dinleme),
        parseFloat(formData.yazili1_konusma)
    );

    const yazili2Total = calculateYaziliTotal(
        parseFloat(formData.yazili2_yazma),
        parseFloat(formData.yazili2_dinleme),
        parseFloat(formData.yazili2_konusma)
    );

    const performans1Total = calculatePerformans1Total(
        parseFloat(formData.perf1_tema1_yazma),
        parseFloat(formData.perf1_tema1_konusma),
        parseFloat(formData.perf1_tema2_yazma),
        parseFloat(formData.perf1_tema2_konusma)
    );

    const performans2Total = calculatePerformans2Total(
        parseFloat(formData.perf2_kitap1),
        parseFloat(formData.perf2_kitap2)
    );

    return {
        id: editingStudentId || Date.now(),
        no: formData.no,
        name: formData.name,
        yazili1: {
            yazili: parseFloat(formData.yazili1_yazma),
            dinleme: parseFloat(formData.yazili1_dinleme),
            konusma: parseFloat(formData.yazili1_konusma),
            toplam: yazili1Total
        },
        yazili2: {
            yazili: parseFloat(formData.yazili2_yazma),
            dinleme: parseFloat(formData.yazili2_dinleme),
            konusma: parseFloat(formData.yazili2_konusma),
            toplam: yazili2Total
        },
        performans1: {
            tema1: {
                yazma: parseFloat(formData.perf1_tema1_yazma),
                konusma: parseFloat(formData.perf1_tema1_konusma)
            },
            tema2: {
                yazma: parseFloat(formData.perf1_tema2_yazma),
                konusma: parseFloat(formData.perf1_tema2_konusma)
            },
            toplam: performans1Total
        },
        performans2: {
            kitap1: parseFloat(formData.perf2_kitap1),
            kitap2: parseFloat(formData.perf2_kitap2),
            toplam: performans2Total
        }
    };
}

// Tabloyu güncelleme fonksiyonu
function updateTable() {
    studentTableBody.innerHTML = '';
    students.sort((a, b) => parseInt(a.no) - parseInt(b.no));
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border-right">${student.no}</td>
            <td class="border-right">${student.name}</td>
            <td>${student.yazili1.yazili}</td>
            <td>${student.yazili1.dinleme}</td>
            <td>${student.yazili1.konusma}</td>
            <td class="border-right"><strong>${student.yazili1.toplam}</strong></td>
            <td>${student.yazili2.yazili}</td>
            <td>${student.yazili2.dinleme}</td>
            <td>${student.yazili2.konusma}</td>
            <td class="border-right"><strong>${student.yazili2.toplam}</strong></td>
            <td>${student.performans1.tema1.yazma}</td>
            <td>${student.performans1.tema1.konusma}</td>
            <td>${student.performans1.tema2.yazma}</td>
            <td>${student.performans1.tema2.konusma}</td>
            <td class="border-right"><strong>${student.performans1.toplam}</strong></td>
            <td>${student.performans2.kitap1}</td>
            <td>${student.performans2.kitap2}</td>
            <td><strong>${student.performans2.toplam}</strong></td>
            <td class="print:hidden">
                <button onclick="editStudent(${student.id})" class="btn-edit">Düzenle</button>
            </td>
        `;
        studentTableBody.appendChild(row);
    });

    localStorage.setItem('students', JSON.stringify(students));
}

// Form submit olayı
studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        no: document.getElementById('studentNo').value,
        name: document.getElementById('studentName').value,
        yazili1_yazma: document.getElementById('yazili1_yazma').value,
        yazili1_dinleme: document.getElementById('yazili1_dinleme').value,
        yazili1_konusma: document.getElementById('yazili1_konusma').value,
        yazili2_yazma: document.getElementById('yazili2_yazma').value,
        yazili2_dinleme: document.getElementById('yazili2_dinleme').value,
        yazili2_konusma: document.getElementById('yazili2_konusma').value,
        perf1_tema1_yazma: document.getElementById('perf1_tema1_yazma').value,
        perf1_tema1_konusma: document.getElementById('perf1_tema1_konusma').value,
        perf1_tema2_yazma: document.getElementById('perf1_tema2_yazma').value,
        perf1_tema2_konusma: document.getElementById('perf1_tema2_konusma').value,
        perf2_kitap1: document.getElementById('perf2_kitap1').value,
        perf2_kitap2: document.getElementById('perf2_kitap2').value
    };

    if (editingStudentId) {
        const index = students.findIndex(s => s.id === editingStudentId);
        if (index !== -1) {
            students[index] = distributeGrades(formData);
        }
    } else {
        students.push(distributeGrades(formData));
    }

    updateTable();
    toggleModal(false);
});

// Olay dinleyicileri
addStudentBtn.addEventListener('click', () => toggleModal(true, false));
cancelBtn.addEventListener('click', () => toggleModal(false));
printBtn.addEventListener('click', () => window.print());

// Modal dışına tıklandığında kapatma
window.addEventListener('click', (e) => {
    if (e.target === studentModal) {
        toggleModal(false);
    }
});

// LocalStorage'dan verileri yükleme
window.addEventListener('load', () => {
    const savedHeaderInfo = localStorage.getItem('headerInfo');
    if (savedHeaderInfo) {
        const headerInfo = JSON.parse(savedHeaderInfo);
        document.getElementById('educationYear').value = headerInfo.year;
        document.getElementById('schoolName').value = headerInfo.school;
        document.getElementById('teacherName').value = headerInfo.teacher;
        document.getElementById('teacherTitle').value = headerInfo.title;
        updateHeaderInfo();
    }

    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
        students = JSON.parse(savedStudents);
        updateTable();
    }
});