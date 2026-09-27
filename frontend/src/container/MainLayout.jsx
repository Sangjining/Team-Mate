import { Outlet } from 'react-router-dom';

function MainLayout() {
  return (
    <div>
      {/* Header */}

      <div>
        {/* Sidebar */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;