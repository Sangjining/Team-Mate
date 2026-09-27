import { Outlet } from 'react-router-dom';

function AdminLayout() {
  return (
    <div>
      {/* Admin Header */}

      <div>
        {/* Admin Sidebar */}

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;