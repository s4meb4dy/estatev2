import OverlayMenu from './modules/OverlayMenu';
import ConsulationMenu from "./modules/ConsulationModal"
import SwiperCatalogImg from './modules/SwiperCatalogImg';
import PropertyPhotoOrientation from './modules/PropertyPhotoOrientation';

new OverlayMenu()
new PropertyPhotoOrientation()
if (document.querySelector('.service-button')) {
    new ConsulationMenu(); // Инициализируем только если элементы найдены
  }

if (document.querySelector('.paginate.left')) {
  SwiperCatalogImg()
}
