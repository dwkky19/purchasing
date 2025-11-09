document.addEventListener('DOMContentLoaded', () => {

    // --- Konfigurasi Global ---
    const DB_KEY = "purchaseRequestDB"; // Kunci untuk localStorage
    const LOGIN_PAGE_URL = 'index.html'; // Anggap halaman login adalah index.html
    const PURCHASING_PAGE_URL = 'purchasing.html';
    const bodyId = document.body.id;
    
    // --- Kredensial Hardcode (Simulasi) ---
    const VALID_USERNAME = 'tester'; 
    const VALID_PASSWORD = 'password123';

    // ===================================
    // KODE UTAMA BERDASARKAN HALAMAN
    // ===================================
    if (bodyId === 'login-page') {
        handleLoginPage(); 
    } else if (bodyId === 'purchasing-page') {
        // Cek login sebelum menjalankan logika halaman
        checkLoginStatus(LOGIN_PAGE_URL);
        handlePurchasingPage();
        setupLogout(LOGIN_PAGE_URL);
    } else if (bodyId === 'history-page') {
        // Cek login sebelum menjalankan logika halaman
        checkLoginStatus(LOGIN_PAGE_URL);
        handleHistoryPage(); 
        setupLogout(LOGIN_PAGE_URL);
    }

    // ===================================
    // 🔑 FUNGSI LOGIN & LOGOUT
    // ===================================

    function checkLoginStatus(redirectPage) {
        if (sessionStorage.getItem("isLoggedIn") !== "true") {
            alert("Anda harus login terlebih dahulu!");
            window.location.href = redirectPage;
        }
    }

    function handleLoginPage() {
        const loginForm = document.getElementById('login-form');
        const loginError = document.getElementById('login-error');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();

            resetFeedback(loginError);

            if (username === "" || password === "") {
                alert("Username dan Password tidak boleh kosong!");
                showFeedback(loginError, false, 'Semua bidang wajib diisi.');
                return;
            }

            if (username === VALID_USERNAME && password === VALID_PASSWORD) {
                sessionStorage.setItem("isLoggedIn", "true");
                alert("Login Berhasil! Anda akan diarahkan ke halaman Purchase Request.");
                window.location.href = PURCHASING_PAGE_URL;
            } else {
                alert("Login Gagal! Username atau Password salah.");
                showFeedback(loginError, false, 'Username atau Password salah');
            }
        });
    }

    function setupLogout(redirectPage) {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin logout?')) {
                    sessionStorage.removeItem("isLoggedIn");
                    // Hapus data lokal di sini (opsional, tergantung kebutuhan)
                    // localStorage.removeItem("isLoggedIn");
                    alert("Anda telah logout.");
                    window.location.href = redirectPage; 
                }
            });
        }
    }


    // ===================================
    // 🛒 FUNGSI HALAMAN PURCHASING (Form Input)
    // ===================================
    function handlePurchasingPage() {
        const form = document.getElementById('purchasing-form');
        const formFeedback = document.getElementById('form-feedback');
        
        // Input Fields (Pastikan ID ini ada di purchasing.html)
        const requesterDept = document.getElementById('requester-dept');
        const needDate = document.getElementById('need-date');
        const itemName = document.getElementById('item-name');
        const quantity = document.getElementById('quantity');
        const unit = document.getElementById('unit');
        const purpose = document.getElementById('purpose');
        
        // FUNGSI VALIDASI & SIMPAN SAAT SUBMIT
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            resetFeedback(formFeedback);
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
                    requestDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: '2-digit', day: '2-digit' }),
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
            let errorList = [];
            
            // 1. Departemen
            if (requesterDept.value === '' || requesterDept.value.includes('Pilih Departemen')) { 
                showInputError(requesterDept, 'Departemen wajib dipilih.'); 
                isValid = false; 
                errorList.push('Departemen Peminta');
            }
            
            // 2. Tanggal Kebutuhan (Minimal 7 hari ke depan)
            if (needDate.value === '') { 
                showInputError(needDate, 'Tanggal kebutuhan wajib diisi.'); 
                isValid = false; 
                errorList.push('Tanggal Kebutuhan');
            }
            else if (!isDateAhead(needDate.value, 7)) { 
                showInputError(needDate, 'Tanggal kebutuhan harus minimal 7 hari ke depan.'); 
                isValid = false; 
                errorList.push('Tanggal Kebutuhan (Min. 7 hari)');
            }

            // 3. Nama Barang
            if (itemName.value.trim().length < 5) { 
                showInputError(itemName, 'Nama barang minimal 5 karakter.'); 
                isValid = false; 
                errorList.push('Nama Barang');
            }

            // 4. Kuantitas
            const qty = parseInt(quantity.value);
            if (isNaN(qty) || qty <= 0) { 
                showInputError(quantity, 'Kuantitas harus berupa angka dan minimal 1.'); 
                isValid = false; 
                errorList.push('Kuantitas');
            }

            // 5. Satuan Unit
            if (unit.value === '' || unit.value.includes('Pilih Satuan')) { 
                showInputError(unit, 'Satuan unit wajib dipilih.'); 
                isValid = false; 
                errorList.push('Satuan Unit');
            }
            
            // 6. Tujuan
            if (purpose.value.trim().length < 10) { 
                showInputError(purpose, 'Tujuan pengadaan minimal 10 karakter.'); 
                isValid = false; 
                errorList.push('Tujuan Pengadaan');
            }
            
            return isValid;
        }
    }

    // ===================================
    // 📊 FUNGSI HALAMAN HISTORY (Menampilkan Data)
    // ===================================
    function handleHistoryPage() {
        const tableBody = document.querySelector('#purchase-data-table tbody');
        const purchaseCountSpan = document.getElementById("purchase-count");
        const noDataMessage = document.getElementById("no-data-message");
        const clearDataBtn = document.getElementById('clear-data-btn');

        if (!tableBody) return; // Guard untuk memastikan elemen tabel ada

        loadPurchaseDataToTable();

        // Aksi Hapus Semua Data Riwayat
        if (clearDataBtn) {
            clearDataBtn.addEventListener('click', () => {
                if (confirm('PERINGATAN: Anda yakin ingin menghapus SEMUA data riwayat permintaan pembelian?')) {
                    localStorage.removeItem(DB_KEY);
                    loadPurchaseDataToTable(); // Muat ulang tabel yang kosong
                    alert('Semua data riwayat pembelian berhasil dihapus.');
                }
            });
        }

        function loadPurchaseDataToTable() {
            const data = getPurchaseData().reverse(); // Tampilkan yang terbaru di atas
            tableBody.innerHTML = '';
            
            if (purchaseCountSpan) purchaseCountSpan.textContent = data.length;

            if (data.length === 0) {
                if (noDataMessage) noDataMessage.style.display = 'block';
                return;
            }
            if (noDataMessage) noDataMessage.style.display = 'none';

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
                    <td>${item.purpose.substring(0, 50)}${item.purpose.length > 50 ? '...' : ''}</td>
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

    /** Menyembunyikan feedback global */
    function resetFeedback(element) {
        element.style.display = 'none';
        element.className = 'feedback-box';
        element.innerHTML = '';
    }
    
    /** Menampilkan pesan error di bawah input spesifik */
    function showInputError(inputElement, message) {
        const formGroup = inputElement.closest('.form-group');
        formGroup.classList.add('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
            // Ini penting untuk menampilkan error
            errorMessage.style.display = 'block'; 
        }
    }

    /** Menghapus semua indikasi error visual */
    function resetAllErrors(formElement) {
        const errorGroups = formElement.querySelectorAll('.form-group.error');
        errorGroups.forEach(group => {
            group.classList.remove('error');
            const errorMessage = group.querySelector('.error-message');
            if(errorMessage) {
                // Ini penting untuk menyembunyikan error
                errorMessage.style.display = 'none';
            }
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