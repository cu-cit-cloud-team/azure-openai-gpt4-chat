import './globals.scss';

export const metadata = {
  title: 'Cloud Team GPT Chat',
  description: 'Powered by Azure OpenAI GPT-4',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="night">
      <body>
        <link rel="icon" href="/azure-openai.png" />
        <div className="page-wrapper">{children}</div>
      </body>
    </html>
  );
}
