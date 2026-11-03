export default class PropertyPhotoOrientation {
    constructor() {
        document.querySelectorAll('.property-photo').forEach((frame) => {
            const image = frame.querySelector('.property-photo__image')

            if (!image) {
                return
            }

            const applyOrientation = () => {
                if (!image.naturalWidth || !image.naturalHeight) {
                    return
                }

                frame.dataset.orientation =
                    image.naturalWidth >= image.naturalHeight ? 'landscape' : 'portrait'
            }

            image.addEventListener('load', applyOrientation)

            // Изображение может быть уже загружено к моменту запуска скрипта.
            if (image.complete) {
                applyOrientation()
            }
        })
    }
}
