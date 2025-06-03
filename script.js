// Sabit ve değişken tanımları
const studentModal = document.getElementById('studentModal');
const addStudentBtn = document.getElementById('addStudentBtn');
const cancelBtn = document.getElementById('cancelBtn');
const studentForm = document.getElementById('studentForm');
const printBtn = document.getElementById('printBtn');
const studentTableBody = document.getElementById('studentTableBody');
const modalTitle = document.getElementById('modalTitle');
const saveBtn = document.getElementById('saveBtn');
const importModal = document.getElementById('importModal');
const importExcelBtn = document.getElementById('importExcelBtn');
const cancelImportBtn = document.getElementById('cancelImportBtn');
const saveImportBtn = document.getElementById('saveImportBtn');
const importData = document.getElementById('importData');

// Öğrenci listesi
let students = [];
let editingStudentId = null;

// Sınıf yönetimi için değişkenler
let classes = {}; // { sınıfAdı: [öğrenciler], ... }
let currentClass = null;

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
function calculateYaziliTotal(yazili, dinleme, konusma) {
    return Math.round((yazili * 0.7) + (dinleme * 0.15) + (konusma * 0.15));
}

function calculatePerformans1Total(tema1Yazma, tema1Konusma, tema2Yazma, tema2Konusma) {
    return Math.round((tema1Yazma * 0.25) + (tema1Konusma * 0.25) + (tema2Yazma * 0.25) + (tema2Konusma * 0.25));
}

function calculatePerformans2Total(kitap1, kitap2) {
    return Math.round((kitap1 * 0.5) + (kitap2 * 0.5));
}

// Toplamdan detaylara dağıtım fonksiyonları
function distributeYaziliFromTotal(total) {
    // Hedef toplam değer
    const targetTotal = parseInt(total) || 0;
    
    // Yazma %70, Dinleme %15, Konuşma %15 oranlarına göre dağıt
    // Ancak birbirinden farklı notlar olsun
    let yazma = Math.round(targetTotal * 0.95); // Ana not biraz düşük
    let dinleme = Math.min(100, yazma + Math.round(Math.random() * 10) + 5); // 5-15 puan fazla
    let konusma = Math.min(100, yazma + Math.round(Math.random() * 10) + 5); // 5-15 puan fazla
    
    // Gerçek toplamı hesapla ve hedefle karşılaştır
    let currentTotal = calculateYaziliTotal(yazma, dinleme, konusma);
    let diff = targetTotal - currentTotal;
    
    // Farkı yazma notuna ekle/çıkar
    yazma = Math.max(0, Math.min(100, yazma + Math.round(diff / 0.7)));
    
    return { yazma, dinleme, konusma };
}

function distributePerformans1FromTotal(total) {
    // Her biri %25 - farklı notlar
    const targetTotal = parseInt(total) || 0;
    const baseScore = targetTotal - 5; // Temel not
    
    // Her birine farklı değerler ata
    let tema1Yazma = Math.max(0, Math.min(100, baseScore + Math.round(Math.random() * 10)));
    let tema1Konusma = Math.max(0, Math.min(100, baseScore + Math.round(Math.random() * 10)));
    let tema2Yazma = Math.max(0, Math.min(100, baseScore + Math.round(Math.random() * 10)));
    let tema2Konusma = Math.max(0, Math.min(100, baseScore + Math.round(Math.random() * 10)));
    
    // Toplamı kontrol et ve ayarla
    let currentTotal = calculatePerformans1Total(tema1Yazma, tema1Konusma, tema2Yazma, tema2Konusma);
    let diff = targetTotal - currentTotal;
    
    // Farkı dağıt
    if (diff !== 0) {
        tema1Yazma = Math.max(0, Math.min(100, tema1Yazma + Math.round(diff / 4)));
    }
    
    return {
        tema1Yazma,
        tema1Konusma,
        tema2Yazma,
        tema2Konusma
    };
}

