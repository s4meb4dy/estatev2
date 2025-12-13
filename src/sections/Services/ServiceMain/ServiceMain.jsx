import Service from '../../Home/Service'
import './ServiceMain.scss'

const ServiceMain = () => {
    return (
        <div className="serviceMain">
            <p className="Services-header-text">Все услуги агентства недвижимости <span>Город</span></p>
            <Service />
        </div>
    )
}

export default ServiceMain