import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

// Layout
import AppLayout from './components/layout/AppLayout';

// Pages
import Home from './pages/Home';
import Gestograma from './pages/Gestograma';
import Calendario from './pages/Calendario';
import ControlPrenatal from './pages/ControlPrenatal';
import Estudios from './pages/Estudios';
import Vacunas from './pages/Vacunas';
import Diario from './pages/Diario';
import Notas from './pages/Notas';
import SignosAlarma from './pages/SignosAlarma';
import Lactancia from './pages/Lactancia';
import Planificacion from './pages/Planificacion';
import NuevoPerfil from './pages/NuevoPerfil';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 gradient-rose rounded-2xl flex items-center justify-center shadow-lg">
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground font-semibold">MaternaApp</p>
        </div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/gestograma" element={<Gestograma />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/consulta/nueva" element={<ControlPrenatal />} />
        <Route path="/estudios" element={<Estudios />} />
        <Route path="/vacunas" element={<Vacunas />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/notas" element={<Notas />} />
        <Route path="/alarmas" element={<SignosAlarma />} />
        <Route path="/lactancia" element={<Lactancia />} />
        <Route path="/planificacion" element={<Planificacion />} />
        <Route path="/perfil/nuevo" element={<NuevoPerfil />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App