function distributePerformans2FromTotal(total) {
    // Her kitap %50 - farklı notlar
    const targetTotal = parseInt(total) || 0;
    
    // İki kitaba farklı notlar ver
    let kitap1 = Math.max(0, Math.min(100, targetTotal - Math.round(Math.random() * 5) - 2));
    let kitap2 = Math.max(0, Math.min(100, targetTotal + Math.round(Math.random() * 5) + 2));
    
    // Toplamı kontrol et ve ayarla
    let currentTotal = calculatePerformans2Total(kitap1, kitap2);
    let diff = targetTotal - currentTotal;
    
    // Farkı kitap1'e ekle
    if (diff !== 0) {
        kitap1 = Math.max(0, Math.min(100, kitap1 + diff * 2));
    }
    
    return {
        kitap1,
        kitap2
    };
}

// Öğrenci düzenleme formu doldurma
function editStudent(studentId) {
    // Öğrenciyi number'a göre bul
    const student = students.find(s => s.number === studentId.toString());
    if (!student) return;

    editingStudentId = student.number;
    document.getElementById('studentNo').value = student.number;
    document.getElementById('studentName').value = student.name;
    
    // Mevcut notları forma yükle
    document.getElementById('yazili1_yazma').value = student.yazili1?.yazma || 0;
    document.getElementById('yazili1_dinleme').value = student.yazili1?.dinleme || 0;
    document.getElementById('yazili1_konusma').value = student.yazili1?.konusma || 0;
    document.getElementById('yazili2_yazma').value = student.yazili2?.yazma || 0;
    document.getElementById('yazili2_dinleme').value = student.yazili2?.dinleme || 0;
    document.getElementById('yazili2_konusma').value = student.yazili2?.konusma || 0;
    document.getElementById('perf1_tema1_yazma').value = student.performans1?.tema1?.yazma || 0;
    document.getElementById('perf1_tema1_konusma').value = student.performans1?.tema1?.konusma || 0;
    document.getElementById('perf1_tema2_yazma').value = student.performans1?.tema2?.yazma || 0;
    document.getElementById('perf1_tema2_konusma').value = student.performans1?.tema2?.konusma || 0;
    document.getElementById('perf2_kitap1').value = student.performans2?.kitap1 || 0;
    document.getElementById('perf2_kitap2').value = student.performans2?.kitap2 || 0;

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
        number: formData.no,
        name: formData.name,
        yazili1: {
            yazma: parseFloat(formData.yazili1_yazma) || 0,
            dinleme: parseFloat(formData.yazili1_dinleme) || 0,
            konusma: parseFloat(formData.yazili1_konusma) || 0,
            toplam: yazili1Total
        },
        yazili2: {
            yazma: parseFloat(formData.yazili2_yazma) || 0,
            dinleme: parseFloat(formData.yazili2_dinleme) || 0,
            konusma: parseFloat(formData.yazili2_konusma) || 0,
            toplam: yazili2Total
        },
        performans1: {
            tema1: {
                yazma: parseFloat(formData.perf1_tema1_yazma) || 0,
                konusma: parseFloat(formData.perf1_tema1_konusma) || 0
            },
            tema2: {
                yazma: parseFloat(formData.perf1_tema2_yazma) || 0,
                konusma: parseFloat(formData.perf1_tema2_konusma) || 0
            },
            toplam: performans1Total
        },
        performans2: {
            kitap1: parseFloat(formData.perf2_kitap1) || 0,
            kitap2: parseFloat(formData.perf2_kitap2) || 0,
            toplam: performans2Total
        }
    };
}

