import OverlayMenu from './modules/OverlayMenu';
import ConsulationMenu from "./modules/ConsulationModal"
import SwiperCatalogImg from './modules/SwiperCatalogImg';

new OverlayMenu()
if (document.querySelector('.service-button')) {
    new ConsulationMenu(); // Инициализируем только если элементы найдены
  }

if (document.querySelector('.paginate.left')) {
  SwiperCatalogImg()
}
