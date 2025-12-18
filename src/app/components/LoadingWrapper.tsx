import { useAppContext } from '../context/AppContext';

export const LoadingWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading } = useAppContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
          <h2 className="text-xl text-gray-700">Loading AXIOMS...</h2>
          <p className="text-sm text-gray-500 mt-2">Fetching data from Supabase</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
