const SwiperCatalogImg = () => {

    // Получаем элементы
    const prevBtn = document.querySelector('.paginate.left');
    const nextBtn = document.querySelector('.paginate.right');
    const galleryBig = document.querySelector('.left-roulette-big');
    const gallerySmall = document.querySelector('.left-roulette-small');
    const galleryItems = document.querySelectorAll('.left-roulette-item-big');
    const totalItems = galleryItems.length;
    let currentIndex = 0;

    // Функция для обновления состояния кнопок и галереи
    function updateGallery() {
        // Обновляем трансформацию галереи
        galleryBig.style.transform = `translateX(-${currentIndex * 100}%)`;
        gallerySmall.style.transform = `translateX(-${currentIndex * 20.6}%)`;
        
        // Обновляем состояние кнопок
        prevBtn.setAttribute('data-state', currentIndex === 0 ? 'disabled' : '');
        nextBtn.setAttribute('data-state', currentIndex === totalItems - 1 ? 'disabled' : '');
        
        // Обновляем активное изображение (если нужно)
        document.querySelectorAll('.big-img-for-script').forEach((img, index) => {
            img.dataset.key = index === currentIndex ? 'active' : '';
        });
        document.querySelectorAll('.small-img-for-script').forEach((img, index) => {
            img.dataset.key = index === currentIndex ? 'active' : '';
        })
    }

    // Функция для переключения слайдов
    function slide(offset) {
        const newIndex = currentIndex + offset;
        
        // Проверяем границы
        if (newIndex >= 0 && newIndex < totalItems) {
            currentIndex = newIndex;
            updateGallery();
        }
    }

    // Инициализация
    updateGallery();

    // Обработчики событий
    prevBtn.addEventListener('click', () => {
        if (prevBtn.getAttribute('data-state') !== 'disabled') {
            slide(-1);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (nextBtn.getAttribute('data-state') !== 'disabled') {
            slide(1);
        }
    });

    // Для touch-устройств можно добавить свайп
    let touchStartX = 0;
    let touchEndX = 0;

    galleryBig.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    galleryBig.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);


    function handleSwipe() {
    if (touchEndX < touchStartX) {
        // Свайп влево
        if (nextBtn.getAttribute('data-state') !== 'disabled') {
            slide(1);
        }
    }
    if (touchEndX > touchStartX) {
        // Свайп вправо
        if (prevBtn.getAttribute('data-state') !== 'disabled') {
            slide(-1);
        }
    }
    }
}

export default SwiperCatalogImg