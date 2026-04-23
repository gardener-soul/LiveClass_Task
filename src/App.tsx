import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrollmentPage } from '@/pages/EnrollmentPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <EnrollmentPage />
    </QueryClientProvider>
  );
}

export default App;
