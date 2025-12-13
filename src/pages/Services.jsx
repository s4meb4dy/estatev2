import Help from "@/sections/Services/Help"
import ServiceMain from "@/sections/Services/ServiceMain"

export const metadata = {
    title: 'Услуги',
  }

export default function () {
  return (
    <>
      <ServiceMain />
      <Help />
    </>
  )
}

