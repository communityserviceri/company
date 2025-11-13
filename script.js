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
        document.querySelectorAll('nav a').forEach(x => x.classList.remove('active'));
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

  // ---------- Scroll-Spy (Update Nav saat Scroll) ----------
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('nav a');

  const updateActiveNav = () => {
    let currentSectionId = 'top'; 
    const scrollY = window.pageYOffset + 150; // Offset untuk akurasi yang lebih baik

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    // Cek section 'top' (hero) secara khusus
    const heroSection = document.getElementById('hero');
    if (heroSection && heroSection.getBoundingClientRect().top > 0) {
      currentSectionId = 'top';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();


  // ---------- (MODERN) Intersection Observer for Scroll Reveal Animations ----------
  // Elemen yang akan dianimasikan saat masuk viewport
  const animateElements = document.querySelectorAll('.card, .feature, .proj, .client-logos, .testimonial-card');

  const observerOptions = {
    root: null, // Menggunakan viewport sebagai root
    rootMargin: '0px',
    threshold: 0.1 // Elemen terlihat 10% di viewport untuk memicu
  };

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Hentikan observasi setelah terlihat agar animasi tidak berulang
        observer.unobserve(entry.target); 
      }
      // Tidak perlu else { remove } jika animasi hanya ingin berjalan sekali
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);

  animateElements.forEach(element => {
    element.classList.add('animate-on-scroll'); // Tambahkan kelas dasar untuk animasi
    observer.observe(element);
  });

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
        try {
          document.getElementById('name').focus();
        } catch (focusError) {
          console.warn("Tidak dapat fokus ke #name", focusError);
        }
      }
    });
  }

  // ---------- Form Kontak Profesional (AJAX ke Formspree) ----------
  const contactForm = document.getElementById('contactForm');
  const formAlert = document.getElementById('form-alert');

  if (contactForm) {
    contactForm.addEventListener('submit', async function(ev) {
      ev.preventDefault();

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
          showAlert('success', 'Pesan Anda telah terkirim! Kami akan segera menghubungi Anda.');
          contactForm.reset();
        } else {
          const data = await response.json();
          if (Object.hasOwn(data, 'errors')) {
            const errorMsg = data["errors"].map(error => error["message"]).join(", ");
            showAlert('error', `Gagal mengirim: ${errorMsg}`);
          } else {
            showAlert('error', 'Gagal mengirim pesan. Silakan coba lagi.');
          }
        }
      } catch (error) {
        console.error('Fetch error:', error);
        showAlert('error', 'Terjadi masalah jaringan. Silakan periksa koneksi Anda.');
      } finally {
        submitButton.textContent = 'Kirim Pesan';
        submitButton.disabled = false;
      }
    });
  }

  function validateEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  function showAlert(type, message) {
    if (formAlert) {
      formAlert.className = `alert ${type} show`;
      formAlert.textContent = message;
      formAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      setTimeout(() => {
        formAlert.classList.remove('show');
      }, 5000); 
    } else {
      console.log(`Alert (${type}): ${message}`);
    }
  }

  // ---------- Fungsi Modal Proyek (Global) ----------
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalContactBtn = document.getElementById('modalContact');

  window.openProject = function(title, desc) {
    if (modal && modalTitle && modalDesc && modalContactBtn) {
      modalTitle.textContent = title;
      modalDesc.textContent = desc;
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden'; 
      const subj = encodeURIComponent('Pertanyaan tentang proyek: ' + title);
      modalContactBtn.href = '#contact'; 
    } else {
      console.error("Elemen modal tidak ditemukan.");
    }
  }

  window.closeModal = function() {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = ''; 
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

}); // Akhir dari DOMContentLoaded
