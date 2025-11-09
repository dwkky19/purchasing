document.addEventListener("DOMContentLoaded", () => {
  // Mendeteksi halaman mana yang sedang dimuat
  const bodyId = document.body.id;

  // ===================================
  // KODE LOGIKA UTAMA
  // ===================================
  if (bodyId === "login-page") {
    handleLoginPage();
  } else if (bodyId === "purchasing-page") {
    handlePurchasingPage();
  }

  // ===================================
  // 🔑 FUNGSI HALAMAN LOGIN (index.html)
  // ===================================
  function handleLoginPage() {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");

    if (!loginForm) return;

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const username = document.getElementById("login-username").value;
      const password = document.getElementById("login-password").value;

      // Kredensial Hardcode untuk simulasi
      const VALID_USERNAME = "tester";
      const VALID_PASSWORD = "password123";

      if (username === VALID_USERNAME && password === VALID_PASSWORD) {
        loginError.style.display = "none";
        sessionStorage.setItem("isLoggedIn", "true");
        window.location.href = "purchasing.html";
      } else {
        showFeedback(loginError, false, "Username atau Password salah");
      }
    });
  }

  // ===================================
  // 🛒 FUNGSI HALAMAN PEMBELIAN (PURCHASING)
  // ===================================
  function handlePurchasingPage() {
    // Cek status login (Guard Clause)
    if (sessionStorage.getItem("isLoggedIn") !== "true") {
      alert("Anda harus login terlebih dahulu!");
      window.location.href = "login.html"; // Redirect kembali jika belum login
      return;
    }

    const form = document.getElementById("purchasing-form");
    const formFeedback = document.getElementById("form-feedback");
    const logoutBtn = document.getElementById("logout-btn");
    const showHistoryBtn = document.getElementById("show-history-btn");
    const clearDataBtn = document.getElementById("clear-data-btn");

    // Input Fields (didefinisikan untuk digunakan oleh fungsi internal)
    const purchaseDate = document.getElementById("purchase-date");
    const supplierName = document.getElementById("supplier-name");
    const itemName = document.getElementById("item-name");
    const itemQuantity = document.getElementById("item-quantity");
    const itemUnit = document.getElementById("item-unit");
    const unitPrice = document.getElementById("unit-price");

    // Load awal data
    loadPurchaseHistory();

    // **Aksi Logout: Menghapus sesi dan kembali ke halaman login**
    logoutBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin logout?")) {
        // 1. Hapus status login dari sesi
        sessionStorage.removeItem("isLoggedIn");
        // 2. Arahkan pengguna kembali ke index.html
        window.location.href = "login.html";
      }
    });
    // ***************************************************************

    // Tampilkan/Sembunyikan Riwayat
    showHistoryBtn.addEventListener("click", () => {
      const historyList = document.getElementById("purchase-history-list");
      const isVisible = historyList.style.display === "block";

      historyList.style.display = isVisible ? "none" : "block";
      showHistoryBtn.innerHTML = isVisible
        ? '<i class="fas fa-search"></i> Lihat Data'
        : '<i class="fas fa-eye-slash"></i> Sembunyikan Data';
    });

    // Hapus Semua Data Pembelian (Simulasi LocalStorage)
    clearDataBtn.addEventListener("click", () => {
      if (
        confirm(
          "PERINGATAN: Apakah Anda yakin ingin menghapus semua data pembelian? Aksi ini tidak dapat dibatalkan."
        )
      ) {
        localStorage.removeItem(DB_KEY);
        loadPurchaseHistory();
        showFeedback(
          formFeedback,
          true,
          "Semua data pembelian berhasil dihapus."
        );
      }
    });

    // FUNGSI VALIDASI UTAMA SAAT SUBMIT (Simulasi LocalStorage)
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      formFeedback.style.display = "none";
      const purchaseData = collectFormData();
      const isFormValid = validatePurchaseInputs(purchaseData);

      if (isFormValid) {
        savePurchaseData(purchaseData);
        const total = new Intl.NumberFormat("id-ID").format(purchaseData.total);
        showFeedback(
          formFeedback,
          true,
          `Pembelian ${purchaseData.itemName} senilai Rp${total} berhasil dicatat.`
        );
        form.reset();
        loadPurchaseHistory();
      } else {
        // Feedback box sudah otomatis tampil di dalam validatePurchaseInputs jika ada error
        showFeedback(
          formFeedback,
          false,
          "Terdapat kesalahan pada data. Harap periksa bidang yang ditandai."
        );
      }
    });

    // FUNGSI PENDUKUNG
    function collectFormData() {
      const qty = parseFloat(itemQuantity.value) || 0;
      const price = parseFloat(unitPrice.value) || 0;

      return {
        id: Date.now(),
        date: purchaseDate.value,
        supplierName: supplierName.value.trim(),
        itemName: itemName.value.trim(),
        quantity: qty,
        unit: itemUnit.value,
        unitPrice: price,
        total: qty * price,
      };
    }

    function validatePurchaseInputs(data) {
      resetAllErrors(form);
      let isValid = true;
      let errorMessage = ""; // Variable untuk mengumpulkan pesan error alert


      // Tambahkan ALERT jika ada kesalahan (Jawaban untuk permintaan Anda)
      if (!isValid) {
        alert(
          "⚠️ Kesalahan Input Data:\n" +
            errorMessage +
            "\nMohon periksa input yang ditandai."
        );
      }

      return isValid;
    }

    // FUNGSI SIMULASI DATABASE (localStorage)
    const DB_KEY = "purchaseDatabase";
    function getPurchaseData() {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : [];
    }

    function savePurchaseData(newData) {
      const data = getPurchaseData();
      data.push(newData);
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    }

    function loadPurchaseHistory() {
      const data = getPurchaseData();
      const historyList = document.getElementById("purchase-history-list");
      const purchaseCountSpan = document.getElementById("purchase-count");

      purchaseCountSpan.textContent = data.length;
      historyList.innerHTML = "";

      const latestData = data.slice(-5).reverse();
      if (latestData.length > 0) {
        latestData.forEach((item) => {
          const listItem = document.createElement("li");
          const formattedTotal = new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(item.total);
          listItem.innerHTML = `<i class="fas fa-tag"></i> **${item.itemName}** dari **${item.supplierName}** (${formattedTotal})`;
          historyList.appendChild(listItem);
        });
      } else {
        const listItem = document.createElement("li");
        listItem.innerHTML =
          '<i class="fas fa-info-circle"></i> Belum ada data pembelian.';
        historyList.appendChild(listItem);
      }
    }
  }

  // ===================================
  // 💡 FUNGSI UTILITAS GLOBAL
  // ===================================
  function showFeedback(element, isSuccess, message) {
    element.style.display = "block";
    element.className = isSuccess
      ? "feedback-box success"
      : "feedback-box error";
    element.textContent = message;
  }

  function showInputError(inputElement, message, form) {
    const formGroup = inputElement.closest(".form-group");
    formGroup.classList.add("error");
    const errorMessage = formGroup.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.textContent = message;
    }
  }

  function resetAllErrors(form) {
    const errorGroups = form.querySelectorAll(".form-group.error");
    errorGroups.forEach((group) => {
      group.classList.remove("error");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // --- Logika Halaman Login ---
  const loginForm = document.getElementById("login-form");
  const loginUsername = document.getElementById("login-username");
  const loginPassword = document.getElementById("login-password");
  const loginErrorBox = document.getElementById("login-error");
  const loginPage = document.getElementById("login-page");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Mengambil nilai input
      const username = loginUsername.value.trim();
      const password = loginPassword.value.trim();

      // Aturan validasi
      const validUsername = "tester";
      const validPassword = "password123";

      // Reset tampilan error
      loginErrorBox.style.display = "none";
      loginErrorBox.textContent = "";

      if (username === "" || password === "") {
        // Tampilkan alert dan pesan error jika ada yang kosong
        alert("Semua bidang wajib diisi!");
        loginErrorBox.textContent = "Username dan Password tidak boleh kosong.";
        loginErrorBox.style.display = "block";
        return;
      }

      if (username === validUsername && password === validPassword) {
        // Simulasi Login Sukses
        alert(
          "Login Berhasil! Anda akan diarahkan ke halaman purchase request."
        );

        // Simulasikan navigasi ke halaman purchasing (jika ini aplikasi satu halaman,
        // ini akan menjadi penggantian konten atau pengalihan window.location.href)

        // Karena HTML purchasing sudah ada, kita bisa simulasikan penggantian halaman
        // Dalam proyek nyata, ini akan menjadi window.location.href = 'purchasing.html';

        // Untuk demo ini, anggap Anda memiliki mekanisme penggantian halaman/konten
        // Ini adalah placeholder:
        console.log("Login sukses. Redirecting...");
        // Di sini Anda mungkin ingin menyimpan status login
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "purchasing.html"; // Ganti dengan nama file purchasing yang sesuai
      } else {
        // Tampilkan alert dan pesan error jika login gagal
        alert("Login Gagal! Username atau Password salah.");
        loginErrorBox.textContent =
          "Username atau Password yang Anda masukkan salah.";
        loginErrorBox.style.display = "block";
      }
    });
  }

  // --- Logika Halaman Purchasing/PR Form ---
  const purchasingForm = document.getElementById("purchasing-form");
  const formFeedback = document.getElementById("form-feedback");
  const needDateInput = document.getElementById("need-date");
  const quantityInput = document.getElementById("quantity");
  const purposeInput = document.getElementById("purpose");

  // Fungsi utilitas untuk membersihkan tampilan error
  function clearFormErrors() {
    document.querySelectorAll(".error-message").forEach((el) => {
      el.style.display = "none";
    });
    document
      .querySelectorAll(
        ".form-group input, .form-group select, .form-group textarea"
      )
      .forEach((el) => {
        el.classList.remove("input-error");
      });
    formFeedback.style.display = "none";
    formFeedback.classList.remove("error", "success");
    formFeedback.textContent = "";
  }

  // Fungsi utilitas untuk menampilkan error pada field tertentu
  function showFieldError(inputElement, message) {
    const parentGroup = inputElement.closest(".form-group");
    const errorMessageEl = parentGroup.querySelector(".error-message");
    inputElement.classList.add("input-error");
    if (errorMessageEl) {
      errorMessageEl.textContent = message;
      errorMessageEl.style.display = "block";
    }
  }

  if (purchasingForm) {
    purchasingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      clearFormErrors(); // Reset error sebelum validasi baru

      let isValid = true;
      let errors = [];

      // 1. Validasi Bidang Kosong
      const fields = [
        { id: "requester-dept", name: "Departemen Peminta", minLength: 1 },
        { id: "need-date", name: "Tanggal Kebutuhan", minLength: 1 },
        { id: "item-name", name: "Nama Barang", minLength: 1 },
        { id: "quantity", name: "Kuantitas", minLength: 1 },
        { id: "unit", name: "Satuan Unit", minLength: 1 },
        { id: "purpose", name: "Tujuan Pengadaan", minLength: 10 },
      ];

      fields.forEach((field) => {
        const input = document.getElementById(field.id);
        const value = input.value.trim();

        if (
          value.length < field.minLength ||
          value === "-- Pilih Departemen --" ||
          value === "-- Pilih Satuan --"
        ) {
          isValid = false;
          errors.push(
            `${field.name} wajib diisi atau minimal ${field.minLength} karakter.`
          );
          showFieldError(input, `${field.name} wajib diisi.`);
        }
      });

      // 2. Validasi Kuantitas (harus angka > 0)
      const quantity = parseInt(quantityInput.value);
      if (isNaN(quantity) || quantity <= 0) {
        isValid = false;
        errors.push("Kuantitas harus berupa angka dan minimal 1.");
        showFieldError(quantityInput, "Kuantitas harus berupa angka (min 1).");
      }

      // 3. Validasi Tanggal Kebutuhan (minimal 7 hari ke depan)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const neededDate = new Date(needDateInput.value);
      const minDate = new Date(today);
      minDate.setDate(today.getDate() + 7);

      if (needDateInput.value && neededDate < minDate) {
        isValid = false;
        errors.push("Tanggal Kebutuhan harus minimal 7 hari dari sekarang.");
        showFieldError(
          needDateInput,
          "Tanggal kebutuhan harus 7 hari ke depan."
        );
      }

      // --- Tampilkan Hasil Validasi ---
      if (!isValid) {
        // Tampilkan alert
        alert("Validasi Gagal! Mohon periksa kembali formulir Anda.");

        // Tampilkan feedback box di atas form
        formFeedback.classList.add("error");
        formFeedback.style.display = "block";

        // Tampilkan daftar error di feedback box
        formFeedback.innerHTML =
          "<strong>Permintaan Gagal Dibuat!</strong><br>Mohon perbaiki kesalahan berikut:<ul>" +
          [...new Set(errors)].map((err) => `<li>${err}</li>`).join("") +
          "</ul>";
      } else {
        // Simulasi Pengiriman Sukses
        alert("Permintaan Pembelian Berhasil Dikirim!");
        formFeedback.classList.add("success");
        formFeedback.style.display = "block";
        formFeedback.textContent =
          "Permintaan Pembelian Anda telah berhasil diserahkan!";

        // Opsi: Reset form setelah sukses
        purchasingForm.reset();
        clearFormErrors();
      }
    });

    // Logika Logout (opsional, untuk simulasi)
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        alert("Anda telah logout.");
        window.location.href = "login.html"; // Ganti ke halaman login
      });
    }
  }
});
