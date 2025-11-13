// Menjalankan skrip setelah DOM sepenuhnya dimuat
document.addEventListener('DOMContentLoaded', () => {

  // ---------- Set Tahun di Footer ----------
  try {
    document.getElementById('year').textContent = new Date().getFullYear();
  } catch (e) {
    console.error("Elemen #year tidak ditemukan.", e);
  }

  // ---------- Navigasi Smooth Scroll (Saat Klik) ----------
  document.querySelectorAll('nav a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.getAttribute('href');
      const targetElement = document.querySelector(id);
      
      if (targetElement) {
        // Hapus aktif dari semua link
        document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
        // Tambahkan aktif ke link yang diklik
        a.classList.add('active');
        
        const headerOffset = document.querySelector('header').offsetHeight + 20;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---------- (BARU) Scroll-Spy (Update Nav saat Scroll) ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  const updateActiveNav = () => {
    let currentSectionId = 'top'; // Default ke 'Beranda' (id="top")
    
    sections.forEach(section => {
      const sectionTop = section.getBoundingClientRect().top;
      const headerOffset = 100; // Offset 100px
      
      // Cek apakah bagian ini ada di viewport
      if (sectionTop <= headerOffset && sectionTop + section.offsetHeight > headerOffset) {
        currentSectionId = section.getAttribute('id');
      }
    });

    // Cek section 'top' (hero) secara khusus
    const heroSection = document.getElementById('hero');
    if (heroSection && heroSection.getBoundingClientRect().top > 0) {
      currentSectionId = 'top';
    }

    // Update kelas 'active' di navigasi
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  // Tambahkan listener ke window
  window.addEventListener('scroll', updateActiveNav);
  // Panggil sekali saat load
  updateActiveNav();

  // ---------- Tombol CTA Hero ke Kontak ----------
  const btnContact = document.getElementById('btnContact');
  if (btnContact) {
    btnContact.addEventListener('click', (e) => {
      e.preventDefault();
      const targetElement = document.querySelector('#contact');
      if (targetElement) {
        const headerOffset = document.querySelector('header').offsetHeight + 20;
        const elementPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - headerOffset,
          behavior: 'smooth'
        });
        // Fokus ke input nama untuk UX yang lebih baik
        try {
          document.getElementById('name').focus();
        } catch (focusError) {
          console.warn("Tidak dapat fokus ke #name", focusError);
        }
      }
    });
  }

  // ---------- (DIPERBARUI) Form Kontak Profesional (AJAX ke Formspree) ----------
  const contactForm = document.getElementById('contactForm');
  const formAlert = document.getElementById('form-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(ev) {
      ev.preventDefault();

      // Validasi dasar sisi klien
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      if (!name || !email || !message) {
        showAlert('error', 'Mohon lengkapi semua kolom yang wajib diisi (Nama, Email, Pesan).');
        return false;
      }
      if (!validateEmail(email)) {
        showAlert('error', 'Format email tidak valid.');
        return false;
      }

      // Tampilkan status "mengirim..."
      const submitButton = contactForm.querySelector('button[type="submit"]');
      submitButton.textContent = 'Mengirim...';
      submitButton.disabled = true;

      const formData = new FormData(contactForm);
      
      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.ok) {
          // Sukses
          showAlert('success', 'Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
          contactForm.reset();
        } else {
          // Error dari server
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            const errorMsg = data["errors"].map(error => error["message"]).join(", ");
            showAlert('error', `Gagal mengirim: ${errorMsg}`);
          } else {
            showAlert('error', 'Gagal mengirim pesan. Silakan coba lagi.');
          }
        }
      } catch (error) {
        // Error jaringan
        console.error('Fetch error:', error);
        showAlert('error', 'Terjadi masalah jaringan. Silakan periksa koneksi Anda.');
      } finally {
        // Kembalikan tombol ke status normal
        submitButton.textContent = 'Kirim Pesan';
        submitButton.disabled = false;
      }
    });
  }

  // Helper: Validasi Email
  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  // Helper: Tampilkan Alert
  function showAlert(type, message) {
    if (formAlert) {
      formAlert.className = `alert ${type} show`;
      formAlert.textContent = message;
      // Scroll ke alert agar terlihat
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        formAlert.classList.remove('show');
      }, 5000); // Sembunyikan setelah 5 detik
    } else {
      console.log(`Alert (${type}): ${message}`);
    }
  }

  // ---------- Fungsi Modal Proyek (Global) ----------
  // Dibuat global agar bisa dipanggil dari `onclick` di HTML
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalContactBtn = document.getElementById('modalContact');

  window.openProject = function(title, desc) {
    if (modal && modalTitle && modalDesc && modalContactBtn) {
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Mencegah scroll background

      // Set mailto di tombol kontak modal
      const subj = encodeURIComponent('Pertanyaan tentang proyek: ' + title);
      // Tombol ini sekarang mengarah ke #contact, bukan mailto
      modalContactBtn.href = '#contact'; 
      // Jika ingin mailto, ganti baris di atas dengan:
      // modalContactBtn.href = 'mailto:sims.simanmandirisentosa@gmail.com?subject='+subj;
    } else {
      console.error("Elemen modal tidak ditemukan.");
    }
  }

  window.closeModal = function() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; // Kembalikan scroll
    }
  }

  // Aksesibilitas: tutup modal dengan tombol Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Tutup modal saat klik di luar area kartu modal
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

}); // Akhir dari DOMContentLoaded
