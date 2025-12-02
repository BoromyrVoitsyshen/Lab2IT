import React from 'react';
import { Outlet } from 'react-router-dom'; // 1. Импортируем Outlet
import Sidebar from './Sidebar';

const Layout = () => { // children больше не нужен в пропсах
    return (
        <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark font-display">
            <Sidebar />
            <main className="flex-1 overflow-y-auto h-screen">
                {/* 2. Заменяем {children} на <Outlet /> */}
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