// Toplam not girişinden detaylara dağıtım
function updateGradesFromTotal(studentNumber, gradeType, totalValue) {
    const student = students.find(s => s.number === studentNumber.toString());
    if (!student) return;

    const numValue = parseInt(totalValue) || 0;
    
    if (gradeType === 'yazili1') {
        const distributed = distributeYaziliFromTotal(numValue);
        student.yazili1 = {
            yazma: distributed.yazma,
            dinleme: distributed.dinleme,
            konusma: distributed.konusma,
            toplam: numValue
        };
    } else if (gradeType === 'yazili2') {
        const distributed = distributeYaziliFromTotal(numValue);
        student.yazili2 = {
            yazma: distributed.yazma,
            dinleme: distributed.dinleme,
            konusma: distributed.konusma,
            toplam: numValue
        };
    } else if (gradeType === 'performans1') {
        const distributed = distributePerformans1FromTotal(numValue);
        student.performans1 = {
            tema1: {
                yazma: distributed.tema1Yazma,
                konusma: distributed.tema1Konusma
            },
            tema2: {
                yazma: distributed.tema2Yazma,
                konusma: distributed.tema2Konusma
            },
            toplam: numValue
        };
    } else if (gradeType === 'performans2') {
        const distributed = distributePerformans2FromTotal(numValue);
        student.performans2 = {
            kitap1: distributed.kitap1,
            kitap2: distributed.kitap2,
            toplam: numValue
        };
    }

    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Tabloyu güncelle
    updateTable();
}

// Tablo hücresinde not güncelleme fonksiyonu
function updateGrade(studentNumber, gradeType, subType, value) {
    const student = students.find(s => s.number === studentNumber.toString());
    if (!student) return;

    const numValue = parseInt(value) || 0;
    
    // Notu güncelle
    if (gradeType === 'yazili1') {
        if (!student.yazili1) student.yazili1 = {};
        student.yazili1[subType] = numValue;
        student.yazili1.toplam = calculateYaziliTotal(
            student.yazili1.yazma || 0,
            student.yazili1.dinleme || 0,
            student.yazili1.konusma || 0
        );
    } else if (gradeType === 'yazili2') {
        if (!student.yazili2) student.yazili2 = {};
        student.yazili2[subType] = numValue;
        student.yazili2.toplam = calculateYaziliTotal(
            student.yazili2.yazma || 0,
            student.yazili2.dinleme || 0,
            student.yazili2.konusma || 0
        );
    } else if (gradeType === 'performans1') {
        if (!student.performans1) student.performans1 = { tema1: {}, tema2: {} };
        if (subType.includes('tema1')) {
            student.performans1.tema1[subType.replace('tema1-', '')] = numValue;
        } else if (subType.includes('tema2')) {
            student.performans1.tema2[subType.replace('tema2-', '')] = numValue;
        }
        student.performans1.toplam = calculatePerformans1Total(
            student.performans1.tema1?.yazma || 0,
            student.performans1.tema1?.konusma || 0,
            student.performans1.tema2?.yazma || 0,
            student.performans1.tema2?.konusma || 0
        );
    } else if (gradeType === 'performans2') {
        if (!student.performans2) student.performans2 = {};
        student.performans2[subType] = numValue;
        student.performans2.toplam = calculatePerformans2Total(
            student.performans2.kitap1 || 0,
            student.performans2.kitap2 || 0
        );
    }

    // LocalStorage'a kaydet
    saveToLocalStorage();
    
    // Toplamları güncelle
    updateTableTotals(studentNumber);
}

// Sadece toplamları güncelleme fonksiyonu
function updateTableTotals(studentNumber) {
    const row = document.querySelector(`tr[data-student="${studentNumber}"]`);
    if (!row) return;
    
    const student = students.find(s => s.number === studentNumber.toString());
    if (!student) return;

    // Toplamları güncelle
    row.querySelector('[data-total="yazili1"]').value = student.yazili1?.toplam || 0;
    row.querySelector('[data-total="yazili2"]').value = student.yazili2?.toplam || 0;
    row.querySelector('[data-total="performans1"]').value = student.performans1?.toplam || 0;
    row.querySelector('[data-total="performans2"]').value = student.performans2?.toplam || 0;
}

