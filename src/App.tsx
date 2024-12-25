import ChatViewer from './components/features/ChatViewer/ChatViewer';
import { Layout } from './components/ui/Layout';
import { Container } from './components/ui/Container';

function App() {
  return (
    <Layout>
      <header className="bg-white shadow">
        <Container>
          <h1 className="text-3xl font-bold text-gray-900">
            Chat Backup Helper
          </h1>
        </Container>
      </header>
      <main className="py-6">
        <Container>
          <ChatViewer />
        </Container>
      </main>
      <footer className="bg-white border-t mt-8">
        <Container>
          <div className="py-4 text-center text-sm text-gray-500">
            © 2024 Chat Backup Helper
          </div>
        </Container>
      </footer>
    </Layout>
  );
}

export default App;
