import { ErrorPage } from './ErrorPage';

export default function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="페이지를 찾을 수 없어요"
      description="요청하신 페이지가 존재하지 않거나 이동되었어요."
    />
  );
}
