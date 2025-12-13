import Advantages from "@/sections/Home/Advantages"
import Main from "@/sections/Home/Main"
import Service from "@/sections/Home/Service"

export const metadata = {
  title: 'Главная',
}

export default function () {
  return (
    <>
      <Main />
      <Advantages />
      <Service />
    </>
  )
}
