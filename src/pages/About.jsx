import AboutMain from "@/sections/About/AboutMain"
import Advantages from "@/sections/Home/Advantages"
import Service from "@/sections/Home/Service"
import Help from "@/sections/Services/Help"

export const metadata = {
  title: 'About',
}

export default function () {
  return (
    <>
      <AboutMain />
      <Advantages />
      <Service />
      <Help />
    </>
  )
}