// Tabloyu güncelleme fonksiyonu
function updateTable() {
    studentTableBody.innerHTML = '';
    console.log('Güncellenecek öğrenciler:', students);
    
    students.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.setAttribute('data-student', student.number);
        row.innerHTML = `
            <td class="border-right">${student.number}</td>
            <td class="border-right">${student.name}</td>
            <td><input type="number" value="${student.yazili1?.yazma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili1', 'yazma', this.value)"></td>
            <td><input type="number" value="${student.yazili1?.dinleme || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili1', 'dinleme', this.value)"></td>
            <td><input type="number" value="${student.yazili1?.konusma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili1', 'konusma', this.value)"></td>
            <td class="border-right"><input type="number" value="${student.yazili1?.toplam || 0}" min="0" max="100" class="table-input total-input" data-total="yazili1" onchange="updateGradesFromTotal('${student.number}', 'yazili1', this.value)"></td>
            <td><input type="number" value="${student.yazili2?.yazma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili2', 'yazma', this.value)"></td>
            <td><input type="number" value="${student.yazili2?.dinleme || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili2', 'dinleme', this.value)"></td>
            <td><input type="number" value="${student.yazili2?.konusma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'yazili2', 'konusma', this.value)"></td>
            <td class="border-right"><input type="number" value="${student.yazili2?.toplam || 0}" min="0" max="100" class="table-input total-input" data-total="yazili2" onchange="updateGradesFromTotal('${student.number}', 'yazili2', this.value)"></td>
            <td><input type="number" value="${student.performans1?.tema1?.yazma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans1', 'tema1-yazma', this.value)"></td>
            <td><input type="number" value="${student.performans1?.tema1?.konusma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans1', 'tema1-konusma', this.value)"></td>
            <td><input type="number" value="${student.performans1?.tema2?.yazma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans1', 'tema2-yazma', this.value)"></td>
            <td><input type="number" value="${student.performans1?.tema2?.konusma || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans1', 'tema2-konusma', this.value)"></td>
            <td class="border-right"><input type="number" value="${student.performans1?.toplam || 0}" min="0" max="100" class="table-input total-input" data-total="performans1" onchange="updateGradesFromTotal('${student.number}', 'performans1', this.value)"></td>
            <td><input type="number" value="${student.performans2?.kitap1 || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans2', 'kitap1', this.value)"></td>
            <td><input type="number" value="${student.performans2?.kitap2 || 0}" min="0" max="100" class="table-input" onchange="updateGrade('${student.number}', 'performans2', 'kitap2', this.value)"></td>
            <td><input type="number" value="${student.performans2?.toplam || 0}" min="0" max="100" class="table-input total-input" data-total="performans2" onchange="updateGradesFromTotal('${student.number}', 'performans2', this.value)"></td>
            <td class="print:hidden">
                <button onclick="editStudent('${student.number}')" class="btn-edit">Düzenle</button>
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
        const index = students.findIndex(s => s.number === editingStudentId);
        if (index !== -1) {
            // Mevcut öğrenci yapısını koru, sadece notları güncelle
            const updatedStudent = {
                ...students[index],
                name: formData.name,
                yazili1: {
                    yazma: parseFloat(formData.yazili1_yazma) || 0,
                    dinleme: parseFloat(formData.yazili1_dinleme) || 0,
                    konusma: parseFloat(formData.yazili1_konusma) || 0,
                    toplam: calculateYaziliTotal(
                        parseFloat(formData.yazili1_yazma),
                        parseFloat(formData.yazili1_dinleme),
                        parseFloat(formData.yazili1_konusma)
                    )
                },
                yazili2: {
                    yazma: parseFloat(formData.yazili2_yazma) || 0,
                    dinleme: parseFloat(formData.yazili2_dinleme) || 0,
                    konusma: parseFloat(formData.yazili2_konusma) || 0,
                    toplam: calculateYaziliTotal(
                        parseFloat(formData.yazili2_yazma),
                        parseFloat(formData.yazili2_dinleme),
                        parseFloat(formData.yazili2_konusma)
                    )
                },
                performans1: {
                    tema1: {
                        yazma: parseFloat(formData.perf1_tema1_yazma) || 0,
                        konusma: parseFloat(formData.perf1_tema1_konusma) || 0
                    },
                    tema2: {
                        yazma: parseFloat(formData.perf1_tema2_yazma) || 0,
                        konusma: parseFloat(formData.perf1_tema2_konusma) || 0
                    },
                    toplam: calculatePerformans1Total(
                        parseFloat(formData.perf1_tema1_yazma),
                        parseFloat(formData.perf1_tema1_konusma),
                        parseFloat(formData.perf1_tema2_yazma),
                        parseFloat(formData.perf1_tema2_konusma)
                    )
                },
                performans2: {
                    kitap1: parseFloat(formData.perf2_kitap1) || 0,
                    kitap2: parseFloat(formData.perf2_kitap2) || 0,
                    toplam: calculatePerformans2Total(
                        parseFloat(formData.perf2_kitap1),
                        parseFloat(formData.perf2_kitap2)
                    )
                }
            };
            students[index] = updatedStudent;
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
    if (e.target === importModal) {
        toggleImportModal(false);
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

// Excel verilerini işleme fonksiyonu
function processImportData(data) {
    try {
        const normalizedData = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const lines = normalizedData.trim().split('\n');
        const newStudents = [];

        lines.forEach((line, index) => {
            try {
                if (!line.trim()) return;

                const values = line.trim().split(/[\t\s+]/);
                console.log('İşlenen satır:', values);

                if (values.length >= 2) {
                    const no = values[0].trim();
                    const name = values.slice(1).join(' ').trim();

                    // Öğrenci verisi oluştur - mevcut yapıyla uyumlu
                    const student = {
                        number: no,  // no -> number olarak değiştirildi
                        name: name,
                        book1Scores: Array(10).fill(0),  // 10 tane 0 içeren dizi
                        book2Scores: Array(10).fill(0)   // 10 tane 0 içeren dizi
                    };

                    // Aynı numarada öğrenci var mı kontrol et
                    if (!students.some(s => s.number === no)) {  // number kullanıyoruz
                        newStudents.push(student);
                    }
                }
            } catch (err) {
                console.error(`Satır ${index + 1} işlenirken hata:`, err);
            }
        });

        return newStudents;
    } catch (err) {
        console.error('Veri işleme hatası:', err);
        throw err;
    }
}

// Import modal kontrolü
function toggleImportModal(show = true) {
    importModal.classList.toggle('show', show);
    if (show) {
        document.body.style.overflow = 'hidden';
        importData.value = '';
    } else {
        document.body.style.overflow = '';
    }
}

// Import butonuna tıklama olayı
saveImportBtn.addEventListener('click', () => {
    try {
        const importedData = importData.value;
        console.log('Alınan ham veri:', importedData);

        if (!importedData.trim()) {
            alert('Lütfen veri giriniz!');
            return;
        }

        const newStudents = processImportData(importedData);
        console.log('İşlenmiş öğrenciler:', newStudents);

        if (newStudents.length === 0) {
            alert('Geçerli veri bulunamadı! Lütfen doğru formatta veri girdiğinizden emin olun.');
            return;
        }

        // Mevcut öğrencilere yeni öğrencileri ekle
        students = [...students, ...newStudents];
        
        // Tabloyu güncelle
        updateTable();
        
        // Modalı kapat
        toggleImportModal(false);
        
        // Başarı mesajı
        alert(`${newStudents.length} öğrenci başarıyla eklendi.`);
    } catch (err) {
        console.error('İşlem hatası:', err);
        alert('Veriler işlenirken bir hata oluştu. Lütfen tekrar deneyin.\nHata detayı: ' + err.message);
    }
});

// Event listener'ları
importExcelBtn.addEventListener('click', () => toggleImportModal(true));
cancelImportBtn.addEventListener('click', () => toggleImportModal(false));

// Sınıf ekleme fonksiyonu
function addClass() {
    const input = document.getElementById('newClassName');
    const className = input.value.trim().toUpperCase();
    
    if (!className) {
        alert('Lütfen sınıf adı girin');
        return;
    }
    
    if (classes[className]) {
        alert('Bu sınıf zaten mevcut');
        return;
    }
    
    classes[className] = [];
    input.value = '';
    updateClassTabs();
    switchClass(className);
    saveToLocalStorage();
}

// Sınıf düzenleme fonksiyonu
function editClass(className) {
    const newName = prompt('Yeni sınıf adını girin:', className);
    if (newName && newName.trim() && newName.trim() !== className) {
        const trimmedName = newName.trim().toUpperCase();
        
        // Aynı isimde başka sınıf var mı kontrol et
        if (classes[trimmedName]) {
            alert('Bu isimde bir sınıf zaten var!');
            return;
        }

        // Sınıfın öğrencilerini yeni isme taşı
        classes[trimmedName] = classes[className];
        delete classes[className];

        // Eğer düzenlenen sınıf aktif sınıfsa, currentClass'ı güncelle
        if (currentClass === className) {
            currentClass = trimmedName;
        }

        updateClassTabs();
        saveToLocalStorage();
    }
}

// Sınıf sekmelerini güncelleme fonksiyonunu güncelle
function updateClassTabs() {
    const tabsContainer = document.getElementById('classTabs');
    tabsContainer.innerHTML = '';
    
    Object.keys(classes).forEach(className => {
        const tab = document.createElement('div');
        tab.className = 'class-tab';
        
        const nameBtn = document.createElement('button');
        nameBtn.className = `class-name ${currentClass === className ? 'active' : ''}`;
        nameBtn.textContent = className;
        nameBtn.onclick = () => switchClass(className);
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-3d btn-edit';
        editBtn.innerHTML = '✎'; // Kalem ikonu
        editBtn.onclick = (e) => {
            e.stopPropagation(); // Tıklama olayının nameBtn'ye geçmesini engelle
            editClass(className);
        };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-3d btn-delete';
        deleteBtn.innerHTML = '×'; // Çarpı ikonu
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteClass(className);
        };
        
        tab.appendChild(nameBtn);
        tab.appendChild(editBtn);
        tab.appendChild(deleteBtn);
        tabsContainer.appendChild(tab);
    });
}

// Sınıf değiştirme
function switchClass(className) {
    if (currentClass) {
        // Mevcut sınıfın öğrencilerini kaydet
        classes[currentClass] = [...students];
    }
    
    currentClass = className;
    // Seçilen sınıfın öğrencilerini yükle
    students = classes[className] || [];
    
    updateClassTabs();
    updateTable();
    saveToLocalStorage();
}

// Sınıfı temizleme
function clearClass(className) {
    if (confirm(`${className} sınıfındaki tüm öğrenciler silinecek. Emin misiniz?`)) {
        if (className === currentClass) {
            students = [];
            updateTable();
        }
        classes[className] = [];
        saveToLocalStorage();
    }
}

// Sınıfı silme
function deleteClass(className) {
    if (confirm(`${className} sınıfı tamamen silinecek. Emin misiniz?`)) {
        delete classes[className];
        if (currentClass === className) {
            currentClass = Object.keys(classes)[0] || null;
            students = currentClass ? classes[currentClass] : [];
        }
        updateClassTabs();
        updateTable();
        saveToLocalStorage();
    }
}

// LocalStorage'a kaydetme fonksiyonunu güncelle
function saveToLocalStorage() {
    try {
        localStorage.setItem('classes', JSON.stringify(classes));
        localStorage.setItem('currentClass', currentClass || '');
        localStorage.setItem('students', JSON.stringify(students));
    } catch (error) {
        console.error('Veriler kaydedilirken hata oluştu:', error);
    }
}

// LocalStorage'dan yükleme fonksiyonunu güncelle
function loadFromLocalStorage() {
    try {
        const savedClasses = localStorage.getItem('classes');
        const savedCurrentClass = localStorage.getItem('currentClass');
        
        if (savedClasses) {
            classes = JSON.parse(savedClasses);
        }
        
        if (savedCurrentClass) {
            currentClass = savedCurrentClass;
            students = classes[currentClass] || [];
        }
        
        updateClassTabs();
        updateTable();
    } catch (error) {
        console.error('Veriler yüklenirken hata oluştu:', error);
        classes = {};
        currentClass = null;
        students = [];
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
});

// Temizle butonu için event listener ekle
document.getElementById('clearBtn').addEventListener('click', () => {
    if (!currentClass) {
        alert('Lütfen önce bir sınıf seçin');
        return;
    }

    if (confirm(`${currentClass} sınıfındaki tüm öğrenciler silinecek. Emin misiniz?`)) {
        students = [];
        classes[currentClass] = [];
        updateTable();
        saveToLocalStorage();
    }
});

