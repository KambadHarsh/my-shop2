import React, { useEffect } from 'react';
import { NavLink ,useNavigate } from 'react-router-dom';
import "../app.css";


export function TopBar() {

  const navigate =useNavigate();

 const handleLogoClick =()=>{
  navigate('/'); 
  };

  return (
    <div>
      <div className="topbar-section">
        <div className="logo-block">
          <div onClick={handleLogoClick} className='handle-logo'>
            <img className="logo" src="../assets/logo.png" alt="logo" />
            <h1 className='text-bold h4'> Shop Dashboard</h1>
          </div>
            <NavLink to="/newImport"> Import</NavLink>
            <NavLink to="/newExport"> Export</NavLink>
            {/* <NavLink to="/Product"> Product</NavLink> */}
        </div>
      </div>
    </div>
  )
}


