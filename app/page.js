// app/page.js
import LoginForm from '@/components/LoginForm';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8">
      <LoginForm />
    </div>
  );
};

export default Home;