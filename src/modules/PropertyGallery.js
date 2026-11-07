const PropertyGallery = () => {
    const galleries = document.querySelectorAll('[data-js-property-gallery]')

    galleries.forEach((root) => {
        const bigGallery = root.querySelector('.left-roulette-big')
        const smallGallery = root.querySelector('.left-roulette-small')
        const prevButton = root.querySelector('[data-js-gallery-prev]')
        const nextButton = root.querySelector('[data-js-gallery-next]')
        const slides = Array.from(root.querySelectorAll('.left-roulette-item-big'))
        const thumbnails = Array.from(root.querySelectorAll('[data-js-gallery-thumb]'))

        if (!bigGallery || slides.length === 0) {
            return
        }

        let currentIndex = 0
        const lastIndex = slides.length - 1

        const getThumbnailShift = () => {
            if (!smallGallery || thumbnails.length < 2) {
                return { step: 0, maxIndex: 0 }
            }

            const smallRect = smallGallery.getBoundingClientRect()
            const firstRect = thumbnails[0].getBoundingClientRect()
            const secondRect = thumbnails[1].getBoundingClientRect()
            const step = secondRect.left - firstRect.left

            if (!step || !smallRect.width) {
                return { step: 0, maxIndex: 0 }
            }

            const visibleCount = Math.max(1, Math.round(smallRect.width / step))
            return {
                step,
                maxIndex: Math.max(0, thumbnails.length - visibleCount),
            }
        }

        const update = () => {
            bigGallery.style.transform = `translateX(-${currentIndex * 100}%)`

            if (smallGallery) {
                const { step, maxIndex } = getThumbnailShift()
                const shiftIndex = Math.min(currentIndex, maxIndex)
                smallGallery.style.transform = `translateX(-${shiftIndex * step}px)`
            }

            if (prevButton) {
                prevButton.setAttribute('data-state', currentIndex === 0 ? 'disabled' : '')
            }
            if (nextButton) {
                nextButton.setAttribute('data-state', currentIndex === lastIndex ? 'disabled' : '')
            }

            thumbnails.forEach((thumbnail, index) => {
                thumbnail.dataset.key = index === currentIndex ? 'active' : ''
                thumbnail.setAttribute('aria-current', index === currentIndex ? 'true' : 'false')
            })
        }

        const slideTo = (index) => {
            const nextIndex = Math.min(Math.max(index, 0), lastIndex)
            if (nextIndex === currentIndex) {
                return
            }
            currentIndex = nextIndex
            update()
        }

        prevButton?.addEventListener('click', () => slideTo(currentIndex - 1))
        nextButton?.addEventListener('click', () => slideTo(currentIndex + 1))

        thumbnails.forEach((thumbnail, index) => {
            thumbnail.addEventListener('click', () => slideTo(index))
        })

        root.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault()
                slideTo(currentIndex - 1)
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault()
                slideTo(currentIndex + 1)
            }
        })

        let touchStartX = 0

        bigGallery.addEventListener('touchstart', (event) => {
            touchStartX = event.changedTouches[0].screenX
        }, { passive: true })

        bigGallery.addEventListener('touchend', (event) => {
            const touchEndX = event.changedTouches[0].screenX
            const distance = touchEndX - touchStartX

            if (Math.abs(distance) < 30) {
                return
            }

            slideTo(currentIndex + (distance < 0 ? 1 : -1))
        }, { passive: true })

        update()
    })
}

export default PropertyGallery
