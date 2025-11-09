document.addEventListener('DOMContentLoaded', () => {

    const bodyId = document.body.id;
    const DB_KEY = "purchaseRequestDB"; // Kunci untuk localStorage

    // ===================================
    // KODE UTAMA BERDASARKAN HALAMAN
    // ===================================
    if (bodyId === 'login-page') {
        handleLoginPage(); 
    } else if (bodyId === 'purchasing-page') {
        handlePurchasingPage();
    } else if (bodyId === 'history-page') {
        handleHistoryPage(); // FUNGSI BARU
    }
    
    // ===================================
    // FUNGSI UMUM: Login & Logout (Diperlukan di semua halaman)
    // ===================================

    function handleLoginPage() {
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;
            const VALID_USERNAME = 'purchaser'; 
            const VALID_PASSWORD = 'pass123';

            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                sessionStorage.setItem("isLoggedIn", "true");
                window.location.href = 'purchasing.html';
            } else {
                showFeedback(loginError, false, 'Kredensial tidak valid.');
            }
        });
    }

    function setupLogout(redirectPage = 'login.html') {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    sessionStorage.removeItem("isLoggedIn");
                    window.location.href = redirectPage; 
                }
            });
        }
    }
    // Panggil setupLogout di setiap halaman
    if (bodyId === 'purchasing-page') setupLogout('login.html');
    if (bodyId === 'history-page') setupLogout('login.html');


    // ===================================
    // 🛒 FUNGSI HALAMAN PURCHASING (Form Input)
    // ===================================
    function handlePurchasingPage() {
        // Guard Login
        // if (sessionStorage.getItem("isLoggedIn") !== "true") { window.location.href = 'login.html'; return; }

        const form = document.getElementById('purchasing-form');
        const formFeedback = document.getElementById('form-feedback');
        
        // Input Fields (diambil dari purchasing.html)
        const requesterDept = document.getElementById('requester-dept');
        const needDate = document.getElementById('need-date');
        const itemName = document.getElementById('item-name');
        const quantity = document.getElementById('quantity');
        const unit = document.getElementById('unit');
        const purpose = document.getElementById('purpose');
        
        // FUNGSI VALIDASI & SIMPAN SAAT SUBMIT
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            formFeedback.style.display = 'none';
            resetAllErrors(form);

            if (validateAllInputs()) {
                const purchaseData = {
                    id: Date.now(),
                    dept: requesterDept.value,
                    needDate: needDate.value,
                    item: itemName.value.trim(),
                    qty: parseInt(quantity.value),
                    unit: unit.value,
                    purpose: purpose.value.trim(),
                    requestDate: new Date().toLocaleDateString('id-ID'),
                };
                
                savePurchaseData(purchaseData);
                showFeedback(formFeedback, true, `Permintaan **${purchaseData.item}** berhasil diajukan! Anda dapat melihatnya di halaman Riwayat.`);
                form.reset(); 
                alert(`Permintaan Pembelian Berhasil Dikirim untuk: ${purchaseData.item}!`);
            } else {
                showFeedback(formFeedback, false, 'Validasi Gagal! Harap periksa bidang yang ditandai.');
                alert('Validasi Gagal! Mohon periksa kembali formulir Anda.');
            }
        });

        // FUNGSI VALIDASI
        function validateAllInputs() {
            let isValid = true; 
            
            if (requesterDept.value === '') { showInputError(requesterDept, 'Departemen wajib dipilih.'); isValid = false; }
            if (needDate.value === '') { showInputError(needDate, 'Tanggal kebutuhan wajib diisi.'); isValid = false; }
            else if (!isDateAhead(needDate.value, 7)) { showInputError(needDate, 'Tanggal kebutuhan harus minimal 7 hari ke depan.'); isValid = false; }

            if (itemName.value.trim().length < 5) { showInputError(itemName, 'Nama barang minimal 5 karakter.'); isValid = false; }

            const qty = parseInt(quantity.value);
            if (isNaN(qty) || qty <= 0) { showInputError(quantity, 'Kuantitas harus berupa angka dan minimal 1.'); isValid = false; }

            if (unit.value === '') { showInputError(unit, 'Satuan unit wajib dipilih.'); isValid = false; }
            
            if (purpose.value.trim().length < 10) { showInputError(purpose, 'Tujuan pengadaan minimal 10 karakter.'); isValid = false; }
            
            return isValid;
        }
    }

    // ===================================
    // 📊 FUNGSI HALAMAN HISTORY (Menampilkan Data) [FUNGSI BARU]
    // ===================================
    function handleHistoryPage() {
        // Guard Login
        // if (sessionStorage.getItem("isLoggedIn") !== "true") { window.location.href = 'login.html'; return; }
        
        const tableBody = document.querySelector('#purchase-data-table tbody');
        const purchaseCountSpan = document.getElementById("purchase-count");
        const noDataMessage = document.getElementById("no-data-message");
        const clearDataBtn = document.getElementById('clear-data-btn');

        loadPurchaseDataToTable();

        // Aksi Hapus Semua Data Riwayat
        clearDataBtn.addEventListener('click', () => {
            if (confirm('PERINGATAN: Anda yakin ingin menghapus SEMUA data riwayat permintaan pembelian?')) {
                localStorage.removeItem(DB_KEY);
                loadPurchaseDataToTable(); // Muat ulang tabel yang kosong
                alert('Semua data riwayat pembelian berhasil dihapus.');
            }
        });

        function loadPurchaseDataToTable() {
            const data = getPurchaseData().reverse(); // Tampilkan yang terbaru di atas
            tableBody.innerHTML = '';
            purchaseCountSpan.textContent = data.length;

            if (data.length === 0) {
                noDataMessage.style.display = 'block';
                return;
            }
            noDataMessage.style.display = 'none';

            data.forEach((item, index) => {
                const row = tableBody.insertRow();
                row.innerHTML = `
                    <td>${data.length - index}</td>
                    <td>${item.requestDate}</td>
                    <td>${item.dept}</td>
                    <td>${item.item}</td>
                    <td>${item.qty}</td>
                    <td>${item.unit}</td>
                    <td>${item.needDate}</td>
                    <td>${item.purpose.substring(0, 50)}...</td>
                `;
            });
        }
    }


    // ===================================
    // 💾 FUNGSI UTILITAS GLOBAL (Storage & Helper)
    // ===================================

    /** Mengambil semua data dari localStorage */
    function getPurchaseData() {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : [];
    }

    /** Menyimpan data baru ke localStorage */
    function savePurchaseData(newData) {
        const data = getPurchaseData();
        data.push(newData);
        localStorage.setItem(DB_KEY, JSON.stringify(data));
    }
    
    /** Menampilkan feedback global */
    function showFeedback(element, isSuccess, message) {
        element.style.display = 'block'; 
        element.className = isSuccess ? 'feedback-box success' : 'feedback-box error';
        element.innerHTML = message;
    }
    
    /** Menampilkan pesan error di bawah input spesifik */
    function showInputError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.add('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
    }

    /** Menghapus semua indikasi error visual */
    function resetAllErrors(formElement) {
        const errorGroups = formElement.querySelectorAll('.form-group.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
        });
    }

    /** Pengecekan tanggal minimal (N hari ke depan) */
    function isDateAhead(dateString, daysAhead) {
        const today = new Date();
        today.setHours(0, 0, 0, 0); 
        
        const requiredDate = new Date(dateString);
        
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + daysAhead);
        minDate.setHours(0, 0, 0, 0);

        return requiredDate >= minDate;
    }
});