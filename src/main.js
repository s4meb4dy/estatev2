import OverlayMenu from './modules/OverlayMenu';
import ConsulationMenu from "./modules/ConsulationModal"
import PropertyGallery from './modules/PropertyGallery';
import PropertyPhotoOrientation from './modules/PropertyPhotoOrientation';
import PhoneMask from './modules/PhoneMask';

new OverlayMenu()
new PropertyPhotoOrientation()
new PhoneMask()
if (document.querySelector('.service-button')) {
    new ConsulationMenu(); // Инициализируем только если элементы найдены
  }

if (document.querySelector('[data-js-property-gallery]')) {
  PropertyGallery()
}
