import React from 'react'
import { Outlet } from 'react-router-dom'

const Auth = () => {
  return (
    <div className=' w-auto h-screen flex justify-center items-center'>
      <Outlet/>
      </div>
  )
}

export default Auth