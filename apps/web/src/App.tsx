import { Routes, Route } from 'react-router-dom';

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <h1 className="text-5xl font-bold">INOS</h1>
        <p className="py-6 text-xl">인문학의 OS — 인문학 모임 플랫폼</p>
        <button className="btn btn-primary">시작하기</button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}
