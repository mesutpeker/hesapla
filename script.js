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

// Tabloyu güncelleme fonksiyonu
function updateTable() {
    studentTableBody.innerHTML = '';
    console.log('Güncellenecek öğrenciler:', students);
    
    students.sort((a, b) => parseInt(a.number) - parseInt(b.number));
    
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="border-right">${student.number}</td>
            <td class="border-right">${student.name}</td>
            <td>${student.yazili1?.yazma || 0}</td>
            <td>${student.yazili1?.dinleme || 0}</td>
            <td>${student.yazili1?.konusma || 0}</td>
            <td class="border-right"><strong>${student.yazili1?.toplam || 0}</strong></td>
            <td>${student.yazili2?.yazma || 0}</td>
            <td>${student.yazili2?.dinleme || 0}</td>
            <td>${student.yazili2?.konusma || 0}</td>
            <td class="border-right"><strong>${student.yazili2?.toplam || 0}</strong></td>
            <td>${student.performans1?.tema1?.yazma || 0}</td>
            <td>${student.performans1?.tema1?.konusma || 0}</td>
            <td>${student.performans1?.tema2?.yazma || 0}</td>
            <td>${student.performans1?.tema2?.konusma || 0}</td>
            <td class="border-right"><strong>${student.performans1?.toplam || 0}</strong></td>
            <td>${student.performans2?.kitap1 || 0}</td>
            <td>${student.performans2?.kitap2 || 0}</td>
            <td><strong>${student.performans2?.toplam || 0}</strong></td>
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