// Menjalankan skrip setelah DOM sepenuhnya dimuat
document.addEventListener('DOMContentLoaded', () => {

  // Cek apakah di mobile (untuk optimalisasi)
  const isMobile = window.innerWidth <= 768;

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
    const scrollY = window.pageYOffset + 150; 

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });
    
    const heroSection = document.getElementById('hero');
    if (heroSection && heroSection.getBoundingClientRect().top > -100) {
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


  // ---------- (LOGIKA BARU) Stats Counter ----------
  const animateCounter = (element, target) => {
    let current = 0;
    const duration = 1500; // Durasi animasi 1.5 detik
    const increment = target / (duration / 16); // Hitung increment per frame

    const updateCount = () => {
      current += increment;
      if (current >= target) {
        element.textContent = target.toLocaleString('id-ID'); // Format angka (misal: 1.200)
        return;
      }
      element.textContent = Math.ceil(current).toLocaleString('id-ID');
      requestAnimationFrame(updateCount);
    };
    updateCount();
  };

  // ---------- Intersection Observer (Scroll Reveal + Stats Counter) ----------
  const animateElements = document.querySelectorAll('.animate-on-scroll');
  const statNumbers = document.querySelectorAll('.stat-number');

  const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.1
  };

  const observerCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Terapkan delay
        const delay = entry.target.dataset.delay;
        if (delay) {
          entry.target.style.transitionDelay = `calc(var(--animation-delay-base) * ${delay})`;
        }
        
        entry.target.classList.add('is-visible');
        
        // (BARU) Cek apakah ini adalah stat-number
        if (entry.target.classList.contains('stat-item')) {
          const numberElement = entry.target.querySelector('.stat-number');
          if (numberElement && !numberElement.classList.contains('counted')) {
            const targetCount = parseInt(numberElement.dataset.count, 10);
            animateCounter(numberElement, targetCount);
            numberElement.classList.add('counted'); // Tandai sudah dihitung
          }
        }
        
        observer.unobserve(entry.target);
      }
    });
  };

  const observer = new IntersectionObserver(observerCallback, observerOptions);
  animateElements.forEach(element => {
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
          headers: {'Accept': 'application/json'}
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
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
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

  // ---------- (UPDATED) Logika Partikel (Optimalisasi Mobile) ----------
  const canvas = document.getElementById('particle-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particlesArray = [];
    let heroSection = document.querySelector('.hero');
    const mouse = { x: null, y: null, radius: 100 };

    window.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    });
    window.addEventListener('mouseout', () => { mouse.x = undefined; mouse.y = undefined; });

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x; this.y = y; this.directionX = directionX; this.directionY = directionY; this.size = size; this.color = color;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = 'rgba(14, 165, 161, 0.7)';
        ctx.fill();
      }
      update() {
        if (this.x > canvas.width || this.x < 0) { this.directionX = -this.directionX; }
        if (this.y > canvas.height || this.y < 0) { this.directionY = -this.directionY; }
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouse.radius + this.size && !isMobile) { // Nonaktifkan interaksi mouse di mobile
          if (mouse.x < this.x && this.x < canvas.width - this.size * 10) { this.x += 3; }
          if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
          if (mouse.y < this.y && this.y < canvas.height - this.size * 10) { this.y += 3; }
          if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
      }
    }

    function initParticles() {
      particlesArray = [];
      canvas.width = heroSection.offsetWidth;
      canvas.height = heroSection.offsetHeight;
      
      // (OPTIMALISASI) Kurangi jumlah partikel di mobile
      let baseDensity = isMobile ? 25000 : 9000; 
      let numberOfParticles = (canvas.width * canvas.height) / baseDensity;
      
      for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((canvas.width - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((canvas.height - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 0.4) - 0.2;
        let directionY = (Math.random() * 0.4) - 0.2;
        particlesArray.push(new Particle(x, y, directionX, directionY, size, 'rgba(14, 165, 161, 0.7)'));
      }
    }

    function connectParticles() {
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) + ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));
          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            opacityValue = 1 - (distance / 20000);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacityValue * 0.3 + ')'; 
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
      }
      connectParticles();
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
    window.addEventListener('resize', initParticles);
  }
  
  // ---------- (LOGIKA BARU) Efek Parallax pada Proyek ----------
  if (!isMobile) { // HANYA JALANKAN DI DESKTOP
    const parallaxCards = document.querySelectorAll('.parallax-card');
    
    const handleParallax = () => {
      parallaxCards.forEach(card => {
        const thumb = card.querySelector('.thumb');
        const rect = card.getBoundingClientRect();
        
        // Cek apakah card ada di viewport
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          // Hitung seberapa jauh card telah di-scroll dalam viewport
          // 'rect.top' akan negatif saat di atas, positif saat di bawah
          // Kita ingin '0' saat di tengah, jadi kita kurangi setengah tinggi viewport
          const scrollPercent = (rect.top - (window.innerHeight / 2)) / (window.innerHeight / 2);
          
          // Terapkan pergerakan. -30px (saat di atas) hingga 30px (saat di bawah)
          // Kecepatan bisa diatur dengan mengubah '30'
          const move = scrollPercent * -30; 
          
          thumb.style.transform = `translateY(${move}px)`;
        }
      });
    };
    
    // Tambahkan event listener baru HANYA untuk parallax
    window.addEventListener('scroll', handleParallax);
    handleParallax(); // Panggil sekali saat load
  }

}); // Akhir dari DOMContentLoaded
